"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

export default function AuthInitializer({ user }: { user: User | null }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        useAuthStore.setState({ user, isLoading: false });
    }, [user]);

    return null;
}