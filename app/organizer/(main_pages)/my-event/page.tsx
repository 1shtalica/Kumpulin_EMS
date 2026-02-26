import OrganizerEventsList from "@/components/organizer/my-event/OrganizerEventsList";
import OrganizerEventFilter from "@/components/organizer/my-event/OrganizerEventFilter";

export default function MyEvent() {
  return (
    <div className="p-8 space-y-8">
      <OrganizerEventFilter />
      <OrganizerEventsList />
    </div>
  );
}
