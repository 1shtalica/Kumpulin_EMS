"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GetStartedForm from "@/components/auth/GetStartedForm";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

export default function GetStarted() {
    const router = useRouter();
    const { user, isLoading } = useAuthStore();

    useEffect(() => {
        // Wait for auth check to complete
        if (isLoading) return;

        // Redirect to login if not authenticated
        if (!user) {
            router.push("/login");
            return;
        }

        // Redirect to home if phone already set (profile complete)
        // 🚨 TODO: Update redirect to /dashboard when dashboard is ready
        if (user.phone_number && user.phone_number !== "") {
            router.push("/"); // TEMPORARY: Change to /dashboard later
            return;
        }
    }, [user, isLoading, router]);

    // Show loading while checking auth
    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Show form if authenticated and phone not set
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <GetStartedForm />
        </div>
    );
}