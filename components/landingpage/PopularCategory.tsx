import Link from "next/link";
import type { CSSProperties } from "react";
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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POPULAR_CATEGORIES = [
  {
    id: 1,
    name: "Musik",
    count: 156,
    description: "Konser, gig, dan festival",
    icon: Music,
    href: "/events?category=musik",
    color: "#6366f1",
    bg: "#eef2ff",
  },
  {
    id: 2,
    name: "Teknologi",
    count: 89,
    description: "Talkshow, kelas, dan hackathon",
    icon: Laptop,
    href: "/events?category=teknologi",
    color: "#10b981",
    bg: "#ecfdf5",
  },
  {
    id: 3,
    name: "Olahraga",
    count: 67,
    description: "Kompetisi dan aktivitas komunitas",
    icon: Trophy,
    href: "/events?category=olahraga",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    id: 4,
    name: "Desain",
    count: 45,
    description: "Workshop, portfolio, dan kreatif",
    icon: Palette,
    href: "/events?category=desain",
    color: "#ec4899",
    bg: "#fdf2f8",
  },
  {
    id: 5,
    name: "Bisnis",
    count: 78,
    description: "Networking, seminar, dan founder",
    icon: Briefcase,
    href: "/events?category=bisnis",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    id: 6,
    name: "Kuliner",
    count: 34,
    description: "Festival rasa dan kelas masak",
    icon: Pizza,
    href: "/events?category=kuliner",
    color: "#ef4444",
    bg: "#fef2f2",
  },
  {
    id: 7,
    name: "Seni",
    count: 52,
    icon: ImageIcon,
    description: "Pameran, instalasi, dan karya",
    href: "/events?category=seni",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    id: 8,
    name: "Hiburan",
    count: 43,
    icon: Drama,
    description: "Stand up, teater, dan pertunjukan",
    href: "/events?category=hiburan",
    color: "#06b6d4",
    bg: "#ecfeff",
  },
];

export default function PopularCategory() {
  return (
    <section className="relative overflow-hidden bg-[#f9fafb] py-10 md:py-12">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.24,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 shadow-sm ring-1 ring-slate-200">
              <Sparkles size={13} className="text-primary" />
              8 kategori teratas
            </div>
            <h2 className="text-xl font-bold text-accent md:text-3xl">
              Kategori Populer
            </h2>
            <p className="mt-1.5 text-sm text-muted md:text-base">
              Pilih jalur tercepat ke event yang sesuai minatmu.
            </p>
          </div>

          <Button
            variant="link"
            asChild
            className="self-start px-0 md:self-auto md:px-4"
          >
            <Link href="/events">
              Lihat Semua <ArrowRight size={18} />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-3.5">
          {POPULAR_CATEGORIES.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className={cn(
                "group relative min-h-30 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 md:min-h-32 md:p-3.5",
                "hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                index === 0 && "md:col-span-2 md:row-span-2 md:min-h-68 md:p-5",
              )}
              style={
                {
                  "--category-color": category.color,
                  "--category-bg": category.bg,
                } as CSSProperties
              }
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--category-color)] opacity-80" />
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[var(--category-bg)] transition-transform duration-300 group-hover:scale-125 md:h-24 md:w-24" />
              <category.icon
                className={cn(
                  "absolute -bottom-5 -right-4 h-20 w-20 rotate-[-8deg] text-[var(--category-color)] opacity-[0.075] transition-all duration-300 group-hover:rotate-[-2deg] group-hover:scale-110 group-hover:opacity-[0.11]",
                  index === 0 && "md:-bottom-8 md:-right-6 md:h-34 md:w-34",
                )}
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <svg
                className="absolute inset-0 h-full w-full text-[var(--category-color)] opacity-70 transition-transform duration-300 group-hover:scale-[1.03]"
                viewBox="0 0 260 180"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M152 16h96M172 32h68M204 48h44"
                  stroke="currentColor"
                  strokeOpacity="0.09"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M16 140C48 110 70 156 104 126C134 99 154 118 180 94C208 68 226 82 250 56"
                  stroke="currentColor"
                  strokeOpacity="0.11"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M190 118c14 0 26 12 26 26M190 132c7 0 12 5 12 12"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <g fill="currentColor" opacity="0.1">
                  <circle cx="42" cy="34" r="4" />
                  <circle cx="74" cy="24" r="2.5" />
                  <circle cx="232" cy="128" r="3" />
                </g>
              </svg>

              <div className="relative flex h-full flex-col justify-between gap-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--category-bg)] text-[var(--category-color)] ring-1 ring-inset ring-white/70 transition-transform duration-300 group-hover:scale-105 md:h-10 md:w-10">
                    <category.icon size={19} strokeWidth={2.4} />
                  </div>
                  <span className="rounded-2xl bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                    {category.count}
                  </span>
                </div>

                <div>
                  <h3
                    className={cn(
                      "text-base font-bold leading-tight text-accent md:text-lg",
                      index === 0 && "md:text-xl",
                    )}
                  >
                    {category.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-xs leading-relaxed text-muted",
                      index === 0 && "md:mt-1.5 md:max-w-xs md:text-sm",
                    )}
                  >
                    {category.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {category.count} events
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-[var(--category-color)] group-hover:text-white">
                    <ChevronRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
