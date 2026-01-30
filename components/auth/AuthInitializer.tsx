"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

export default function AuthInitializer({ user }: { user: User | null }) {
    const initialized = useRef(false);

    // Server-side hydration (Run once on mount/render)
    if (!initialized.current && user) {
        useAuthStore.setState({ user, isLoading: false });
        initialized.current = true;
    }

    const checkAuth = useAuthStore((state) => state.checkAuth);
    const currentUser = useAuthStore((state) => state.user);

    useEffect(() => {
        // Only fetch if we haven't initialized with a user AND we don't have a user yet
        // This covers the case where the user navigates client-side and we need to re-verify or initial load failed
        if (!initialized.current && !user && !currentUser) {
            checkAuth();
            initialized.current = true;
        }
    }, [checkAuth, user, currentUser]);

    return null;
}
