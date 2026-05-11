"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    ScanQrCode,
    Users,
    User,
    LogOut,
    LayoutDashboard,
    ChevronsUpDown,
    LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as AuthUser } from "@/types/user";

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

interface NavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

interface OrganizerNavBarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
}

export const menuItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/organizer/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Event Saya",
        href: "/organizer/my-event",
        icon: Calendar,
    },
    {
        title: "Check In",
        href: "/organizer/check-in",
        icon: ScanQrCode,
    },
    {
        title: "Komunitas",
        href: "/organizer/communities",
        icon: Users,
    },
    {
        title: "Organizer Profile",
        href: "/organizer/profile",
        icon: User,
    },
];

// ─── NavContent (shared) ─────────────────────────────────────────────────────

function getUserDisplayName(user: AuthUser | null) {
    if (!user) return "Organizer";

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ");

    return fullName || user.username || user.email || "Organizer";
}

function getUserInitials(name: string) {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("") || "K"
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
        <nav className="flex flex-col gap-1 overflow-hidden">
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
                            "w-full justify-start h-10 rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200",
                            !showLabel && "justify-center px-2",
                            isActive
                                ? "bg-primary/10 text-primary font-semibold shadow-none hover:bg-primary/20 hover:text-primary"
                                : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900",
                        )}
                        onClick={onClose}
                    >
                        <Link href={item.href}>
                            <Icon
                                className={cn(
                                    "h-4.5 w-4.5 shrink-0",
                                    isActive
                                        ? "text-primary"
                                        : "text-slate-400",
                                    showLabel && "mr-3",
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

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export default function OrganizerNavBar({
    isOpen,
    toggleSidebar,
}: OrganizerNavBarProps) {
    const { logout, user } = useAuthStore();
    const displayName = getUserDisplayName(user);
    const fallback = getUserInitials(displayName);

    const profileTrigger = (
        <Button
            variant="ghost"
            className={cn(
                "min-w-0 justify-start  text-left  transition-all hover:border-primary/20 hover:bg-primary-light/60 hover:text-slate-950",
                isOpen ? "h-15 w-full p-2.5" : "h-11 w-11 justify-center p-0",
            )}
        >
            <Avatar className="h-10 w-10 shrink-0 rounded-full ring-2 ring-white">
                <AvatarImage src={user?.profile_url} alt={displayName} />
                <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
                    {fallback}
                </AvatarFallback>
            </Avatar>
            {isOpen && (
                <div className="ml-3 min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-slate-950">
                        {displayName}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {user?.email || "Organizer"}
                    </p>
                </div>
            )}
            {isOpen && (
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
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
                    "fixed top-0 left-0 z-40 h-screen bg-white border-r border-slate-100",
                    "transition-all duration-300 ease-in-out flex-col",
                    "hidden md:flex",
                    isOpen ? "w-64" : "w-20",
                )}
            >
                {/* Header sidebar: Logo + toggle */}
                <div
                    className={cn(
                        "h-18 flex items-center px-4 shrink-0 border-b border-slate-100",
                        isOpen ? "justify-between" : "justify-center",
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center gap-3 overflow-hidden transition-all pt-2 ps-2",
                            !isOpen && "w-0 opacity-0",
                        )}
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-bold text-lg">
                            K
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-tight whitespace-nowrap">
                                kumpul.in
                            </span>
                            <span className="text-[13px] text-slate-500 font-medium whitespace-nowrap">
                                Organizer
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={toggleSidebar}
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "rounded-full shrink-0 text-slate-400 hover:text-slate-600 hover:bg-slate-50",
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

                {/* Konten utama */}
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-4 gap-6">
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <NavContent showLabel={isOpen} items={menuItems} />
                    </div>

                    <div className="flex-1" />

                    <div
                        className={cn(
                            "border-t border-slate-100 pt-4",
                            isOpen
                                ? "flex items-center gap-2"
                                : "flex flex-col items-center gap-2",
                        )}
                    >
                        {accountMenu}
                    </div>
                </div>
            </aside>
        </TooltipProvider>
    );
}
