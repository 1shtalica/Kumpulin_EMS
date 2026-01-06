"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
export default function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

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
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-md"
          : "bg-transparent border-transparent shadow-none"
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        {/* === BAGIAN KIRI: LOGO === */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl group">
            <span className="text-3xl transition-transform group-hover:rotate-12">
              🎉
            </span>
            <span className="bg-linear-to-r from-kumpulinPurple to-kumpulinGreen text-transparent bg-clip-text font-bold">
              kumpul.in
            </span>
          </Link>
        </div>

        {/* === BAGIAN TENGAH: MENU (Hidden for now) === */}
        {/* <div className="hidden md:flex gap-8"> ... </div> */}

        {/* === BAGIAN KANAN: DAFTAR TOMBOL === */}
        <div className="flex items-center gap-4">
          <Button variant="light" size="sm" asChild>
            <Link href="/login">Masuk</Link>
          </Button>

          <Button
            variant="brand"
            size="sm"
            asChild
            className="hidden md:inline-flex"
          >
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
