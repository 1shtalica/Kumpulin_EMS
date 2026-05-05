"use client";

import type { HomeEventCard } from "@/types/event";
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
    Ticket,
    Users,
    CalendarDays,
    Star,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Data ──────────────────────────────────────────────────────
const CYCLING_WORDS = ["Konser", "Workshop", "Festival", "Seminar", "Pameran"];

// Palet warna untuk kartu event (di-assign secara cyclic)
const CARD_ACCENTS = ["#6366f1", "#10b981", "#f59e0b"];

function formatEventDate(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getEventTag(ev: HomeEventCard): { text: string; className: string } {
    const fillRatio = ev.max_capacity > 0 ? ev.total_sold / ev.max_capacity : 0;
    if (ev.ticket_price === 0)
        return { text: "Gratis", className: "bg-emerald-50 text-emerald-700" };
    if (fillRatio >= 0.8)
        return { text: "Hampir penuh", className: "bg-rose-50 text-rose-600" };
    return { text: "Tersedia", className: "bg-sky-50 text-sky-700" };
}

const CATEGORIES = [
    {
        name: "Musik",
        icon: Music,
        href: "/events?category=musik",
        color: "#6366f1",
    },
    {
        name: "Teknologi",
        icon: Laptop,
        href: "/events?category=teknologi",
        color: "#10b981",
    },
    {
        name: "Olahraga",
        icon: Trophy,
        href: "/events?category=olahraga",
        color: "#f59e0b",
    },
    {
        name: "Desain",
        icon: Palette,
        href: "/events?category=desain",
        color: "#ec4899",
    },
    {
        name: "Bisnis",
        icon: Briefcase,
        href: "/events?category=bisnis",
        color: "#3b82f6",
    },
    {
        name: "Kuliner",
        icon: Pizza,
        href: "/events?category=kuliner",
        color: "#ef4444",
    },
];

const STATS = [
    { v: "1,200+", l: "Event", icon: CalendarDays },
    { v: "50K+", l: "Peserta", icon: Users },
    { v: "34", l: "Kota", icon: MapPin },
    { v: "98%", l: "Puas", icon: Star },
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
            <span
                className="absolute inset-x-0 bottom-0 h-[45%] rounded-sm"
                style={{ background: "#002cee20", zIndex: -1 }}
            />
            <span className="text-primary font-black">
                {CYCLING_WORDS[index]}
            </span>
        </span>
    );
}

