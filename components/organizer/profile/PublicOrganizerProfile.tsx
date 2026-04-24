"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  Star,
  Globe,
  Share2,
  Clock,
  MapPin,
  Laptop,
  UserPlus,
  Mail,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Inbox,
  CalendarDays,
  Check,
} from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { UserService } from "@/services/user-service";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";
import { OrganizerService } from "@/services/organizer-service";
import type {
  OrganizerProfileData,
  OrganizerProfileEvent,
  OrganizerProfileReview,
} from "@/types/organizer";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("id-ID");
}

function formatDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM yyyy", { locale: idLocale });
  } catch {
    return "—";
  }
}

function formatDateShort(iso: string): string {
  try {
    return format(parseISO(iso), "dd MMM", { locale: idLocale });
  } catch {
    return "—";
  }
}

function formatDayOfWeek(iso: string): string {
  try {
    return format(parseISO(iso), "EEEE", { locale: idLocale });
  } catch {
    return "";
  }
}

function formatTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm");
  } catch {
    return "";
  }
}

function hostingDuration(joinedAt: string): string {
  try {
    return formatDistanceToNow(parseISO(joinedAt), { locale: idLocale });
  } catch {
    return "—";
  }
}

// ─── Event Mode Config ────────────────────────────────────────────────────────

const modeConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  offline: { label: "Offline", icon: MapPin, className: "text-emerald-600 bg-emerald-50" },
  online: { label: "Online", icon: Globe, className: "text-blue-600 bg-blue-50" },
  hybrid: { label: "Hybrid", icon: Laptop, className: "text-amber-600 bg-amber-50" },
};

// ─── Event Card ───────────────────────────────────────────────────────────────

function OrganizerEventCard({ event }: { event: OrganizerProfileEvent }) {
  const [imgError, setImgError] = useState(false);
  const mode = modeConfig[event.event_mode] ?? modeConfig.offline;
  const ModeIcon = mode.icon;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-slate-100 overflow-hidden">
        {imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100">
            <span className="text-4xl font-black text-slate-300 select-none">
              {event.title.charAt(0).toUpperCase()}
            </span>
          </div>
        ) : (
          <Image
            src={event.primary_image || `/placeholder-event.jpg`}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}

        {/* Mode badge */}
        <span
          className={cn(
            "absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm",
            mode.className
          )}
        >
          <ModeIcon className="w-2.5 h-2.5" />
          {mode.label}
        </span>

        {/* Attendee count */}
        <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold bg-black/40 text-white backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Users className="w-2.5 h-2.5" />
          {formatStat(event.attendee_count)}
        </span>
      </div>

      {/* Body */}
      <div className="flex gap-3 p-4">
        {/* Date box */}
        <div className="shrink-0 flex flex-col items-center justify-center w-12 h-14 rounded-xl bg-primary/5 border border-primary/10">
          <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider leading-none">
            {formatDateShort(event.start_time).split(" ")[1]}
          </span>
          <span className="text-xl font-black text-primary leading-tight">
            {formatDateShort(event.start_time).split(" ")[0]}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {formatDayOfWeek(event.start_time)} · {formatTime(event.start_time)}
          </p>
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
            kumpul.in
          </p>
        </div>
      </div>
    </Link>
  );
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: OrganizerProfileReview }) {
  const initials = review.reviewer_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800 truncate">
            {review.reviewer_name}
          </span>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                )}
              />
            ))}
          </div>
        </div>
        <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-3">
          {review.comment}
        </p>
        <p className="text-[11px] text-slate-300 mt-1.5 font-medium">
          {formatDate(review.created_at)}
        </p>
      </div>
    </div>
  );
}

// ─── Tab Types ────────────────────────────────────────────────────────────────

type TabId = "upcoming" | "past" | "reviews";

const TABS: { id: TabId; label: string }[] = [
  { id: "upcoming", label: "Mendatang" },
  { id: "past", label: "Selesai" },
  { id: "reviews", label: "Ulasan" },
];

