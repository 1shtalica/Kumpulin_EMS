"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

export default function AuthInitializer({ user }: { user: User | null }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        if (user) {
            console.log("AuthInitializer: server user found, syncing...");
            useAuthStore.setState({ user, isLoading: false });
        } else {
            console.log("AuthInitializer: no server user, attempting client check...");
            checkAuth();
        }
    }, [user, checkAuth]);

    return null;
}
