"use client";

import { useState } from "react";
import OrganizerNavBar, {
    NavContent,
    useOrganizerNavItems,
} from "@/components/organizer/layout/OrganizerNavBar";
import { useAuthStore } from "@/stores/auth-store";
import { ChevronsUpDown, LogOut, User, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function MainPagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { logout, user } = useAuthStore();
    const navItems = useOrganizerNavItems();
    const scannerOnly =
        pathname.startsWith("/organizer/check-in/") &&
        searchParams.get("scanner") === "1";
    const displayName =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        user?.username ||
        user?.email ||
        "Organizer";
    const initials =
        displayName
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("") || "K";

    if (scannerOnly) {
        return <div className="min-h-screen bg-[#f9fafb]">{children}</div>;
    }

    return (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <div className="min-h-screen bg-white flex">
                {/* ── Mobile Sheet ── */}
                <SheetContent
                    side="left"
                    className="w-68 flex flex-col gap-0 p-0"
                    aria-describedby={undefined}
                >
                    <SheetHeader className="h-18 flex flex-row items-center border-b border-slate-100 shrink-0 p-0">
                        <SheetTitle className="flex-1 px-4 text-left">
                            <button
                                type="button"
                                className="flex items-center gap-3 group cursor-pointer focus-visible:outline-none"
                                onClick={() => {
                                    setIsSheetOpen(false);
                                    router.refresh();
                                }}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-base">
                                    K
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="font-bold text-slate-900 leading-tight whitespace-nowrap">
                                        kumpul.in
                                    </span>
                                    <span className="text-[13px] text-slate-500 font-medium whitespace-nowrap">
                                        Organizer
                                    </span>
                                </div>
                            </button>
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-3 gap-5">
                        <div className="flex flex-col gap-1 overflow-hidden">
                            <NavContent
                                showLabel={true}
                                onClose={() => setIsSheetOpen(false)}
                                items={navItems}
                            />
                        </div>

                        <div className="flex-1" />

                        {/* Tombol Beranda */}
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSheetOpen(false);
                                    router.push("/");
                                }}
                                className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <Home className="h-4 w-4 shrink-0 text-slate-400" />
                                Beranda
                            </button>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="flex h-13 w-full min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/20 hover:bg-primary-light/60"
                                    >
                                        <Avatar className="h-9 w-9 shrink-0 rounded-full ring-2 ring-white">
                                            <AvatarImage
                                                src={user?.profile_url}
                                                alt={displayName}
                                            />
                                            <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold leading-tight text-slate-950">
                                                {displayName}
                                            </p>
                                            <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                                {user?.email || "Organizer"}
                                            </p>
                                        </div>
                                        <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    side="top"
                                    className="w-56 rounded-2xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10"
                                >
                                    <DropdownMenuItem
                                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium"
                                        onClick={() => {
                                            setIsSheetOpen(false);
                                            router.push("/organizer/profile");
                                        }}
                                    >
                                        <User className="mr-2 h-4 w-4 text-primary" />
                                        Organizer Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                                        onClick={() => {
                                            setIsSheetOpen(false);
                                            logout();
                                        }}
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </SheetContent>

                {/* ── Desktop Sidebar ── */}
                <OrganizerNavBar
                    isOpen={isOpen}
                    toggleSidebar={() => setIsOpen(!isOpen)}
                />

                {/* ── Main Content ── */}
                <div
                    className={cn(
                        "px-6 md:px-8 pb-8 flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden",
                        "md:ml-18",
                        isOpen ? "md:ml-60" : "md:ml-18",
                        "pt-6",
                    )}
                >
                    {children}
                </div>
            </div>
        </Sheet>
    );
}
