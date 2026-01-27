"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
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

  // Helper untuk menentukan style Active vs Inactive (Versi Sederhana/Putih)
  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path;

    return cn(
      "rounded-full transition-all duration-300",
      isActive
        ? "bg-purple-50 text-kumpulinPurple font-bold" // Active State
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900", // Inactive State
    );
  };

  console.log(user)
  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out p-4",
        // Base Style: Selalu Putih + Blur + Border Halus
        "bg-white/80 backdrop-blur-md border-b border-slate-200/50",
        // Conditional Style: Tambah shadow jika di-scroll
        isScrolled ? "shadow-md" : "shadow-none",
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        {/* === BAGIAN KIRI: LOGO === */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl group">
            <span className="text-3xl transition-transform group-hover:rotate-12">
              🎉
            </span>
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-kumpulinPurple to-kumpulinGreen">
              kumpul.in
            </span>
          </Link>
        </div>

        {/* === BAGIAN TENGAH: MENU === */}
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

        {/* === BAGIAN KANAN: AUTH === */}
        {user ? (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-kumpulinPurple/20 transition-all hover:scale-105 active:scale-95">
                  <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                    <AvatarImage src={user.avatar || ""} alt={user.username} className="object-cover" />
                    <AvatarFallback className="bg-linear-to-br from-purple-100 to-indigo-100 text-kumpulinPurple font-bold">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl shadow-kumpulinPurple/10 p-2"
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="rounded-xl" asChild>
              <Link href="/login">Masuk</Link>
            </Button>

            <Button
              variant="brand"
              size="sm"
              asChild
              className="hidden rounded-xl md:inline-flex shadow-lg shadow-kumpulinPurple/20"
            >
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
