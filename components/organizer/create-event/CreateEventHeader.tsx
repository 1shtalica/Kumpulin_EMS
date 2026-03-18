"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CreateEventHeader() {
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

  const handleSaveDraft = () => {
    alert("Draft berhasil disimpan");
  };

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300 ease-in-out px-3 py-2 md:px-6 md:py-2",
        "bg-white/80 backdrop-blur-md border-b border-slate-200/50",
        isScrolled ? "shadow-md" : "shadow-xs",
      )}
    >
      <div className="container mx-auto flex flex-row items-center justify-between">
        <Button
          size="lg"
          variant="ghost"
          className="rounded-3xl pl-2 gap-2 text-muted hover:text-accent"
          asChild
        >
          {/* 🌟 Nanti diubah pakai callback jika iya */}
          <Link href="/organizer/my-event">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </Button>

        {/* KANAN: Aksi Simpan */}
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            onClick={handleSaveDraft}
            className="gap-2 rounded-3xl"
          >
            <Save className="h-4 w-4" />
            Simpan Draft
          </Button>
        </div>
      </div>
    </nav>
  )
}
