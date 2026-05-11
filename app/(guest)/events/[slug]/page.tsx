import { notFound } from "next/navigation";
import EventDetailHeader from "@/components/eventdetail/EventDetailHeader";
import EventDetailContent from "@/components/eventdetail/EventDetailContent";
import {EventService} from "@/services/event-service";

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await EventService.getEventBySlug(slug);

  if (!event) {
    return notFound();
  }

  return (
    <>
      <EventDetailHeader />
      <main className="min-h-screen bg-[#f9fafb]">
        <EventDetailContent event={event} />
      </main>
    </>
  );
}
