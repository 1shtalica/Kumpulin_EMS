"use client";

import { useEffect, useState } from "react";
import { EventService } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";
import OrganizerEventCard from "./OrganizerEventCard";
import EmptyState from "@/components/reusable/EmptyState";
import { SkeletonOrganizerEvents } from "@/components/reusable/SkeletonElements";
import { CalendarX, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
  const [refreshCount, setRefreshCount] = useState(0);

  const handleStatusChange = () => setRefreshCount((n) => n + 1);

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
  }, [search, status, offset, limit, refreshCount]);

  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const pageWindow = Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => {
    if (totalPages <= 5) return true;
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - currentPage) <= 1;
  });

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("offset", String((page - 1) * limit));
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Tampilkan empty state hanya jika tidak sedang loading DAN data memang kosong
  const showEmpty = !loading && events.length === 0 && offset === 0;

  if (showEmpty) {
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

  // Loading awal (belum ada data sama sekali) — tampilkan skeleton penuh
  if (loading && events.length === 0) {
    return <SkeletonOrganizerEvents layout={layout as "list" | "grid"} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`relative transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
        <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
          {events.map((event) => (
            <OrganizerEventCard key={event.id || event.event_id} event={event} layout={layout as "list" | "grid"} onStatusChange={handleStatusChange} />
          ))}
        </div>
      </div>

      {totalPages > 0 && (
        <div className="mt-1 mb-2 flex flex-col-reverse items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm shadow-slate-900/5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] font-medium text-slate-500 sm:inline-block">Data per halaman</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-xl border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-900 shadow-none transition-all hover:border-primary/40 hover:text-primary focus:ring-0"
                >
                  {limit}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[80px] rounded-xl border-slate-200 p-1.5 shadow-lg">
                {[5, 10, 20, 50].map((pageSize) => (
                  <DropdownMenuItem
                    key={pageSize}
                    className={`mb-0.5 cursor-pointer justify-center rounded-xl py-2 text-sm transition-colors last:mb-0 ${limit === pageSize
                      ? "bg-primary/10 font-bold text-primary"
                      : "font-medium text-muted-foreground hover:bg-muted"
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
              className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-500 shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageWindow.map((page, index) => {
              const previousPage = pageWindow[index - 1];
              const hasGap = previousPage && page - previousPage > 1;

              return (
                <div key={page} className="flex items-center gap-1.5">
                  {hasGap && <span className="px-1 text-[13px] font-medium text-slate-400">...</span>}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={
                      page === currentPage
                        ? "h-9 w-9 rounded-xl bg-primary p-0 font-bold text-white shadow-md shadow-primary/20 hover:opacity-90"
                        : "h-9 w-9 rounded-xl border border-slate-200 bg-white p-0 font-medium text-slate-500 shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    }
                  >
                    {page}
                  </Button>
                </div>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-500 shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
