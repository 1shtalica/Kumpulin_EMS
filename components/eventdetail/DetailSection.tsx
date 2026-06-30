"use client";

import {
    Calendar,
    List,
    Navigation,
    Clock,
    MapPin,
    Users,
    Check,
    ExternalLink,
    Loader2,
    Plus,
    CheckCircle2,
    Pencil,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "../ui/button";
import { Event } from "@/types/event";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { EditSectionModal } from "@/components/organizer/my-event/EditSectionModal";
import TipTapViewer from "@/components/reusable/TipTapViewer";
import { UserService } from "@/services/user-service";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

interface DetailSectionProps {
    event: Event;
    isEditable?: boolean;
}

export default function DetailSection({
    event,
    isEditable = false,
}: DetailSectionProps) {
    // Guard: pastikan date string valid sebelum diparse
    const startDate = event.event_start_date
        ? new Date(event.event_start_date)
        : null;
    const endDate = event.event_end_date
        ? new Date(event.event_end_date)
        : null;

    // Helper untuk format tanggal & waktu yang seragam
    const formatDateRange = (start: Date | null, end: Date | null) => {
        if (!start || !end) return "Tanggal belum ditentukan";
        if (isSameDay(start, end)) {
            return format(start, "dd MMMM yyyy", { locale: id });
        }
        return `${format(start, "dd MMMM yyyy", { locale: id })} - ${format(
            end,
            "dd MMMM yyyy",
            { locale: id },
        )}`;
    };

    const formatTimeRange = (start: Date | null, end: Date | null) => {
        if (!start || !end) return "-";
        return `${format(start, "HH:mm", { locale: id })} - ${format(
            end,
            "HH:mm",
            {
                locale: id,
            },
        )} WIB`;
    };

    // 1. Jadwal Event
    const eventDateString = formatDateRange(startDate, endDate);
    const eventTimeString = formatTimeRange(startDate, endDate);

    // 2. Masa Registrasi
    const regStartDate = event.start_registration_date
        ? new Date(event.start_registration_date)
        : null;
    const regEndDate = event.end_registration_date
        ? new Date(event.end_registration_date)
        : null;

    const regDateString = formatDateRange(regStartDate, regEndDate);
    const regTimeString = formatTimeRange(regStartDate, regEndDate);

    const { user } = useAuthStore();

    // True jika user yang sedang login adalah pemilik event ini
    const isOwnEvent =
        user?.role === "organizer" &&
        String(user?.id) === String(event.organizer?.id);
    const [hasFollowed, setHasFollowed] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);

    useEffect(() => {
        if (user && event.organizer?.id) {
            const fetchFollowStatus = async () => {
                try {
                    const res = await UserService.getFollowStatus(
                        event.organizer.id.toString(),
                    );
                    if (res.data?.is_follow) {
                        setHasFollowed(true);
                    }
                } catch (err) {
                    console.error("Failed to fetch follow status", err);
                }
            };
            fetchFollowStatus();
        }
    }, [user, event.organizer?.id]);

    const debouncedFollowToggle = useDebouncedCallback(async () => {
        try {
            if (hasFollowed) {
                await UserService.unfollowOrganizer(
                    event.organizer.id.toString(),
                );
                toast.success("Berhasil berhenti mengikuti organizer");
                setHasFollowed(false);
            } else {
                await UserService.followOrganizer(
                    event.organizer.id.toString(),
                );
                toast.success("Berhasil mengikuti organizer");
                setHasFollowed(true);
            }
        } catch {
            toast.error(
                hasFollowed
                    ? "Gagal berhenti mengikuti organizer"
                    : "Gagal mengikuti organizer",
            );
        } finally {
            setIsLoadingFollow(false);
        }
    }, 500);

    const handleFollowToggle = () => {
        if (isLoadingFollow) return;
        setIsLoadingFollow(true);
        debouncedFollowToggle();
    };

    return (
        <section className="w-full flex flex-col items-center justify-between relative">
            <div className="w-full h-fit p-4 sm:p-5 lg:p-6 bg-white shadow-md shadow-slate-900/5 border border-slate-200/80 rounded-2xl">
                <div className="flex flex-col gap-4 md:gap-5">
                    <div className="-mx-4 -mt-4 border-b border-slate-100 px-4 pb-4 pt-4 sm:-mx-5 sm:-mt-5 sm:px-5 sm:pt-5 lg:-mx-6 lg:-mt-6 lg:px-6 lg:pt-6">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge variant="brand">{event.category}</Badge>

                            <Badge
                                className={
                                    event.is_online
                                        ? "bg-blue-50 text-blue-700 font-semibold border border-blue-100 px-2.5 rounded-full uppercase text-[10px] tracking-wide shadow-none"
                                        : "bg-slate-100 text-slate-700 border border-slate-200 shadow-none px-2.5 rounded-full uppercase text-[10px] tracking-wide"
                                }
                            >
                                {event.is_online ? "Online" : "Offline"}
                            </Badge>

                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-2.5 text-[10px] uppercase tracking-wide shadow-none">
                                {(() => {
                                    if (
                                        !event.ticket_categories ||
                                        event.ticket_categories.length === 0
                                    )
                                        return "Gratis";
                                    const hasFree =
                                        event.ticket_categories.some(
                                            (t) => t.price === 0,
                                        );
                                    const hasPaid =
                                        event.ticket_categories.some(
                                            (t) => t.price > 0,
                                        );

                                    if (hasFree && hasPaid)
                                        return "Gratis & Berbayar";
                                    if (hasPaid) return "Berbayar";
                                    return "Gratis";
                                })()}
                            </Badge>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <div className="border-l-2 border-primary/70 pl-4">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                                    Event Detail
                                </span>
                                <h1 className="mt-1 text-2xl font-bold leading-tight tracking-normal text-slate-950 md:text-3xl">
                                    {event.title}
                                </h1>
                            </div>
                            {isEditable && (
                                <EditSectionModal
                                    event={event}
                                    section="core"
                                />
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-100">
                                <Calendar size={15} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Jadwal Event
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="datetime"
                                        />
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-950">
                                    {eventDateString}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {eventTimeString}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-100">
                                <Clock size={15} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Masa Registrasi
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="datetime"
                                        />
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-950">
                                    {regDateString}
                                </p>
                                {regTimeString && (
                                    <p className="text-xs text-slate-500">
                                        {regTimeString}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-100">
                                <MapPin size={15} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Lokasi
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="location"
                                        />
                                    )}
                                </div>
                                <p
                                    className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-950"
                                    title={event.address?.raw_address}
                                >
                                    {event.is_online
                                        ? "Online Meeting"
                                        : event.address?.raw_address ||
                                          "Lokasi Event"}
                                </p>
                                {event.address?.city &&
                                    event.address?.province && (
                                        <p className="text-xs text-slate-500">
                                            {event.address.city},{" "}
                                            {event.address.province}
                                        </p>
                                    )}
                                {!event.is_online &&
                                    event.address?.maps_url && (
                                        <a
                                            href={event.address.maps_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/10 transition-colors hover:bg-primary-light"
                                        >
                                            <MapPin size={11} />
                                            Lihat di Peta
                                            <ExternalLink size={10} />
                                        </a>
                                    )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-100">
                                <Users size={15} />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                        Partisipan
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="tickets"
                                        />
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm font-semibold text-slate-950">
                                    {event.total_sold}/
                                    {event.max_capacity || "-"} terdaftar
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="-mx-4 sm:-mx-5 lg:-mx-6 border-y border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-5 lg:px-6">
                        {event.organizer && (
                            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3.5">
                                    <Link
                                        href={
                                            isOwnEvent
                                                ? "/organizer/profile"
                                                : `/organizer/${event.organizer.slug}`
                                        }
                                        className="shrink-0 hover:opacity-85 transition-opacity"
                                    >
                                        <Avatar className="h-11 w-11 ring-1 ring-slate-200 shadow-sm">
                                            <AvatarImage
                                                src={
                                                    event.organizer
                                                        .profile_image_url
                                                }
                                            />
                                            <AvatarFallback className="bg-slate-700 text-xs font-semibold text-white">
                                                {event.organizer.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                            Organizer
                                        </span>
                                        <div className="mt-0.5 flex items-center gap-1.5">
                                            <p className="truncate text-sm font-semibold leading-tight text-slate-950">
                                                {event.organizer.name}
                                            </p>
                                            {event.organizer
                                                .verification_status ===
                                                "verified" && (
                                                <CheckCircle2
                                                    size={15}
                                                    className="shrink-0 text-blue-500 fill-blue-50"
                                                />
                                            )}
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                                            {event.organizer.description}
                                        </p>
                                    </div>
                                </div>

                                {isOwnEvent ? (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="h-9 shrink-0 rounded-lg border-slate-200 px-4 text-xs font-semibold"
                                    >
                                        <Link href="/organizer/profile">
                                            <Pencil
                                                size={14}
                                                className="mr-1.5"
                                            />
                                            Edit Profile
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button
                                        variant={
                                            hasFollowed ? "outline" : "default"
                                        }
                                        size="sm"
                                        className="h-9 shrink-0 rounded-lg px-4 text-xs font-semibold shadow-sm shadow-primary/15"
                                        onClick={handleFollowToggle}
                                        disabled={isLoadingFollow}
                                    >
                                        {isLoadingFollow ? (
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                        ) : hasFollowed ? (
                                            <Check size={14} />
                                        ) : (
                                            <Plus size={14} />
                                        )}
                                        {isLoadingFollow
                                            ? "Loading..."
                                            : hasFollowed
                                              ? "Unfollow"
                                              : "Follow"}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bagian Deskripsi Event  */}
                    <div className="pt-1 md:pt-2">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                                    Detail Event
                                </span>
                                <h4 className="mt-1 text-lg font-bold leading-tight text-slate-950 md:text-xl">
                                    Tentang Event
                                </h4>
                            </div>
                            {isEditable && (
                                <EditSectionModal
                                    event={event}
                                    section="core"
                                />
                            )}
                        </div>
                        <div className="border-l-2 border-primary/70 pl-4 sm:pl-5">
                            <TipTapViewer
                                content={event.description?.content || ""}
                            />
                        </div>
                    </div>

                    {/* Bagian Rundown Acara  */}
                    {event.rundowns && event.rundowns.length > 0 && (
                        <div className="pt-1 md:pt-2">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                                        <List className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                                            Susunan Acara
                                        </span>
                                        <h4 className="mt-1 text-lg font-bold leading-tight text-slate-950 md:text-xl">
                                            Rundown
                                        </h4>
                                    </div>
                                </div>
                                {isEditable && (
                                    <EditSectionModal
                                        event={event}
                                        section="rundown"
                                    />
                                )}
                            </div>

                            <div className="relative space-y-4">
                                {event.rundowns.map((item, index) => (
                                    <div
                                        key={item.id ?? index}
                                        className="relative grid grid-cols-[44px_1fr] gap-3"
                                    >
                                        <div className="relative flex flex-col items-center">
                                            {index <
                                                (event.rundowns?.length ?? 0) -
                                                    1 && (
                                                <span
                                                    className="absolute bottom-0 top-11 w-px bg-slate-200"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-white text-sm font-semibold tabular-nums text-primary shadow-sm shadow-slate-900/5">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/20 hover:bg-slate-50">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                                        Sesi {index + 1}
                                                    </p>
                                                    <h5 className="mt-1 text-base font-semibold leading-snug text-slate-950">
                                                        {item.title ||
                                                            "Untitled Rundown"}
                                                    </h5>
                                                </div>
                                                <div className="flex shrink-0 items-center rounded-xl border border-primary/10 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm shadow-slate-900/5">
                                                    <span className="font-bold">
                                                        {item.start_time ||
                                                            "--:--"}
                                                    </span>
                                                    <span className="mx-2 text-slate-300">
                                                        hingga
                                                    </span>
                                                    <span className="font-bold">
                                                        {item.end_time ||
                                                            "--:--"}
                                                    </span>
                                                </div>
                                            </div>

                                            {item.description && (
                                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                    {item.description}
                                                </p>
                                            )}

                                            {item.location && (
                                                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-white px-2.5 py-1 text-xs font-medium text-primary">
                                                    <Navigation className="h-3 w-3" />
                                                    {item.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
