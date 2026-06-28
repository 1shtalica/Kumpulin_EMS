import EventCard from "../reusable/EventCard";
import { Inbox } from "lucide-react";
import type { HomeEventCard } from "@/types/event";

interface EventListProps {
  events: HomeEventCard[];
}

function formatEventDate(isoDate: string): string {
  // 🌟 TBA
  if (!isoDate) return "TBA";
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

export default function EventList({ events }: EventListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-border rounded-4xl bg-card shadow-sm max-w-3xl mx-auto my-8">
        <div className="bg-primary/5 p-5 rounded-3xl mb-4 border border-primary/10">
          <Inbox className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground">
          Tidak ada event ditemukan
        </h3>
        <p className="text-muted-foreground max-w-sm mt-3 text-sm md:text-base leading-relaxed">
          Coba ganti kata kunci pencarian atau atur ulang filter kamu untuk
          menemukan hasil lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {events.map((event) => (
        <EventCard
          key={event.id ?? event.event_id ?? event.slug}
          eventId={event.event_id ?? event.id}
          title={event.title}
          // 🌟 seharusnya kategori
          category={event.type}
          date={formatEventDate(event.start_date)}
          location={event.is_online ? "Online" : event.address_title}
          price={event.ticket_price}
          organizer={event.organizer_name}
          image={event.image_url || "/placeholder-event.jpg"}
          slug={event.slug}
          isOnline={event.is_online}
          isWishlisted={event.is_wishlisted}
          ticketSold={event.total_sold}
          maxQuota={event.max_capacity}
        />
      ))}
    </div>
  );
}
