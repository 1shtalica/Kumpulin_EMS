"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Music,
  Laptop,
  Trophy,
  Palette,
  Briefcase,
  Pizza,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  {
    name: "Musik",
    icon: <Music size={18} />,
    href: "/events?category=musik",
    color: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    name: "Teknologi",
    icon: <Laptop size={18} />,
    href: "/events?category=teknologi",
    color: "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  },
  {
    name: "Olahraga",
    icon: <Trophy size={18} />,
    href: "/events?category=olahraga",
    color: "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white",
  },
  {
    name: "Desain",
    icon: <Palette size={18} />,
    href: "/events?category=desain",
    color: "bg-pink-100 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
  },
  {
    name: "Bisnis",
    icon: <Briefcase size={18} />,
    href: "/events?category=bisnis",
    color: "bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
  },
  {
    name: "Kuliner",
    icon: <Pizza size={18} />,
    href: "/events?category=kuliner",
    color: "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const debouncedSearch = useDebouncedCallback((term: string) => {
    if (term.trim()) {
      router.push(`/events?q=${encodeURIComponent(term.trim())}`);
    }
  }, 500);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearch.cancel(); // Cancel pending debounce
      const value = e.currentTarget.value.trim();
      if (value) {
        router.push(`/events?q=${encodeURIComponent(value)}`);
      }
    }
  };

  const executeSearch = () => {
    if (searchValue.trim()) {
      debouncedSearch.cancel();
      router.push(`/events?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 flex flex-col items-center justify-center overflow-hidden bg-slate-50">
      {/* Background gradients and texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-1/4 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[120px]" />
        <Image
          src="/Images/noiseGradient.png"
          alt="Background Texture"
          fill
          className="object-cover object-center opacity-[0.15] mix-blend-multiply"
          priority
        />
      </div>

      <div className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center gap-8">

        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-xs sm:text-sm font-semibold text-slate-700">Temukan 1000+ Event Menarik Bulan Ini</span>
        </div>

        {/* Highlighted Typography */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both leading-tight">
          Waktunya Eksplorasi <br className="hidden sm:block" />
          <span className="relative whitespace-nowrap inline-block mt-2">
            <span className="relative z-10 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">Event Terbaik</span>
            {/* Decorative underline */}
            <svg className="absolute -bottom-1 left-0 w-full h-2 sm:h-3 text-primary/30 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 15 Q 50 0 100 15 L 100 20 L 0 20 Z" fill="currentColor" />
            </svg>
          </span>
        </h1>

        <p className="max-w-2xl text-sm sm:text-base md:text-lg text-slate-600 font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both leading-relaxed">
          Jangan lewatkan momen seru di sekitarmu. Dari konser musik meriah, workshop edukatif, hingga festival budaya yang tak terlupakan.
        </p>

        {/* Elevated Search Component */}
        <div className="w-full max-w-2xl mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
          <div className="relative flex items-center w-full h-14 sm:h-16 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-1.5 sm:p-2 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10">
            <div className="flex items-center justify-center w-10 sm:w-12 h-full">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Cari event, konser, workshop..."
              className="flex-1 h-full border-0 bg-transparent text-slate-800 placeholder:text-slate-400 focus-visible:ring-0 text-sm sm:text-base px-2 rounded-none shadow-none"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              onClick={executeSearch}
              className="h-full px-5 sm:px-6 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hidden sm:flex"
            >
              Cari Event
            </Button>
          </div>
        </div>

        {/* Modern Interactive Categories */}
        <div className="w-full mt-8 sm:mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-700 fill-mode-both">
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-4 sm:mb-6 uppercase tracking-wider">Atau telusuri kategori</p>
          <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group flex flex-col sm:flex-row items-center gap-2 bg-white border border-slate-100 px-3 py-3 sm:px-4 sm:py-2.5 rounded-xl hover:border-transparent hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 w-[90px] sm:w-auto"
              >
                <div className={`p-2.5 sm:p-2 rounded-lg transition-colors duration-300 ${category.color}`}>
                  {category.icon}
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors text-xs sm:text-sm">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Decorative Bottom Fade bridging to next section */}
      <div className="absolute bottom-0 left-0 w-full h-24 lg:h-32 bg-linear-to-t from-white to-transparent z-20 pointer-events-none" />
    </section>
  );
}
