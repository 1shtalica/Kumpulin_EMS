"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryFilter = "all" | "community" | "music" | "workshop" | "education";

interface FollowedOrganizer {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryKey: Exclude<CategoryFilter, "all">;
  followers: number;
  totalEvents: number;
  upcomingEvents: number;
  avatarInitial: string;
  recentEvent: string;
  recentDate: string;
  accent: string;
  tint: string;
  textAccent: string;
  eventTint: string;
}

const FOLLOWED_ORGANIZERS: FollowedOrganizer[] = [
  {
    id: "1",
    slug: "jakarta-event-co",
    name: "Jakarta Event Co.",
    category: "Konferensi & Seminar",
    categoryKey: "community",
    followers: 12_450,
    totalEvents: 48,
    upcomingEvents: 4,
    avatarInitial: "JE",
    recentEvent: "Tech Summit 2026",
    recentDate: "10 Jun 2026",
    accent: "bg-primary text-white",
    tint: "border-l-primary",
    textAccent: "text-primary",
    eventTint: "border-slate-200/80 bg-white",
  },
  {
    id: "2",
    slug: "komunitas-startup-id",
    name: "Komunitas Startup ID",
    category: "Networking & Komunitas",
    categoryKey: "community",
    followers: 8_210,
    totalEvents: 31,
    upcomingEvents: 2,
    avatarInitial: "KS",
    recentEvent: "Startup Pitch Night Vol.7",
    recentDate: "22 Jun 2026",
    accent: "bg-[#10b981] text-white",
    tint: "border-l-[#10b981]",
    textAccent: "text-slate-700",
    eventTint: "border-slate-200/80 bg-white",
  },
  {
    id: "3",
    slug: "soundwave-productions",
    name: "Soundwave Productions",
    category: "Musik & Hiburan",
    categoryKey: "music",
    followers: 24_800,
    totalEvents: 93,
    upcomingEvents: 7,
    avatarInitial: "SW",
    recentEvent: "Malam Akustik - Open Stage",
    recentDate: "15 Jul 2026",
    accent: "bg-slate-950 text-cyan-300",
    tint: "border-l-info",
    textAccent: "text-slate-700",
    eventTint: "border-slate-200/80 bg-white",
  },
  {
    id: "4",
    slug: "bumi-kreatif-studio",
    name: "Bumi Kreatif Studio",
    category: "Workshop & Seni",
    categoryKey: "workshop",
    followers: 3_540,
    totalEvents: 17,
    upcomingEvents: 1,
    avatarInitial: "BK",
    recentEvent: "Workshop Fotografi Urban",
    recentDate: "28 Jun 2026",
    accent: "bg-warning text-slate-950",
    tint: "border-l-warning",
    textAccent: "text-slate-700",
    eventTint: "border-slate-200/80 bg-white",
  },
  {
    id: "5",
    slug: "edunusantara",
    name: "EduNusantara",
    category: "Pendidikan & Pelatihan",
    categoryKey: "education",
    followers: 6_780,
    totalEvents: 62,
    upcomingEvents: 5,
    avatarInitial: "EN",
    recentEvent: "Bootcamp Data Science 2026",
    recentDate: "5 Agu 2026",
    accent: "bg-info text-white",
    tint: "border-l-success",
    textAccent: "text-slate-700",
    eventTint: "border-slate-200/80 bg-white",
  },
];

