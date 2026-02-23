"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Menu, Home, Compass, LogOut, User, LayoutDashboard, Calendar, ScanQrCode, Users, Ticket, Heart } from "lucide-react";
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

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, checkAuth, logout } = useAuthStore();

  // Menu items berdasarkan role
  const menuItemsByRole = user?.role === "organizer"
    ? [
      { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/organizer/my-event", label: "Event Saya", icon: Calendar },
      { href: "/organizer/check-in", label: "Check In", icon: ScanQrCode },
      { href: "/organizer/communities", label: "Komunitas", icon: Users },
    ]
    : [
      { href: "/user/my-ticket", label: "Tiket Saya", icon: Ticket },
      { href: "/user/following", label: "Mengikuti", icon: Heart },
    ];

  const accountItemsByRole = user?.role === "organizer"
    ? [{ href: "/organizer/profile", label: "Profile", icon: User }]
    : [{ href: "/user/profile", label: "Profile", icon: User }];

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path;
    return cn(
      "rounded-full px-5 py-2 transition-all duration-300 relative font-semibold text-sm h-9",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    );
  };

  const userInitials = user
    ? (user.first_name?.[0] ?? user.username?.[0] ?? "U").toUpperCase()
    : "U";

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out py-3 md:py-4",
        "border-b backdrop-blur-xl",
        isScrolled
          ? "bg-white/85 border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          : "bg-white/50 border-white/40 shadow-none",
      )}
    >
      <div className="container relative mx-auto px-4 md:px-8 lg:px-12 flex flex-row items-center justify-between w-full max-w-7xl">
        {/* LEFT: Burger (mobile) + Logo (desktop-only) */}
        <div className="flex items-center gap-2">
          {/* Burger — Mobile Only, slides dari kiri */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-64 flex flex-col gap-0"
                aria-describedby={undefined}
              >
                <SheetHeader className="h-16 flex flex-row items-center border-b shrink-0 p-0">
                  <SheetTitle className="flex-1 px-4 font-bold">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-xl group cursor-pointer focus-visible:outline-none"
                      onClick={() => { setIsMobileMenuOpen(false); router.refresh(); }}
                    >
                      <span className="transition-transform group-hover:rotate-12">🎉</span>
                      <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
                        kumpul.in
                      </span>
                    </button>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">
                  <nav className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-10",
                        pathname === "/"
                          ? "bg-primary/10 text-primary font-bold hover:bg-primary/20"
                          : "text-muted font-medium",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/">
                        <Home className="h-5 w-5 shrink-0 mr-3" />
                        <span>Beranda</span>
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-10",
                        pathname === "/events"
                          ? "bg-primary/10 text-primary font-bold hover:bg-primary/20"
                          : "text-muted font-medium",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/events">
                        <Compass className="h-5 w-5 shrink-0 mr-3" />
                        <span>Jelajah</span>
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
            onClick={() => router.refresh()}
            className="hidden md:flex items-center gap-2 md:text-2xl group cursor-pointer focus-visible:outline-none"
          >
            <span className="transition-transform group-hover:rotate-12">🎉</span>
            <span className="font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              kumpul.in
            </span>
          </button>
        </div>

        {/* CENTER: Desktop Nav */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
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
        </div>

        {/* RIGHT: Auth area */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            // Placeholder kosong selama auth check — cegah flash tombol masuk/daftar
            <div className="h-8 w-16" />
          ) : user ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="focus-visible:outline-none cursor-pointer">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/30 hover:ring-primary transition-all">
                    <AvatarImage src={user.avatar ?? undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary text-white text-xs font-bold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {/* Info user */}
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-accent truncate">{user.username}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />

                {/* Grup Menu */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-muted px-2 py-1">Menu</DropdownMenuLabel>
                  {menuItemsByRole.map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild>
                      <Link href={href} className="cursor-pointer">
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Grup Akun */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-muted px-2 py-1">Akun</DropdownMenuLabel>
                  {accountItemsByRole.map(({ href, label, icon: Icon }) => (
                    <DropdownMenuItem key={href} asChild>
                      <Link href={href} className="cursor-pointer">
                        <Icon className="mr-2 h-4 w-4" />
                        {label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem
                    className="text-danger focus:text-danger focus:bg-danger/10 cursor-pointer"
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
              <Button variant="ghost" size="sm" className="rounded-full font-bold h-9 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button
                variant="brand"
                size="sm"
                asChild
                className="hidden md:inline-flex rounded-full font-bold h-9 shadow-[0_4px_14px_0_rgb(0,44,238,0.39)] hover:shadow-[0_6px_20px_rgba(0,44,238,0.23)] hover:-translate-y-0.5 transition-all"
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
