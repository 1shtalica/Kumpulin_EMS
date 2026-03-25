import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
        } catch (e) { }
    }

    const isGrid = layout === "grid";

    return (
        <div className={`flex bg-card relative text-card-foreground border border-border rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group h-full ${isGrid ? "flex-col" : "flex-col sm:flex-row"}`}>
            {/* Very subtle elegant geometric line pattern overlay */}
            <div
                className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />
            {/* Left side/Top side: Image */}
            <div className={`relative shrink-0 bg-transparent flex justify-center items-center z-10 overflow-hidden ${isGrid ? "m-3 rounded-[12px] w-[calc(100%-24px)] h-48" : "m-3 sm:m-4 sm:mr-0 rounded-[12px] w-[calc(100%-24px)] sm:w-[280px] h-48 sm:min-h-[220px]"}`}>
                {event.image_url ? (
                    <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-background to-secondary/30 flex justify-center items-center relative drop-shadow-sm">
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
            <div className={`flex flex-col flex-1 z-10 relative bg-card justify-between gap-4 ${isGrid ? "p-5 pt-2" : "p-5 sm:p-6"}`}>
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
                <div className="space-y-1.5 mt-2 md:mt-0 pr-20">
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

                <div className="w-full h-px bg-border my-1" />

                {/* Bottom: Stats and Actions */}
                <div className={`flex justify-between gap-4 flex-col sm:flex-row sm:items-end mt-auto ${!isGrid && "w-full"}`}>
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

                    <div className={`flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto`}>
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            title="Duplikat Event"
                            className="h-[34px] w-[34px] shrink-0 rounded-full border-border shadow-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <Link href={`/organizer/create-event?duplicateId=${event.id}`}>
                                <Copy className="w-4 h-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className={`h-[34px] font-semibold bg-primary hover:bg-primary/90 text-white rounded-full shadow-md transition-all flex-1 sm:w-auto justify-center px-4`}
                        >
                            <Link href={`/organizer/my-event/${event.id}`}>
                                <Eye className="w-4 h-4 mr-1.5 stroke-[1.5]" />
                                Lihat
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
