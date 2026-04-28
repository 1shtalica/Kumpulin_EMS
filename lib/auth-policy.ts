export type ProtectedRoutePolicy = {
  path: string;
  roles: string[];
};

export type RoutePolicyResolution = {
  isOnboardingRoute: boolean;
  isProtectedRoute: boolean;
  isAuthRoute: boolean;
  isPublicRoute: boolean;
  protectedRoute?: ProtectedRoutePolicy;
};

export const protectedRoutes: ProtectedRoutePolicy[] = [
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

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const guestReadableRoutes = ["/events", "/explore"];

export const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

export const isAuthRoutePath = (pathname: string): boolean =>
  authRoutes.some((route) => matchesRoute(pathname, route));

export const resolveRoutePolicy = (pathname: string): RoutePolicyResolution => {
  const isOnboardingRoute = pathname === "/get-started";

  const protectedRoute = protectedRoutes.find((route) =>
    matchesRoute(pathname, route.path),
  );
  const isProtectedRoute = Boolean(protectedRoute);

  const isGuestReadableRoute = guestReadableRoutes.some((route) =>
    matchesRoute(pathname, route),
  );
  const isPublicOrganizerRoute =
    matchesRoute(pathname, "/organizer") && !isProtectedRoute;

  const isAuthRoute = isAuthRoutePath(pathname);
  const isPublicRoute =
    pathname === "/" ||
    isGuestReadableRoute ||
    isPublicOrganizerRoute ||
    isAuthRoute;

  return {
    isOnboardingRoute,
    isProtectedRoute,
    isAuthRoute,
    isPublicRoute,
    protectedRoute: protectedRoute ?? undefined,
  };
};
