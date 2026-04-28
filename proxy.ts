import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type ProtectedRoute = {
  path: string;
  roles: string[];
};

type SessionClaims = {
  exp?: number;
  role?: string;
  phone_number?: string | null;
  [key: string]: unknown;
};

const protectedRoutes: ProtectedRoute[] = [
  { path: "/organizer/dashboard", roles: ["organizer"] },
  { path: "/organizer/check-in", roles: ["organizer"] },
  { path: "/organizer/communities", roles: ["organizer"] },
  { path: "/organizer/my-event", roles: ["organizer"] },
  { path: "/organizer/profile", roles: ["organizer"] },
  { path: "/organizer/create-event", roles: ["organizer"] },
  { path: "/user/following", roles: ["user"] },
  { path: "/user/my-ticket", roles: ["user"] },
  { path: "/user/profile", roles: ["user"] },
];

const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

const roleHomePages: Record<string, string> = {
  organizer: "/organizer/dashboard",
  user: "/",
};

const getApiBaseUrl = () =>
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL;

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
};

function decodeJwt(token: string): SessionClaims | null {
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
    const parsed = JSON.parse(jsonPayload);
    const record = asRecord(parsed);
    if (!record) return null;
    return record as SessionClaims;
  } catch {
    return null;
  }
}

const extractSessionClaims = (value: unknown): SessionClaims | null => {
  const root = asRecord(value);
  if (!root) return null;

  const nested = asRecord(root.data);
  if (nested) return nested as SessionClaims;
  return root as SessionClaims;
};

const isProfileIncomplete = (user: SessionClaims | null): boolean => {
  if (!user) return false;
  if (!Object.prototype.hasOwnProperty.call(user, "phone_number")) return false;
  return user.phone_number === "" || user.phone_number === null;
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isOnboardingRoute = pathname === "/get-started";

  const protectedRoute = protectedRoutes.find((route) =>
    matchesRoute(pathname, route.path),
  );
  const isProtectedRoute = Boolean(protectedRoute);

  const isEventsRoute = matchesRoute(pathname, "/events");
  const isExploreRoute = matchesRoute(pathname, "/explore");
  const isPublicOrganizerRoute =
    matchesRoute(pathname, "/organizer") && !isProtectedRoute;
  const isPublicRoute =
    pathname === "/" ||
    isEventsRoute ||
    isExploreRoute ||
    isPublicOrganizerRoute ||
    authRoutes.some((route) => matchesRoute(pathname, route));

  const isAuthRoute = authRoutes.some((route) => matchesRoute(pathname, route));

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
  const optimisticUser = accessToken?.value ? decodeJwt(accessToken.value) : null;
  const hasValidAccessToken =
    optimisticUser?.exp !== undefined && optimisticUser.exp * 1000 > Date.now();

  if (hasValidAccessToken && isAuthRoute) {
    const homePage = roleHomePages[optimisticUser.role ?? ""] || "/";
    if (isProfileIncomplete(optimisticUser) && !isOnboardingRoute) {
      return NextResponse.redirect(new URL("/get-started", req.nextUrl));
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

    const payload = await res.json();
    const freshUser = extractSessionClaims(payload);
    if (!freshUser) {
      if (isProtectedRoute || isOnboardingRoute) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
      }
      return NextResponse.next();
    }

    const homePage = roleHomePages[freshUser.role ?? ""] || "/";
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

    if (isProtectedRoute && !protectedRoute?.roles.includes(freshUser.role ?? "")) {
      return NextResponse.redirect(new URL(homePage, req.nextUrl));
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
