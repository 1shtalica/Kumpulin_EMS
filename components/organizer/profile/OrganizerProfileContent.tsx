"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  Globe,
  Laptop,
  MapPin,
  ChevronRight,
  Award,
  MessageSquare,
  CalendarCheck,
  CalendarClock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { OrganizerService } from "@/services/organizer-service";
import type {
  OrganizerProfileData,
  OrganizerProfileEvent,
  OrganizerProfileReview,
} from "@/types/organizer";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: idLocale });
  } catch {
    return "—";
  }
}

function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "—";
  }
}

const eventModeConfig: Record<
  string,
  { label: string; icon: React.ElementType; colorClass: string }
> = {
  offline: {
    label: "Offline",
    icon: MapPin,
    colorClass:
      "bg-secondary-light/60 text-secondary-hover border-secondary-light",
  },
  online: {
    label: "Online",
    icon: Globe,
    colorClass: "bg-info-light/60 text-info-hover border-info-light",
  },
  hybrid: {
    label: "Hybrid",
    icon: Laptop,
    colorClass: "bg-warning-light/60 text-warning-hover border-warning-light",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
  sub?: string;
}

function StatCard({ icon: Icon, label, value, accent = "text-primary", sub }: StatCardProps) {
  return (
    <div className="relative flex flex-col gap-2 bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* subtle geometric overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
          {label}
        </span>
        <span className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent}`}>{value}</p>
      {sub && (
        <p className="text-[11px] text-muted-foreground/60 font-medium">{sub}</p>
      )}
    </div>
  );
}

interface EventRowProps {
  event: OrganizerProfileEvent;
}

function EventRow({ event }: EventRowProps) {
  const mode = eventModeConfig[event.event_mode] ?? eventModeConfig.offline;
  const ModeIcon = mode.icon;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
        <CalendarClock className="w-5 h-5 text-primary/70" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground/90 truncate group-hover:text-primary transition-colors">
          {event.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground/60 font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(event.start_time)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(event.start_time)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge
          variant="outline"
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${mode.colorClass}`}
        >
          <ModeIcon className="w-2.5 h-2.5 mr-1" />
          {mode.label}
        </Badge>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60 font-medium bg-muted-foreground/5 rounded-full px-2.5 py-0.5">
          <Users className="w-2.5 h-2.5" />
          {formatStat(event.attendee_count)}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: OrganizerProfileReview;
}

function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.reviewer_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors duration-200">
      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <span className="text-xs font-bold text-primary">{initials}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-foreground/90 truncate">
            {review.reviewer_name}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < review.rating
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/20"
                  }`}
              />
            ))}
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground/80 leading-relaxed">
          {review.comment}
        </p>
        <p className="text-[11px] text-muted-foreground/50 mt-1.5 font-medium">
          {formatDate(review.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OrganizerProfileContent() {
  const [profile, setProfile] = useState<OrganizerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    OrganizerService.getProfile()
      .then(setProfile)
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat profil. Coba lagi nanti.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── Loading State ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Memuat profil organizer...</p>
      </div>
    );
  }

  // ── Error State ──
  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <AlertCircle className="w-10 h-10 text-danger" />
        <p className="text-sm font-medium">{error ?? "Data tidak tersedia."}</p>
      </div>
    );
  }

  const { organizer, stats, events, reviews } = profile;

  // ── Rating stars display ──
  const ratingFull = Math.floor(stats.average_rating);
  const ratingHalf = stats.average_rating - ratingFull >= 0.5;

  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      {/* ─── Hero Card ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-md">
        {/* Background decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/3 bg-primary/5 blur-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 p-7 sm:p-8">
          {/* Organizer Avatar / Initial */}
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/20">
            <span className="text-3xl font-bold text-white">
              {organizer.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Organizer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground leading-tight">
                {organizer.name}
              </h1>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold rounded-full px-2.5 py-0.5">
                ✓ Terverifikasi
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground/70 font-medium mb-3">
              @{organizer.slug}
            </p>
            <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xl">
              {organizer.description}
            </p>
            <p className="text-[11px] text-muted-foreground/50 font-medium mt-3">
              Bergabung sejak {formatDate(organizer.joined_at)}
            </p>
          </div>

          {/* Rating Pill */}
          <div className="shrink-0 flex flex-col items-center gap-1 bg-warning/5 border border-warning/20 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < ratingFull
                      ? "fill-warning text-warning"
                      : i === ratingFull && ratingHalf
                        ? "fill-warning/50 text-warning"
                        : "text-muted-foreground/20"
                    }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold text-warning-hover">
              {stats.average_rating.toFixed(1)}
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-medium">
              {formatStat(stats.reviews_count)} ulasan
            </span>
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Pengikut"
          value={formatStat(stats.followers)}
          accent="text-primary"
        />
        <StatCard
          icon={Calendar}
          label="Total Event"
          value={stats.total_events}
          accent="text-secondary"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Peserta"
          value={formatStat(stats.total_event_attendees)}
          accent="text-info"
        />
        <StatCard
          icon={Award}
          label="Avg Rating"
          value={`${stats.average_rating.toFixed(1)} / 5`}
          accent="text-warning"
          sub={`dari ${formatStat(stats.reviews_count)} ulasan`}
        />
      </div>

      {/* ─── Events Section ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Event Mendatang
              </h2>
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-semibold rounded-full px-2">
                {stats.upcoming_events_count}
              </Badge>
            </div>
            <Link
              href="/organizer/my-event"
              className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {!events?.upcoming || events.upcoming.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground/60 text-sm border border-dashed border-border rounded-2xl">
                Belum ada event mendatang
              </div>
            ) : (
              events.upcoming.map((event) => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </div>
        </section>

        {/* Past Events */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-base font-bold text-foreground">
                Event Selesai
              </h2>
              <Badge
                variant="outline"
                className="border-border text-muted-foreground/70 text-[10px] font-semibold rounded-full px-2 bg-transparent"
              >
                {stats.past_events_count}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {!events?.past || events.past.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground/60 text-sm border border-dashed border-border rounded-2xl">
                Belum ada event selesai
              </div>
            ) : (
              events.past.map((event) => (
                <EventRow key={event.id} event={event} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ─── Reviews Section ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground">Ulasan Terbaru</h2>
          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-semibold rounded-full px-2">
            {stats.reviews_count}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {reviews.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-muted-foreground/60 text-sm border border-dashed border-border rounded-2xl">
              Belum ada ulasan
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
