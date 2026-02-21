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
// import HeroImage from

const categories = [
  {
    name: "Musik",
    icon: <Music size={18} />,
    href: "/events?category=musik",
  },
  {
    name: "Teknologi",
    icon: <Laptop size={18} />,
    href: "/events?category=teknologi",
  },
  {
    name: "Olahraga",
    icon: <Trophy size={18} />,
    href: "/events?category=olahraga",
  },
  {
    name: "Desain",
    icon: <Palette size={18} />,
    href: "/events?category=desain",
  },
  {
    name: "Bisnis",
    icon: <Briefcase size={18} />,
    href: "/events?category=bisnis",
  },
  {
    name: "Kuliner",
    icon: <Pizza size={18} />,
    href: "/events?category=kuliner",
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  // Debounced search (500ms delay)
  const debouncedSearch = useDebouncedCallback((term: string) => {
    if (term.trim()) {
      router.push(`/events?q=${encodeURIComponent(term.trim())}`);
    }
  }, 500);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Instant search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearch.cancel(); // Cancel pending debounce
      const value = e.currentTarget.value.trim();
      if (value) {
        router.push(`/events?q=${encodeURIComponent(value)}`);
      }
    }
  };

  return (
    <section className="relative w-full py-20 md:py-32 flex items-center justify-center bg-white overflow-hidden">
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src="/Images/noiseGradient.png"
          alt="Background Hero"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="absolute inset-0 z-10 bg-black/60" />

      <div className="relative z-20 container mx-auto px-4 md:px-8 flex flex-col items-center text-center gap-6">
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight">
          TEMUKAN EVENT{" "}
          <span className="bg-linear-to-r from-primary to-secondary text-transparent bg-clip-text font-extrabold">
            TERBAIK
          </span>
        </h1>

        <p className="text-white text-sm font-medium md:text-lg max-w-2xl">
          Temukan berbagai event menarik di sekitarmu. Dari konser musik yang
          meriah, workshop edukatif, hingga festival budaya.
        </p>

        {/* Unified Search Bar */}
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
          <Input
            type="text"
            placeholder="Cari event, konser, workshop..."
            className="w-full pl-12 pr-4 h-12 bg-white rounded-full border-slate-200 shadow-sm focus-visible:ring-primary text-base"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Horizontal Scrollable Categories */}
        <div className="w-full max-w-3xl overflow-x-auto scrollbar-hide mt-4">
          <div className="flex gap-3 p-4 md:justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            {categories.map((category) => (
              <Button
                key={category.name}
                asChild
                variant="light"
                hoverEffect="hover_up"
                className="rounded-full px-6 h-10 gap-2 font-medium border-0 text-black hover:text-primary shrink-0"
              >
                <Link href={category.href}>
                  {category.icon}
                  <span>{category.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
