import Link from "next/link";
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
  },
  {
    name: "Teknologi",
    icon: <Laptop size={18} />,
    href: "/events?category=teknologi",
  },
  {
    name: "Olahraga",
    icon: <Trophy size={18} />, // Lucide tidak punya bola, Trophy alternatif terbaik
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
  return (
    // 1. SECTION: Wrapper Utama (Relative agar anak-anaknya bisa absolute)
    <section className="relative w-full py-20 md:py-32 flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* 2. BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
        }}
      />

      {/* 3. OVERLAY HITAM (PENTING AGAR TEKS TERBACA) */}
      <div className="absolute inset-0 z-10 bg-black/60" />

      {/* 4. KONTEN (Harus z-20 agar di atas overlay) */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center text-center gap-6">
        {/* JUDUL */}
        <h1 className="font-bold text-3xl md:text-5xl lg:text-6xl text-white leading-tight">
          TEMUKAN EVENT{" "}
          <span className="bg-linear-to-r from-kumpulinPurple to-kumpulinGreen text-transparent bg-clip-text font-extrabold">
            TERBAIK
          </span>
        </h1>

        {/* DESKRIPSI */}
        <p className="text-gray-200 text-sm md:text-lg max-w-2xl">
          Temukan berbagai event menarik di sekitarmu. Dari konser musik yang
          meriah, workshop edukatif, hingga festival budaya.
        </p>

        {/* SEARCH BAR */}

        <div className="w-full max-w-2xl bg-white flex flex-row items-center p-2 md:p-3 rounded-full shadow-xl mt-4">
          <div className="pl-4 hidden md:block text-gray-400">
            <Search size={20} />
          </div>

          <Input
            type="search"
            placeholder="Cari Event, Konser, Workshop..."
            className="w-full mx-2 shadow-none border-none focus-visible:ring-0 p-2 text-sm md:text-base placeholder:text-gray-400"
          />

          <Button
            asChild
            variant="default"
            size="icon"
            hoverEffect="grow"
            className="rounded-full w-10 h-10 md:w-12 md:h-12 shrink-0 bg-kumpulinPurple"
          >
            <Link href="/search">
              <Search size={18} className="text-white" />
            </Link>
          </Button>
        </div>

        {/* DAFTAR TOMBOL KATEGORI  */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {categories.map((category) => (
            <Button
              key={category.name}
              asChild
              variant="light"
              hoverEffect="hover_up"
              className="rounded-full px-6 h-10 gap-2 font-medium text-slate-700 hover:text-kumpulinPurple"
            >
              <Link href={category.href}>
                {category.icon}
                <span>{category.name}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
