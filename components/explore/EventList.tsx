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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
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
          ticketSold={event.total_sold}
          maxQuota={event.max_capacity}
        />
      ))}
    </div>
  );
}
