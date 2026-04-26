"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import {
  Search,
  Music,
  Laptop,
  Trophy,
  Palette,
  Briefcase,
  Pizza,
  ArrowUpRight,
  MapPin,
  Clock,
  Ticket,
  Users,
  CalendarDays,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Data ──────────────────────────────────────────────────────
const CYCLING_WORDS = ["Konser", "Workshop", "Festival", "Seminar", "Pameran"];

const MARQUEE_ITEMS = [
  "Java Jazz Festival",
  "TEDx Jakarta",
  "Bali Arts Festival",
  "DevFest Indonesia",
  "Jak-Japan Matsuri",
  "Indonesia Open",
  "Ubud Writers Fest",
  "Bandung Culinary",
  "Jogja Art Week",
  "Makassar F8",
];

const LIVE_EVENTS = [
  {
    id: 1,
    title: "Jazz Night Immersive",
    city: "Jakarta",
    date: "28 Apr",
    time: "19:00",
    category: "Musik",
    attendees: 312,
    capacity: 400,
    accent: "#6366f1",
    tag: "Hampir penuh",
    tagColor: "bg-rose-50 text-rose-600",
  },
  {
    id: 2,
    title: "DevFest Indonesia 2026",
    city: "Bandung",
    date: "3 Mei",
    time: "09:00",
    category: "Teknologi",
    attendees: 780,
    capacity: 1200,
    accent: "#10b981",
    tag: "Gratis",
    tagColor: "bg-emerald-50 text-emerald-700",
  },
  {
    id: 3,
    title: "Ubud Writers & Readers",
    city: "Bali",
    date: "10 Mei",
    time: "10:00",
    category: "Budaya",
    attendees: 190,
    capacity: 500,
    accent: "#f59e0b",
    tag: "Populer",
    tagColor: "bg-amber-50 text-amber-700",
  },
];

const CATEGORIES = [
  { name: "Musik", icon: Music, href: "/events?category=musik", color: "#6366f1" },
  { name: "Teknologi", icon: Laptop, href: "/events?category=teknologi", color: "#10b981" },
  { name: "Olahraga", icon: Trophy, href: "/events?category=olahraga", color: "#f59e0b" },
  { name: "Desain", icon: Palette, href: "/events?category=desain", color: "#ec4899" },
  { name: "Bisnis", icon: Briefcase, href: "/events?category=bisnis", color: "#3b82f6" },
  { name: "Kuliner", icon: Pizza, href: "/events?category=kuliner", color: "#ef4444" },
];

// ── Sub-components ─────────────────────────────────────────────
function CyclingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % CYCLING_WORDS.length);
        setVisible(true);
      }, 350);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="relative inline-block"
      style={{
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-10px)",
      }}
    >
      {/* Solid accent block behind the word */}
      <span
        className="absolute inset-x-0 bottom-0 h-[45%] rounded-sm"
        style={{ background: "#002cee20", zIndex: -1 }}
      />
      <span className="text-primary font-black">{CYCLING_WORDS[index]}</span>
    </span>
  );
}