const FILTERS: Array<{ label: string; value: CategoryFilter }> = [
  { label: "Semua", value: "all" },
  { label: "Komunitas", value: "community" },
  { label: "Musik", value: "music" },
  { label: "Workshop", value: "workshop" },
  { label: "Edukasi", value: "education" },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function FollowingPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [hiddenOrganizerIds, setHiddenOrganizerIds] = useState<string[]>([]);

  const followedOrganizers = useMemo(
    () =>
      FOLLOWED_ORGANIZERS.filter(
        (organizer) => !hiddenOrganizerIds.includes(organizer.id),
      ),
    [hiddenOrganizerIds],
  );

  const filteredOrganizers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return followedOrganizers.filter((organizer) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        organizer.name.toLowerCase().includes(normalizedQuery) ||
        organizer.category.toLowerCase().includes(normalizedQuery) ||
        organizer.recentEvent.toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        activeFilter === "all" || organizer.categoryKey === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, followedOrganizers, query]);

  const totalUpcomingEvents = followedOrganizers.reduce(
    (sum, organizer) => sum + organizer.upcomingEvents,
    0,
  );
  const totalEvents = followedOrganizers.reduce(
    (sum, organizer) => sum + organizer.totalEvents,
    0,
  );

  return (
    <PageSurface>
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
        <svg
          className="pointer-events-none absolute -right-10 -top-10 h-52 w-80 text-primary md:right-2 md:top-1/2 md:-translate-y-1/2"
          viewBox="0 0 320 210"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M34 138C77 82 124 106 164 66C205 24 244 47 292 18"
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M52 55C94 94 128 82 168 123C205 161 250 151 292 179"
            stroke="#10b981"
            strokeOpacity="0.1"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {[34, 164, 292, 52, 168, 250].map((cx, index) => (
            <circle
              key={cx}
              cx={cx}
              cy={[138, 66, 18, 55, 123, 151][index]}
              r={index % 2 === 0 ? 12 : 15}
              fill="white"
              stroke="currentColor"
              strokeOpacity="0.13"
              strokeWidth="2"
            />
          ))}
          <rect
            x="222"
            y="102"
            width="34"
            height="34"
            rx="10"
            fill="#10b981"
            fillOpacity="0.08"
          />
        </svg>

        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Organizer yang diikuti
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
              Mengikuti
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Pantau organizer favorit, lihat event terbaru, dan buka halaman
              publik mereka dari satu tempat.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2">
            <HeaderMetric
              label="Diikuti"
              value={followedOrganizers.length}
              tone="primary"
            />
            <HeaderMetric
              label="Event aktif"
              value={totalUpcomingEvents}
              tone="success"
            />
            <HeaderMetric label="Total event" value={totalEvents} tone="info" />
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
        <div className="border-b border-slate-200/80 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Daftar organizer
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">
                {filteredOrganizers.length} dari {followedOrganizers.length}{" "}
                organizer ditampilkan.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari organizer atau event"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 pr-9 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Hapus pencarian"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
                <SlidersHorizontal className="ml-2 hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
                {FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={cn(
                      "h-8 shrink-0 rounded-lg px-3 text-xs font-semibold transition-all",
                      activeFilter === filter.value
                        ? "bg-white text-primary shadow-sm shadow-slate-900/5"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredOrganizers.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredOrganizers.map((organizer) => (
              <OrganizerRow
                key={organizer.id}
                organizer={organizer}
                onUnfollow={() =>
                  setHiddenOrganizerIds((current) => [...current, organizer.id])
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            hasFollowing={followedOrganizers.length > 0}
            onReset={() => {
              setQuery("");
              setActiveFilter("all");
            }}
          />
        )}
      </section>
    </PageSurface>
  );
}

function PageSurface({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.14,
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        {children}
      </div>
    </main>
  );
}

function HeaderMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "primary" | "success" | "info";
  value: number;
}) {
  const toneClass = {
    primary: "text-primary",
    success: "text-success-hover",
    info: "text-info-hover",
  }[tone];

  return (
    <div className="min-w-22 rounded-xl bg-white px-3 py-2 text-center shadow-sm shadow-slate-900/5">
      <p className={cn("text-lg font-semibold leading-none", toneClass)}>
        {formatNumber(value)}
      </p>
      <p className="mt-1 whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function OrganizerRow({
  organizer,
  onUnfollow,
}: {
  organizer: FollowedOrganizer;
  onUnfollow: () => void;
}) {
  return (
    <article
      className={cn(
        "group grid gap-4 border-l-4 bg-white p-4 transition-colors hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_220px] md:items-center md:p-5",
        organizer.tint,
      )}
    >
      <div className="flex min-w-0 gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-semibold shadow-md shadow-slate-900/10",
            organizer.accent,
          )}
        >
          {organizer.avatarInitial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/organizer/${organizer.slug}`}
              className="truncate text-base font-semibold text-slate-950 transition-colors hover:text-primary"
            >
              {organizer.name}
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success-hover">
              <Check className="h-3 w-3" />
              Mengikuti
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {organizer.category}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {formatNumber(organizer.followers)} pengikut
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
              {formatNumber(organizer.totalEvents)} total event
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-slate-400" />
              {organizer.upcomingEvents} event aktif
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:justify-items-end">
        <div
          className={cn(
            "w-full rounded-xl border p-3 shadow-sm shadow-slate-900/[0.03] md:max-w-55",
            organizer.eventTint,
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Event terbaru
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-800">
            {organizer.recentEvent}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {organizer.recentDate}
          </p>
        </div>

        <div className="flex w-full gap-2 md:max-w-55">
          <Button
            asChild
            variant="outline"
            className="h-9 flex-1 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-primary/30 hover:text-primary"
          >
            <Link href={`/organizer/${organizer.slug}`}>
              Lihat
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onUnfollow}
            className="h-9 flex-1 rounded-xl border-danger/20 px-3 text-xs font-semibold text-danger hover:bg-danger-light hover:text-danger"
          >
            Berhenti
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  hasFollowing,
  onReset,
}: {
  hasFollowing: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
        {hasFollowing ? (
          <Search className="h-8 w-8" />
        ) : (
          <Heart className="h-8 w-8" />
        )}
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">
        {hasFollowing ? "Organizer tidak ditemukan" : "Belum mengikuti organizer"}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {hasFollowing
          ? "Coba ubah kata kunci atau filter kategori untuk melihat organizer lain."
          : "Ikuti organizer dari halaman event agar event terbaru mereka muncul di sini."}
      </p>
      {hasFollowing ? (
        <Button
          type="button"
          onClick={onReset}
          className="mt-5 h-10 rounded-xl px-4 text-sm font-semibold"
        >
          Reset filter
        </Button>
      ) : (
        <Button
          asChild
          className="mt-5 h-10 rounded-xl px-4 text-sm font-semibold"
        >
          <Link href="/events">Jelajahi event</Link>
        </Button>
      )}
    </div>
  );
}
