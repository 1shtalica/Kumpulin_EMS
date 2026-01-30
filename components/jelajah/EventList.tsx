import EventCard from "../reusable/EventCard";
import { Inbox } from "lucide-react";

// Tipe Data Event (Sesuaikan dengan kebutuhan)
interface Event {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  price: number;
  originalPrice?: number;
  organizer: string;
  image: string;
  slug: string;
  isHot?: boolean;
  isOnline?: boolean;
  isRtPintar?: boolean;
  quota?: number;
  maxQuota?: number;
}

interface EventListProps {
  events: Event[];
}

export default function EventList({ events }: EventListProps) {
  // 1. EMPTY STATE (Jika hasil filter kosong)
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <Inbox className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">
          Tidak ada event ditemukan
        </h3>
        <p className="text-slate-500 max-w-md mt-2">
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
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
}
