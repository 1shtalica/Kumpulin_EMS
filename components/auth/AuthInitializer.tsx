"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

export default function AuthInitializer({ user }: { user: User | null }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        if (user) {
            useAuthStore.setState({ user, isLoading: false });
            return;
        }

        // When SSR cannot resolve user from short-lived access token,
        // let client revalidate via /auth/me using refresh cookie.
        void checkAuth();
    }, [checkAuth, user]);

    return null;
}
