import EventDetailHeader from "@/components/eventdetail/EventDetailHeader";
import EventDetailContent from "@/components/eventdetail/EventDetailContent";

export default function EventDetail({ params }: { params: { slug: string } }) {
  return (
    <>
      <EventDetailHeader />
      <main className="min-h-screen bg-white">
        <EventDetailContent />
      </main>
    </>
  );
}
