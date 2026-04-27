import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  { path: "/organizer", roles: ["organizer"] },
  { path: "/user", roles: ["user"] },
  { path: "/events", roles: ["organizer", "user"] },
  { path: "/explore", roles: ["organizer", "user"] },
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const publicRoutes = [
  "/",
  ...authRoutes,
];

const roleHomePages: Record<string, string> = {
  organizer: "/organizer/dashboard",
  user: "/",
};

// Next.js Best Practice: Optimistically decode JWT locally
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Exclude static files and APIs gracefully
  if (!isProtectedRoute && !isPublicRoute && pathname !== "/get-started") {
    return NextResponse.next();
  }

  // Next.js Best Practice: If it's a completely read-only public route (like / or /events), 
  // we do NOT need to evaluate the auth state strictly in middleware.
  if (!isProtectedRoute && !isAuthRoute && pathname !== "/get-started") {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token");
  const refreshToken = req.cookies.get("refresh_token");

  // If no refresh token, user is not logged in. Redirect if accessing protected/get-started.
  if (!refreshToken) {
    if (isProtectedRoute || pathname === "/get-started") {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    return NextResponse.next();
  }

  // If no access token but has refresh token, proceed to API call to refresh.
  if (!accessToken) {
    if (!isProtectedRoute && pathname !== "/get-started") {
      return NextResponse.next();
    }
  }

  // 1. Optimistic Auth Check (No API Call)
  let user: any = null;
  if (accessToken?.value) {
    user = decodeJwt(accessToken.value);
  }

  const isTokenValid = user && user.exp && user.exp * 1000 > Date.now();

  if (isTokenValid) {
    const userRole = user.role || "user";
    const homePage = roleHomePages[userRole] || "/";

    // Handle complete profile redirection
    if (user.hasOwnProperty('phone_number')) {
      const isProfileIncomplete = !user.phone_number;
      if (isProfileIncomplete && pathname !== "/get-started") {
        return NextResponse.redirect(new URL("/get-started", req.nextUrl));
      }
      if (!isProfileIncomplete && pathname === "/get-started") {
        return NextResponse.redirect(new URL(homePage, req.nextUrl));
      }
    }

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(homePage, req.nextUrl));
    }

    if (isProtectedRoute) {
      if (!isProtectedRoute.roles.includes(userRole)) {
        return NextResponse.redirect(new URL(homePage, req.nextUrl));
      }
    }

    // Token is fully valid and authorized, proceed without fetching DB!
    return NextResponse.next();
  }

  // 2. Fetch /auth/me ONLY if token is expired, missing, or corrupt
  // AND the route requires strict validation (protected or auth routes).
  if (!isProtectedRoute && !isAuthRoute && pathname !== "/get-started") {
    // For pure public routes (e.g. '/' or '/events'), just pass through if not strictly valid.
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookieParts: string[] = [];
    if (accessToken) cookieParts.push(`access_token=${accessToken.value}`);
    if (refreshToken) cookieParts.push(`refresh_token=${refreshToken.value}`);
    const cookieHeader = cookieParts.join("; ");

    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.status === 401) {
      return NextResponse.next();
    }

    if (!res.ok) {
      if (isProtectedRoute || pathname === "/get-started") {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      return NextResponse.next();
    }

    const freshUser = await res.json();
    const homePage = roleHomePages[freshUser.role] || "/";
    const isProfileIncomplete = !freshUser.phone_number;

    if (isProfileIncomplete && pathname !== "/get-started") {
      return NextResponse.redirect(new URL("/get-started", req.nextUrl));
    }

    if (!isProfileIncomplete && pathname === "/get-started") {
      return NextResponse.redirect(new URL(homePage, req.nextUrl));
    }

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(homePage, req.nextUrl));
    }

    if (isProtectedRoute) {
      if (!isProtectedRoute.roles.includes(freshUser.role)) {
        return NextResponse.redirect(new URL(homePage, req.nextUrl));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Verification Failed:", error);
    return NextResponse.next();
  }
}

// Routes Proxy should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
