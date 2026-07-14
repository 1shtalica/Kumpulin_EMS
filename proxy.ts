import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveRoutePolicy } from "@/lib/auth-policy";
import { normalizePhoneNumber } from "@/lib/phone";

type SessionClaims = {
    exp?: number;
    role?: string;
    phone_number?: string | null;
    email_verified?: boolean | string;
    is_email_verified?: boolean | string;
    [key: string]: unknown;
};

const roleHomePages: Record<string, string> = {
    organizer: "/organizer/dashboard",
    user: "/",
    support: "/dashboard/support/events",
};

const shouldLogAuthDecision =
    process.env.AUTH_POLICY_LOG_LEVEL === "debug" ||
    process.env.NODE_ENV === "development";

const logAuthDecision = (
    pathname: string,
    decision: string,
    reason: string,
) => {
    if (!shouldLogAuthDecision) return;
    console.info("[auth-policy]", { pathname, decision, reason });
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
                .map(
                    (c) =>
                        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
                )
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

const readSetCookieHeaders = (headers: Headers): string[] => {
    const headersWithSetCookie = headers as Headers & {
        getSetCookie?: () => string[];
    };

    return (
        headersWithSetCookie.getSetCookie?.() ??
        (headers.get("set-cookie") ? [headers.get("set-cookie") as string] : [])
    );
};

const readBooleanClaim = (
    user: SessionClaims,
    keys: Array<keyof SessionClaims>,
): boolean | undefined => {
    for (const key of keys) {
        const value = user[key];
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            if (value.toLowerCase() === "true") return true;
            if (value.toLowerCase() === "false") return false;
        }
    }

    return undefined;
};

const isEmailVerified = (user: SessionClaims): boolean => {
    const explicitValue = readBooleanClaim(user, [
        "email_verified",
        "is_email_verified",
    ]);
    return explicitValue ?? false;
};

