"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
    Image as ImageIcon,
} from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
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
function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

const modeConfig: Record<
    string,
    { label: string; icon: React.ElementType; className: string }
> = {
    offline: {
        label: "Offline",
        icon: MapPin,
        className: "text-emerald-600 bg-emerald-50",
    },
    online: {
        label: "Online",
        icon: Globe,
        className: "text-blue-600 bg-blue-50",
    },
    hybrid: {
        label: "Hybrid",
        icon: Laptop,
        className: "text-amber-600 bg-amber-50",
    },
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
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
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
                        mode.className,
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
                        {formatDayOfWeek(event.start_time)} ·{" "}
                        {formatTime(event.start_time)}
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
                                        : "text-slate-200",
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

export default function PublicOrganizerProfile({
    slug,
}: PublicOrganizerProfileProps = {}) {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<OrganizerProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>(
        slug ? "upcoming" : "reviews",
    );
    const [followed, setFollowed] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);

    const router = useRouter();
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const profileInputRef = useRef<HTMLInputElement>(null);

    const handleBannerUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.loading("Mengunggah banner...", { id: "upload-banner" });
        try {
            await OrganizerService.updateBannerImage(file);
            toast.success("Banner berhasil diperbarui!", {
                id: "upload-banner",
            });
            router.refresh();
            // Optional: Update local state immediately if needed, or rely on a full page reload if we re-fetch profile on component mount
            // For now, refreshing the router and re-running the fetch effect will grab the new data.
            window.location.reload(); // Quick dirty way to refresh page if router.refresh() doesn't immediately refetch the effect for this component.
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Gagal mengunggah banner"), {
                id: "upload-banner",
            });
        }
    };

    const handleProfileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.loading("Mengunggah foto profil...", { id: "upload-profile" });
        try {
            await OrganizerService.updateProfileImage(file);
            toast.success("Foto profil berhasil diperbarui!", {
                id: "upload-profile",
            });
            router.refresh();
            window.location.reload();
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, "Gagal mengunggah foto profil"), {
                id: "upload-profile",
            });
        }
    };

    function handleShareableLink() {
        const PROFILE_LINK = window.location.href;
        navigator.clipboard.writeText(PROFILE_LINK);
        toast.info("Link berhasil disalin!");
    }

    useEffect(() => {
        if (user && profile?.organizer?.id) {
            const fetchFollowStatus = async () => {
                try {
                    const res = await UserService.getFollowStatus(
                        profile.organizer.id.toString(),
                    );
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
                await UserService.unfollowOrganizer(
                    profile.organizer.id.toString(),
                );
                toast.success("Berhasil berhenti mengikuti organizer");
                setFollowed(false);
            } else {
                await UserService.followOrganizer(
                    profile.organizer.id.toString(),
                );
                toast.success("Berhasil mengikuti organizer");
                setFollowed(true);
            }
        } catch {
            toast.error(
                followed
                    ? "Gagal berhenti mengikuti organizer"
                    : "Gagal mengikuti organizer",
            );
        } finally {
            setIsLoadingFollow(false);
        }
    }, 500);

    const handleFollowToggle = () => {
        if (isLoadingFollow || !profile?.organizer?.id) return;
        setIsLoadingFollow(true);
        debouncedFollowToggle();
    };

    const handleProfileUpdated = (updates: {
        name: string;
        description: string;
    }) => {
        setProfile((currentProfile) =>
            currentProfile
                ? {
                      ...currentProfile,
                      organizer: {
                          ...currentProfile.organizer,
                          ...updates,
                      },
                  }
                : currentProfile,
        );
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
                <p className="text-sm font-medium">
                    {error ?? "Data tidak tersedia."}
                </p>
            </div>
        );
    }

    const {
        organizer,
        stats,
        events = { upcoming: [], past: [] },
        reviews,
    } = profile;
    const ratingFull = Math.floor(stats.average_rating);
    const ratingHalf = stats.average_rating - ratingFull >= 0.5;
    const isPublicProfile = Boolean(slug);

    const activeEvents =
        activeTab === "upcoming"
            ? events.upcoming
            : activeTab === "past"
              ? events.past
              : [];

    return (
        <div
            className={cn(
                "min-h-screen bg-[#f9fafb]",
                isPublicProfile && "px-4 py-6 md:px-8",
            )}
        >
            {/* ─── Hero Header ───────────────────────────────────────────────────── */}
            <div
                className={cn(
                    "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5",
                    isPublicProfile && "mx-auto max-w-6xl",
                )}
            >
                {/* Cover Banner */}
                <div
                    className={cn(
                        "relative w-full overflow-hidden bg-slate-100",
                        isPublicProfile ? "h-48 sm:h-64" : "h-36 sm:h-48",
                    )}
                >
                    <Image
                        src={
                            organizer.banner_image_url ||
                            "/organizer-cover-placeholder.png"
                        }
                        alt="Organizer cover"
                        fill
                        className="object-cover"
                        priority
                    />
                    {!slug && (
                        <div className="absolute top-4 right-4 z-20">
                            <input
                                type="file"
                                accept="image/*"
                                ref={bannerInputRef}
                                className="hidden"
                                onChange={handleBannerUpload}
                            />
                            <button
                                onClick={() => bannerInputRef.current?.click()}
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-slate-950/20 backdrop-blur-md transition-colors hover:bg-black/70"
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                                Ubah Banner
                            </button>
                        </div>
                    )}
                    {/* Subtle bottom fade */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white/50 to-transparent" />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 pb-6 md:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                        {/* Avatar */}
                        <div
                            className={cn(
                                "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary-light shadow-md shadow-slate-900/10",
                                isPublicProfile
                                    ? "-mt-12 h-24 w-24 sm:-mt-16 sm:h-32 sm:w-32"
                                    : "-mt-10 h-20 w-20 sm:-mt-12 sm:h-24 sm:w-24",
                            )}
                        >
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
                            {!slug && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={profileInputRef}
                                        className="hidden"
                                        onChange={handleProfileUpload}
                                    />
                                    <div
                                        onClick={() =>
                                            profileInputRef.current?.click()
                                        }
                                        className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-colors hover:bg-black/40 hover:opacity-100"
                                    >
                                        <ImageIcon className="w-6 h-6 text-white" />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Name + description */}
                        <div className="min-w-0 flex-1 pt-2 sm:pt-3">
                            <div className="mb-0.5 flex flex-wrap items-center gap-2">
                                <h1
                                    className={cn(
                                        "font-bold leading-tight tracking-normal text-slate-950",
                                        isPublicProfile
                                            ? "text-3xl sm:text-4xl"
                                            : "text-2xl sm:text-3xl",
                                    )}
                                >
                                    {organizer.name}
                                </h1>
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-light px-2.5 py-1 text-[10px] font-semibold text-primary">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Terverifikasi
                                </span>
                            </div>
                            <p className="mb-2 text-xs font-medium text-slate-400">
                                @{organizer.slug}
                            </p>
                            <p
                                className={cn(
                                    "max-w-2xl text-sm leading-relaxed text-slate-500",
                                    isPublicProfile
                                        ? "line-clamp-3"
                                        : "line-clamp-2",
                                )}
                            >
                                {organizer.description ||
                                    "Belum ada deskripsi organizer."}
                            </p>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex shrink-0 flex-wrap items-center gap-2.5 sm:pt-3">
                            {slug ? (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        disabled={isLoadingFollow}
                                        className={cn(
                                            "flex h-11 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-300",
                                            followed
                                                ? "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                : "bg-primary text-white shadow-md shadow-primary/15 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20",
                                            isLoadingFollow &&
                                                "opacity-70 cursor-not-allowed",
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
                                    <button className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:border-primary/20 hover:bg-primary-light/40 hover:text-primary">
                                        <Mail className="w-4 h-4" />
                                        Hubungi
                                    </button>
                                    <button
                                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:border-primary/20 hover:bg-primary-light/40 hover:text-primary"
                                        onClick={handleShareableLink}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <EditProfileModal
                                        organizer={organizer}
                                        onUpdated={handleProfileUpdated}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Stats Row ─────────────────────────────────────────────────────── */}
            <div
                className={cn(
                    "mt-5 rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5",
                    isPublicProfile && "mx-auto max-w-6xl",
                )}
            >
                <div className="mx-auto max-w-6xl px-4 md:px-8">
                    <div className="scrollbar-hide flex items-center gap-0 overflow-x-auto py-4">
                        {/* Followers */}
                        <div className="flex min-w-32 flex-col items-center border-r border-slate-200 px-6 first:pl-0 last:border-0 sm:items-start">
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {formatStat(stats.followers)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Pengikut
                            </span>
                        </div>

                        {/* Hosting duration */}
                        <div className="flex min-w-36 flex-col items-center border-r border-slate-200 px-6 sm:items-start">
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {hostingDuration(organizer.joined_at)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Bergabung
                            </span>
                        </div>

                        {/* Total events */}
                        <div className="flex min-w-32 flex-col items-center border-r border-slate-200 px-6 sm:items-start">
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {stats.total_events}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Total Event
                            </span>
                        </div>

                        {/* Total attendees */}
                        <div className="flex min-w-36 flex-col items-center border-r border-slate-200 px-6 sm:items-start">
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {formatStat(stats.total_event_attendees)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Total Peserta
                            </span>
                        </div>

                        {/* Rating */}
                        <div className="flex min-w-40 flex-col items-center px-6 sm:items-start">
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
                                                    : i === ratingFull &&
                                                        ratingHalf
                                                      ? "fill-amber-200 text-amber-300"
                                                      : "text-slate-200",
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
            <div
                className={cn(
                    "mx-auto max-w-6xl px-4 py-8 md:px-8",
                    isPublicProfile && "px-0 md:px-0",
                )}
            >
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* ── Left Main ── */}
                    <div id="events" className="flex-1 min-w-0 scroll-mt-24">
                        {/* Tabs */}
                        <div className="mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm shadow-slate-900/5">
                            {(slug
                                ? TABS
                                : TABS.filter((t) => t.id === "reviews")
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "relative flex h-10 cursor-pointer items-center rounded-xl px-4 text-sm font-semibold transition-colors",
                                        activeTab === tab.id
                                            ? "bg-primary-light text-primary"
                                            : "text-slate-400 hover:text-slate-700",
                                    )}
                                >
                                    {tab.label}
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
                                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-slate-400 shadow-sm shadow-slate-900/5">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                                            <Inbox className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-600 mb-1">
                                                {activeTab === "upcoming"
                                                    ? "Belum ada event mendatang"
                                                    : "Belum ada event selesai"}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                Pantau halaman ini untuk update
                                                event berikutnya.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                        {activeEvents.map((event) => (
                                            <OrganizerEventCard
                                                key={event.id}
                                                event={event}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Reviews */}
                        {activeTab === "reviews" && (
                            <>
                                {reviews.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center text-slate-400 shadow-sm shadow-slate-900/5">
                                        <Star className="h-8 w-8 text-slate-300" />
                                        <p className="font-bold text-slate-600">
                                            Belum ada ulasan
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Ulasan peserta akan muncul setelah
                                            event selesai.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {reviews.map((review) => (
                                            <ReviewCard
                                                key={review.id}
                                                review={review}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ── Right Sidebar ── */}
                    <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-80">
                        {/* About */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2 className="text-sm font-bold text-slate-900">
                                    Tentang Organizer
                                </h2>
                                {isPublicProfile && (
                                    <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-semibold text-primary">
                                        @{organizer.slug}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500">
                                {organizer.description ||
                                    "Belum ada deskripsi organizer."}
                            </p>
                            <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                    <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>
                                        Bergabung{" "}
                                        {formatDate(organizer.joined_at)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>
                                        {stats.total_events} event
                                        diselenggarakan
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>
                                        {formatStat(
                                            stats.total_event_attendees,
                                        )}{" "}
                                        total peserta
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                                    <Star className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>
                                        Rating {stats.average_rating.toFixed(1)}{" "}
                                        dari {formatStat(stats.reviews_count)}{" "}
                                        ulasan
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Next event spotlight */}
                        {events.upcoming[0] && (
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Event Terdekat
                                    </h2>
                                    <Link
                                        href="#events"
                                        className="text-xs font-semibold text-primary hover:text-primary/80"
                                    >
                                        Lihat semua
                                    </Link>
                                </div>
                                <OrganizerEventCard
                                    event={events.upcoming[0]}
                                />
                            </div>
                        )}

                        {/* Quick rating widget */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                            <div className="mb-2 flex items-center justify-between">
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
                                                  : "text-slate-200",
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">
                                Berdasarkan {formatStat(stats.reviews_count)}{" "}
                                ulasan peserta
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
