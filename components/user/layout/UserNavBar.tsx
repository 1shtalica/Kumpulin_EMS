"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ClipboardList,
    BookmarkCheck,
    CalendarCheck2,
    Heart,
    Home,
    LogOut,
    LucideIcon,
    MessageSquareText,
    Ticket,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as AuthUser } from "@/types/user";
import { SupportService } from "@/services/support-service";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

interface UserNavBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    workspaceLabel?: string;
}

export const menuItems: NavItem[] = [
    {
        title: "Riwayat Pesanan",
        href: "/user/my-orders",
        icon: ClipboardList,
    },
    {
        title: "Tiket Saya",
        href: "/user/my-ticket",
        icon: Ticket,
    },
    {
        title: "Mengikuti",
        href: "/user/following",
        icon: Heart,
    },
    {
        title: "Wishlist",
        href: "/user/wishlist",
        icon: BookmarkCheck,
    },
    {
        title: "Profil Saya",
        href: "/user/profile",
        icon: User,
    },
];

export const supportMenuItems: NavItem[] = [
    {
        title: "Support Events",
        href: "/dashboard/support/events",
        icon: CalendarCheck2,
    },
    {
        title: "Support Community",
        href: "/dashboard/support/community",
        icon: MessageSquareText,
    },
];

export function useUserNavItems() {
    const user = useAuthStore((state) => state.user);
    const [hasSupportAccess, setHasSupportAccess] = useState(false);

    useEffect(() => {
        let active = true;

        if (!user) {
            return () => {
                active = false;
            };
        }

        const checkSupportAccess = async () => {
            try {
                const access = await SupportService.getSupportAccess();
                if (active) {
                    setHasSupportAccess(access.events || access.community);
                }
            } catch {
                if (active) setHasSupportAccess(false);
            }
        };

        void checkSupportAccess();

        return () => {
            active = false;
        };
    }, [user]);

    return useMemo(
        () =>
            hasSupportAccess ? [...menuItems, ...supportMenuItems] : menuItems,
        [hasSupportAccess],
    );
}

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

interface NavContentProps {
    showLabel?: boolean;
    onClose?: () => void;
    items: NavItem[];
}

export function NavContent({
    showLabel = true,
    onClose,
    items,
}: NavContentProps) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1.5 overflow-hidden">
            {items.map((item) => {
                const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;

                const linkButton = (
                    <Button
                        asChild
                        variant="ghost"
                        className={cn(
                            "h-10 w-full justify-start overflow-hidden whitespace-nowrap rounded-lg px-4 text-sm transition-all duration-200",
                            !showLabel && "justify-center px-0",
                            isActive
                                ? "bg-primary/10 font-semibold text-primary shadow-none hover:bg-primary/20 hover:text-primary"
                                : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        )}
                        onClick={onClose}
                    >
                        <Link href={item.href}>
                            <Icon
                                className={cn(
                                    "h-4 w-4 shrink-0",
                                    isActive
                                        ? "text-primary"
                                        : "text-slate-400",
                                    showLabel && "mr-2.5",
                                )}
                            />
                            {showLabel && (
                                <span className="whitespace-nowrap">
                                    {item.title}
                                </span>
                            )}
                        </Link>
                    </Button>
                );

                if (showLabel) {
                    return <div key={item.href}>{linkButton}</div>;
                }

                return (
                    <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkButton}</TooltipTrigger>
                        <TooltipContent side="right">
                            {item.title}
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </nav>
    );
}

export default function UserNavBar({
    isOpen,
    toggleSidebar,
    workspaceLabel = "User",
}: UserNavBarProps) {
    const router = useRouter();
    const { logout, user } = useAuthStore();
    const navItems = useUserNavItems();
    const displayName = getUserDisplayName(user);
    const fallback = getUserInitials(displayName);

    const profileTrigger = (
        <Button
            variant="ghost"
            className={cn(
                "group min-w-0 justify-start overflow-hidden text-left transition-all",
                isOpen
                    ? "h-13 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-2 py-2 shadow-sm shadow-slate-900/5 hover:border-primary/20 hover:bg-primary-light/60 hover:text-slate-900"
                    : "mx-auto h-10 w-10 justify-center rounded-lg p-0 hover:bg-slate-50",
            )}
        >
            <Avatar className="h-9 w-9 shrink-0 rounded-full ring-2 ring-white">
                <AvatarImage src={user?.profile_url} alt={displayName} />
                <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
                    {fallback}
                </AvatarFallback>
            </Avatar>
            {isOpen && (
                <div className="ml-2.5 min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-slate-950">
                        {displayName}
                    </p>
                </div>
            )}
            {isOpen && (
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-primary" />
            )}
        </Button>
    );

    const accountMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{profileTrigger}</DropdownMenuTrigger>
            <DropdownMenuContent
                align={isOpen ? "end" : "start"}
                side={isOpen ? "top" : "right"}
                className="w-56 rounded-2xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10"
            >
                <DropdownMenuItem
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen border-r border-slate-100 bg-white",
                    "hidden flex-col transition-all duration-300 ease-in-out md:flex",
                    isOpen ? "w-60" : "w-18",
                )}
            >
                <div
                    className={cn(
                        "flex h-18 shrink-0 items-center border-b border-slate-100 px-3",
                        isOpen ? "justify-between" : "justify-center",
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center gap-2.5 overflow-hidden ps-1.5 pt-2 transition-all",
                            !isOpen && "w-0 opacity-0",
                        )}
                    >
                        <Link
                            href="/"
                            className="group flex items-center gap-3 text-left focus-visible:outline-none ps-4"
                        >
                            <span className="flex min-w-0 flex-col">
                                <span className="whitespace-nowrap font-bold leading-tight text-slate-900">
                                    <Image
                                        src="/kumpulin_wordmark.svg"
                                        alt="Kumpulin Logo"
                                        height={40}
                                        width={80}
                                        priority
                                    />
                                </span>
                                <span className="whitespace-nowrap text-xs font-medium text-slate-500">
                                    {workspaceLabel}
                                </span>
                            </span>
                        </Link>
                    </div>

                    <Button
                        onClick={toggleSidebar}
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "shrink-0 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600",
                            isOpen && "ml-auto",
                        )}
                    >
                        {isOpen ? (
                            <ChevronLeft className="h-5 w-5" />
                        ) : (
                            <ChevronRight className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                <div className="flex flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden px-4 py-3">
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <NavContent showLabel={isOpen} items={navItems} />
                    </div>

                    <div className="flex-1" />

                    <div className="-mx-4 border-t border-slate-100 px-4 pb-3 pt-3">
                        <Button
                            variant="ghost"
                            size={isOpen ? "default" : "icon"}
                            className={cn(
                                "h-10 w-full justify-start whitespace-nowrap rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900",
                                !isOpen && "h-10 w-10 justify-center px-0",
                            )}
                            asChild
                        >
                            <Link href="/">
                                <Home
                                    className={cn(
                                        "h-4 w-4 shrink-0",
                                        isOpen && "mr-2.5",
                                    )}
                                />
                                {isOpen && <span>Beranda</span>}
                            </Link>
                        </Button>

                        <div
                            className={cn(
                                "my-2 border-t border-slate-100",
                                !isOpen && "hidden",
                            )}
                        />

                        <div
                            className={cn(
                                "flex items-center",
                                isOpen ? "justify-start" : "justify-center",
                            )}
                        >
                            {accountMenu}
                        </div>
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    );
}
