import CreateEventHeader from "@/components/organizer/create-event/CreateEventHeader";
import CreateEventClient from "@/components/organizer/create-event/CreateEventClient";

export default async function CreateEventPage() {
  return (
    <main className="pt-16">
      <CreateEventHeader />
      <CreateEventClient />
    </main>
  );
}
