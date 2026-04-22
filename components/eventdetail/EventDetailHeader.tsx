"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();

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
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out py-4",
        "bg-slate-50/80 backdrop-blur-md border-b border-slate-200/50",
        isScrolled ? "shadow-md" : "shadow-xs",
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
            <span className="text-2xl transition-transform group-hover:rotate-12">
              🎉
            </span>
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              kumpul.in
            </span>
          </button>
        </div>

        {/* === BAGIAN KANAN: AUTH === */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm">
                    <AvatarImage
                      src={user.profile_url || ""}
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
