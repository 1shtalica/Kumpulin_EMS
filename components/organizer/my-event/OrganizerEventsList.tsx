"use client";

import { useEffect, useState } from "react";
import { EventService } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import OrganizerEventCard from "./OrganizerEventCard";
import EmptyState from "@/components/reusable/EmptyState";
import { CalendarX, Loader2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useViewPreferenceStore } from "@/stores/view-preference-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



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
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground font-medium hidden sm:inline-block">Data per halaman</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-xl border-border/60 bg-card px-3 text-[13px] font-semibold text-foreground shadow-sm hover:border-primary/40 hover:text-primary transition-all focus:ring-0"
                >
                  {limit}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[80px] rounded-2xl border-border/60 shadow-lg p-1.5">
                {[5, 10, 20, 50].map((pageSize) => (
                  <DropdownMenuItem
                    key={pageSize}
                    className={`justify-center cursor-pointer rounded-xl text-sm py-2 mb-0.5 last:mb-0 transition-colors ${limit === pageSize
                      ? "bg-primary/10 text-primary font-bold shadow-sm"
                      : "text-muted-foreground hover:bg-muted font-medium"
                      }`}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set("limit", String(pageSize));
                      params.set("offset", "0");
                      replace(`${pathname}?${params.toString()}`, { scroll: false });
                    }}
                  >
                    {pageSize}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="h-9 w-9 p-0 rounded-xl border-border/60 shadow-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => goToPage(page)}
                className={
                  page === currentPage
                    ? "h-9 w-9 p-0 rounded-xl bg-primary text-white shadow-md font-bold hover:opacity-90"
                    : "h-9 w-9 p-0 rounded-xl bg-card border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 font-medium transition-all shadow-sm"
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
              className="h-9 w-9 p-0 rounded-xl border-border/60 shadow-sm text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
