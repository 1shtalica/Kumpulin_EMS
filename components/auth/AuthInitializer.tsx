"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

const isAuthRoutePath = (pathname: string): boolean =>
    authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export default function AuthInitializer({ user }: { user: User | null }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);
    const pathname = usePathname();

    useEffect(() => {
        if (user) {
            useAuthStore.setState({ user, isLoading: false });
            return;
        }

        if (isAuthRoutePath(pathname)) {
            useAuthStore.setState({ isLoading: false });
            return;
        }

        // When SSR cannot resolve user from short-lived access token,
        // let client revalidate via /auth/me using refresh cookie.
        void checkAuth();
    }, [checkAuth, pathname, user]);

    return null;
}
