"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LogOut } from "lucide-react";
import UserHeader from "@/components/user/layout/UserHeader";
import UserNavBar, {
    NavContent,
    accountItems,
    useUserNavItems,
} from "@/components/user/layout/UserNavBar";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { User as AuthUser } from "@/types/user";

function getUserDisplayName(user: AuthUser | null) {
    if (!user) return "Pengguna";

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.username || user.email || "Pengguna";
}

function getUserInitials(name: string) {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("") || "U"
    );
}

export default function UserMainPagesLayout({
    children,
    variant = "default",
    workspaceLabel = "User",
}: {
    children: React.ReactNode;
    variant?: "default" | "workspace";
    workspaceLabel?: string;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const navItems = useUserNavItems();
    const displayName = getUserDisplayName(user);
    const fallback = getUserInitials(displayName);
    const isWorkspaceVariant = variant === "workspace";

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <div className="flex min-h-screen bg-white">
                <SheetContent
                    side="left"
                    className="flex w-68 flex-col gap-0 border-slate-100 p-0"
                    aria-describedby={undefined}
                >
                    <SheetHeader className="flex h-18 shrink-0 flex-row items-center border-b border-slate-100 p-0">
                        <SheetTitle className="flex-1 px-4 font-bold">
                            <button
                                type="button"
                                className="group flex items-center gap-3 text-left focus-visible:outline-none"
                                onClick={() => {
                                    setIsSheetOpen(false);
                                    router.refresh();
                                }}
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-white transition-transform group-hover:scale-105">
                                    K
                                </span>
                                <span className="flex min-w-0 flex-col">
                                    <span className="whitespace-nowrap font-bold leading-tight text-slate-900">
                                        kumpul.in
                                    </span>
                                    <span className="whitespace-nowrap text-[13px] font-medium text-slate-500">
                                        {workspaceLabel}
                                    </span>
                                </span>
                            </button>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden p-3">
                        <div className="flex flex-col gap-1 overflow-hidden">
                            <NavContent
                                showLabel={true}
                                onClose={() => setIsSheetOpen(false)}
                                items={navItems}
                            />
                        </div>

                        <div className="flex-1" />

                        <div className="space-y-2 border-t border-slate-100 pt-3">
                            <NavContent
                                showLabel={true}
                                onClose={() => setIsSheetOpen(false)}
                                items={accountItems}
                            />

                            <div className="mb-2 flex min-w-0 items-center gap-2.5 rounded-xl px-2 py-2">
                                <Avatar className="h-9 w-9 shrink-0 rounded-full ring-2 ring-white">
                                    <AvatarImage
                                        src={user?.profile_url}
                                        alt={displayName}
                                    />
                                    <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
                                        {fallback}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold leading-tight text-slate-950">
                                        {displayName}
                                    </p>
                                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                        {user?.email || "User"}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className="h-10 w-full justify-start overflow-hidden whitespace-nowrap rounded-lg px-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => {
                                    setIsSheetOpen(false);
                                    logout();
                                }}
                            >
                                <LogOut className="mr-3 h-5 w-5 shrink-0" />
                                <span>Keluar</span>
                            </Button>
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-slate-100 p-4">
                        <Button
                            variant="ghost"
                            className="h-10 w-full justify-start rounded-lg px-3 text-sm whitespace-nowrap text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            asChild
                        >
                            <Link
                                href="/"
                                onClick={() => setIsSheetOpen(false)}
                            >
                                <Home className="h-4 w-4 shrink-0" />
                                <span>Beranda</span>
                            </Link>
                        </Button>
                    </div>
                </SheetContent>

                <UserNavBar
                    isOpen={isOpen}
                    toggleSidebar={() => setIsOpen(!isOpen)}
                    workspaceLabel={workspaceLabel}
                />

                <div
                    className={cn(
                        "px-6 md:px-8 pb-8 flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden",
                        "md:ml-18",
                        isOpen ? "md:ml-60" : "md:ml-18",
                        isWorkspaceVariant ? "pt-6" : "pt-6",
                    )}
                >
                    {children}
                </div>
            </div>
        </Sheet>
    );
}
