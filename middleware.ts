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
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const cookieHeader = `access_token=${accessToken.value}; refresh_token=${refreshToken.value}`;

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
      const homePage = roleHomePages[user.role] || "/";
      return redirect(request, homePage);
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