function EventCardStack() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % LIVE_EVENTS.length);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-[340px] w-full max-w-[340px] mx-auto">
      {LIVE_EVENTS.map((ev, i) => {
        const offset = (i - activeIdx + LIVE_EVENTS.length) % LIVE_EVENTS.length;
        const isTop = offset === 0;
        const isMid = offset === 1;

        const translateY = isTop ? 0 : isMid ? 18 : 36;
        const scale = isTop ? 1 : isMid ? 0.95 : 0.9;
        const opacity = isTop ? 1 : isMid ? 0.75 : 0.45;
        const zIndex = isTop ? 30 : isMid ? 20 : 10;

        return (
          <div
            key={ev.id}
            className="absolute inset-x-0 top-0 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-5 cursor-pointer"
            style={{
              transform: `translateY(${translateY}px) scale(${scale})`,
              opacity,
              zIndex,
              transition: "all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transformOrigin: "top center",
            }}
            onClick={() => setActiveIdx(i)}
          >
            {/* Top accent bar */}
            <div
              className="h-1.5 w-16 rounded-full mb-4"
              style={{ background: ev.accent }}
            />

            {/* Category + Tag */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: ev.accent }}
              >
                {ev.category}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ev.tagColor}`}>
                {ev.tag}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-4">
              {ev.title}
            </h3>

            {/* Meta */}
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <MapPin size={14} className="shrink-0" />
                <span>{ev.city}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <CalendarDays size={14} className="shrink-0" />
                <span>{ev.date} · {ev.time} WIB</span>
              </div>
            </div>

            {/* Capacity bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {ev.attendees.toLocaleString()} peserta
                </span>
                <span>{Math.round((ev.attendees / ev.capacity) * 100)}% terisi</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(ev.attendees / ev.capacity) * 100}%`,
                    background: ev.accent,
                  }}
                />
              </div>
            </div>

            {/* CTA row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Clock size={12} />
                <span>Segera</span>
              </div>
              <Link
                href={`/events`}
                className="flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all"
              >
                Lihat detail <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        );
      })}

      {/* Dot indicators */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {LIVE_EVENTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            className="transition-all duration-300"
            style={{
              width: i === activeIdx ? 20 : 6,
              height: 6,
              borderRadius: 9999,
              background: i === activeIdx ? "#002cee" : "#cbd5e1",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  return (
    <div className="w-full overflow-hidden border-y border-slate-100 bg-white/60 backdrop-blur-sm py-3">
      <div className="hero-marquee flex gap-0 whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-sm font-semibold text-slate-500">
            <Star size={12} className="text-primary fill-primary shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function HeroSection() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
      debouncedSearch.cancel();
      const value = e.currentTarget.value.trim();
      if (value) router.push(`/events?q=${encodeURIComponent(value)}`);
    }
  };

  const executeSearch = () => {
    if (searchValue.trim()) {
      debouncedSearch.cancel();
      router.push(`/events?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#f9fafb] pt-16">

      {/* ── Geometric SVG Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Diagonal accent lines */}
          <line x1="0" y1="0" x2="30%" y2="100%" stroke="#002cee" strokeWidth="0.4" strokeOpacity="0.12" />
          <line x1="5%" y1="0" x2="35%" y2="100%" stroke="#002cee" strokeWidth="0.4" strokeOpacity="0.08" />
          <line x1="80%" y1="0" x2="60%" y2="100%" stroke="#002cee" strokeWidth="0.4" strokeOpacity="0.10" />
          <circle cx="85%" cy="20%" r="180" fill="#002cee" fillOpacity="0.028" />
        </svg>
      </div>

      {/* ── Main Split Layout ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── LEFT: Editorial Headline ── */}
          <div className="flex-1 flex flex-col gap-7 lg:max-w-[58%]">

            {/* Live indicator pill */}
            <div className="inline-flex items-center gap-2 self-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-[0.15em]">
                1.200+ Event Aktif Indonesia
              </span>
            </div>

            {/* Big editorial headline */}
            <h1 className="text-[2.6rem] sm:text-5xl md:text-[3.4rem] lg:text-[3.8rem] font-extrabold text-slate-900 leading-[1.08] tracking-[-0.02em]">
              Satu tempat<br />
              semua{" "}
              <span className="relative z-10">
                <CyclingWord />
              </span>
              <br />
              <span className="text-slate-300">di Indonesia.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
              Dari konser jazz malam hari hingga hackathon teknologi —
              temukan, ikuti, dan beli tiket dalam satu klik.
            </p>

            {/* Search bar — left aligned, not rounded-full */}
            <div className="flex flex-col gap-3 w-full max-w-lg">
              <div className="flex items-center h-13 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all duration-200">
                <div className="flex items-center justify-center px-4 h-full text-slate-400">
                  <Search size={18} />
                </div>
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari event, konser, workshop..."
                  className="flex-1 h-full border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-slate-800 placeholder:text-slate-400 px-0"
                  value={searchValue}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  onClick={executeSearch}
                  className="shrink-0 h-full rounded-none rounded-r-xl px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold border-l border-primary/20 shadow-none"
                >
                  Cari
                </Button>
              </div>

              {/* Quick tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Coba:</span>
                {["Jazz", "Startup", "Workshop UI", "Marathon"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSearchValue(t);
                      router.push(`/events?q=${encodeURIComponent(t)}`);
                    }}
                    className="text-xs text-slate-600 px-3 py-1 rounded-md bg-white border border-slate-200 hover:border-primary hover:text-primary transition-all duration-150 cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5 flex-wrap">
              {[
                { v: "1,200+", l: "Event", icon: CalendarDays },
                { v: "50K+", l: "Peserta", icon: Users },
                { v: "34", l: "Kota", icon: MapPin },
                { v: "98%", l: "Puas", icon: Star },
              ].map(({ v, l, icon: Icon }) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">{v}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{l}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Category quick-links — horizontal scroll strip */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Jelajah kategori
              </p>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map(({ name, icon: Icon, href, color }) => (
                  <Link
                    key={name}
                    href={href}
                    className="group shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:border-transparent hover:shadow-md transition-all duration-200"
                    style={{ "--cat-color": color } as React.CSSProperties}
                  >
                    <Icon
                      size={15}
                      className="transition-colors duration-200"
                      style={{ color: "var(--cat-color)" }}
                    />
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 whitespace-nowrap">
                      {name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Live Event Card Stack ── */}
          <div className="hidden lg:flex flex-col items-center flex-1 max-w-[38%] gap-6">
            {/* Label */}
            <div className="self-start flex items-center gap-2">
              <Ticket size={14} className="text-primary" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Event Berlangsung
              </span>
            </div>

            <EventCardStack />

            {/* CTA below stack */}
            <Link
              href="/events"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary border-b-2 border-primary/30 hover:border-primary transition-all duration-200 pb-0.5"
            >
              Lihat semua event <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Marquee Ticker ── */}
      <Marquee />

      {/* ── Keyframes ── */}
      <style jsx>{`
        .hero-marquee {
          animation: marqueeScroll 28s linear infinite;
          display: inline-flex;
        }
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
