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
    Home,
    Settings,
    Wallet,
    ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User as AuthUser } from "@/types/user";
import { Separator } from "@/components/ui/separator";
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
        title: "Komunitas Saya",
        href: "/organizer/communities",
        icon: Users,
    },
    {
        title: "Keuangan",
        href: "/organizer/finance",
        icon: Wallet,
    },
    {
        title: "Support Staff",
        href: "/organizer/team",
        icon: ShieldCheck,
    },
    {
        title: "Profil Organizer",
        href: "/organizer/profile",
        icon: User,
    },
];
export function useOrganizerNavItems() {
    return menuItems;
}
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
                                ? "bg-primary/10 text-primary font-semibold shadow-none hover:bg-primary/20 hover:text-primary"
                                : "text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-500",
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

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

export default function OrganizerNavBar({
    isOpen,
    toggleSidebar,
}: OrganizerNavBarProps) {
    const { logout, user } = useAuthStore();
    const navItems = useOrganizerNavItems();
    const displayName = getUserDisplayName(user);
    const fallback = getUserInitials(displayName);

    const profileTrigger = (
        <Button
            variant="ghost"
            className={cn(
                "group min-w-0 justify-start overflow-hidden text-left transition-all",
                isOpen
                    ? "h-11 w-full rounded-lg px-2 py-1.5 hover:bg-slate-50 hover:text-slate-900"
                    : "mx-auto h-10 w-10 justify-center rounded-lg p-0 hover:bg-slate-50",
            )}
        >
            <Avatar className="h-8 w-8 shrink-0 rounded-full">
                <AvatarImage src={user?.profile_url} alt={displayName} />
                <AvatarFallback className="rounded-full bg-primary-light text-xs font-semibold text-primary">
                    {fallback}
                </AvatarFallback>
            </Avatar>

            {isOpen && (
                <div className="ml-2.5 flex min-w-0 flex-1 flex-col justify-center">
                    <p className="truncate text-sm font-semibold leading-tight text-slate-900">
                        {displayName}
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {user?.email || "Organizer"}
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
                className="w-56 rounded-xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10"
            >
                <DropdownMenuItem
                    className="cursor-pointer rounded-lg p-3 text-sm font-medium text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4 text-danger" />
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
                    isOpen ? "w-60" : "w-18",
                )}
            >
                {/* Header sidebar: Logo + toggle */}
                <div
                    className={cn(
                        "h-18 flex items-center px-3 shrink-0 border-b border-slate-100 ",
                        isOpen ? "justify-between" : "justify-center",
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center gap-2.5 overflow-hidden transition-all pt-2 ps-1.5",
                            !isOpen && "w-0 opacity-0",
                        )}
                    >
                        <div className="flex flex-col ps-4">
                            <Image
                                src="/kumpulin_wordmark.svg"
                                alt="Kumpulin Logo"
                                height={40}
                                width={80}
                                priority
                            />
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
                <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-4 py-3 gap-5">
                    <div className="flex flex-col gap-1 overflow-hidden">
                        <NavContent showLabel={isOpen} items={navItems} />
                    </div>

                    <div className="flex-1" />

                    <div className="-mx-4 border-t border-slate-100 px-4 pb-1 pt-3">
                        {/* Tombol Beranda */}
                        <div>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "h-10 w-full justify-start rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900",
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
                        </div>

                        <Separator
                            orientation="horizontal"
                            className={cn(
                                "my-2 border-slate-100",
                                !isOpen && "hidden",
                            )}
                        />

                        {/* Kontainer Account Menu */}
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
