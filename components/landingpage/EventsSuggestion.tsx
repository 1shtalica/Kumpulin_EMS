import Link from "next/link";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard, { EventCardSkeleton } from "../reusable/EventCard";
import { EventService } from "@/services/event-service";

async function EventsSuggestionGrid() {
  let events: Awaited<ReturnType<typeof EventService.getRandomEvents>> = [];

  try {
    events = await EventService.getRandomEvents();
  } catch (error) {
    console.error("Failed to load random events:", error);
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {events.slice(0, 4).map((event, index) => (
        <div key={event.id} className={cn(index > 0 && "hidden md:block")}>
          <EventCard
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
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className={cn(index > 1 && "hidden md:block")}>
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


