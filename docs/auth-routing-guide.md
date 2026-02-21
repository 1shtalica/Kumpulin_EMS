# Auth-Based Routing Guide

Panduan implementasi routing berbasis status autentikasi untuk kumpul.in.

---

## 1. Peta Akses Halaman

| Halaman                 | Guest                                  | Logged-in User             | Logged-in Organizer                  |
| ----------------------- | -------------------------------------- | -------------------------- | ------------------------------------ |
| `/` (Landing)           | ✅ Akses                               | ❌ Redirect → `/user/home` | ❌ Redirect → `/organizer/dashboard` |
| `/events` (Browse)      | ✅ Akses                               | ❌ Redirect → `/user/home` | ❌ Redirect → `/organizer/dashboard` |
| `/events/[id]` (Detail) | ✅ Akses                               | ✅ Akses                   | ✅ Akses                             |
| `/user/*`               | ❌ Redirect → `/login?callbackUrl=...` | ✅ Akses                   | ❌ Redirect → `/organizer/dashboard` |
| `/organizer/*`          | ❌ Redirect → `/login?callbackUrl=...` | ❌ Redirect → `/user/home` | ✅ Akses                             |
| `/login`, `/register`   | ✅ Akses                               | ❌ Redirect (sudah login)  | ❌ Redirect (sudah login)            |

---

## 2. Implementasi via `middleware.ts`

File `middleware.ts` di root project adalah **titik tunggal** untuk semua logika redirect.
Middleware berjalan di Edge Runtime — sebelum halaman dirender — sehingga tidak ada flicker UI.

### Struktur File

```
/middleware.ts         ← file utama
/lib/auth-config.ts   ← konstanta route groups (opsional, untuk keterbacaan)
```

### Logika Middleware

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// Ambil token/session dari cookie (sesuaikan dengan cara auth-store menyimpannya)
function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get("auth-token")?.value ?? null;
}

// Ambil role dari token (decode JWT atau baca cookie terpisah)
function getRoleFromToken(token: string): "user" | "organizer" | null {
  // decode JWT di sini atau baca dari cookie role
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);
  const role = token ? getRoleFromToken(token) : null;

  const isLoggedIn = !!token;
  const isGuestOnlyRoute = ["/", "/events"].some(
    (r) =>
      pathname === r ||
      (pathname.startsWith("/events") && !pathname.includes("[")),
  );
  const isUserRoute = pathname.startsWith("/user");
  const isOrganizerRoute = pathname.startsWith("/organizer");
  const isAuthRoute = ["/login", "/register"].some((r) =>
    pathname.startsWith(r),
  );

  // ── GUEST-ONLY ROUTES: redirect yang sudah login ──────────────────────
  if (isGuestOnlyRoute && isLoggedIn) {
    const destination =
      role === "organizer" ? "/organizer/dashboard" : "/user/home";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ── AUTH ROUTES: redirect yang sudah login ────────────────────────────
  if (isAuthRoute && isLoggedIn) {
    const destination =
      role === "organizer" ? "/organizer/dashboard" : "/user/home";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ── PROTECTED USER ROUTES ─────────────────────────────────────────────
  if (isUserRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    if (role === "organizer") {
      return NextResponse.redirect(
        new URL("/organizer/dashboard", request.url),
      );
    }
  }

  // ── PROTECTED ORGANIZER ROUTES ────────────────────────────────────────
  if (isOrganizerRoute) {
    if (!isLoggedIn) {
      const callbackUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
      );
    }
    if (role === "user") {
      return NextResponse.redirect(new URL("/user/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware di semua route kecuali static files & API
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
```

---

## 3. Callback URL — Cara Kerja

**Callback URL** adalah URL tujuan yang disimpan saat user diarahkan ke halaman login, agar setelah login berhasil, user dikembalikan ke halaman yang semula ingin dituju.

### Alur

```
User belum login → akses /user/my-ticket
         ↓
Middleware redirect → /login?callbackUrl=%2Fuser%2Fmy-ticket
         ↓
User login berhasil
         ↓
LoginForm baca query param callbackUrl → router.push(callbackUrl)
         ↓
User tiba di /user/my-ticket  ✅
```

### Implementasi di LoginForm

```ts
// Di dalam komponen LoginForm
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const callbackUrl = searchParams.get("callbackUrl") ?? "/user/home";

// Setelah login berhasil:
router.push(callbackUrl);
```

> **⚠️ Validasi callbackUrl**: Pastikan callbackUrl yang diterima hanya mengarah ke path internal (dimulai dengan `/`), bukan URL eksternal, untuk mencegah **Open Redirect vulnerability**.
>
> ```ts
> const safeCallback = callbackUrl.startsWith("/") ? callbackUrl : "/user/home";
> router.push(safeCallback);
> ```

---

## 4. Header Kondisional di `/events/[id]`

Halaman detail event bisa diakses oleh semua orang, tapi header menampilkan UI yang berbeda.

### Komponen Header Kondisional

```tsx
// components/eventdetail/EventDetailHeader.tsx
"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, ... } from "@/components/ui/dropdown-menu";

export default function EventDetailHeader() {
  const { user, isHydrated } = useAuthStore(); // ← lihat bagian 5 untuk isHydrated

  return (
    <header className="...">
      <Logo />

      {/* Conditional auth section */}
      {!isHydrated ? (
        // ── Loading state: cegah FOUC ──
        <Skeleton className="h-9 w-9 rounded-full" />
      ) : user ? (
        // ── Sudah login: tampilkan Avatar ──
        <UserAvatarDropdown user={user} />
      ) : (
        // ── Belum login: tampilkan tombol ──
        <div className="flex gap-2">
          <Button variant="ghost" asChild><Link href="/login">Masuk</Link></Button>
          <Button asChild><Link href="/register">Daftar</Link></Button>
        </div>
      )}
    </header>
  );
}
```

---

## 5. Mencegah FOUC dengan `isHydrated`

**Flash of Unauthenticated Content (FOUC)** terjadi karena `useAuthStore` (Zustand + persist) membutuhkan waktu untuk membaca data dari localStorage saat pertama kali dirender. Sesaat setelah mount, `user` bernilai `null`, lalu berubah ke user yang login — ini menyebabkan tombol "Masuk/Daftar" muncul sebentar sebelum berganti ke Avatar.

### Solusi: Tambah `isHydrated` ke Auth Store

```ts
// stores/auth-store.ts
interface AuthState {
  user: User | null;
  isHydrated: boolean; // ← tambahkan ini
  // ...
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      // ...actions
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Dipanggil setelah data dari localStorage selesai dibaca
        state?.setIsHydrated(true);
      },
    },
  ),
);
```

> Atau gunakan hook `useStore` dengan `skipHydration` pattern dari Zustand docs jika versi Zustand yang dipakai mendukungnya.

### Penggunaan di Komponen

```tsx
const { user, isHydrated } = useAuthStore();

if (!isHydrated) return <Skeleton className="h-9 w-9 rounded-full" />;
if (user) return <UserAvatarDropdown />;
return <GuestButtons />;
```

---

## 6. Urutan Implementasi yang Disarankan

```
1. [ ] Tambah `isHydrated` ke auth-store
2. [ ] Buat middleware.ts dengan logika redirect dasar
3. [ ] Update LoginForm untuk membaca & menggunakan callbackUrl
4. [ ] Buat/update EventDetailHeader dengan conditional UI
5. [ ] Test semua skenario (guest, user, organizer, akses cross-role)
```
