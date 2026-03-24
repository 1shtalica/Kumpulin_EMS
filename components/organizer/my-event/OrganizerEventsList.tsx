"use client";

import { useEffect, useState } from "react";
import { EventService } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import OrganizerEventCard from "./OrganizerEventCard";
import EmptyState from "@/components/reusable/EmptyState";
import { CalendarX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useViewPreferenceStore } from "@/stores/view-preference-store";



export default function OrganizerEventsList() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const { layout: rawLayout } = useViewPreferenceStore();
  const [isMounted, setIsMounted] = useState(false);
  const limit = parseInt(searchParams.get("limit") ?? "10");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const layout = isMounted ? rawLayout : "list";

  const [events, setEvents] = useState<OrganizerEventCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
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
  }, [search, status, offset, limit]);

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
          <OrganizerEventCard key={event.id || event.event_id} event={event} layout={layout as "list" | "grid"} />
        ))}
      </div>

      {/* Bottom Actions: Pagination and Items per page */}
      {totalPages > 0 && (
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-4 mb-2">
          {/* Rows per page selector */}
          <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground font-medium bg-card px-4 py-1.5 rounded-full border border-border/60 shadow-sm">
            <span>Tampilkan</span>
            <div className="relative flex items-center">
              <select
                className="appearance-none bg-transparent text-foreground font-semibold px-1 pr-5 focus:outline-none cursor-pointer"
                value={limit}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams);
                  params.set("limit", e.target.value);
                  params.set("offset", "0"); // Reset offset when changing page size
                  replace(`${pathname}?${params.toString()}`, { scroll: false });
                }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <div className="pointer-events-none absolute right-0 flex items-center text-muted-foreground">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>
            <span>data</span>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="h-9 w-9 p-0 rounded-full border-border/80 shadow-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "brand" : "ghost"}
                size="sm"
                onClick={() => goToPage(page)}
                className={
                  page === currentPage
                    ? "h-9 w-9 p-0 rounded-full shadow-md shadow-primary/20 font-semibold"
                    : "h-9 w-9 p-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium transition-all"
                }
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="h-9 w-9 p-0 rounded-full border-border/80 shadow-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
