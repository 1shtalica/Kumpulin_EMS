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

  const isProtectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (!isProtectedRoute && !isPublicRoute && pathname !== "/get-started") {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");

  if (!refreshToken) {
    if (isProtectedRoute || pathname === "/get-started") {
      return redirect(request, "/login");
    }
    return NextResponse.next();
  }

  if (!accessToken) {
    if (!isProtectedRoute && pathname !== "/get-started") {
      return NextResponse.next();
    }
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
        return redirect(request, "/login");
      }
      return NextResponse.next();
    }

    const user = await res.json();

    const homePage = roleHomePages[user.role] || "/";

    const isProfileIncomplete = !user.phone_number;

    if (isProfileIncomplete && pathname !== "/get-started") {
      return redirect(request, "/get-started");
    }

    if (!isProfileIncomplete && pathname === "/get-started") {
      return redirect(request, homePage);
    }

    if (isPublicRoute) {
      const isEventDetailPage = pathname.startsWith("/events/") && pathname !== "/events/";
      if (isEventDetailPage) return NextResponse.next();

      return redirect(request, homePage);
    }

    if (isProtectedRoute) {
      if (!isProtectedRoute.roles.includes(user.role)) {
        return redirect(request, homePage);
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