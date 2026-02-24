import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard, { EventCardSkeletonList } from "@/components/reusable/EventCard";
import { EventService } from "@/services/event-service";
import EmptyState from "../reusable/EmptyState";

async function UpcomingEventsGrid() {
  let events: Awaited<ReturnType<typeof EventService.getEvents>> = [];

  try {
    events = await EventService.getEvents();
  } catch (error) {
    console.error("Failed to load random events:", error);
  }

  if (!events || events.length === 0) {
    return <EmptyState
      icon={<CalendarX className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />}
      title="Belum Ada Event"
      description="Saat ini belum ada event yang tersedia"
    />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          title={event.title}
          category={""}
          date={event.start_date}
          location={event.address_title}
          price={event.ticket_price}
          originalPrice={event.ticket_price}
          organizer={event.organizer_name}
          image={event.image_url}
          slug={event.slug}
          isHot={false}
          isOnline={event.is_online}
          isRtPintar={event.type === "internal"}
          ticketSold={event.total_sold}
          maxQuota={event.max_capacity}
        />
      ))}
    </div>
  );
}

export default function UpcomingEvents() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Row 1: Title + Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold text-accent">
              Event Segera Hadir
            </h2>
            <Button variant="link" asChild className="px-0 md:px-4">
              <Link
                href="/events?sort=terbaru"
                className="flex items-center gap-1"
              >
                Lihat Semua <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          <p className="text-muted">
            Jangan lewatkan event seru yang akan datang
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <EventCardSkeletonList count={8} />
          </div>
        }>
          <UpcomingEventsGrid />
        </Suspense>
      </div>
    </section>
  );
}


