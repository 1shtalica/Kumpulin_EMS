"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function HeaderSection() {
  const [isScrolled, setIsScrolled] = useState(false);
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
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out p-4",
        // Base Style: Selalu Putih + Blur + Border Halus
        "bg-white/80 backdrop-blur-md border-b border-slate-200/50",
        // Conditional Style: Tambah shadow jika di-scroll
        isScrolled ? "shadow-md" : "shadow-none",
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        {/* === BAGIAN KIRI: LOGO === */}
        <div className="flex items-center gap-4">
          {/* Tombol Back - hanya muncul di event detail */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button> */}

          <Link href="/" className="flex items-center gap-2 text-2xl group">
            <span className="text-3xl transition-transform group-hover:rotate-12">
              🎉
            </span>
            <span className="font-bold bg-clip-text text-transparent bg-linear-to-r from-kumpulinPurple to-kumpulinGreen">
              kumpul.in
            </span>
          </Link>
        </div>

        {/* === BAGIAN KANAN: AUTH === */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            // Teks selalu gelap sekarang
            className="rounded-xl text-black"
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
