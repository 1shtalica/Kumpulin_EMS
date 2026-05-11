import OrganizerEventsList from "@/components/organizer/my-event/OrganizerEventsList";
import OrganizerEventFilter from "@/components/organizer/my-event/OrganizerEventFilter";

export default function MyEvent() {
  return (
    <main className="relative -mx-6 min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-5 md:-mx-8 md:px-8 md:py-6">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.14,
        }}
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        <OrganizerEventFilter />
        <OrganizerEventsList />
      </div>
    </main>
  );
}
