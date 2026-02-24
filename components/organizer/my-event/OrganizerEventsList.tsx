"use client";

import { useEffect, useState } from "react";
import { EventService } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import OrganizerEventCard from "./OrganizerEventCard";
import EmptyState from "@/components/reusable/EmptyState";
import { CalendarX, Loader2 } from "lucide-react";

export default function OrganizerEventsList() {
    const [events, setEvents] = useState<OrganizerEventCardType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await EventService.getOrganizerEvents();
                setEvents(data || []);
            } catch (error) {
                console.error("Failed to fetch organizer events", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse text-sm">Loading events...</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <EmptyState
                icon={<CalendarX className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />}
                title="Belum Ada Event"
                description="You haven't created any events yet! Click the 'Create Event' button above to get started."
            />
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {events.map((event) => (
                <OrganizerEventCard key={event.id} event={event} />
            ))}
        </div>
    );
}
