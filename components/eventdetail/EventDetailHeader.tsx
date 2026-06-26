"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import {
    LogOut,
    User,
    LayoutDashboard,
    Calendar,
    ScanQrCode,
    Users,
    Ticket,
    Heart,
    BookmarkCheck,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function HeaderSection() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, isLoading } = useAuthStore();
    const router = useRouter();

    // Menu items berdasarkan role — sama persis dengan LandingNavbar
    const menuItemsByRole =
        user?.role === "organizer"
            ? [
                  {
                      href: "/organizer/dashboard",
                      label: "Dashboard",
                      icon: LayoutDashboard,
                  },
                  {
                      href: "/organizer/my-event",
                      label: "Event Saya",
                      icon: Calendar,
                  },
                  {
                      href: "/organizer/check-in",
                      label: "Check In",
                      icon: ScanQrCode,
                  },
                  {
                      href: "/organizer/communities",
                      label: "Komunitas",
                      icon: Users,
                  },
              ]
            : [
                  {
                      href: "/user/my-ticket",
                      label: "Tiket Saya",
                      icon: Ticket,
                  },
                  { href: "/user/following", label: "Mengikuti", icon: Heart },
                  {
                      href: "/user/wishlist",
                      label: "Wishlist",
                      icon: BookmarkCheck,
                  },
              ];

    const accountItemsByRole =
        user?.role === "organizer"
            ? [{ href: "/organizer/profile", label: "Profile", icon: User }]
            : [{ href: "/user/profile", label: "Profile", icon: User }];

    const userInitials = user
        ? (user.first_name?.[0] ?? user.username?.[0] ?? "U").toUpperCase()
        : "U";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out py-3.5",
                "bg-[#f9fafb]/85 backdrop-blur-xl border-b border-slate-200/70",
                isScrolled ? "shadow-md shadow-slate-900/5" : "shadow-xs",
            )}
        >
            <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl flex flex-row items-center justify-between">
                {/* === BAGIAN KIRI: LOGO === */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => router.refresh()}
                        className="flex items-center gap-2 text-xl group cursor-pointer focus-visible:outline-none"
                    >
                        <Image
                            src="/kumpulin_wordmark.svg"
                            alt="Kumpulin Logo"
                            height={40}
                            width={120}
                            priority
                        />
                    </button>
                </div>

                {/* === BAGIAN KANAN: AUTH === */}
                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                    ) : user ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                                    <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                                        <AvatarImage
                                            src={user.profile_url ?? undefined}
                                            alt={user.username}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-primary text-white font-bold text-sm">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56 rounded-xl border-border/60 bg-white/95 backdrop-blur-xl shadow-xl shadow-primary/10 p-2"
                                align="end"
                                forceMount
                            >
                                {/* Info user */}
                                <div className="px-2 py-2">
                                    <p className="text-sm font-semibold text-accent leading-none truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-xs leading-none text-muted truncate font-medium mt-1">
                                        {user.email}
                                    </p>
                                </div>
                                <DropdownMenuSeparator className="bg-border/50 my-1" />

                                {/* Grup Menu */}
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs font-semibold text-muted px-2 py-1">
                                        Menu
                                    </DropdownMenuLabel>
                                    {menuItemsByRole.map(
                                        ({ href, label, icon: Icon }) => (
                                            <DropdownMenuItem
                                                key={href}
                                                asChild
                                            >
                                                <Link
                                                    href={href}
                                                    className="cursor-pointer rounded-xl"
                                                >
                                                    <Icon className="mr-2 h-4 w-4" />
                                                    {label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                </DropdownMenuGroup>

                                <DropdownMenuSeparator className="bg-border/50 my-1" />

                                {/* Grup Akun */}
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="text-xs font-semibold text-muted px-2 py-1">
                                        Akun
                                    </DropdownMenuLabel>
                                    {accountItemsByRole.map(
                                        ({ href, label, icon: Icon }) => (
                                            <DropdownMenuItem
                                                key={href}
                                                asChild
                                            >
                                                <Link
                                                    href={href}
                                                    className="cursor-pointer rounded-xl"
                                                >
                                                    <Icon className="mr-2 h-4 w-4" />
                                                    {label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => logout()}
                                        className="rounded-xl p-2.5 text-danger focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium transition-colors"
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-danger" />
                                        <span>Keluar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-xl font-bold h-9 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm"
                                asChild
                            >
                                <Link href="/login">Masuk</Link>
                            </Button>
                            <Button
                                variant="brand"
                                size="sm"
                                asChild
                                className="hidden md:inline-flex rounded-xl font-bold h-9 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
                            >
                                <Link href="/register">Daftar</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
