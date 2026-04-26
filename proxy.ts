import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  { path: "/organizer", roles: ["organizer"] },
  { path: "/user", roles: ["user"] },
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const publicRoutes = [
  "/",
  "/events",
  ...authRoutes,
];

const roleHomePages: Record<string, string> = {
  organizer: "/organizer/dashboard",
  user: "/",
};

const getApiBaseUrl = () =>
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL;

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const isProfileIncomplete = (user: any): boolean =>
  !!user &&
  typeof user === "object" &&
  Object.prototype.hasOwnProperty.call(user, "phone_number") &&
  !user.phone_number;

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path),
  );
  const isProtectedRoute = Boolean(protectedRoute);
  const isOnboardingRoute = pathname === "/get-started";

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Exclude static files and APIs gracefully
  if (!isProtectedRoute && !isPublicRoute && !isOnboardingRoute) {
    return NextResponse.next();
  }

  // Read-only public routes do not require strict auth checks.
  if (!isProtectedRoute && !isAuthRoute && !isOnboardingRoute) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get("access_token");
  const refreshToken = req.cookies.get("refresh_token");

  // No refresh token means no active session.
  if (!refreshToken) {
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Optional optimistic redirect for auth pages only.
  // Authorization for protected routes still relies on backend verification.
  let optimisticUser: any = null;
  if (accessToken?.value) {
    optimisticUser = decodeJwt(accessToken.value);
  }

  const hasValidAccessToken =
    optimisticUser && optimisticUser.exp && optimisticUser.exp * 1000 > Date.now();

  if (hasValidAccessToken && isAuthRoute) {
    const homePage = roleHomePages[optimisticUser.role] || "/";
    if (isProfileIncomplete(optimisticUser)) {
      if (!isOnboardingRoute) {
        return NextResponse.redirect(new URL("/get-started", req.nextUrl));
      }
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(homePage, req.nextUrl));
  }

  try {
    const apiUrl = getApiBaseUrl();
    if (!apiUrl) {
      if (isProtectedRoute || isOnboardingRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      return NextResponse.next();
    }

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
      if (isProtectedRoute || isOnboardingRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      return NextResponse.next();
    }

    if (!res.ok) {
      if (isProtectedRoute || isOnboardingRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      return NextResponse.next();
    }

    const data = await res.json();
    const freshUser = data?.data ?? data;
    const homePage = roleHomePages[freshUser.role] || "/";
    const profileIncomplete = isProfileIncomplete(freshUser);

    if (profileIncomplete && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/get-started", req.nextUrl));
    }

    if (!profileIncomplete && isOnboardingRoute) {
      return NextResponse.redirect(new URL(homePage, req.nextUrl));
    }

    if (isAuthRoute) {
      return NextResponse.redirect(new URL(homePage, req.nextUrl));
    }

    if (isProtectedRoute) {
      if (!protectedRoute?.roles.includes(freshUser.role)) {
        return NextResponse.redirect(new URL(homePage, req.nextUrl));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware Auth Verification Failed:", error);
    if (isProtectedRoute || isOnboardingRoute) {
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    }
    return NextResponse.next();
  }
}

// Routes Proxy should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
