"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Menu, Home, Compass } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
      "rounded-full transition-all duration-300",
      isActive
        ? "bg-none hover:bg-primary-light text-primary text-md font-bold"
        : " hover:bg-primary-light text-accent text-md font-semibold",
    );
  };

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out py-4",
        "bg-white backdrop-blur-md border-b border-slate-200/50",
        isScrolled ? "shadow-md" : "shadow-xs",
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex flex-row items-center justify-between">
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

                  {/* Auth Buttons — Guest only (middleware will redirect logged-in users) */}
                  <div className="mt-auto flex flex-col gap-3">
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
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              kumpul.in
            </span>
          </button>
        </div>

        {/* CENTER: Desktop Nav */}
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

        {/* RIGHT: Auth Buttons — Guest only (middleware will redirect logged-in users) */}
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
      </div>
    </nav>
  );
}
