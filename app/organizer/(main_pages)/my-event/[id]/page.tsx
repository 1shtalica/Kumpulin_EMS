"use client";

import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from "react";
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

function getStatusBadgeClass(isPublished: boolean) {
    return isPublished
        ? "gap-1.5 rounded-full border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary-light"
        : "gap-1.5 rounded-full border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100";
}

function WorkspaceShell({ children }: { children: ReactNode }) {
    return (
        <main className="relative -mx-6 min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-5 md:-mx-8 md:px-8 md:py-6">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.14,
                }}
            />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

function SectionTitle({
    icon: Icon,
    title,
}: {
    icon: ComponentType<{ className?: string }>;
    title: string;
}) {
    return (
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon className="h-4.5 w-4.5" />
            </span>
            {title}
        </h3>
    );
}

export default function OrganizerEventDetail() {
    const params = useParams();
    const eventId = params?.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundFlag, setNotFoundFlag] = useState(false);

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;

        try {
            const data = await EventService.getEventByIdFull(eventId);
            if (!data) {
                setNotFoundFlag(true);
                setEvent(null);
                return;
            }

            setNotFoundFlag(false);
            setEvent(data);
        } catch {
            setNotFoundFlag(true);
            setEvent(null);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        void fetchEvent();
    }, [fetchEvent]);

    if (loading) {
        return (
            <WorkspaceShell>
                <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </WorkspaceShell>
        );
    }

    if (notFoundFlag || !event) {
        return (
            <WorkspaceShell>
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm shadow-slate-900/5">
                    <p className="text-lg font-semibold text-slate-950">Event tidak ditemukan.</p>
                    <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                        Event mungkin sudah dihapus atau kamu tidak punya akses untuk mengelolanya.
                    </p>
                    <Button asChild variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary">
                        <Link href="/organizer/my-event">Kembali ke Event Saya</Link>
                    </Button>
                </div>
            </WorkspaceShell>
        );
    }

    const isPublished = event.status?.toLowerCase() === "published";
    const eventVersionKey = [
        event.event_id,
        event.title,
        event.status,
        event.type,
        event.event_start_date,
        event.event_end_date,
        event.start_registration_date,
        event.end_registration_date,
        event.address?.raw_address,
        event.meeting_url,
        event.images?.map((image) => image.image_url).join("|"),
        event.rundowns?.length,
        event.ticket_categories?.length,
    ].join("-");

    return (
        <WorkspaceShell>
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <svg
                    className="pointer-events-none absolute -right-10 -top-12 h-40 w-56 text-primary"
                    viewBox="0 0 224 160"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M15 96C48 34 91 12 144 30C183 43 199 81 210 132"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="18"
                        strokeLinecap="round"
                    />
                    <path
                        d="M54 125C82 80 115 65 153 78C179 87 193 108 201 143"
                        stroke="#10b981"
                        strokeOpacity="0.1"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    <rect x="126" y="24" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.1" />
                    <rect x="155" y="43" width="26" height="26" rx="7" fill="currentColor" fillOpacity="0.08" />
                </svg>

                <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                        <Button variant="outline" size="icon" asChild className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-white shadow-sm shadow-slate-900/5">
                            <Link href="/organizer/my-event">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                Organizer workspace
                            </p>
                            <h1 className="mt-1 truncate text-2xl font-bold leading-[1.12] tracking-normal text-slate-950 md:text-3xl">
                                {event.title}
                            </h1>
                            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 md:text-sm">
                                Kelola detail event per bagian. Klik tombol Edit pada panel yang ingin diperbarui.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getStatusBadgeClass(isPublished)}>
                            <span className={isPublished ? "size-1.5 rounded-full bg-primary" : "size-1.5 rounded-full bg-slate-400"} />
                            {event.status || "Draft"}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                            {event.type}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="space-y-5 md:col-span-2">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                        <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
                            {event.images && event.images.length > 0 ? (
                                <Image src={event.images[0].image_url} alt="Banner" fill className="object-cover" unoptimized />
                            ) : (
                                <Image src="/organizer-cover-placeholder.png" alt="Organizer cover placeholder" fill className="object-cover opacity-60" />
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Badge className={getStatusBadgeClass(isPublished)}>
                                        <span className={isPublished ? "size-1.5 rounded-full bg-primary" : "size-1.5 rounded-full bg-slate-400"} />
                                        {event.status || "Draft"}
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                                        {event.type}
                                    </Badge>
                                </div>
                                <EditSectionModal key={`${eventVersionKey}-core`} event={event} section="core" onUpdated={fetchEvent} />
                            </div>

                            <h2 className="text-xl font-semibold leading-snug text-slate-950 md:text-2xl">{event.title}</h2>

                            <div className="space-y-1 text-slate-600">
                                {event.description
                                    ? <TipTapViewer content={(() => {
                                        const raw: unknown = event.description;
                                        if (typeof raw === 'string') {
                                            try {
                                                const parsed: unknown = JSON.parse(raw);
                                                if (parsed && typeof parsed === 'object' && 'content' in parsed) {
                                                    const content = (parsed as { content?: unknown }).content;
                                                    if (typeof content === 'string') return content;
                                                }
                                            } catch { /* raw string, pass through */ }
                                            return raw;
                                        }
                                        if (raw && typeof raw === 'object') {
                                            if ('content' in raw) {
                                                const content = (raw as { content?: unknown }).content;
                                                if (typeof content === 'string') return content;
                                            }
                                            return JSON.stringify(raw);
                                        }
                                        return String(raw ?? "");
                                    })()} />
                                    : <p className="text-sm italic text-slate-500">No description provided.</p>
                                }
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <SectionTitle icon={MapPin} title="Lokasi" />
                            <EditSectionModal key={`${eventVersionKey}-location`} event={event} section="location" onUpdated={fetchEvent} />
                        </div>

                        {event.is_online ? (
                            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm shadow-slate-900/5">
                                <div className="flex items-start gap-4">
                                    <div className="shrink-0 rounded-xl bg-white p-3 text-primary shadow-sm shadow-slate-900/5 ring-1 ring-primary/10">
                                        <Video className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">Online event</p>
                                        <h4 className="mt-1 font-semibold text-slate-950">Virtual meeting room</h4>
                                        <div className="mt-3 rounded-xl border border-primary/10 bg-white px-3 py-2 shadow-sm shadow-slate-900/5">
                                            {event.meeting_url ? (
                                                <a href={event.meeting_url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline">
                                                    <Navigation className="h-3.5 w-3.5 shrink-0" />
                                                    {event.meeting_url}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-slate-500">Link has not been setup yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            event.address && (event.address.raw_address || event.address.title) ? (
                                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                                    <div className="flex items-start gap-4">
                                        <div className="shrink-0 rounded-xl bg-white p-3 text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80">
                                            <Map className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Venue</p>
                                            <h4 className="mt-1 font-semibold leading-snug text-slate-950">{event.address.title || event.address.raw_address || "Unnamed Location"}</h4>
                                            {event.address.raw_address && <p className="mt-2 text-sm leading-relaxed text-slate-600">{event.address.raw_address}</p>}
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {[event.address.city, event.address.province, event.address.postal_code].filter(Boolean).map((item) => (
                                                    <span key={item} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                            {event.address.maps_url && (
                                                <a href={event.address.maps_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary">
                                                    <Navigation className="h-3.5 w-3.5" />
                                                    Buka Google Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center">
                                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-950">Offline location not fully configured.</p>
                                    <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">Lengkapi venue agar peserta bisa menemukan lokasi event.</p>
                                </div>
                            )
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <SectionTitle icon={List} title="Rundown" />
                            <EditSectionModal key={`${eventVersionKey}-rundown`} event={event} section="rundown" onUpdated={fetchEvent} />
                        </div>

                        {event.rundowns && event.rundowns.length > 0 ? (
                            <div className="relative space-y-4">
                                {event.rundowns.map((r, i) => (
                                    <div key={r.id || i} className="relative grid grid-cols-[44px_1fr] gap-3">
                                        <div className="relative flex flex-col items-center">
                                            {i < (event.rundowns?.length ?? 0) - 1 && (
                                                <span className="absolute top-11 bottom-0 w-px bg-slate-200" aria-hidden="true" />
                                            )}
                                            <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-white text-sm font-semibold text-primary shadow-sm shadow-slate-900/5 tabular-nums">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5 transition-colors hover:border-primary/20 hover:bg-slate-50">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                                        Sesi {i + 1}
                                                    </p>
                                                    <h4 className="mt-1 text-base font-semibold leading-snug text-slate-950">
                                                        {r.title || "Untitled Rundown"}
                                                    </h4>
                                                </div>
                                                <div className="flex shrink-0 items-center rounded-xl border border-primary/10 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm shadow-slate-900/5">
                                                    <span>{r.start_time || "--:--"}</span>
                                                    <span className="mx-2 text-slate-300">to</span>
                                                    <span>{r.end_time || "--:--"}</span>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                                {r.description || "No specific details provided."}
                                            </p>

                                            {r.location && (
                                                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-white px-2.5 py-1 text-xs font-medium text-primary">
                                                    <Navigation className="h-3 w-3" />
                                                    {r.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center">
                                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80">
                                    <List className="h-5 w-5" />
                                </div>
                                <p className="text-sm font-semibold text-slate-950">No rundowns configured.</p>
                                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
                                    Tambahkan sesi untuk menyusun alur acara yang akan ditampilkan ke peserta.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="mb-5 flex items-center justify-between">
                            <SectionTitle icon={Calendar} title="Jadwal" />
                            <EditSectionModal key={`${eventVersionKey}-datetime`} event={event} section="datetime" onUpdated={fetchEvent} />
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-primary/10">
                                        <Calendar className="h-4.5 w-4.5" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Periode Event</p>
                                        <p className="text-sm font-semibold text-slate-950">Waktu pelaksanaan</p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Mulai</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(event.event_start_date)}</p>
                                    </div>
                                    <div className="flex justify-center text-xs font-semibold uppercase tracking-wider text-slate-400">to</div>
                                    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Selesai</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(event.event_end_date)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm shadow-slate-900/5">
                                <div className="mb-3 flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-primary/10">
                                        <Calendar className="h-4.5 w-4.5" />
                                    </span>
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">Periode Registrasi</p>
                                        <p className="text-sm font-semibold text-slate-950">Akses pendaftaran peserta</p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <div className="rounded-xl border border-primary/10 bg-white px-3 py-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Dibuka</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(event.start_registration_date)}</p>
                                    </div>
                                    <div className="flex justify-center text-xs font-semibold uppercase tracking-wider text-slate-400">to</div>
                                    <div className="rounded-xl border border-primary/10 bg-white px-3 py-2">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Ditutup</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatDate(event.end_registration_date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="mb-5 flex items-center justify-between">
                            <SectionTitle icon={Users} title="Kapasitas" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                                <p className="text-2xl font-semibold leading-none text-primary tabular-nums">{event.total_sold}</p>
                                <p className="mt-2 text-xs font-medium text-slate-500">Total Booked</p>
                            </div>
                            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                                <p className="text-2xl font-semibold leading-none text-slate-950 tabular-nums">{event.max_capacity}</p>
                                <p className="mt-2 text-xs font-medium text-slate-500">Max Capacity</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="mb-5 flex items-center justify-between">
                            <SectionTitle icon={Ticket} title="Tiket" />
                            <EditSectionModal key={`${eventVersionKey}-tickets`} event={event} section="tickets" onUpdated={fetchEvent} />
                        </div>

                        {event.ticket_categories && event.ticket_categories.length > 0 ? (
                            <div className="space-y-3">
                                {event.ticket_categories.map((t, i) => (
                                    <div key={i} className="flex flex-col rounded-xl border border-slate-200/80 p-4 transition-colors hover:border-primary/30 hover:bg-slate-50/60">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <h4 className="font-semibold text-slate-950">{t.name}</h4>
                                            <span className="shrink-0 font-semibold text-primary">
                                                {t.price === 0 ? "Free" : `Rp ${t.price.toLocaleString("id-ID")}`}
                                            </span>
                                        </div>
                                        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{t.description}</p>
                                        <div className="mt-auto flex items-center justify-between border-t border-slate-200/80 pt-3">
                                            <span className="text-xs font-medium text-slate-500">Booked: <strong className="text-slate-950">{t.booked}/{t.quota}</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm italic text-slate-500">No tickets configured.</p>
                        )}
                    </div>
                </div>
            </div>
        </WorkspaceShell>
    );
}
