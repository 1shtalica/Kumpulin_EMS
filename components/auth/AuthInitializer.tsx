"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

export default function AuthInitializer({ user }: { user: User | null }) {
    const initialized = useRef(false);

    if (!initialized.current && user) {
        useAuthStore.setState({ user, isLoading: false });
        initialized.current = true;
    }

    // const checkAuth = useAuthStore((state) => state.checkAuth);
    // const currentUser = useAuthStore((state) => state.user);

    // useEffect(() => {
    //     if (!initialized.current && !user && !currentUser) {
    //         checkAuth();
    //         initialized.current = true;
    //     }
    // }, [checkAuth, user, currentUser]);

    return null;
}
