
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OrganizerEventsList from "@/components/organizer/my-event/OrganizerEventsList";

export default function MyEvent() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/organizer/create-event">
            <Plus className="h-3 w-3" />
            <p className="font-medium text-sm" >Create Event</p>
          </Link>
        </Button>
      </div>

      <OrganizerEventsList />
    </div>
  );
}
