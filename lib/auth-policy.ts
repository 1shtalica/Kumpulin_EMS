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

/**
 * Route prefixes that require an authenticated user with one of the listed roles.
 */
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

/**
 * Auth pages that should be available to guests and redirect authenticated users.
 */
export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Public read-only route prefixes that must remain accessible without login.
 */
const guestReadableRoutes = ["/events", "/explore"];

/**
 * Checks whether a pathname is exactly a route or a child path of that route.
 */
export const matchesRoute = (pathname: string, route: string): boolean =>
  pathname === route || pathname.startsWith(`${route}/`);

/**
 * Checks whether a pathname belongs to the guest-facing auth page group.
 */
export const isAuthRoutePath = (pathname: string): boolean =>
  authRoutes.some((route) => matchesRoute(pathname, route));

/**
 * Classifies a pathname into auth policy buckets used by the Next proxy.
 * Public routes should not require backend auth verification.
 */
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
