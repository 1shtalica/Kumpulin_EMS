import DetailSection from "./DetailSection";
import ImageSection from "./ImageSection";
import TicketSection from "./TicketSection";
import { Event } from "@/types/event";

export default function EventDetailContent({ event }: { event: Event }) {
  return (
    <div className="pt-16 md:pt-18">
      <ImageSection event={event} />
      <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-14 md:pb-18 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
          <div className="xl:col-span-8">
            <DetailSection event={event} />
          </div>
          <div className="xl:col-span-4 relative">
            <div className="sticky top-24">
              <TicketSection event={event} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
