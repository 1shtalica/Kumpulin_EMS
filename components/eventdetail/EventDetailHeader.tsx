"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HeaderSection() {
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out p-4",
        "bg-white/80 backdrop-blur-md border-b border-slate-200/50",
        isScrolled ? "shadow-md" : "shadow-xs",
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        {/* === BAGIAN KIRI: LOGO === */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-2xl group">
            <span className="text-3xl transition-transform group-hover:rotate-12">
              🎉
            </span>
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              kumpul.in
            </span>
          </Link>
        </div>

        {/* === BAGIAN KANAN: AUTH === */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                    <AvatarImage
                      src={user.avatar || ""}
                      alt={user.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary-light text-primary font-bold">
                      {user.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl border-border/60 bg-white/90 backdrop-blur-xl shadow-xl shadow-primary/10 p-2"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold text-accent leading-none truncate">
                      {user.username}
                    </p>
                    <p className="text-xs leading-none text-muted truncate font-medium">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-1" />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="rounded-xl p-2.5 text-danger focus:text-red-700 focus:bg-red-50 cursor-pointer font-medium transition-colors"
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="light"
                size="sm"
                className="rounded-xl font-bold"
                asChild
              >
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
