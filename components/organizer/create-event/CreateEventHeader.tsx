"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CreateEventHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full border-b px-3 py-2 transition-all duration-300 ease-in-out md:px-6",
        "bg-white/85 backdrop-blur-xl",
        isScrolled
          ? "border-slate-200 shadow-sm shadow-slate-900/5"
          : "border-slate-200/70 shadow-xs",
      )}
    >
      <div className="container mx-auto flex max-w-7xl flex-row items-center justify-between gap-3">
        <Button
          size="sm"
          variant="ghost"
          className="h-10 rounded-xl pl-2 pr-3 text-slate-600 hover:bg-primary-light/60 hover:text-primary"
          asChild
        >
          <Link href="/organizer/my-event">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Kembali</span>
          </Link>
        </Button>

        <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="inline-flex items-center gap-2 rounded-xl border border-primary/10 bg-primary-light/60 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Buat event baru
          </div>
        </div>


      </div>
    </nav>
  );
}
