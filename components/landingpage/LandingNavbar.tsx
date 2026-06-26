"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
    Menu,
    Home,
    LogOut,
    User,
    LayoutDashboard,
    Calendar,
    ScanQrCode,
    Users,
    Ticket,
    Heart,
    BookmarkCheck,
    Settings,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
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
import { useAuthStore } from "@/stores/auth-store";
import Image from "next/image";

export default function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading, logout } = useAuthStore();

    // Menu items berdasarkan role
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
                      label: "Komunitas Saya",
                      icon: Users,
                  },
                  {
                      href: "/organizer/profile",
                      label: "Profil Organizer",
                      icon: User,
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
            ? [
                  {
                      href: "/organizer/profile",
                      label: "Pengaturan Akun",
                      icon: Settings,
                  },
              ]
            : [
                  {
                      href: "/user/profile",
                      label: "Pengaturan Akun",
                      icon: Settings,
                  },
              ];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const getNavLinkClass = (path: string) => {
        const isActive =
            path !== "/"
                ? pathname.slice(0, path.length) === path
                : pathname === path;
        return cn(
            "relative h-9 rounded-xl px-4 text-sm font-semibold transition-all duration-200",
            isActive
                ? "border border-primary/10 bg-primary-light text-primary shadow-sm shadow-primary/5 hover:bg-primary-light hover:text-primary"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
        );
    };

    const userInitials = user
        ? (user.first_name?.[0] ?? user.username?.[0] ?? "U").toUpperCase()
        : "U";

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full border-b py-2.5 backdrop-blur-xl transition-all duration-300 ease-in-out md:py-3",
                isScrolled
                    ? "border-slate-200/70 bg-white/90 shadow-sm shadow-slate-900/5"
                    : "border-slate-100 bg-white/95 shadow-none",
            )}
        >
            <div className="container relative mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-4 md:px-8 lg:px-12">
                {/* LEFT: Burger (mobile) + Logo (desktop-only) */}
                <div className="flex items-center gap-2">
                    {/* Burger — Mobile Only, slides dari kiri */}
                    <div className="md:hidden">
                        <Sheet
                            open={isMobileMenuOpen}
                            onOpenChange={setIsMobileMenuOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary"
                                    aria-label="Menu"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side="left"
                                className="flex w-72 flex-col gap-0 border-slate-200 p-0"
                                aria-describedby={undefined}
                            >
                                <SheetHeader className="flex h-16 shrink-0 flex-row items-center border-b border-slate-100 px-4 py-0">
                                    <SheetTitle className="flex-1">
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 text-xl group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                router.push("/");
                                            }}
                                        >
                                            <Image
                                                src="/kumpulin_wordmark.svg"
                                                alt="Kumpulin Logo"
                                                height={40}
                                                width={120}
                                                priority
                                            />
                                        </button>
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
                                    <nav className="flex flex-col gap-1.5">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            className={cn(
                                                "h-10 w-full justify-start rounded-xl px-3 text-sm",
                                                pathname === "/"
                                                    ? "bg-primary-light font-semibold text-primary hover:bg-primary-light"
                                                    : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                            )}
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Link href="/">
                                                <Home className="mr-3 h-4 w-4 shrink-0" />
                                                <span>Beranda</span>
                                            </Link>
                                        </Button>

                                        <Button
                                            asChild
                                            variant="ghost"
                                            className={cn(
                                                "h-10 w-full justify-start rounded-xl px-3 text-sm",
                                                pathname === "/events"
                                                    ? "bg-primary-light font-semibold text-primary hover:bg-primary-light"
                                                    : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                            )}
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Link href="/events">
                                                <Calendar className="mr-3 h-4 w-4 shrink-0" />
                                                <span>Jelajah</span>
                                            </Link>
                                        </Button>

                                        <Button
                                            asChild
                                            variant="ghost"
                                            className={cn(
                                                "h-10 w-full justify-start rounded-xl px-3 text-sm",
                                                pathname.startsWith("/komunitas")
                                                    ? "bg-primary-light font-semibold text-primary hover:bg-primary-light"
                                                    : "font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                            )}
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            <Link href="/komunitas">
                                                <Users className="mr-3 h-4 w-4 shrink-0" />
                                                <span>Komunitas</span>
                                            </Link>
                                        </Button>
                                    </nav>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo — Desktop only (hidden on mobile) */}
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="hidden h-10 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 md:flex"
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

                {/* CENTER: Desktop Nav */}
                <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200/70 bg-white/80 p-1 shadow-sm shadow-slate-900/5 md:flex">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={getNavLinkClass("/")}
                    >
                        <Link href="/">Beranda</Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={getNavLinkClass("/events")}
                    >
                        <Link href="/events">Jelajah</Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className={getNavLinkClass("/komunitas")}
                    >
                        <Link href="/komunitas">Komunitas</Link>
                    </Button>
                </div>

                {/* RIGHT: Auth area */}
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        // Placeholder kosong selama auth check — cegah flash tombol masuk/daftar
                        <div className="h-8 w-16" />
                    ) : user ? (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button className="cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                                    <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all hover:ring-primary/50">
                                        <AvatarImage
                                            src={user.profile_url ?? undefined}
                                            alt={user.username}
                                        />
                                        <AvatarFallback className="bg-primary-light text-xs font-semibold text-primary">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-200 p-1.5 shadow-lg shadow-slate-900/10">
                                {/* Info user */}
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold text-accent truncate">
                                        {user.username}
                                    </p>
                                    <p className="text-xs text-muted truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <DropdownMenuSeparator />

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

                                <DropdownMenuSeparator />

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
                                        className="cursor-pointer rounded-xl text-danger focus:bg-danger/10 focus:text-danger"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-2 h-4 w-4 text-danger" />
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        /* Guest — tombol Masuk (selalu) + Daftar (desktop only) */
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                asChild
                            >
                                <Link href="/login">Masuk</Link>
                            </Button>
                            <Button
                                variant="brand"
                                size="sm"
                                asChild
                                className="hidden h-9 rounded-xl px-4 text-sm font-semibold shadow-glow transition-all hover:bg-primary-hover md:inline-flex"
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