const isProfileIncomplete = (user: SessionClaims | null): boolean => {
    if (!user) return false;
    return !normalizePhoneNumber(user.phone_number) || !isEmailVerified(user);
};

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const {
        isOnboardingRoute,
        isProtectedRoute,
        isPublicRoute,
        isAuthRoute,
        isGuestOnlyAuthRoute,
        protectedRoute,
    } = resolveRoutePolicy(pathname);

    // Exclude static files and APIs gracefully
    if (!isProtectedRoute && !isPublicRoute && !isOnboardingRoute) {
        logAuthDecision(pathname, "allow", "non-policy route");
        return NextResponse.next();
    }

    // Read-only public routes do not require strict auth checks.
    if (!isProtectedRoute && !isAuthRoute && !isOnboardingRoute) {
        logAuthDecision(pathname, "allow", "public read-only route");
        return NextResponse.next();
    }

    const accessToken = req.cookies.get("access_token");
    const refreshToken = req.cookies.get("refresh_token");

    // No refresh token means no active session.
    if (!refreshToken) {
        if (isProtectedRoute || isOnboardingRoute) {
            logAuthDecision(
                pathname,
                "redirect:/login",
                "missing refresh token",
            );
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }
        logAuthDecision(
            pathname,
            "allow",
            "missing refresh token on public/auth",
        );
        return NextResponse.next();
    }

    // Optional optimistic redirect for auth pages only.
    // Authorization for protected routes still relies on backend verification.
    const optimisticUser = accessToken?.value
        ? decodeJwt(accessToken.value)
        : null;
    const hasValidAccessToken =
        optimisticUser?.exp !== undefined &&
        optimisticUser.exp * 1000 > Date.now();

    if (hasValidAccessToken && isGuestOnlyAuthRoute) {
        const homePage = roleHomePages[optimisticUser.role ?? ""] || "/";
        if (isProfileIncomplete(optimisticUser) && !isOnboardingRoute) {
            logAuthDecision(
                pathname,
                "redirect:/get-started",
                "auth route with incomplete profile",
            );
            return NextResponse.redirect(new URL("/get-started", req.nextUrl));
        }
        logAuthDecision(
            pathname,
            `redirect:${homePage}`,
            "auth route with valid access token",
        );
        return NextResponse.redirect(new URL(homePage, req.nextUrl));
    }

    try {
        const apiUrl = getApiBaseUrl();
        if (!apiUrl) {
            if (isProtectedRoute || isOnboardingRoute) {
                logAuthDecision(pathname, "redirect:/login", "missing API URL");
                return NextResponse.redirect(new URL("/login", req.nextUrl));
            }
            logAuthDecision(
                pathname,
                "allow",
                "missing API URL on public/auth route",
            );
            return NextResponse.next();
        }

        const cookieParts: string[] = [];
        if (accessToken) cookieParts.push(`access_token=${accessToken.value}`);
        if (refreshToken)
            cookieParts.push(`refresh_token=${refreshToken.value}`);
        const cookieHeader = cookieParts.join("; ");

        let res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        let refreshedSetCookies: string[] = [];
        if (res.status === 401) {
            const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
                method: "POST",
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });

            if (refreshResponse.ok) {
                refreshedSetCookies = readSetCookieHeaders(
                    refreshResponse.headers,
                );
                const refreshedCookieParts = refreshedSetCookies
                    .map((cookie) => cookie.split(";", 1)[0])
                    .filter(Boolean);
                const refreshedCookieHeader = [
                    ...refreshedCookieParts,
                    ...(refreshedCookieParts.some((cookie) =>
                        cookie.startsWith("refresh_token="),
                    )
                        ? []
                        : [`refresh_token=${refreshToken.value}`]),
                ].join("; ");

                res = await fetch(`${apiUrl}/auth/me`, {
                    headers: {
                        Cookie: refreshedCookieHeader,
                        "Content-Type": "application/json",
                    },
                    cache: "no-store",
                });
            }
        }

        const finish = (response: NextResponse) => {
            for (const cookie of refreshedSetCookies) {
                response.headers.append("set-cookie", cookie);
            }
            return response;
        };

        if (res.status === 401) {
            if (isProtectedRoute || isOnboardingRoute) {
                logAuthDecision(
                    pathname,
                    "redirect:/login",
                    "backend /auth/me and refresh returned 401",
                );
                return finish(NextResponse.redirect(new URL("/login", req.nextUrl)));
            }
            logAuthDecision(
                pathname,
                "allow",
                "backend /auth/me and refresh returned 401 on public/auth",
            );
            return finish(NextResponse.next());
        }
        if (!res.ok) {
            if (isProtectedRoute || isOnboardingRoute) {
                logAuthDecision(
                    pathname,
                    "redirect:/login",
                    `backend /auth/me failed with ${res.status}`,
                );
                return NextResponse.redirect(new URL("/login", req.nextUrl));
            }
            logAuthDecision(
                pathname,
                "allow",
                `backend /auth/me failed with ${res.status} on public/auth`,
            );
            return NextResponse.next();
        }

        const payload = await res.json();
        const freshUser = extractSessionClaims(payload);
        if (!freshUser) {
            if (isProtectedRoute || isOnboardingRoute) {
                logAuthDecision(
                    pathname,
                    "redirect:/login",
                    "invalid /auth/me payload",
                );
                return finish(NextResponse.redirect(new URL("/login", req.nextUrl)));
            }
            logAuthDecision(
                pathname,
                "allow",
                "invalid /auth/me payload on public/auth",
            );
            return finish(NextResponse.next());
        }

        const homePage = roleHomePages[freshUser.role ?? ""] || "/";
        const profileIncomplete = isProfileIncomplete(freshUser);

        if (profileIncomplete && !isOnboardingRoute) {
            logAuthDecision(
                pathname,
                "redirect:/get-started",
                "incomplete profile",
            );
            return finish(NextResponse.redirect(new URL("/get-started", req.nextUrl)));
        }

        if (!profileIncomplete && isOnboardingRoute) {
            logAuthDecision(
                pathname,
                `redirect:${homePage}`,
                "profile completed on onboarding route",
            );
            return finish(NextResponse.redirect(new URL(homePage, req.nextUrl)));
        }

        if (isGuestOnlyAuthRoute) {
            logAuthDecision(
                pathname,
                `redirect:${homePage}`,
                "already authenticated user on auth route",
            );
            return finish(NextResponse.redirect(new URL(homePage, req.nextUrl)));
        }

        if (
            isProtectedRoute &&
            !protectedRoute?.roles.includes(freshUser.role ?? "")
        ) {
            logAuthDecision(
                pathname,
                `redirect:${homePage}`,
                "role mismatch for protected route",
            );
            return finish(NextResponse.redirect(new URL(homePage, req.nextUrl)));
        }

        logAuthDecision(pathname, "allow", "authorized");
        return finish(NextResponse.next());
    } catch (error) {
        console.error("Middleware Auth Verification Failed:", error);
        if (isProtectedRoute || isOnboardingRoute) {
            logAuthDecision(
                pathname,
                "redirect:/login",
                "middleware exception on protected/onboarding",
            );
            return NextResponse.redirect(new URL("/login", req.nextUrl));
        }
        logAuthDecision(
            pathname,
            "allow",
            "middleware exception on public/auth",
        );
        return NextResponse.next();
    }
}

// Routes Proxy should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
