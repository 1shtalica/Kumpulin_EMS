import DetailSection from "./DetailSection";
import ImageSection from "./ImageSection";
import TicketSection from "./TicketSection";
import { DUMMY_EVENT_DETAIL } from "@/lib/data/dummy-events";

export default function EventDetailContent() {
  return (
    <div className="pt-18">
      <ImageSection event={DUMMY_EVENT_DETAIL} />
      <div className="container mx-auto px-4 pb-20 relative z-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8">
            <DetailSection event={DUMMY_EVENT_DETAIL} />
          </div>
          <div className="xl:col-span-4 relative">
            <div className="sticky top-28">
              <TicketSection event={DUMMY_EVENT_DETAIL} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
