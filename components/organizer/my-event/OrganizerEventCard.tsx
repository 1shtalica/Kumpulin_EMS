import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, Pencil, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OrganizerEventCard as OrganizerEventCardType } from '@/types/event';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
    event: OrganizerEventCardType;
}

export default function OrganizerEventCard({ event }: Props) {
    let dateStr = "TBA";
    let timeStr = "TBA";

    if (event.start_date) {
        try {
            const dateObj = parseISO(event.start_date);
            dateStr = format(dateObj, 'dd MMM yyyy', { locale: id });
            timeStr = format(dateObj, 'HH:mm') + ' WIB';
        } catch (e) { }
    }

    return (
        <div className="flex flex-col md:flex-row bg-card text-card-foreground border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            {/* Left side: Image and Badge */}
            <div className="relative w-full md:w-[280px] h-40 md:h-auto shrink-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-4 flex flex-col justify-center items-center">
                {event.image_url ? (
                    <Image src={event.image_url} alt={event.title} fill className="object-cover" />
                ) : (
                    <div className="w-24 h-24 relative drop-shadow-xl hover:scale-105 transition-transform duration-500">
                        <Image src="/logo.png" alt="Event Cover" fill className="object-cover opacity-80" unoptimized />
                    </div>
                )}
                <div className="absolute top-4 right-4 z-10">
                    <Badge className={
                        event.status?.toLowerCase() === 'published'
                            ? 'bg-success hover:bg-success-hover text-primary-foreground border-none px-4 py-1 text-xs font-bold rounded-full shadow-sm capitalize'
                            : 'bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground border-none px-4 py-1 text-xs font-bold rounded-full shadow-sm capitalize'
                    }>
                        {event.status ? event.status.toLowerCase() : 'Draft'}
                    </Badge>
                </div>
            </div>

            {/* Right side: Content */}
            <div className="flex flex-col flex-1 p-5 md:p-6 justify-between gap-4">

                {/* Top: Category and Title */}
                <div className="space-y-2.5">
                    <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 text-primary rounded-full px-3 py-1 border-none font-medium text-xs">
                        {event.type || 'Event'}
                    </Badge>

                    <div>
                        <h3 className="text-[18px] font-bold text-foreground tracking-tight mb-1 line-clamp-1">{event.title}</h3>
                        <p className="text-muted-foreground text-[13px] line-clamp-1">
                            {event.is_online ? "Berlangsung secara online" : event.address_title}
                        </p>
                    </div>

                    <div className="flex items-center gap-6 text-[12px] font-medium text-muted-foreground/80 mt-1.5">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground/50" />
                            <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground/50" />
                            <span>{timeStr}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-border my-1" />

                {/* Bottom: Stats and Actions */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="flex gap-10">
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-foreground leading-tight">
                                {event.total_sold}/{event.max_capacity}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium tracking-tight">Peserta</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold text-foreground leading-tight">
                                Rp -
                            </span>
                            <span className="text-xs text-muted-foreground font-medium tracking-tight">Pendapatan</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 lg:mt-0">
                        <Button variant="outline" size="sm" asChild className="h-9 px-4 text-muted-foreground font-medium">
                            <Link href={`/events/${event.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Lihat
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-9 px-4 text-muted-foreground font-medium">
                            <Link href={`/organizer/my-event/${event.id}/edit`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="default" size="sm" asChild className="h-9 px-5 font-medium shadow-md shadow-primary/20">
                            <Link href={`/organizer/my-event/${event.id}/check-in`}>
                                <CheckSquare className="w-4 h-4 mr-2" />
                                Check-in
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
