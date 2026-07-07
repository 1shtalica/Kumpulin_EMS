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
                        <span className="select-none text-3xl font-semibold text-slate-300">
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
            <div className="flex gap-3 p-4 sm:p-4">
                {/* Date box */}
                <div className="shrink-0 flex flex-col items-center justify-center h-[52px] w-11 rounded-xl border border-primary/10 bg-primary/5">
                    <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider leading-none">
                        {formatDateShort(event.start_time).split(" ")[1]}
                    </span>
                    <span className="text-base font-semibold leading-tight text-primary">
                        {formatDateShort(event.start_time).split(" ")[0]}
                    </span>
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {formatDayOfWeek(event.start_time)} ·{" "}
                        {formatTime(event.start_time)}
                    </p>
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary sm:text-lg">
                        {event.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-400">
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
        const fetchProfileData = async () => {
            try {
                let data: OrganizerProfileData;
                if (slug) {
                    data = await OrganizerService.getProfileBySlug(slug);
                } else {
                    data = await OrganizerService.getProfile();

                    // Fetch organizer's own events to populate the profile
                    try {
                        const { EventService } =
                            await import("@/services/event-service");
                        const eventsRes = await EventService.getOrganizerEvents(
                            { limit: 100 },
                        );

                        const upcoming: OrganizerProfileEvent[] = [];
                        const past: OrganizerProfileEvent[] = [];
                        const now = new Date();

                        eventsRes.data.forEach((ev) => {
                            const eventTime = new Date(ev.start_date);

                            // Determine event mode based on is_online and type
                            let event_mode: "offline" | "online" | "hybrid" =
                                "offline";
                            if (ev.is_online && ev.type !== "hybrid") {
                                event_mode = "online";
                            } else if (ev.type === "hybrid") {
                                event_mode = "hybrid";
                            } else if (ev.is_online) {
                                event_mode = "online";
                            }

                            const mappedEvent: OrganizerProfileEvent = {
                                id: ev.id || ev.event_id || "",
                                title: ev.title,
                                slug: ev.slug,
                                event_mode: event_mode,
                                status: ev.status,
                                start_time: ev.start_date,
                                end_time: ev.start_date, // fallback
                                attendee_count: ev.total_sold,
                                primary_image: ev.image_url,
                            };

                            if (eventTime > now) {
                                upcoming.push(mappedEvent);
                            } else {
                                past.push(mappedEvent);
                            }
                        });

                        data.events = { upcoming, past };
                    } catch (eventErr) {
                        console.error(
                            "Failed to fetch organizer events",
                            eventErr,
                        );
                    }
                }
                setProfile(data);
            } catch (err) {
                console.error(err);
                setError("Gagal memuat profil organizer.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
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

    const { organizer, stats, events = { upcoming: [], past: [] } } = profile;
    const isPublicProfile = Boolean(slug);

    const activeEvents =
        activeTab === "upcoming" ? events.upcoming : events.past;

    return (
        <div
            className={cn(
                "min-h-screen bg-[#f9fafb]",
                isPublicProfile
                    ? "px-4 py-6 md:px-8 lg:px-12"
                    : "relative min-h-[calc(100vh-136px)] overflow-hidden px-4 py-6 md:-mx-8 md:px-8 flex flex-col",
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
                    "relative mx-auto flex w-full flex-col gap-5 flex-1",
                    !isPublicProfile ? "max-w-6xl" : "max-w-7xl"
                )}
            >
                {!isPublicProfile && (
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                    Organizer workspace
                                </p>
                                <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                                    Profil Organizer
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-md">
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
                        "w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5",
                    )}
                >
                    {/* Cover Banner */}
                    <div
                        className={cn(
                            "px-8 relative w-full overflow-hidden bg-slate-100",
                            isPublicProfile ? "h-48 sm:h-64" : "h-40 sm:h-48",
                        )}
                    >
                        {organizer.banner_image_url ? (
                            <Image
                                src={organizer.banner_image_url}
                                alt="Organizer cover"
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="relative h-full w-full overflow-hidden bg-slate-100">
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-70"
                                    aria-hidden="true"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                                        backgroundSize: "24px 24px",
                                    }}
                                />
                                <svg
                                    className="pointer-events-none absolute inset-0 h-full w-full text-primary"
                                    viewBox="0 0 960 240"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M-20 164C122 98 238 94 372 152C506 210 642 210 806 122C872 86 930 72 1000 82"
                                        stroke="currentColor"
                                        strokeOpacity="0.12"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M-40 92C118 34 262 48 390 104C546 172 696 160 1000 36"
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="2"
                                    />
                                    <rect
                                        x="748"
                                        y="44"
                                        width="92"
                                        height="92"
                                        rx="18"
                                        stroke="currentColor"
                                        strokeOpacity="0.1"
                                        strokeWidth="2"
                                    />
                                    <rect
                                        x="112"
                                        y="132"
                                        width="126"
                                        height="56"
                                        rx="14"
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="2"
                                    />
                                </svg>
                                <div className="absolute top-5 flex items-center gap-3 text-slate-500 ">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-primary shadow-sm shadow-slate-900/5 backdrop-blur">
                                        <CalendarDays className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                            Banner organizer
                                        </p>
                                        <p className="truncate text-sm font-semibold text-slate-700">
                                            {organizer.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    onClick={() =>
                                        bannerInputRef.current?.click()
                                    }
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

                    <div className="relative z-10 mx-auto max-w-full px-4 pb-6 md:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                            {/* Avatar */}
                            <div
                                className={cn(
                                    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary-light shadow-md shadow-slate-900/10",
                                    isPublicProfile
                                        ? "-mt-12 h-24 w-24 sm:-mt-14 sm:h-28 sm:w-28"
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
                                    <span className="z-10 select-none text-3xl font-semibold text-primary sm:text-4xl">
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

                            {/* Name */}
                            <div className="min-w-0 flex-1 pt-2 sm:pt-3">
                                <div className="mb-0.5 flex flex-wrap items-center gap-2">
                                    <h1
                                        className={cn(
                                            "font-semibold leading-tight tracking-normal text-slate-950",
                                            isPublicProfile
                                                ? "text-2xl sm:text-3xl"
                                                : "text-xl sm:text-2xl",
                                        )}
                                    >
                                        {organizer.name}
                                    </h1>
                                </div>
                                <p className="text-xs font-medium text-slate-400">
                                    @{organizer.slug}
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
                                                "flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-300",
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
                                        <button className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:border-primary/20 hover:bg-primary-light/40 hover:text-primary">
                                            <Mail className="w-4 h-4" />
                                            Hubungi
                                        </button>
                                        <button
                                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm shadow-slate-900/5 transition-all duration-300 hover:border-primary/20 hover:bg-primary-light/40 hover:text-primary"
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
                {isPublicProfile ? (
                    <div className="w-full mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {/* Followers */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-slate-900/10">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-lg font-bold leading-none text-slate-950 tabular-nums">
                                    {formatStat(stats.followers)}
                                </span>
                                <span className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Pengikut
                                </span>
                            </div>
                        </div>
                        {/* Hosting duration */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-slate-900/10">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-base font-bold leading-none text-slate-950 tabular-nums">
                                    {hostingDuration(organizer.joined_at)}
                                </span>
                                <span className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Bergabung
                                </span>
                            </div>
                        </div>
                        {/* Total events */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-slate-900/10">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-lg font-bold leading-none text-slate-950 tabular-nums">
                                    {stats.total_events}
                                </span>
                                <span className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Total Event
                                </span>
                            </div>
                        </div>
                        {/* Total attendees */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-slate-900/10">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-lg font-bold leading-none text-slate-950 tabular-nums">
                                    {formatStat(stats.total_event_attendees)}
                                </span>
                                <span className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Total Peserta
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                        <div className="mx-auto max-w-full p-4">
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {/* Followers */}
                                <div className="flex min-w-28 flex-col rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                                    <span className="text-base font-semibold leading-none text-slate-950 sm:text-lg">
                                        {formatStat(stats.followers)}
                                    </span>
                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Pengikut
                                    </span>
                                </div>
                                {/* Hosting duration */}
                                <div className="flex min-w-[8.5rem] flex-col rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                                    <span className="text-base font-semibold leading-none text-slate-950 sm:text-lg">
                                        {hostingDuration(organizer.joined_at)}
                                    </span>
                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Bergabung
                                    </span>
                                </div>
                                {/* Total events */}
                                <div className="flex min-w-28 flex-col rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                                    <span className="text-base font-semibold leading-none text-slate-950 sm:text-lg">
                                        {stats.total_events}
                                    </span>
                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Total Event
                                    </span>
                                </div>
                                {/* Total attendees */}
                                <div className="flex min-w-[8.5rem] flex-col rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                                    <span className="text-base font-semibold leading-none text-slate-950 sm:text-lg">
                                        {formatStat(stats.total_event_attendees)}
                                    </span>
                                    <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Total Peserta
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Body ──────────────────────────────────────────────────────────── */}
                <div
                    className={cn(
                        "w-full flex-1 flex flex-col",
                        isPublicProfile ? "px-0 py-8 md:px-0" : "pt-2 pb-8",
                    )}
                >
                    <div className="w-full grid gap-6 md:grid-cols-[1fr_280px] lg:grid-cols-[1fr_320px] md:items-stretch flex-1">
                        {/* ── Left Main ── */}
                        <div
                            id="events"
                            className="min-w-0 scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-5 flex flex-col"
                        >
                            <div className="mb-5 flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/80 p-1">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "relative flex h-9 cursor-pointer items-center rounded-lg px-4 text-sm font-semibold transition-colors",
                                            activeTab === tab.id
                                                ? "bg-white text-primary shadow-sm shadow-slate-900/5"
                                                : "text-slate-400 hover:text-slate-700",
                                        )}
                                    >
                                        {tab.label}
                                        {tab.id === "upcoming" && (
                                            <span className="ml-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                                {stats.upcoming_events_count}
                                            </span>
                                        )}
                                        {tab.id === "past" && (
                                            <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-400">
                                                {stats.past_events_count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {activeEvents.length === 0 ? (
                                <div className="flex min-h-70 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-slate-400">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm shadow-slate-900/5">
                                        <Inbox className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <div className="text-center">
                                        <p className="mb-1 text-sm font-semibold text-slate-700">
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
                                <div
                                    className={cn(
                                        "grid gap-4",
                                        isPublicProfile
                                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                            : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
                                    )}
                                >
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
                        <aside className="flex w-full min-w-0 flex-col gap-5">
                            {/* About */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Tentang Organizer
                                    </h2>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-500">
                                    {organizer.description ||
                                        "Belum ada deskripsi organizer."}
                                </p>
                                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
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
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
