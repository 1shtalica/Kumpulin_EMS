"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Calendar,
    Clock,
    Copy,
    Eye,
    Loader2,
    MapPin,
    Pencil,
    Power,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EventService } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
    event: OrganizerEventCardType;
    layout?: "list" | "grid";
    onStatusChange?: (eventId: string, status: string) => void;
}

const statusTranslation: Record<string, string> = {
    draft: "Draft",
    published: "Diterbitkan",
    "registration closed": "Pendaftaran Selesai",
    ongoing: "Berlangsung",
    finished: "Selesai",
    archived: "Diarsipkan",
    cancelled: "Dibatalkan",
};

const statusStyles: Record<string, string> = {
    published: "border-success/15 bg-success-light text-success",
    draft: "border-slate-200 bg-slate-100 text-slate-500",
    "registration closed": "border-info/15 bg-info-light text-info-hover",
    ongoing: "border-primary/15 bg-primary-light text-primary",
    finished: "border-slate-200 bg-slate-100 text-slate-500",
    archived: "border-slate-200 bg-slate-100 text-slate-500",
    cancelled: "border-danger/15 bg-danger-light text-danger",
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

export default function OrganizerEventCard({
    event,
    layout = "list",
    onStatusChange,
}: Props) {
    const [currentStatus, setCurrentStatus] = useState(event.status || "draft");
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    useEffect(() => {
        setCurrentStatus(event.status || "draft");
    }, [event.status]);

    let dateStr = "TBA";
    let timeStr = "TBA";

    if (event.start_date) {
        try {
            const dateObj = parseISO(event.start_date);
            dateStr = format(dateObj, "dd MMM yyyy", { locale: id });
            timeStr = `${format(dateObj, "HH:mm")} WIB`;
        } catch {}
    }

    const isGrid = layout === "grid";
    const normalizedStatus = currentStatus?.toLowerCase() || "draft";
    const statusLabel = statusTranslation[normalizedStatus] || normalizedStatus;
    const isPublished = normalizedStatus === "published";
    const nextStatus = isPublished ? "draft" : "published";
    const canTogglePublish =
        normalizedStatus === "draft" || normalizedStatus === "published";
    const capacity = event.max_capacity || 0;
    const sold = event.total_sold || 0;
    const soldPercent =
        capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;
    const eventId = event.id || event.event_id || "";

    const handleConfirmStatusChange = async () => {
        if (!eventId) {
            toast.error("ID event tidak ditemukan.");
            return;
        }

        setIsUpdatingStatus(true);
        const toastId = toast.loading(
            isPublished ? "Mengubah event ke draft..." : "Menerbitkan event...",
        );

        try {
            await EventService.updateOrganizerEventStatus(eventId, nextStatus);
            setCurrentStatus(nextStatus);
            onStatusChange?.(eventId, nextStatus);
            setPublishDialogOpen(false);
            toast.success(
                isPublished
                    ? "Event dikembalikan ke draft."
                    : "Event berhasil diterbitkan.",
                {
                    id: toastId,
                },
            );
        } catch (error) {
            toast.error(
                getErrorMessage(error, "Gagal memperbarui status event."),
                { id: toastId },
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <article
            className={`group relative flex h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-card-foreground shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10 ${isGrid ? "flex-col" : "flex-col lg:flex-row"}`}
        >
            <div
                className={`relative z-10 flex shrink-0 items-center justify-center overflow-hidden bg-slate-950 ${isGrid ? "m-3 h-45 w-[calc(100%-24px)] rounded-xl sm:h-45" : "m-3 h-46 w-[calc(100%-24px)] rounded-xl lg:m-4 lg:mr-0 lg:h-auto lg:min-h-51 lg:w-72"}`}
            >
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-linear-to-br from-primary/8 via-white to-secondary-light/60">
                        <Image
                            src="/logo.png"
                            alt="Event Cover"
                            width={88}
                            height={88}
                            className="object-contain opacity-70"
                            unoptimized
                        />
                    </div>
                )}

                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2.5">
                    <span className="max-w-[60%] truncate rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur">
                        {event.type || "Event"}
                    </span>
                    <Badge
                        className={`shrink-0 gap-1.5 rounded-full border border-white/50 px-2.5 py-1 text-[10px] font-semibold shadow-sm backdrop-blur hover:bg-inherit ${statusStyles[normalizedStatus] || "bg-warning-light text-warning-hover"}`}
                    >
                        <span className="size-1.5 rounded-full bg-current" />
                        {statusLabel}
                    </Badge>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-slate-950/75 via-slate-950/25 to-transparent p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-white">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                            <Calendar className="h-3.5 w-3.5 stroke-[1.5]" />
                            {dateStr}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                            <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
                            {timeStr}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className={`relative z-10 flex flex-1 flex-col justify-between gap-3 bg-white ${isGrid ? "px-4 pb-4 pt-0" : "p-4 pt-1 lg:p-5"}`}
            >
                <div className="flex flex-col gap-2.5">
                    <div className="min-w-0">
                        <h3 className="line-clamp-2 text-lg font-semibold leading-snug tracking-normal text-slate-950 transition-colors group-hover:text-primary">
                            {event.title}
                        </h3>
                        <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
                            <MapPin className="h-4 w-4 shrink-0 stroke-[1.5] text-primary" />
                            <span className="truncate">
                                {event.is_online
                                    ? "Online"
                                    : event.address_title ||
                                      "Lokasi belum diatur"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                                <Users className="h-4 w-4 text-primary" />
                                {sold}/{capacity || "-"} peserta
                            </div>
                            <span className="text-xs font-medium text-slate-500">
                                {soldPercent}%
                            </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${soldPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className={`flex w-full border-t border-slate-100 pt-3 ${isGrid ? "items-center justify-between gap-2" : "flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between"}`}
                >
                    <div
                        className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 ${isGrid ? "w-auto min-w-0 px-2.5 py-2" : "w-full px-3 py-2 sm:w-auto"}`}
                    >
                        <div className="flex min-w-0 flex-col leading-none">
                            <span
                                className={
                                    isGrid
                                        ? "sr-only"
                                        : "text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                                }
                            >
                                Publish
                            </span>
                            <span
                                className={`text-xs font-semibold ${isGrid ? "whitespace-nowrap" : "mt-1"} ${isPublished ? "text-success" : "text-slate-600"}`}
                            >
                                {isPublished ? "Aktif" : "Draft"}
                            </span>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isPublished}
                            disabled={!canTogglePublish || isUpdatingStatus}
                            title={
                                canTogglePublish
                                    ? "Ubah status publikasi"
                                    : "Status ini tidak bisa diubah lewat toggle publish"
                            }
                            onClick={() => setPublishDialogOpen(true)}
                            className={`relative rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${isGrid ? "h-5 w-9" : "h-6 w-11"} ${isPublished ? "bg-success" : "bg-slate-300"}`}
                        >
                            <span
                                className={`absolute left-0.5 top-0.5 rounded-full bg-white shadow-sm transition-transform ${isGrid ? "h-4 w-4" : "h-5 w-5"} ${isPublished ? (isGrid ? "translate-x-4" : "translate-x-5") : "translate-x-0"}`}
                            />
                        </button>
                    </div>
                    <div
                        className={`flex shrink-0 items-center justify-end ${isGrid ? "gap-1.5" : "flex-wrap gap-2"}`}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="Duplikat Event"
                            className={`${isGrid ? "h-9 w-9" : "h-10 w-10"} shrink-0 rounded-xl border-slate-200 bg-white text-slate-500 shadow-none transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary`}
                        >
                            <Link
                                href={`/organizer/create-event?duplicateId=${event.id}`}
                            >
                                <Copy className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="Edit Event"
                            className={`${isGrid ? "h-9 w-9 px-0" : "h-10 w-10 px-0 sm:w-auto sm:px-3.5"} shrink-0 rounded-xl border-primary/25 text-primary shadow-none transition-all hover:bg-primary/5`}
                        >
                            <Link
                                href={`/organizer/my-event/${event.id || event.event_id}`}
                            >
                                <Pencil
                                    className={`h-4 w-4 ${isGrid ? "" : "sm:mr-1.5"}`}
                                />
                                <span
                                    className={
                                        isGrid ? "sr-only" : "hidden sm:inline"
                                    }
                                >
                                    Edit
                                </span>
                            </Link>
                        </Button>
                        <Button
                            size="icon"
                            asChild
                            title="Lihat Event"
                            className={`${isGrid ? "h-9 w-auto px-3" : "h-10 w-10 px-0 sm:w-auto sm:px-3.5"} shrink-0 rounded-xl bg-primary font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90`}
                        >
                            <Link href={`/events/${event.slug}`}>
                                <Eye
                                    className={`h-4 w-4 stroke-[1.5] ${isGrid ? "mr-1.5" : "sm:mr-1.5"}`}
                                />
                                <span
                                    className={
                                        isGrid ? "inline" : "hidden sm:inline"
                                    }
                                >
                                    Lihat
                                </span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog
                open={publishDialogOpen}
                onOpenChange={(open) =>
                    !isUpdatingStatus && setPublishDialogOpen(open)
                }
            >
                <DialogContent className="rounded-2xl border-slate-200 p-0 shadow-xl sm:max-w-md">
                    <div className="p-6">
                        <DialogHeader>
                            <div
                                className={`mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${isPublished ? "bg-slate-100 text-slate-600" : "bg-success-light text-success"}`}
                            >
                                <Power className="h-5 w-5" />
                            </div>
                            <DialogTitle>
                                {isPublished
                                    ? "Ubah event ke draft?"
                                    : "Terbitkan event ini?"}
                            </DialogTitle>
                            <DialogDescription className="leading-relaxed">
                                {isPublished
                                    ? "Event tidak akan tampil sebagai event publik setelah dikembalikan ke draft."
                                    : "Event akan tampil untuk pengunjung dan bisa ditemukan di halaman publik."}
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isUpdatingStatus}
                                onClick={() => setPublishDialogOpen(false)}
                                className="rounded-xl border-slate-200 shadow-none"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                disabled={isUpdatingStatus}
                                onClick={handleConfirmStatusChange}
                                className="rounded-xl"
                            >
                                {isUpdatingStatus && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                {isPublished ? "Jadikan Draft" : "Terbitkan"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </article>
    );
}
