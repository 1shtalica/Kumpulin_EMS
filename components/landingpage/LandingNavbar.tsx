"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// TODO: TEMPORARY - Remove when dashboard is ready
// These imports are only needed until backend redirects authenticated users to dashboard
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// END TODO

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  // TODO: TEMPORARY - Remove when dashboard redirects authenticated users
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  
  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path;

    return cn(
      "rounded-full transition-all duration-300",
      isActive
        ? "bg-none hover:bg-primary-light text-primary text-md font-bold" 
        : " hover:bg-primary-light text-accent text-md font-semibold", 
    );
  };

  const getMobileNavLinkClass = (path: string) => {
    const isActive = pathname === path;
    return cn(
      "w-full justify-start text-base font-medium transition-colors",
      isActive
        ? "bg-primary-light hover:bg-primary-light text-primary text-md font-bold" 
        : "hover:bg-primary-light text-accent text-md font-semibold", 
    );
  };
  
  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out p-4",
        "bg-white/80 backdrop-blur-md border-b border-slate-200/50",
        isScrolled ? "shadow-md" : "shadow-xs",
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        {/* Logo - Always Left */}
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl group">
          <span className="transition-transform group-hover:rotate-12">
            🎉
          </span>
          <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            kumpul.in
          </span>
        </Link>
        {/* === BAGIAN TENGAH: MENU (Desktop) === */}
        <div className="hidden md:flex items-center gap-2">
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

        {/* Burger Menu - Mobile Only (Right Side) */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-75 sm:w-87.5">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">🎉</span>
                  <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
                    kumpul.in
                  </span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-6 mt-8 px-4">
                {/* Navigation Links - Text Style */}
                <nav className="flex flex-col gap-1">
                  <Button
            asChild
            variant="ghost"
            size="lg"
            className={getMobileNavLinkClass("/")}
          >
            <Link href="/">Beranda</Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className={getMobileNavLinkClass("/events")}
          >
            <Link href="/events">Jelajah</Link>
          </Button>
                </nav>

                <Separator/>

                {/* Auth Buttons */}
                {user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || ""} />
                        <AvatarFallback className="bg-primary-light text-primary">
                          {user.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold">{user.username}</p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      asChild
                      variant="light"
                      size="lg"
                      className="w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/login">Masuk</Link>
                    </Button>

                  
                    <Button
                      asChild
                      variant="brand"
                      size="lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/register">Daftar Sekarang</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* === BAGIAN KANAN: AUTH === */}
        {/* TODO: TEMPORARY - Remove entire user section when dashboard is ready */}
        {/* When backend middleware redirects authenticated users to dashboard, */}
        {/* this public navbar should only show Login/Register buttons */}
        {user ? (
          <div className="hidden md:inline-flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={user.avatar || ""} alt={user.username} className="object-cover" />
                    <AvatarFallback className="bg-primary-light text-primary font-bold">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl shadow-primary/10 p-2"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold text-slate-900 leading-none truncate">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-slate-500 truncate font-medium">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="rounded-xl p-2.5 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium transition-colors"
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          /* END TODO - Keep Login/Register buttons as they're for public access */
          <div className="hidden md:flex items-center gap-4">
            <Button variant="light" size="sm" className="rounded-xl font-bold" asChild>
              <Link href="/login">Masuk</Link>
            </Button>

            <Button
              variant="brand"
              size="sm"
              asChild
              className="hidden rounded-xl md:inline-flex font-bold"
            >
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
