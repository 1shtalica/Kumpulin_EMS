"use client";

import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UserCard() {
    const { user, logout, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto w-full animate-pulse">
                <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-full bg-slate-200" />
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <div className="h-6 w-1/3 bg-slate-200 rounded" />
                            <div className="h-4 w-1/2 bg-slate-200 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl mx-auto w-full">
            <div className="flex items-start gap-6">
                <div className="h-20 w-20 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                    {user?.username?.substring(0, 2).toUpperCase() || "US"}
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <h2 className="text-xl font-bold">{user?.username || "Guest"}</h2>
                        <p className="text-muted-foreground">{user?.email}</p>
                        <div className="mt-2 text-sm">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium text-xs">
                                {user?.role || "user"}
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                        <div>
                            <p className="text-muted-foreground">User ID</p>
                            <p className="font-medium">{user?.user_id}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{user?.phone_number || "-"}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Name</p>
                            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button variant="destructive" onClick={() => logout()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
