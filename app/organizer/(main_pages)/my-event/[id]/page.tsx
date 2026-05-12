"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventService } from "@/services/event-service";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar, MapPin, Ticket, Video,
    Map, Users, ChevronLeft, Navigation, List, Loader2
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { EditSectionModal } from "@/components/organizer/my-event/EditSectionModal";
import TipTapViewer from "@/components/reusable/TipTapViewer";
import type { Event } from "@/types/event";


function formatDate(isoString: string | undefined) {
    if (!isoString) return "TBA";
    try {
        return format(parseISO(isoString), "dd MMM yyyy, HH:mm", { locale: id }) + " WIB";
    } catch {
        return "Invalid Date";
    }
}


export default function OrganizerEventDetail() {
    const params = useParams();
    const eventId = params?.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundFlag, setNotFoundFlag] = useState(false);

    useEffect(() => {
        if (!eventId) return;
        setLoading(true);
        EventService.getEventByIdFull(eventId)
            .then((data) => {
                if (!data) {
                    setNotFoundFlag(true);
                } else {
                    setEvent(data);
                }
            })
            .catch(() => setNotFoundFlag(true))
            .finally(() => setLoading(false));
    }, [eventId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (notFoundFlag || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground text-lg">Event not found.</p>
                <Button asChild variant="outline">
                    <Link href="/organizer/my-event">Back to My Events</Link>
                </Button>
            </div>
        );
    }

    const isPublished = event.status?.toLowerCase() === "published";

    return (
        <div className="min-h-[calc(100vh-136px)] space-y-6 bg-[#f8fafc] px-4 py-6 md:-mx-8 md:px-8">
            {/* Header & Back Button */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white shadow-sm shadow-slate-900/5">
                        <Link href="/organizer/my-event">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Edit event
                            </p>
                            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950">
                                {event.title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={isPublished ? "rounded-full bg-success px-3 py-1 text-white" : "rounded-full bg-slate-700 px-3 py-1 text-white"}>
                            {event.status || "Draft"}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                            {event.type}
                        </Badge>
                    </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
                    Kelola detail event per bagian. Klik tombol Edit pada kartu yang ingin diperbarui.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Main Column */}
                <div className="space-y-6 md:col-span-2">
                    {/* Core Info Card */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
                            {event.images && event.images.length > 0 ? (
                                <Image src={event.images[0].image_url} alt="Banner" fill className="object-cover" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image src="/logo.png" alt="Logo" width={100} height={100} className="opacity-30" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Badge className={isPublished ? "rounded-full bg-success px-3 py-1 text-white" : "rounded-full bg-slate-700 px-3 py-1 text-white"}>
                                        {event.status || "Draft"}
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                                        {event.type}
                                    </Badge>
                                </div>
                                <EditSectionModal event={event} section="core" />
                            </div>

                            <h2 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{event.title}</h2>

                            <div className="space-y-1 text-muted-foreground">
                                {event.description
                                    ? <TipTapViewer content={(() => {
                                        const raw = event.description as any;
                                        if (typeof raw === 'string') {
                                            try {
                                                const parsed = JSON.parse(raw);
                                                if (parsed && typeof parsed.content === 'string') {
                                                    return parsed.content;
                                                }
                                            } catch { /* raw string, pass through */ }
                                            return raw;
                                        }
                                        if (raw && typeof raw === 'object') {
                                            if (typeof raw.content === 'string') return raw.content;
                                            return JSON.stringify(raw);
                                        }
                                        return String(raw ?? "");
                                    })()} />
                                    : <p className="text-sm italic">No description provided.</p>
                                }
                            </div>

                        </div>
                    </div>

                    {/* Address / Location Section */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <MapPin className="w-5 h-5" />
                                </span>
                                Lokasi
                            </h3>
                            <EditSectionModal event={event} section="location" />
                        </div>

                        {event.is_online ? (
                            <div className="flex items-start gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                                <div className="p-3 bg-white rounded-full shadow-sm text-primary">
                                    <Video className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Online Event</h4>
                                    <a href={event.meeting_url || "#"} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">
                                        {event.meeting_url || "Link has not been setup yet."}
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {event.address && (event.address.raw_address || event.address.title) ? (
                                    <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-border">
                                        <div className="p-3 bg-white rounded-full shadow-sm text-primary shrink-0">
                                            <Map className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-foreground">{event.address.title || event.address.raw_address || "Unnamed Location"}</h4>
                                            {event.address.raw_address && <p className="text-sm text-muted-foreground">{event.address.raw_address}</p>}
                                            <p className="text-sm font-medium text-slate-500">
                                                {[event.address.city, event.address.province, event.address.postal_code].filter(Boolean).join(", ")}
                                            </p>
                                            {event.address.maps_url && (
                                                <a href={event.address.maps_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                                                    <Navigation className="w-3 h-3" /> View on Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-sm italic">Offline location not fully configured.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Rundown Section */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-950">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <List className="w-5 h-5" />
                                </span>
                                Rundown
                            </h3>
                            <EditSectionModal event={event} section="rundown" />
                        </div>

                        {event.rundowns && event.rundowns.length > 0 ? (
                            <div className="space-y-4">
                                {event.rundowns.map((r, i) => (
                                    <div key={r.id || i} className="flex gap-4 p-4 border border-border rounded-2xl hover:bg-slate-50 transition-colors">
                                        <div className="flex flex-col items-center justify-center px-4 py-2 bg-primary/10 text-primary rounded-xl shrink-0 h-fit min-w-25">
                                            <span className="text-sm font-bold">{r.start_time}</span>
                                            <span className="text-xs font-semibold opacity-70">to</span>
                                            <span className="text-sm font-bold">{r.end_time}</span>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-semibold text-foreground leading-tight">{r.title || "Untitled Rundown"}</h4>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description || "No specific details provided."}</p>
                                            {r.location && <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1"><Navigation className="w-3 h-3" /> {r.location}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">No rundowns configured.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar / Tickets Column */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <Calendar className="w-5 h-5" />
                                </span>
                                Jadwal
                            </h3>
                            <EditSectionModal event={event} section="datetime" />
                        </div>
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Event Start</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(event.event_start_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Event End</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(event.event_end_date)}</p>
                            </div>
                            <div className="w-full h-px bg-border" />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Registration Open</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(event.start_registration_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Registration Close</p>
                                <p className="text-sm font-medium text-foreground">{formatDate(event.end_registration_date)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <Users className="w-5 h-5" />
                                </span>
                                Kapasitas
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-2xl font-bold text-primary">{event.total_sold}</p>
                                <p className="text-xs font-semibold tracking-tight text-muted-foreground mt-1">Total Booked</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-border">
                                <p className="text-2xl font-bold text-foreground">{event.max_capacity}</p>
                                <p className="text-xs font-semibold tracking-tight text-muted-foreground mt-1">Max Capacity</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                    <Ticket className="w-5 h-5" />
                                </span>
                                Tiket
                            </h3>
                            <EditSectionModal event={event} section="tickets" />
                        </div>

                        {event.ticket_categories && event.ticket_categories.length > 0 ? (
                            <div className="space-y-4">
                                {event.ticket_categories.map((t, i) => (
                                    <div key={i} className="flex flex-col p-4 border border-border rounded-2xl hover:border-primary/30 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-foreground">{t.name}</h4>
                                            <span className="font-bold text-primary">
                                                {t.price === 0 ? "Free" : `Rp ${t.price.toLocaleString("id-ID")}`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{t.description}</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                                            <span className="text-xs font-medium text-muted-foreground">Booked: <strong className="text-foreground">{t.booked}/{t.quota}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm italic">No tickets configured.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
