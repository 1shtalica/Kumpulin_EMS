"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    Calendar,
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
    Settings,
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

// ─── Tab Types ────────────────────────────────────────────────────────────────

type TabId = "upcoming" | "past";

const TABS: { id: TabId; label: string }[] = [
    { id: "upcoming", label: "Mendatang" },
    { id: "past", label: "Selesai" },
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
    const [activeTab, setActiveTab] = useState<TabId>("upcoming");
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
    } = profile;
    const isPublicProfile = Boolean(slug);

    const activeEvents = activeTab === "upcoming" ? events.upcoming : events.past;
    const createdEvents = [...events.upcoming, ...events.past].slice(0, 4);

    return (
        <div
            className={cn(
                "min-h-screen bg-[#f9fafb]",
                isPublicProfile
                    ? "px-4 py-6 md:px-8"
                    : "relative min-h-[calc(100vh-136px)] overflow-hidden px-4 py-6 md:-mx-8 md:px-8",
            )}
        >
            {!isPublicProfile && (
                <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.16,
                    }}
                />
            )}
            <div
                className={cn(
                    !isPublicProfile &&
                        "relative mx-auto flex w-full max-w-6xl flex-col gap-5",
                )}
            >
                {!isPublicProfile && (
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                    Organizer workspace
                                </p>
                                <h1 className="mt-1 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
                                    Profil Organizer
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                                    Kelola identitas publik organizer, foto
                                    profil, banner, dan deskripsi yang dilihat
                                    peserta.
                                </p>
                            </div>
                            <EditProfileModal
                                organizer={organizer}
                                onUpdated={handleProfileUpdated}
                                trigger={
                                    <button className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-md shadow-primary/15 transition-colors hover:bg-primary-hover">
                                        <Settings className="h-4 w-4" />
                                        Edit Profil
                                    </button>
                                }
                            />
                        </div>
                    </section>
                )}
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
                        isPublicProfile ? "h-48 sm:h-64" : "h-32 sm:h-40",
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
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Stats Row ─────────────────────────────────────────────────────── */}
            <div
                className={cn(
                    "rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5",
                    isPublicProfile && "mt-5",
                    isPublicProfile && "mx-auto max-w-6xl",
                )}
            >
                <div
                    className={cn(
                        "mx-auto max-w-6xl",
                        isPublicProfile ? "px-4 md:px-8" : "p-4",
                    )}
                >
                    <div
                        className={cn(
                            isPublicProfile
                                ? "scrollbar-hide flex items-center gap-0 overflow-x-auto py-4"
                                : "grid grid-cols-2 gap-3 sm:grid-cols-4",
                        )}
                    >
                        {/* Followers */}
                        <div
                            className={cn(
                                "flex min-w-32 flex-col",
                                isPublicProfile
                                    ? "items-center border-r border-slate-200 px-6 first:pl-0 last:border-0 sm:items-start"
                                    : "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3",
                            )}
                        >
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {formatStat(stats.followers)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Pengikut
                            </span>
                        </div>

                        {/* Hosting duration */}
                        <div
                            className={cn(
                                "flex min-w-36 flex-col",
                                isPublicProfile
                                    ? "items-center border-r border-slate-200 px-6 sm:items-start"
                                    : "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3",
                            )}
                        >
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {hostingDuration(organizer.joined_at)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Bergabung
                            </span>
                        </div>

                        {/* Total events */}
                        <div
                            className={cn(
                                "flex min-w-32 flex-col",
                                isPublicProfile
                                    ? "items-center border-r border-slate-200 px-6 sm:items-start"
                                    : "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3",
                            )}
                        >
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {stats.total_events}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Total Event
                            </span>
                        </div>

                        {/* Total attendees */}
                        <div
                            className={cn(
                                "flex min-w-36 flex-col",
                                isPublicProfile
                                    ? "items-center px-6 sm:items-start"
                                    : "rounded-xl border border-slate-200/80 bg-slate-50/80 p-3",
                            )}
                        >
                            <span className="text-lg sm:text-xl font-bold text-slate-900">
                                {formatStat(stats.total_event_attendees)}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                                Total Peserta
                            </span>
                        </div>

                    </div>
                </div>
            </div>

            {/* ─── Body ──────────────────────────────────────────────────────────── */}
            <div
                className={cn(
                    "mx-auto max-w-6xl",
                    isPublicProfile ? "px-0 py-8 md:px-0" : "py-0",
                )}
            >
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* ── Left Main ── */}
                    <div id="events" className="flex-1 min-w-0 scroll-mt-24">
                        <div className="mb-6 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm shadow-slate-900/5">
                            {TABS.map((tab) => (
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
                                    {tab.id === "upcoming" && (
                                        <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                            {stats.upcoming_events_count}
                                        </span>
                                    )}
                                    {tab.id === "past" && (
                                        <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                                            {stats.past_events_count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeEvents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-slate-400 shadow-sm shadow-slate-900/5">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                                    <Inbox className="h-7 w-7 text-slate-300" />
                                </div>
                                <div className="text-center">
                                    <p className="mb-1 font-bold text-slate-600">
                                        {activeTab === "upcoming"
                                            ? "Belum ada event mendatang"
                                            : "Belum ada event selesai"}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Pantau halaman ini untuk update event berikutnya.
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

                        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    Event Organizer
                                </h2>
                                <Link
                                    href="#events"
                                    className="text-xs font-semibold text-primary hover:text-primary/80"
                                >
                                    Lihat semua
                                </Link>
                            </div>
                            {createdEvents.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-500">
                                    Belum ada event yang dibuat organizer ini.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {createdEvents.map((event) => {
                                        const mode =
                                            modeConfig[event.event_mode] ??
                                            modeConfig.offline;
                                        const ModeIcon = mode.icon;

                                        return (
                                            <Link
                                                key={event.id}
                                                href={`/events/${event.slug}`}
                                                className="group flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white hover:shadow-md hover:shadow-slate-900/10"
                                            >
                                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                    <Image
                                                        src={
                                                            event.primary_image ||
                                                            `/placeholder-event.jpg`
                                                        }
                                                        alt={event.title}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary">
                                                        {event.title}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                                                        <span>
                                                            {formatDateShort(
                                                                event.start_time,
                                                            )}
                                                        </span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <span className="inline-flex items-center gap-1">
                                                            <ModeIcon className="h-3 w-3" />
                                                            {mode.label}
                                                        </span>
                                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                        <span>
                                                            {formatStat(
                                                                event.attendee_count,
                                                            )}{" "}
                                                            peserta
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
            </div>
        </div>
    );
}


