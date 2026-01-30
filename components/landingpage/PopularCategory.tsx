import Link from "next/link";
import {
  Music,
  Laptop,
  Trophy,
  Palette,
  Briefcase,
  Pizza,
  Image as ImageIcon, // Alias biar ga bentrok sama component Image nextjs
  Drama,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- 1. DATA DUMMY (Backend Simulation) ---
// Kita simpan class warna di sini agar dinamis tanpa 'style' inline yang berantakan
const POPULAR_CATEGORIES = [
  {
    id: 1,
    name: "Musik",
    count: 156,
    icon: Music,
    href: "/events?category=musik",
    // Warna Tema: Ungu
    colors: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      borderHover: "group-hover:border-purple-500",
      iconHover: "group-hover:text-purple-600",
    },
  },
  {
    id: 2,
    name: "Teknologi",
    count: 89,
    icon: Laptop,
    href: "/events?category=teknologi",
    // Warna Tema: Biru
    colors: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      borderHover: "group-hover:border-blue-500",
      iconHover: "group-hover:text-blue-600",
    },
  },
  {
    id: 3,
    name: "Olahraga",
    count: 67,
    icon: Trophy,
    href: "/events?category=olahraga",
    // Warna Tema: Emerald/Hijau
    colors: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      borderHover: "group-hover:border-emerald-500",
      iconHover: "group-hover:text-emerald-600",
    },
  },
  {
    id: 4,
    name: "Desain",
    count: 45,
    icon: Palette,
    href: "/events?category=desain",
    // Warna Tema: Rose/Pink
    colors: {
      bg: "bg-rose-100",
      text: "text-rose-600",
      borderHover: "group-hover:border-rose-500",
      iconHover: "group-hover:text-rose-600",
    },
  },
  {
    id: 5,
    name: "Bisnis",
    count: 78,
    icon: Briefcase,
    href: "/events?category=bisnis",
    // Warna Tema: Amber/Orange Gelap
    colors: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      borderHover: "group-hover:border-amber-600",
      iconHover: "group-hover:text-amber-700",
    },
  },
  {
    id: 6,
    name: "Kuliner",
    count: 34,
    icon: Pizza,
    href: "/events?category=kuliner",
    // Warna Tema: Orange
    colors: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      borderHover: "group-hover:border-orange-500",
      iconHover: "group-hover:text-orange-600",
    },
  },
  {
    id: 7,
    name: "Seni",
    count: 52,
    icon: ImageIcon,
    href: "/events?category=seni",
    // Warna Tema: Indigo
    colors: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      borderHover: "group-hover:border-indigo-500",
      iconHover: "group-hover:text-indigo-600",
    },
  },
  {
    id: 8,
    name: "Hiburan",
    count: 43,
    icon: Drama,
    href: "/events?category=hiburan",
    // Warna Tema: Cyan
    colors: {
      bg: "bg-cyan-100",
      text: "text-cyan-600",
      borderHover: "group-hover:border-cyan-500",
      iconHover: "group-hover:text-cyan-600",
    },
  },
];

export default function PopularCategory() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Kategori Populer
          </h2>

          <Button variant="link" asChild className="px-0 md:px-4">
            <Link href="/categories" className="flex items-center gap-1">
              Lihat Semua <ArrowRight size={18} />
            </Link>
          </Button>
        </div>

        {/* GRID CATEGORIES */}
        {/* Responsive: 1 kolom (<md), 2 kolom (md-lg), 4 kolom (>=lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {POPULAR_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group block h-full"
            >
              <div
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border border-slate-300 bg-white transition-all duration-300",
                  "hover:shadow-md hover:-translate-y-1",
                  // Inject class border hover dinamis dari data
                  category.colors.borderHover
                )}
              >
                {/* Bagian Kiri: Icon & Teks */}
                <div className="flex items-center gap-4">
                  {/* Kotak Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 flex items-center justify-center rounded-xl",
                      category.colors.bg, // Background dinamis
                      category.colors.text // Warna icon dinamis
                    )}
                  >
                    <category.icon size={24} strokeWidth={2.5} />
                  </div>

                  {/* Teks */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {category.count} events
                    </p>
                  </div>
                </div>

                {/* Bagian Kanan: Chevron */}
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-slate-300 transition-colors duration-300",
                    // Saat group di-hover, chevron berubah warna sesuai kategori
                    category.colors.iconHover
                  )}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