// ─── Main Component ──────────────────────────────────────────────────────────

interface PublicOrganizerProfileProps {
  /** When provided, fetches the public profile by this ID.
   *  Omit to fetch the currently-authenticated organizer's own profile. */
  slug?: string;
}

export default function PublicOrganizerProfile({ slug }: PublicOrganizerProfileProps = {}) {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<OrganizerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");
  const [followed, setFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    if (user && profile?.organizer?.id) {
      const fetchFollowStatus = async () => {
        try {
          const res = await UserService.getFollowStatus(profile.organizer.id.toString());
          if (res.data?.is_follow) {
            setFollowed(true);
          }
        } catch (err) {
          console.error("Failed to fetch follow status", err);
        }
      };
      fetchFollowStatus();
    }
  }, [user, profile?.organizer?.id]);

  const debouncedFollowToggle = useDebouncedCallback(async () => {
    if (!profile?.organizer?.id) return;
    try {
      if (followed) {
        await UserService.unfollowOrganizer(profile.organizer.id.toString());
        toast.success("Berhasil berhenti mengikuti organizer");
        setFollowed(false);
      } else {
        await UserService.followOrganizer(profile.organizer.id.toString());
        toast.success("Berhasil mengikuti organizer");
        setFollowed(true);
      }
    } catch (err) {
      toast.error(followed ? "Gagal berhenti mengikuti organizer" : "Gagal mengikuti organizer");
    } finally {
      setIsLoadingFollow(false);
    }
  }, 500);

  const handleFollowToggle = () => {
    if (isLoadingFollow || !profile?.organizer?.id) return;
    setIsLoadingFollow(true);
    debouncedFollowToggle();
  };

  useEffect(() => {
    const fetch = slug
      ? OrganizerService.getProfileBySlug(slug)
      : OrganizerService.getProfile();

    fetch
      .then(setProfile)
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat profil organizer.");
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Memuat profil...</p>
      </div>
    );
  }

  // ── Error ──
  if (error || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm font-medium">{error ?? "Data tidak tersedia."}</p>
      </div>
    );
  }

  const { organizer, stats, events, reviews } = profile;
  const ratingFull = Math.floor(stats.average_rating);
  const ratingHalf = stats.average_rating - ratingFull >= 0.5;

  const activeEvents =
    activeTab === "upcoming"
      ? events.upcoming
      : activeTab === "past"
        ? events.past
        : [];

  return (
    <div className="min-h-screen bg-[#f8f8fa]">
      {/* ─── Hero Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        {/* Cover Banner */}
        <div className="relative w-full h-32 sm:h-44 overflow-hidden bg-slate-100">
          <Image
            src={organizer.banner_image_url || "/organizer-cover-placeholder.png"}
            alt="Organizer cover"
            fill
            className="object-cover"
            priority
          />
          {/* Subtle bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/50 to-transparent" />
        </div>

        <div className="container max-w-6xl mx-auto px-4 md:px-8 pb-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative -mt-10 sm:-mt-12">
              {organizer.profile_image_url ? (
                <Image
                  src={organizer.profile_image_url}
                  alt={organizer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl sm:text-5xl font-bold text-primary select-none z-10">
                  {organizer.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>


            {/* Name + description */}
            <div className="flex-1 min-w-0 pt-2 sm:pt-3">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {organizer.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Terverifikasi
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium mb-2">@{organizer.slug}</p>
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 max-w-xl">
                {organizer.description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 sm:pt-3">
              <button
                onClick={handleFollowToggle}
                disabled={isLoadingFollow}
                className={cn(
                  "cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300",
                  followed
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
                  isLoadingFollow && "opacity-70 cursor-not-allowed"
                )}
              >
                {isLoadingFollow ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : followed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isLoadingFollow
                  ? "Loading..."
                  : followed
                    ? "Mengikuti"
                    : "Ikuti"}
              </button>
              <button className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition-all duration-300">
                <Mail className="w-4 h-4" />
                Hubungi
              </button>
              <button className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm transition-all duration-300">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-0 py-4 overflow-x-auto scrollbar-hide">
            {/* Followers */}
            <div className="flex flex-col items-center sm:items-start px-6 first:pl-0 border-r border-slate-200 last:border-0">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {formatStat(stats.followers)}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Pengikut
              </span>
            </div>

            {/* Hosting duration */}
            <div className="flex flex-col items-center sm:items-start px-6 border-r border-slate-200">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {hostingDuration(organizer.joined_at)}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Bergabung
              </span>
            </div>

            {/* Total events */}
            <div className="flex flex-col items-center sm:items-start px-6 border-r border-slate-200">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {stats.total_events}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Total Event
              </span>
            </div>

            {/* Total attendees */}
            <div className="flex flex-col items-center sm:items-start px-6 border-r border-slate-200">
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                {formatStat(stats.total_event_attendees)}
              </span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                Total Peserta
              </span>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-center sm:items-start px-6">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold text-amber-500">
                  {stats.average_rating.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < ratingFull
                          ? "fill-amber-400 text-amber-400"
                          : i === ratingFull && ratingHalf
                            ? "fill-amber-200 text-amber-300"
                            : "text-slate-200"
                      )}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {formatStat(stats.reviews_count)} ulasan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Body ──────────────────────────────────────────────────────────── */}
      <div className="container max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Main ── */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-slate-200 mb-7">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "cursor-pointer relative pb-3 px-5 text-sm font-bold transition-colors",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-slate-400 hover:text-slate-700"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                  {/* Count badge */}
                  {tab.id === "upcoming" && (
                    <span className="ml-1.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full px-1.5 py-0.5">
                      {stats.upcoming_events_count}
                    </span>
                  )}
                  {tab.id === "past" && (
                    <span className="ml-1.5 text-[10px] font-bold bg-slate-100 text-slate-400 rounded-full px-1.5 py-0.5">
                      {stats.past_events_count}
                    </span>
                  )}
                  {tab.id === "reviews" && (
                    <span className="ml-1.5 text-[10px] font-bold bg-amber-50 text-amber-500 rounded-full px-1.5 py-0.5">
                      {stats.reviews_count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Events grid */}
            {activeTab !== "reviews" && (
              <>
                {activeEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <Inbox className="w-7 h-7 text-slate-300" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-600 mb-1">
                        {activeTab === "upcoming"
                          ? "Belum ada event mendatang"
                          : "Belum ada event selesai"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Pantau terus untuk update event berikutnya
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {activeEvents.map((event) => (
                      <OrganizerEventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <>
                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
                    <p className="font-bold text-slate-600">Belum ada ulasan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-5">
            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">
                Tentang Organizer
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {organizer.description}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Bergabung {formatDate(organizer.joined_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{stats.total_events} event diselenggarakan</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {formatStat(stats.total_event_attendees)} total peserta
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Star className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Rating {stats.average_rating.toFixed(1)} dari{" "}
                    {formatStat(stats.reviews_count)} ulasan
                  </span>
                </div>
              </div>
            </div>

            {/* Next event spotlight */}
            {events.upcoming[0] && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  Event Terdekat
                </h2>
                <OrganizerEventCard event={events.upcoming[0]} />
              </div>
            )}

            {/* Quick rating widget */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">
                  Rating Keseluruhan
                </span>
                <span className="text-2xl font-black text-amber-500">
                  {stats.average_rating.toFixed(1)}
                </span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < ratingFull
                        ? "fill-amber-400 text-amber-400"
                        : i === ratingFull && ratingHalf
                          ? "fill-amber-200 text-amber-300"
                          : "text-slate-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Berdasarkan {formatStat(stats.reviews_count)} ulasan peserta
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
