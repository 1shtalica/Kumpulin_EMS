import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  // 🌟 Organizer page
  {
    path: "/organizer",
    roles: ["organizer"],
  },
  // 🌟 User page
  {
    path: "/user",
    roles: ["user"],
  },
];

const publicRoutes = [
  "/",
  "/events",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const roleHomePages: Record<string, string> = {
  organizer: "/organizer/dashboard",
  user: "/user/home",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // 🌟 Kalau tidak terdaftar di list maka lewati middleware
  if (!protectedRoute && !isPublicRoute && pathname !== "/get-started") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  const hasAuthCookies = !!(accessToken && refreshToken);

  if (!hasAuthCookies) {
    // 🌟 kembali ke login jika masuk ke protected route atau get-started
    if (protectedRoute || pathname === "/get-started") {
      return redirect(request, "/login");
    }
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const cookieHeader = [
      accessToken && `access_token=${accessToken.value}`,
      refreshToken && `refresh_token=${refreshToken.value}`,
    ]
      .filter(Boolean)
      .join("; ");

    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // 🌟 Jika data user tidak berhasil didapat
    if (!res.ok) {
      if (protectedRoute || pathname === "/get-started") {
        return redirect(request, "/login");
      }
      return NextResponse.next();
    }

    const user = await res.json();

    // 🌟 CEK PROFIL LENGKAP - langsung dari user object
    const isProfileIncomplete = !user.phone_number;

    // 🌟 Profil belum lengkap → paksa ke /get-started
    if (isProfileIncomplete && pathname !== "/get-started") {
      return redirect(request, "/get-started");
    }

    // 🌟 Profil sudah lengkap tapi masih di /get-started → redirect ke home
    if (!isProfileIncomplete && pathname === "/get-started") {
      const homePage = roleHomePages[user.role] || "/";
      return redirect(request, homePage);
    }

    const homePage = roleHomePages[user.role] || "/";

    // 🌟 Jika sudah login dan akses ke halaman publik maka redirect ke homepagenya sendiri
    if (isPublicRoute) {
      return redirect(request, homePage);
    }

    // 🌟 Jika nyasar ke halaman role lain maka kembali ke homepagenya sendiri
    if (protectedRoute) {
      if (protectedRoute.roles.length > 0) {
        if (!protectedRoute.roles.includes(user.role)) {
          return redirect(request, homePage);
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Verification Failed:", error);
    if (protectedRoute || pathname === "/get-started") {
      return redirect(request, "/login");
    }
    return NextResponse.next();
  }
}

function redirect(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
