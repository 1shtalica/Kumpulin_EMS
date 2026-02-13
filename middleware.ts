import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  { path: "/organizer", roles: ["organizer"] },
  { path: "/user", roles: ["user"] },
];

const publicRoutes = [
  "/",
  "/events",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const roleHomePages: Record<string, string> = {
  organizer: "/dashboard/organizer",
  user: "/",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (!protectedRoute && !isPublicRoute && pathname !== "/get-started") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  if (!refreshToken) {
    if (protectedRoute || pathname === "/get-started") {
      return redirect(request, "/login");
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    // No access token but has refresh token.
    // For public (non-protected) routes, let the client-side interceptor handle token refresh.
    if (!protectedRoute && pathname !== "/get-started") {
      return NextResponse.next();
    }
    // For protected routes, fall through to attempt auth check with refresh_token only.
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
      if (protectedRoute || pathname === "/get-started") {
        return redirect(request, "/login");
      }
      return NextResponse.next();
    }

    const user = await res.json();

    const isProfileIncomplete = !user.phone_number;

    if (isProfileIncomplete && pathname !== "/get-started") {
      return redirect(request, "/get-started");
    }

    if (!isProfileIncomplete && pathname === "/get-started") {
      const homePage = roleHomePages[user.role] || "/";
      return redirect(request, homePage);
    }

    if (isPublicRoute) {
      const isAuthRoute = authRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );

      if (isAuthRoute) {
        const homePage = roleHomePages[user.role] || "/";
        return redirect(request, homePage);
      }
    }
    if (protectedRoute) {
      if (protectedRoute.roles.length > 0) {
        if (!protectedRoute.roles.includes(user.role)) {
          const homePage = roleHomePages[user.role] || "/";
          return redirect(request, homePage);
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Verification Failed:", error);
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