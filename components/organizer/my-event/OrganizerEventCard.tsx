import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Copy, Eye, MapPin, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface Props {
    event: OrganizerEventCardType;
    layout?: "list" | "grid";
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

export default function OrganizerEventCard({ event, layout = "list" }: Props) {
    let dateStr = "TBA";
    let timeStr = "TBA";

    if (event.start_date) {
        try {
            const dateObj = parseISO(event.start_date);
            dateStr = format(dateObj, "dd MMM yyyy", { locale: id });
            timeStr = `${format(dateObj, "HH:mm")} WIB`;
        } catch { }
    }

    const isGrid = layout === "grid";
    const normalizedStatus = event.status?.toLowerCase() || "draft";
    const statusLabel = statusTranslation[normalizedStatus] || normalizedStatus;
    const capacity = event.max_capacity || 0;
    const sold = event.total_sold || 0;
    const soldPercent = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;

    return (
        <article className={`group relative flex h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-card-foreground shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10 ${isGrid ? "flex-col" : "flex-col lg:flex-row"}`}>
            <div className={`relative z-10 flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 ${isGrid ? "m-3 h-44 w-[calc(100%-24px)] rounded-xl sm:h-48" : "m-3 h-48 w-[calc(100%-24px)] rounded-xl lg:m-4 lg:mr-0 lg:h-auto lg:min-h-52 lg:w-72"}`}>
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
            </div>

            <div className={`relative z-10 flex flex-1 flex-col justify-between gap-4 bg-white ${isGrid ? "px-5 pb-5 pt-2" : "p-5 pt-2 lg:p-6"}`}>
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                                {event.type || "Event"}
                            </span>
                            <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-snug tracking-normal text-slate-950 transition-colors group-hover:text-primary">
                                {event.title}
                            </h3>
                        </div>

                        <Badge className={`shrink-0 gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-none hover:bg-inherit ${statusStyles[normalizedStatus] || "border-warning/15 bg-warning-light text-warning-hover"}`}>
                            <span className="size-1.5 rounded-full bg-current" />
                            {statusLabel}
                        </Badge>
                    </div>

                    <div className="grid gap-2 text-xs font-medium text-slate-500 sm:grid-cols-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" />
                            <span>{dateStr}</span>
                        </div>
                        <div className="flex min-w-0 items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" />
                            <span>{timeStr}</span>
                        </div>
                        <div className="flex min-w-0 items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 stroke-[1.5]" />
                            <span className="truncate">
                                {event.is_online ? "Online" : event.address_title || "Lokasi belum diatur"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
                                <Users className="h-4 w-4 text-primary" />
                                {sold}/{capacity || "-"} peserta
                            </div>
                            <span className="text-xs font-medium text-slate-500">{soldPercent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${soldPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-6 sm:justify-end">
                        <div className="flex flex-col text-right">
                            <span className="text-[15px] font-semibold leading-tight text-slate-950">
                                Rp -
                            </span>
                            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                Pendapatan
                            </span>
                        </div>
                    </div>
                </div>

                <Separator className="bg-slate-200/80" />

                <div className="flex w-full flex-wrap items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Duplikat Event"
                        className="h-9 w-9 shrink-0 rounded-xl border-slate-200 bg-white text-slate-500 shadow-none transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                        <Link href={`/organizer/create-event?duplicateId=${event.id}`}>
                            <Copy className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        asChild
                        title="Edit Event"
                        className="h-9 w-9 shrink-0 rounded-xl border-primary/30 px-0 text-primary shadow-none transition-all hover:bg-primary/5 sm:w-auto sm:px-3"
                    >
                        <Link href={`/organizer/my-event/${event.id || event.event_id}`}>
                            <Pencil className="h-4 w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Edit</span>
                        </Link>
                    </Button>
                    <Button
                        size="icon"
                        asChild
                        title="Lihat Event"
                        className="h-9 w-9 shrink-0 rounded-xl bg-primary px-0 font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 sm:w-auto sm:px-3"
                    >
                        <Link href={`/events/${event.slug}`}>
                            <Eye className="h-4 w-4 stroke-[1.5] sm:mr-1.5" />
                            <span className="hidden sm:inline">Lihat</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
