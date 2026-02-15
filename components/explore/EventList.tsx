import EventCard from "../reusable/EventCard";
import { Inbox } from "lucide-react";
import type { Event } from "@/types/event";

interface EventListProps {
  events: Event[];
}

function formatEventDate(isoDate: string): string {
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

export default function EventList({ events }: EventListProps) {
  // 1. EMPTY STATE (Jika hasil filter kosong)
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Inbox className="w-10 h-10 text-muted" />
        </div>
        <h3 className="text-xl font-bold text-accent">
          Tidak ada event ditemukan
        </h3>
        <p className="text-muted max-w-md mt-2">
          Coba ganti kata kunci pencarian atau atur ulang filter kamu untuk
          menemukan hasil lainnya.
        </p>
      </div>
    );
  }

  // 2. SUCCESS STATE (Grid Layout)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          category={event.category}
          date={formatEventDate(event.start_date)}
          location={event.address?.province}
          price={event.ticket_categories}
          organizer={event.organizer?.name || "Organizer"}
          image={event.banner_url || "/placeholder-event.jpg"}
          slug={event.slug}
          isOnline={event.location?.toLowerCase() === "online"}
          quota={0}
          maxQuota={event.capacity}
        />
      ))}
    </div>
  );
}
