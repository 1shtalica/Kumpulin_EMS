
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MyEvent() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-end">
        <Button asChild>
          <Link href="/organizer/create-event">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-muted-foreground">
        <p>You haven't created any events yet.</p>
      </div>
    </div>
  );
}
