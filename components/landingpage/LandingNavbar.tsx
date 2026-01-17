"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Logic scroll hanya untuk shadow saja sekarang
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            // Teks selalu gelap sekarang
            className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            asChild
          >
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
      </div>
    </nav>
  );
}
