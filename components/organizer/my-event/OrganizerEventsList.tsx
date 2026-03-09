"use client";

import { useEffect, useState } from "react";
import { EventService } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import OrganizerEventCard from "./OrganizerEventCard";
import EmptyState from "@/components/reusable/EmptyState";
import { CalendarX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";



export default function OrganizerEventsList() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const layout = searchParams.get("layout") ?? "list";

  const [events, setEvents] = useState<OrganizerEventCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  const limit = 10;
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, total } = await EventService.getOrganizerEvents({
          q: search,
          status,
          limit: limit,
          offset,
        });
        setEvents(data);
        setTotalItems(total);
      } catch (error) {
        console.error("Failed to fetch organizer events", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [search, status, offset]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("offset", String((page - 1) * limit));
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse text-sm">
          Loading events...
        </p>
      </div>
    );
  }

  if (!loading && events.length === 0 && offset === 0) {
    // Bedakan antara "tidak ada event sama sekali" vs "filter tidak ada hasil"
    const isFiltering = search !== "" || status !== "all";
    return (
      <EmptyState
        icon={<CalendarX className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />}
        title={isFiltering ? "Tidak Ada Event Ditemukan" : "Belum Ada Event"}
        description={
          isFiltering
            ? "Tidak ada event yang sesuai dengan pencarian atau filter Anda."
            : "Anda belum membuat event apapun. Klik 'Buat Event' untuk memulai."
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Event list */}
      <div className={layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "flex flex-col gap-5"}>
        {events.map((event) => (
          <OrganizerEventCard key={event.id} event={event} layout={layout as "list" | "grid"} />
        ))}
      </div>

      {/* Pagination — hanya tampil jika ada lebih dari 1 halaman */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className="h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "brand" : "outline"}
              size="sm"
              onClick={() => goToPage(page)}
              className="h-9 w-9 p-0"
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
