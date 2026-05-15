import CreateEventHeader from "@/components/organizer/create-event/CreateEventHeader";
import CreateEventClient from "@/components/organizer/create-event/CreateEventClient";

export default function CreateEventPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f9fafb] pt-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.16,
          }}
        />
      </div>
      <CreateEventHeader />
      <CreateEventClient />
    </main>
  );
}
