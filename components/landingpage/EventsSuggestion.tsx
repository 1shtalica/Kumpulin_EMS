import Link from "next/link";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard, { EventCardSkeleton } from "../reusable/EventCard";
import { EventService } from "@/services/event-service";
import EmptyState from "@/components/reusable/EmptyState";

async function EventsSuggestionGrid() {
  let events: Awaited<ReturnType<typeof EventService.getRandomEvents>> = [];
  let fetchError = false;

  try {
    events = await EventService.getRandomEvents();
  } catch (error) {
    console.error("Failed to load random events:", error);
    fetchError = true;
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />}
        title="Belum Ada Event Pilihan"
        description="Saat ini belum ada event yang tersedia"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {events.slice(0, 4).map((event, index) => (
        <div key={event.id} className={cn(index > 0 && "hidden md:block", index === 3 && "lg:hidden xl:block")}>
          <EventCard
            key={event.id}
            title={event.title}
            category={event.type}
            date={event.start_date}
            location={event.address_title}
            price={event.ticket_price}
            organizer={event.organizer_name}
            image={event.image_url}
            slug={event.slug}
            isOnline={event.is_online}
            ticketSold={event.total_sold}
            maxQuota={event.max_capacity}
          />
        </div>
      ))}
    </div>
  );
}

export default function EventsSuggestion() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#f9fafb]">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.24,
          }}
        />
        <div className="absolute top-8 right-8 h-[22rem] w-[22rem] rounded-full bg-[#002cee14]" />
        <div className="absolute bottom-8 left-8 h-[18rem] w-[18rem] rounded-full bg-[#6366f112]" />
      </div>
      <div className="relative z-10 container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl">
        <div className="flex flex-col gap-2 mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold text-accent">
              Event Pilihan
            </h2>
            <Button variant="link" asChild>
              <Link href="/events?sort=Populer">
                Lihat Semua <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
          <p className="text-sm md:text-base text-muted">
            Jangan lewatkan event seru yang akan datang
          </p>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className={cn(index > 1 && "hidden md:block", index === 4 && "lg:hidden xl:block")}>
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        }>
          <EventsSuggestionGrid />
        </Suspense>
      </div>
    </section>
  );
}


