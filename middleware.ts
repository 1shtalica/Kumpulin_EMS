import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  // 🌟 Organizer page
  // {
  //     path: "/organizer",
  //     roles: ["organizer"],
  // },
  // 🌟 User page
  {
    path: "/user",
    roles: ["user"],
  },
  {
    path: "/get-started",
    roles: ["user"],
  },
];

const publicRoutes = [
  "/",
  "/events",
  "events/:slug",
  "/login",
  "/register",
  "forgot-password",
  "reset-password",
];

const roleHomePages: Record<string, string> = {
  organizer: "/organizer",
  user: "/user",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  const isPublicRoute = publicRoutes.includes(pathname);

  // 🌟 Kalau tidak terdaftar di list maka harus di verifikasi dahulu
  if (!protectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  // const allCookies = request.cookies.getAll();
  const accessToken = request.cookies.get("access_token");
  const refreshToken = request.cookies.get("refresh_token");
  const hasAuthCookies = !!(accessToken && refreshToken);

  if (!hasAuthCookies) {
    if (protectedRoute) {
      return redirect(request, "/login");
    }
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    // const cookieHeader = allCookies
    //   .map((c) => `${c.name}=${c.value}`)
    //   .join("; ");

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

    if (!res.ok) {
      if (protectedRoute) {
        return redirect(request, "/login");
      }
      return NextResponse.next();
    }

    const user = await res.json();
    if (isPublicRoute) {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