/** Desktop only – stacked card deck */
function EventCardStack({ events }: { events: HomeEventCard[] }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const count = events.length;

    useEffect(() => {
        if (count === 0) return;
        const t = setInterval(() => {
            setActiveIdx((i) => (i + 1) % count);
        }, 3200);
        return () => clearInterval(t);
    }, [count]);

    if (count === 0) {
        return (
            <div className="relative h-85 w-full max-w-85 mx-auto flex items-center justify-center">
                <div className="text-slate-300 text-sm">Memuat event...</div>
            </div>
        );
    }

    return (
        <div className="relative h-85 w-full max-w-85 mx-auto">
            {events.map((ev, i) => {
                const offset = (i - activeIdx + count) % count;
                const isTop = offset === 0;
                const isMid = offset === 1;
                const translateY = isTop ? 0 : isMid ? 18 : 36;
                const scale = isTop ? 1 : isMid ? 0.95 : 0.9;
                const opacity = isTop ? 1 : isMid ? 0.75 : 0.45;
                const zIndex = isTop ? 30 : isMid ? 20 : 10;
                const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
                const tag = getEventTag(ev);
                const fillRatio =
                    ev.max_capacity > 0 ? ev.total_sold / ev.max_capacity : 0;
                const slug = ev.slug;

                return (
                    <div
                        key={ev.event_id ?? ev.slug ?? i}
                        className="absolute inset-x-0 top-0 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-5 cursor-pointer"
                        style={{
                            transform: `translateY(${translateY}px) scale(${scale})`,
                            opacity,
                            zIndex,
                            transition:
                                "all 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            transformOrigin: "top center",
                        }}
                        onClick={() => setActiveIdx(i)}
                    >
                        <div
                            className="h-1.5 w-16 rounded-full mb-4"
                            style={{ background: accent }}
                        />
                        <div className="flex items-center justify-between mb-3">
                            <span
                                className="text-xs font-bold uppercase tracking-widest"
                                style={{ color: accent }}
                            >
                                {ev.type}
                            </span>
                            <span
                                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${tag.className}`}
                            >
                                {tag.text}
                            </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight mb-4 line-clamp-2">
                            {ev.title}
                        </h3>
                        <div className="flex flex-col gap-2 mb-5">
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <MapPin size={14} className="shrink-0" />
                                <span className="truncate">
                                    {ev.is_online ? "Online" : ev.address_title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <CalendarDays size={14} className="shrink-0" />
                                <span>{formatEventDate(ev.start_date)}</span>
                            </div>
                        </div>
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span className="flex items-center gap-1">
                                    <Users size={12} />{" "}
                                    {ev.total_sold.toLocaleString("id-ID")}{" "}
                                    peserta
                                </span>
                                <span>
                                    {Math.round(fillRatio * 100)}% terisi
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${fillRatio * 100}%`,
                                        background: accent,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                            <div className="flex items-center gap-1 text-slate-400 text-xs">
                                <Ticket size={12} />
                                <span>
                                    {ev.ticket_price === 0
                                        ? "Gratis"
                                        : `Rp ${ev.ticket_price.toLocaleString("id-ID")}`}
                                </span>
                            </div>
                            <Link
                                href={`/events/${slug}`}
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:gap-2 transition-all"
                            >
                                Lihat detail <ArrowUpRight size={13} />
                            </Link>
                        </div>
                    </div>
                );
            })}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {events.map((_, i) => (
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

/** Mobile only – horizontal scrolling event cards */
function MobileEventStrip({ events }: { events: HomeEventCard[] }) {
    return (
        <div className="w-full lg:hidden">
            <div className="flex items-center justify-between mb-3 px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <Ticket size={13} className="text-primary" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        Event Berlangsung
                    </span>
                </div>
                <Link
                    href="/events"
                    className="flex items-center gap-1 text-xs font-bold text-primary"
                >
                    Lihat semua <ChevronRight size={13} />
                </Link>
            </div>
            {/* Horizontally scrollable cards with right-fade mask */}
            <div className="relative">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-2">
                    {events.map((ev, i) => {
                        const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
                        const tag = getEventTag(ev);
                        const fillRatio =
                            ev.max_capacity > 0
                                ? ev.total_sold / ev.max_capacity
                                : 0;
                        return (
                            <Link
                                key={ev.event_id ?? ev.slug ?? i}
                                href={`/events/${ev.slug}`}
                                className="shrink-0 w-60 bg-white rounded-xl border border-slate-100 shadow-sm p-4 block hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color: accent }}
                                    >
                                        {ev.type}
                                    </span>
                                    <span
                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tag.className}`}
                                    >
                                        {tag.text}
                                    </span>
                                </div>
                                <p className="text-sm font-extrabold text-slate-900 leading-tight mb-2 line-clamp-2">
                                    {ev.title}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={11} />
                                        <span className="truncate max-w-20">
                                            {ev.is_online
                                                ? "Online"
                                                : ev.address_title}
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CalendarDays size={11} />
                                        {formatEventDate(ev.start_date)}
                                    </span>
                                </div>
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${fillRatio * 100}%`,
                                            background: accent,
                                        }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {Math.round(fillRatio * 100)}% terisi
                                </p>
                            </Link>
                        );
                    })}
                </div>
                {/* Right fade mask */}
                <div className="absolute right-0 top-0 h-full w-12 bg-linear-to-l from-[#f9fafb] to-transparent pointer-events-none" />
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────
export default function HeroSection() {
    const router = useRouter();
    const [searchValue, setSearchValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const [heroEvents, setHeroEvents] = useState<HomeEventCard[]>([]);

    // Fetch 3 event terbaru untuk ditampilkan di kartu Hero
    useEffect(() => {
        const fetchHeroEvents = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/events?limit=3&offset=0`,
                );
                if (!res.ok) return;
                const json = await res.json();
                setHeroEvents(json.data ?? []);
            } catch {
                // Gagal fetch: biarkan kosong, kartu menampilkan state loading
            }
        };
        fetchHeroEvents();
    }, []);

    const debouncedSearch = useDebouncedCallback((term: string) => {
        if (term.trim())
            router.push(`/events?q=${encodeURIComponent(term.trim())}`);
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
        <section className="relative w-full overflow-hidden bg-[#f9fafb] pt-12">
            {/* ── Dot Pattern Background ── */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.3,
                    }}
                />
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <circle
                        cx="85%"
                        cy="18%"
                        r="220"
                        fill="#002cee"
                        fillOpacity="0.032"
                    />
                    <circle
                        cx="12%"
                        cy="75%"
                        r="140"
                        fill="#6366f1"
                        fillOpacity="0.028"
                    />
                </svg>
            </div>

            {/* ── Main Split Layout ── */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-20">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
                    {/* ── LEFT: Editorial Headline ── */}
                    <div className="flex-1 flex flex-col gap-5 lg:gap-7 w-full lg:max-w-[58%]">
                        {/* Live indicator pill */}
                        <div className="inline-flex items-center gap-2 self-start">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-[0.12em]">
                                1.200+ Event Aktif Indonesia
                            </span>
                        </div>

                        {/* Headline — scaled down on mobile */}
                        <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.4rem] lg:text-[3.8rem] font-extrabold text-slate-900 leading-[1.1] tracking-[-0.02em]">
                            Satu tempat
                            <br />
                            semua{" "}
                            <span className="relative z-10">
                                <CyclingWord />
                            </span>
                            <br />
                            <span className="text-slate-300">
                                di Indonesia.
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-sm sm:text-base lg:text-lg text-slate-500 leading-relaxed max-w-lg font-medium">
                            Dari konser jazz malam hari hingga hackathon
                            teknologi — temukan, ikuti, dan beli tiket dalam
                            satu klik.
                        </p>

                        {/* Search bar */}
                        <div className="flex flex-col gap-2.5 w-full max-w-lg">
                            <div className="flex items-center h-12 sm:h-13 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all duration-200">
                                <div className="flex items-center justify-center px-3 sm:px-4 h-full text-slate-400 shrink-0">
                                    <Search size={17} />
                                </div>
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Cari event, konser, workshop..."
                                    className="flex-1 h-full border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-slate-800 placeholder:text-slate-400 px-0 min-w-0"
                                    value={searchValue}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                />
                                <Button
                                    onClick={executeSearch}
                                    className="shrink-0 h-full rounded-none rounded-r-xl px-4 sm:px-5 bg-primary hover:bg-primary/90 text-white text-sm font-bold border-l border-primary/20 shadow-none"
                                >
                                    Cari
                                </Button>
                            </div>

                            {/* Quick tags — 4 on desktop, 3 on mobile */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs text-slate-400">
                                    Coba:
                                </span>
                                {[
                                    "Jazz",
                                    "Startup",
                                    "Workshop UI",
                                    "Marathon",
                                ].map((t, i) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => {
                                            setSearchValue(t);
                                            router.push(
                                                `/events?q=${encodeURIComponent(t)}`,
                                            );
                                        }}
                                        className={`text-xs text-slate-600 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-primary hover:text-primary transition-all duration-150 cursor-pointer ${i === 3 ? "hidden sm:inline-flex" : ""}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats — 2×2 grid on mobile, single row on sm+ */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-row sm:items-center gap-3 sm:gap-5">
                            {STATS.map(({ v, l, icon: Icon }) => (
                                <div
                                    key={l}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-slate-600 shrink-0">
                                        <Icon size={15} />
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-sm text-slate-900 leading-none">
                                            {v}
                                        </p>
                                        <p className="text-[12px] text-slate-400 font-medium">
                                            {l}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Category strip — with right-fade mask hinting scroll */}
                        <div>
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                                Jelajah kategori
                            </p>
                            <div className="relative">
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    {CATEGORIES.map(
                                        ({ name, icon: Icon, href, color }) => (
                                            <Link
                                                key={name}
                                                href={href}
                                                className="group shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white border border-slate-200 hover:border-transparent hover:shadow-md transition-all duration-200"
                                                style={
                                                    {
                                                        "--cat-color": color,
                                                    } as React.CSSProperties
                                                }
                                            >
                                                <Icon
                                                    size={14}
                                                    className="transition-colors duration-200"
                                                    style={{
                                                        color: "var(--cat-color)",
                                                    }}
                                                />
                                                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 whitespace-nowrap">
                                                    {name}
                                                </span>
                                            </Link>
                                        ),
                                    )}
                                </div>
                                {/* Fade hint at right edge */}
                                <div className="absolute right-0 top-0 h-full w-10 bg-linear-to-l from-[#f9fafb] to-transparent pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Live Event Card Stack (desktop only) ── */}
                    <div className="hidden lg:flex flex-col items-center flex-1 max-w-[38%] gap-6">
                        <div className="self-start flex items-center gap-2">
                            <Ticket size={14} className="text-primary" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                Event Berlangsung
                            </span>
                        </div>
                        <EventCardStack events={heroEvents} />
                        <Link
                            href="/events"
                            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary border-b-2 border-primary/30 hover:border-primary transition-all duration-200 pb-0.5"
                        >
                            Lihat semua event <ArrowUpRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Mobile Event Strip (shows between content & marquee on mobile) ── */}
            <div className="relative z-10 pb-8 lg:hidden">
                <MobileEventStrip events={heroEvents} />
            </div>
        </section>
    );
}
