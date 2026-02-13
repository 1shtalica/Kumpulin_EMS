"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

export default function AuthInitializer({ user }: { user: User | null }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        if (user) {
            // Server successfully resolved user, sync to store
            console.log("AuthInitializer: server user found, syncing...");
            useAuthStore.setState({ user, isLoading: false });
        } else {
            // Server returned null (guest or failed fetch).
            // Try client-side check to see if we can recover session (e.g. refresh token)
            console.log("AuthInitializer: no server user, attempting client check...");
            checkAuth();
        }
    }, [user, checkAuth]);

    return null;
}
