import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Ticket } from "lucide-react";
import type { RelatedEvent } from "@/types/community";

const formatStartDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatStartingPrice = (price: number) =>
    price <= 0
        ? "Gratis"
        : `Mulai ${new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
          }).format(price)}`;

export default function RelatedEventCard({
    relatedEvent,
    className = "",
}: {
    relatedEvent: RelatedEvent | null | undefined;
    className?: string;
}) {
    if (!relatedEvent) return null;

    return (
        <Link
            href={`/events/${relatedEvent.slug}`}
            className={`group/related-event flex items-center gap-3 rounded-xl border border-primary/15 bg-primary-light/30 p-3 transition hover:border-primary/35 hover:bg-primary-light/55 hover:cursor-pointer ${className}`}
        >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                {relatedEvent.image_url ? (
                    <Image
                        src={relatedEvent.image_url}
                        alt={relatedEvent.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                ) : null}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Event terkait
                </p>
                <h3 className="mt-0.5 truncate text-sm font-semibold text-slate-950 transition-colors group-hover/related-event:text-primary">
                    {relatedEvent.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatStartDate(relatedEvent.event_start_date)}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                        <Ticket className="h-3.5 w-3.5" />
                        {formatStartingPrice(relatedEvent.starting_price)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
