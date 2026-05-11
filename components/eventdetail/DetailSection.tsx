"use client";

import {
    Calendar,
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

import { Separator } from "../ui/separator";
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
            <div className="w-full h-fit p-5 sm:p-6 lg:p-7 bg-white shadow-md shadow-slate-900/5 border border-slate-200/80 rounded-2xl">
                <div className="flex flex-col gap-5 md:gap-6">
                    {/* Baris Kategori */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="brand">{event.category}</Badge>

                        <Badge
                            className={
                                event.is_online
                                    ? "bg-linear-to-r from-blue-600 to-blue-800 text-white font-semibold border-none px-3 rounded-full uppercase text-[10px] tracking-wide shadow-sm"
                                    : "bg-muted text-white shadow-sm"
                            }
                        >
                            {event.is_online ? "Online" : "Offline"}
                        </Badge>

                        <Badge className="bg-secondary-light text-secondary border border-secondary rounded-full px-2 flex items-center gap-1">
                            {(() => {
                                if (
                                    !event.ticket_categories ||
                                    event.ticket_categories.length === 0
                                )
                                    return "Gratis";
                                const hasFree = event.ticket_categories.some(
                                    (t) => t.price === 0,
                                );
                                const hasPaid = event.ticket_categories.some(
                                    (t) => t.price > 0,
                                );

                                if (hasFree && hasPaid)
                                    return "Gratis & Berbayar";
                                if (hasPaid) return "Berbayar";
                                return "Gratis";
                            })()}
                        </Badge>
                    </div>

                    {/* Judul event */}
                    <div className="flex items-start gap-3 py-3 md:py-4">
                        <div className="mt-1 h-9 w-1 bg-primary rounded-full shrink-0"></div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-950 leading-[1.12] tracking-normal">
                            {event.title}
                        </h1>
                        {isEditable && (
                            <EditSectionModal event={event} section="core" />
                        )}
                    </div>

                    {/* Detail Event Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {/* 1. Jadwal Event */}
                        <div className="flex flex-row items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                            <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-primary-light text-primary">
                                <Calendar size={16} />
                            </div>
                            <div className="flex flex-col ">
                                <div className="flex items-center gap-1">
                                    <span className="text-[11px] tracking-wider font-semibold text-slate-500">
                                        JADWAL EVENT
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="datetime"
                                        />
                                    )}
                                </div>
                                <p className="text-sm md:text-base font-semibold text-slate-900 mt-0.5 leading-snug">
                                    {eventDateString}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {eventTimeString}
                                </p>
                            </div>
                        </div>

                        {/* 2. Masa Registrasi */}
                        <div className="flex flex-row items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                            <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-primary-light text-primary">
                                <Clock size={16} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <span className="text-[11px] tracking-wider font-semibold text-slate-500">
                                        MASA REGISTRASI
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="datetime"
                                        />
                                    )}
                                </div>
                                <p className="text-sm md:text-base font-semibold text-slate-900 mt-0.5 leading-snug">
                                    {regDateString}
                                </p>
                                {regTimeString && (
                                    <p className="text-xs text-slate-500">
                                        {regTimeString}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 3. Lokasi */}
                        <div className="flex flex-row items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                            <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-primary-light text-primary">
                                <MapPin size={16} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <span className="text-[11px] tracking-wider font-semibold text-slate-500">
                                        LOKASI
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="location"
                                        />
                                    )}
                                </div>
                                <p
                                    className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2 leading-snug"
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
                                            className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors bg-primary-light hover:bg-primary/10 px-2.5 py-1 rounded-xl w-fit"
                                        >
                                            <MapPin size={11} />
                                            Lihat di Peta
                                            <ExternalLink size={10} />
                                        </a>
                                    )}
                            </div>
                        </div>

                        {/* 4. Partisipan */}
                        <div className="flex flex-row items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
                            <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-primary-light text-primary mt-0.5">
                                <Users size={16} />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <span className="text-[11px] tracking-wider font-semibold text-slate-500">
                                        PARTISIPAN
                                    </span>
                                    {isEditable && (
                                        <EditSectionModal
                                            event={event}
                                            section="tickets"
                                        />
                                    )}
                                </div>
                                <p className="text-sm md:text-base font-semibold text-slate-900">
                                    {event.total_sold}/
                                    {event.max_capacity || "-"} terdaftar
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pemisah  */}
                    <Separator orientation="horizontal" />

                    <div className="bg-primary-light/70 py-4 px-4 sm:px-5 rounded-2xl border border-primary/10">
                        {event.organizer && (
                            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex flex-row items-center gap-5 w-full md:w-auto">
                                    <div className="shrink-0">
                                        <Link
                                            href={
                                                isOwnEvent
                                                    ? "/organizer/profile"
                                                    : `/organizer/${event.organizer.slug}`
                                            }
                                            className="hover:opacity-80 transition-opacity"
                                        >
                                            <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                                <AvatarImage
                                                    src={
                                                        event.organizer
                                                            .profile_image_url
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {event.organizer.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex flex-row items-center gap-1">
                                            <p className="font-semibold text-slate-900 leading-tight">
                                                {event.organizer.name}
                                            </p>
                                            {event.organizer
                                                .verification_status ===
                                                "verified" && (
                                                <CheckCircle2
                                                    size={16}
                                                    className="text-blue-500 fill-blue-50"
                                                />
                                            )}
                                        </div>
                                        <div className="pt-1 text-slate-600 leading-relaxed">
                                            <p className="text-sm line-clamp-2">
                                                {event.organizer.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Kanan: Tombol Aksi */}
                                {isOwnEvent ? (
                                    // Pemilik event: arahkan ke edit profile sendiri
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl px-5 shrink-0"
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
                                    // Bukan pemilik: tombol Follow / Unfollow
                                    <Button
                                        variant={
                                            hasFollowed ? "outline" : "default"
                                        }
                                        size="sm"
                                        className="rounded-xl px-5 shrink-0"
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
                    <div className="pt-2 md:pt-3">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-7 w-1 bg-primary rounded-full"></div>
                            <h4 className="text-xl md:text-2xl font-bold text-slate-950 leading-tight">
                                Tentang Event
                            </h4>
                            {isEditable && (
                                <EditSectionModal
                                    event={event}
                                    section="core"
                                />
                            )}
                        </div>
                        <TipTapViewer
                            content={event.description?.content || ""}
                        />
                    </div>

                    {/* Bagian Rundown Acara  */}
                    {event.rundowns && event.rundowns.length > 0 && (
                        <div className="pt-2 md:pt-3">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-7 w-1 bg-primary rounded-full"></div>
                                <h4 className="text-xl md:text-2xl font-bold text-slate-950 leading-tight">
                                    Rundown Acara
                                </h4>
                                {isEditable && (
                                    <EditSectionModal
                                        event={event}
                                        section="rundown"
                                    />
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                {event.rundowns.map((item, index) => (
                                    <div
                                        key={item.id ?? index}
                                        className="group flex flex-col md:flex-row gap-3 md:gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-primary-light/10 hover:shadow-sm transition-all duration-300"
                                    >
                                        {/* Waktu (Kiri) */}
                                        <div className=" shrink-0 flex flex-col justify-start md:justify-center pt-1">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-white border border-primary/10 px-3 py-1.5 rounded-xl shadow-sm w-fit">
                                                <Clock
                                                    size={14}
                                                    className="md:w-5 md:h-5"
                                                />
                                                <span>
                                                    {item.start_time} -{" "}
                                                    {item.end_time}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detail (Kanan) */}
                                        <div
                                            className={`flex flex-col w-full ${item.location || item.description ? "gap-2" : "justify-center"}`}
                                        >
                                            <h5 className="font-semibold text-slate-950 text-base md:text-lg leading-tight group-hover:text-primary transition-colors">
                                                {item.title}
                                            </h5>

                                            {item.location && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin
                                                        size={16}
                                                        className="text-primary shrink-0"
                                                    />
                                                    <span className="font-medium">
                                                        {item.location}
                                                    </span>
                                                </div>
                                            )}

                                            {item.description && (
                                                <div className="mt-1 pb-1 border-l-2 border-slate-200 pl-3 ml-1">
                                                    <p className="text-sm text-slate-600 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                </div>
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
