"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Search,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import OrganizerEventCard from "@/components/organizer/my-event/OrganizerEventCard";
import SupportPageSurface from "@/components/support/SupportPageSurface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventService, OrganizerApiRequestError } from "@/services/event-service";
import type { OrganizerEventCard as OrganizerEventCardType } from "@/types/event";

const PAGE_LIMIT = 9;

const getEventKey = (event: OrganizerEventCardType) =>
  event.id || event.event_id || event.slug;

const closedStatuses = new Set(["finished", "archived", "cancelled"]);
const toStatusKey = (status?: string) => (status || "draft").toLowerCase();

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof OrganizerApiRequestError) return error.message || fallback;
  if (error instanceof Error) return error.message;
  return fallback;
};

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default function CheckInPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<OrganizerEventCardType[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedInCounts, setCheckedInCounts] = useState<Record<string, number>>({});

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalEvents / PAGE_LIMIT)),
    [totalEvents],
  );
  const pageWindow = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, index) => index + 1).filter(
        (pageNumber) => {
          if (totalPages <= 5) return true;
          if (pageNumber === 1 || pageNumber === totalPages) return true;
          return Math.abs(pageNumber - page) <= 1;
        },
      ),
    [page, totalPages],
  );
  const visibleStart = totalEvents === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const visibleEnd = Math.min(page * PAGE_LIMIT, totalEvents);

  const totalTickets = useMemo(
    () => events.reduce((sum, event) => sum + (event.total_sold ?? 0), 0),
    [events],
  );

  const totalCheckedIn = useMemo(
    () => Object.values(checkedInCounts).reduce((sum, value) => sum + value, 0),
    [checkedInCounts],
  );

  const activeEvents = useMemo(
    () => events.filter((event) => !closedStatuses.has(toStatusKey(event.status))).length,
    [events],
  );

  const fetchCheckInCounts = useCallback(async (items: OrganizerEventCardType[]) => {
    if (items.length === 0) return;
    const entries = await Promise.all(
      items.map(async (event) => {
        const eventId = getEventKey(event);
        if (!eventId) return null;
        try {
          const response = await EventService.getOrganizerCheckInHistory(eventId, {
            page: 1,
            limit: 1,
          });
          return [eventId, response.pagination.total_items] as const;
        } catch {
          return [eventId, 0] as const;
        }
      }),
    );

    setCheckedInCounts((prev) => {
      const next = { ...prev };
      for (const entry of entries) {
        if (!entry) continue;
        next[entry[0]] = entry[1];
      }
      return next;
    });
  }, []);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await EventService.getOrganizerEvents({
        q: query,
        status,
        limit: PAGE_LIMIT,
        offset: (page - 1) * PAGE_LIMIT,
      });
      setEvents(response.data);
      setTotalEvents(response.total);
      await fetchCheckInCounts(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengambil daftar event organizer."));
    } finally {
      setIsLoading(false);
    }
  }, [fetchCheckInCounts, page, query, status]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setPage(1);
    setQuery(value.trim());
  }, 400);

  return (
    <SupportPageSurface>
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Organizer workspace
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
              Check-In Events
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Pilih event, buka scanner, dan pantau progress kehadiran peserta.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Aktif
              </p>
              <p className="mt-1 text-2xl font-semibold leading-none text-slate-950">
                {activeEvents.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Tiket
              </p>
              <p className="mt-1 text-2xl font-semibold leading-none text-slate-950">
                {totalTickets.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-xl border border-primary/10 bg-primary-light/70 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Hadir
              </p>
              <p className="mt-1 text-2xl font-semibold leading-none text-primary">
                {totalCheckedIn.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <ClipboardCheck className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Event untuk check-in
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {isLoading
                  ? "Memuat event..."
                  : `${visibleStart}-${visibleEnd} dari ${totalEvents.toLocaleString("id-ID")} event`}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearchInput(value);
                  debouncedSearch(value);
                }}
                placeholder="Cari event..."
                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
              />
            </div>
            <select
              value={status}
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/20"
            >
              <option value="all">Semua status</option>
              <option value="published">Aktif</option>
              <option value="ongoing">Berlangsung</option>
              <option value="finished">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </section>

      {isLoading ? (
        <LoadingState />
      ) : events.length ? (
        <>
          <section className="space-y-4">
            {events.map((event) => {
              const eventId = getEventKey(event);
              return (
                <OrganizerEventCard
                  key={eventId}
                  event={event}
                  layout="list"
                  mode="check-in"
                  checkedInCount={checkedInCounts[eventId] ?? 0}
                  onCheckIn={() => router.push(`/organizer/check-in/${eventId}`)}
                />
              );
            })}
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Menampilkan {visibleStart}-{visibleEnd} dari {totalEvents.toLocaleString("id-ID")} event
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-500 shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageWindow.map((pageNumber, index) => {
                const previousPage = pageWindow[index - 1];
                const hasGap = previousPage && pageNumber - previousPage > 1;

                return (
                  <div key={pageNumber} className="flex items-center gap-1.5">
                    {hasGap && (
                      <span className="px-1 text-[13px] font-medium text-slate-400">
                        ...
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(pageNumber)}
                      className={
                        pageNumber === page
                          ? "h-9 w-9 rounded-xl bg-primary p-0 font-bold text-white shadow-md shadow-primary/20 hover:opacity-90"
                          : "h-9 w-9 rounded-xl border border-slate-200 bg-white p-0 font-medium text-slate-500 shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      }
                    >
                      {pageNumber}
                    </Button>
                  </div>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-xl border-slate-200 p-0 text-slate-500 shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/5">
          <Ticket className="mx-auto h-8 w-8 text-slate-300" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            {query ? "Event tidak ditemukan" : "Belum ada event"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {query
              ? "Coba kata kunci lain atau hapus pencarian untuk melihat semua event."
              : "Event yang Anda buat akan muncul di sini dan siap dipakai untuk validasi tiket."}
          </p>
        </section>
      )}
    </SupportPageSurface>
  );
}
