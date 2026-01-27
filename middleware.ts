import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
    {
        path: "/dashboard",
        roles: [],
    },
    {
        path: "/admin",
        roles: ["admin", "user"],
    },
];

const guestRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const protectedRoute = protectedRoutes.find((route) =>
        pathname.startsWith(route.path)
    );
    const isGuestRoute = guestRoutes.includes(pathname);

    if (!protectedRoute && !isGuestRoute) {
        return NextResponse.next();
    }

    const allCookies = request.cookies.getAll();
    const hasAuthCookies = allCookies.length > 0;

    if (!hasAuthCookies) {
        if (protectedRoute) {
            return redirect(request, "/login");
        }
        return NextResponse.next();
    }

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

        const res = await fetch(`${apiUrl}/auth/me`, {
            headers: {
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (protectedRoute) {
                return redirect(request, "/login");
            }
            return NextResponse.next();
        }

        const user = await res.json();
        if (isGuestRoute) {
            return redirect(request, "/");
        }

        if (protectedRoute) {
            if (protectedRoute.roles.length > 0) {
                if (!protectedRoute.roles.includes(user.role)) {
                    return redirect(request, "/");
                }
            }
        }

        return NextResponse.next();

    } catch (error) {
        console.error("Middleware Auth Verification Failed:", error);
        if (protectedRoute) {
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
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};
