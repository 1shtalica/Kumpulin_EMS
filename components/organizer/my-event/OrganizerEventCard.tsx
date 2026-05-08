import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Eye, Copy, Pencil } from "lucide-react";
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

export default function OrganizerEventCard({ event, layout = "list" }: Props) {
    let dateStr = "TBA";
    let timeStr = "TBA";

    if (event.start_date) {
        try {
            const dateObj = parseISO(event.start_date);
            dateStr = format(dateObj, "dd MMM yyyy", { locale: id });
            timeStr = format(dateObj, "HH:mm") + " WIB";
        } catch { }
    }

    const isGrid = layout === "grid";

    return (
        <div className={`flex bg-card relative text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group h-full ${isGrid ? "flex-col" : "flex-col sm:flex-row"}`}>
            {/* Left side/Top side: Image */}
            <div className={`relative shrink-0 bg-transparent flex justify-center items-center z-10 overflow-hidden ${isGrid ? "m-3 rounded-[12px] w-[calc(100%-24px)] h-48" : "m-3 sm:m-4 sm:mr-0 rounded-[12px] w-[calc(100%-24px)] sm:w-70 h-48 sm:min-h-55"}`}>
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/5 via-background to-secondary/30 flex justify-center items-center relative drop-shadow-sm">
                            <Image
                                src="/logo.png"
                                alt="Event Cover"
                                width={96}
                                height={96}
                                className="object-contain opacity-70"
                                unoptimized
                            />
                        </div>
                )}
            </div>

            {/* Right side/Bottom side: Content */}
            <div className={`flex flex-col flex-1 z-10 relative bg-card justify-between gap-4 ${isGrid ? "p-5 pt-2" : "p-5 pt-2 sm:p-6"}`}>
                {/* Top-Right Badge */}
                <div className="absolute top-5 right-5 z-20">
                    <Badge
                        className={
                            event.status?.toLowerCase() === "published"
                                ? "bg-success-light/80 hover:bg-success-light text-success border-none px-3 py-0.5 text-[11px] font-medium rounded-full shadow-none capitalize backdrop-blur-sm transition-colors"
                                : "bg-warning-light/80 hover:bg-warning-light text-warning-hover border-none px-3 py-0.5 text-[11px] font-medium rounded-full shadow-none capitalize backdrop-blur-sm transition-colors"
                        }
                    >
                        {event.status ? statusTranslation[event.status.toLowerCase()] || event.status.toLowerCase() : "Draft"}
                    </Badge>
                </div>

                {/* Top: Category and Title */}
                <div className="space-y-1.5 mt-2 md:mt-0 pr-16 sm:pr-20">
                    <span className="text-muted-foreground/60 font-medium text-[11px] uppercase tracking-widest inline-block">
                        {event.type || "Event"}
                    </span>

                    <div>
                        <h3 className="text-[18px] font-semibold text-foreground/90 tracking-tight leading-snug mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                            {event.title}
                        </h3>
                        <p className="text-muted-foreground/70 text-[13px] font-medium line-clamp-1">
                            {event.is_online
                                ? "Berlangsung secara online"
                                : event.address_title}
                        </p>
                    </div>

                    <div className="flex items-center gap-5 text-[12px] font-medium text-muted-foreground/70 mt-3 pt-1">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                            <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                            <span>{timeStr}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                        <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-foreground/90 leading-tight">
                                {event.total_sold}/{event.max_capacity}
                            </span>
                            <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wide uppercase mt-0.5">
                                Peserta
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-semibold text-foreground/90 leading-tight">
                                Rp -
                            </span>
                            <span className="text-[11px] text-muted-foreground/60 font-medium tracking-wide uppercase mt-0.5">
                                Pendapatan
                            </span>
                        </div>
                    </div>

                <Separator />

                {/* Bottom: Stats and Actions */}
                    <div className="flex items-center justify-end gap-2 w-full">
                        {/* Duplikat — selalu icon only */}
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="Duplikat Event"
                            className="h-8.5 w-8.5 shrink-0 rounded-full border-border shadow-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <Link href={`/organizer/create-event?duplicateId=${event.id}`}>
                                <Copy className="w-4 h-4" />
                            </Link>
                        </Button>
                        {/* Edit — icon di mobile, icon+teks di lg+ */}
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="Edit Event"
                            className="h-8.5 w-8.5 px-0 lg:w-auto lg:px-4 shrink-0 rounded-full border border-primary shadow-sm text-primary hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <Link href={`/organizer/my-event/${event.id || event.event_id}`}>
                                <Pencil className="w-4 h-4 lg:mr-1.5" />
                                <span className="hidden lg:inline">Edit</span>
                            </Link>
                        </Button>
                        {/* Lihat — icon di mobile, icon+teks di lg+ */}
                        <Button
                            size="icon"
                            asChild
                            title="Lihat Event"
                            className="h-8.5 w-8.5 px-0 lg:w-auto lg:px-4 shrink-0 font-semibold bg-primary hover:bg-primary/90 text-white rounded-full shadow-sm transition-all"
                        >
                            <Link href={`/events/${event.slug}`}>
                                <Eye className="w-4 h-4 stroke-[1.5] lg:mr-1.5" />
                                <span className="hidden lg:inline">Lihat</span>
                            </Link>
                        </Button>
                    </div>
                
            </div>
        </div>
    );
}
