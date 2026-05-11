"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useDebouncedCallback } from "use-debounce";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Loader2,
  MapPin,
  QrCode,
  ScanLine,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventService, OrganizerApiRequestError } from "@/services/event-service";
import type { OrganizerEventCard } from "@/types/event";

const EVENT_LIMIT = 10;

type StatusVariant = "active" | "upcoming" | "closed" | "draft";

const statusVariantMap: Record<string, StatusVariant> = {
  draft: "draft",
  published: "active",
  ongoing: "active",
  finished: "closed",
  archived: "closed",
  cancelled: "closed",
  "registration closed": "upcoming",
};

const statusLabelMap: Record<string, string> = {
  draft: "Draft",
  published: "Aktif",
  ongoing: "Berlangsung",
  finished: "Selesai",
  archived: "Selesai",
  cancelled: "Dibatalkan",
  "registration closed": "Segera",
};

const statusDotClass: Record<StatusVariant, string> = {
  active: "bg-primary",
  upcoming: "bg-warning",
  closed: "bg-slate-400",
  draft: "bg-slate-400",
};

const statusBadgeClass: Record<StatusVariant, string> = {
  active: "border-primary/15 bg-primary-light text-primary",
  upcoming: "border-warning/15 bg-warning-light text-warning-hover",
  closed: "border-slate-200 bg-slate-100 text-slate-500",
  draft: "border-slate-200 bg-slate-100 text-slate-500",
};

const closedStatuses = new Set(["finished", "archived", "cancelled"]);

const toStatusKey = (status?: string) => (status || "draft").toLowerCase();
const getEventKey = (event: OrganizerEventCard) =>
  event.id || event.event_id || event.slug;

const formatDateTime = (isoDate?: string) => {
  if (!isoDate) return "Tanggal belum diatur";
  try {
    return format(parseISO(isoDate), "dd MMM yyyy - HH:mm", { locale: id });
  } catch {
    return "Tanggal tidak valid";
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof OrganizerApiRequestError) return error.message || fallback;
  if (error instanceof Error) return error.message;
  return fallback;
};

function PageSurface({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.16,
        }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-primary"
        viewBox="0 0 1440 640"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M86 402C244 292 360 458 520 336C658 231 762 292 918 204C1088 108 1210 218 1368 112"
          stroke="currentColor"
          strokeOpacity="0.07"
          strokeWidth="2"
        />
        <path
          d="M116 184C286 246 410 108 568 176C710 238 816 146 970 214C1118 280 1222 386 1366 318"
          stroke="#10b981"
          strokeOpacity="0.055"
          strokeWidth="2"
        />
      </svg>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        {children}
      </div>
    </main>
  );
}

function HeaderGraphic() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-80 overflow-hidden text-primary md:block">
      <svg viewBox="0 0 320 180" className="h-full w-full" fill="none" aria-hidden="true">
        <path
          d="M86 42H190C204 42 216 54 216 68V142"
          stroke="currentColor"
          strokeOpacity="0.08"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <rect x="224" y="24" width="54" height="54" rx="16" fill="currentColor" fillOpacity="0.08" />
        <rect x="239" y="39" width="9" height="9" rx="2" fill="currentColor" fillOpacity="0.22" />
        <rect x="254" y="39" width="9" height="9" rx="2" fill="currentColor" fillOpacity="0.22" />
        <rect x="239" y="54" width="9" height="9" rx="2" fill="currentColor" fillOpacity="0.22" />
        <rect x="254" y="54" width="9" height="9" rx="2" fill="#10b981" fillOpacity="0.16" />
      </svg>
    </div>
  );
}

function CardGraphic() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-9 -left-8 h-44 w-56 text-primary transition-transform duration-300 group-hover:-translate-y-1"
      viewBox="0 0 208 160"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="24"
        y="72"
        width="58"
        height="58"
        rx="16"
        fill="currentColor"
        fillOpacity="0.08"
      />
      <path
        d="M36 92V84H44M62 84H70V92M70 110V118H62M44 118H36V110"
        stroke="currentColor"
        strokeOpacity="0.32"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="45" y="93" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.22" />
      <rect x="56" y="93" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.22" />
      <rect x="45" y="104" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.22" />
      <rect x="56" y="104" width="7" height="7" rx="1.5" fill="#10b981" fillOpacity="0.2" />
      <rect x="67" y="104" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.16" />
    </svg>
  );
}

function EventCard({
  event,
  checkedInCount,
  onManage,
}: {
  event: OrganizerEventCard;
  checkedInCount: number;
  onManage: () => void;
}) {
  const statusKey = toStatusKey(event.status);
  const statusLabel = statusLabelMap[statusKey] || event.status || "Draft";
  const variant: StatusVariant = statusVariantMap[statusKey] ?? "draft";
  const isClosed = closedStatuses.has(statusKey);
  const soldCount = event.total_sold ?? 0;
  const progress =
    soldCount > 0
      ? Math.min(100, Math.round((checkedInCount / soldCount) * 100))
      : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10">
      <CardGraphic />
      <div className="relative grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_230px] sm:p-5">
        <div className="min-w-0 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <QrCode className="h-5 w-5" strokeWidth={2.3} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    statusBadgeClass[variant],
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", statusDotClass[variant])} />
                  {statusLabel}
                </Badge>
              </div>
              <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-slate-950">
                {event.title}
              </h3>
            </div>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{formatDateTime(event.start_date)}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">
                {event.is_online ? "Online" : event.address_title || "Lokasi belum diatur"}
              </span>
            </span>
          </div>
        </div>

        <div className="relative rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white p-3 shadow-sm shadow-slate-900/5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <Ticket className="h-3.5 w-3.5" />
                Tiket
              </div>
              <p className="mt-1 text-2xl font-semibold leading-none text-slate-950">
                {soldCount.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm shadow-slate-900/5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                <Users className="h-3.5 w-3.5" />
                Hadir
              </div>
              <p className="mt-1 text-2xl font-semibold leading-none text-primary">
                {checkedInCount.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Progress check-in</span>
              <span className="font-semibold text-slate-950">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            size="sm"
            variant={isClosed ? "outline" : "default"}
            className={cn(
              "mt-4 h-10 w-full gap-2 rounded-xl text-sm font-semibold",
              isClosed && "border-slate-200 bg-white text-slate-400",
            )}
            disabled={isClosed}
            onClick={onManage}
          >
            {isClosed ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ScanLine className="h-4 w-4" />
            )}
            {isClosed ? "Check-in selesai" : "Buka scanner"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-3.5 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5"
        >
          <div className="flex gap-3">
            <div className="h-11 w-11 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-24 rounded-full bg-slate-100" />
              <div className="h-6 w-2/3 rounded-lg bg-slate-100" />
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="h-4 rounded bg-slate-100" />
                <div className="h-4 rounded bg-slate-100" />
              </div>
            </div>
          </div>
          <div className="mt-4 h-24 rounded-xl bg-slate-50" />
        </div>
      ))}
    </div>
  );
}

export default function CheckInPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [events, setEvents] = useState<OrganizerEventCard[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [checkedInCounts, setCheckedInCounts] = useState<Record<string, number>>({});

  const canLoadMore = useMemo(
    () => events.length < totalEvents && !isLoading && !isLoadingMore,
    [events.length, totalEvents, isLoading, isLoadingMore],
  );

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

  const fetchCheckInCounts = useCallback(async (items: OrganizerEventCard[]) => {
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

  const fetchEvents = useCallback(
    async (nextOffset: number, reset = false) => {
      if (reset) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const response = await EventService.getOrganizerEvents({
          q: query,
          limit: EVENT_LIMIT,
          offset: nextOffset,
        });
        setTotalEvents(response.total);
        setEvents((prev) => {
          if (reset) return response.data;
          const merged = [...prev];
          for (const item of response.data) {
            const key = getEventKey(item);
            if (!merged.some((event) => getEventKey(event) === key)) merged.push(item);
          }
          return merged;
        });
        await fetchCheckInCounts(response.data);
      } catch (error) {
        toast.error(getErrorMessage(error, "Gagal mengambil daftar event organizer."));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [fetchCheckInCounts, query],
  );

  useEffect(() => {
    setOffset(0);
    void fetchEvents(0, true);
  }, [fetchEvents]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setQuery(value.trim());
  }, 400);

  const handleLoadMore = async () => {
    const nextOffset = offset + EVENT_LIMIT;
    setOffset(nextOffset);
    await fetchEvents(nextOffset, false);
  };

  return (
    <PageSurface>
      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
        <HeaderGraphic />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Organizer workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
              Check-In
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
              Pilih event, buka scanner, dan pantau kehadiran peserta dari satu halaman.
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                  : `${events.length} dari ${totalEvents} event ditampilkan`}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-80">
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
        </div>
      </section>

      {isLoading ? (
        <LoadingState />
      ) : events.length === 0 ? (
        <section className="relative overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/5">
          <HeaderGraphic />
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <QrCode className="h-7 w-7" strokeWidth={2.2} />
          </div>
          <h2 className="relative mt-5 text-xl font-semibold text-slate-950">
            {query ? "Event tidak ditemukan" : "Belum ada event"}
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            {query
              ? "Coba kata kunci lain atau hapus pencarian untuk melihat semua event."
              : "Event yang Anda buat akan muncul di sini dan siap dipakai untuk validasi tiket."}
          </p>
        </section>
      ) : (
        <section className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
            {events.map((event) => {
              const eventId = getEventKey(event);
              return (
                <EventCard
                  key={eventId}
                  event={event}
                  checkedInCount={checkedInCounts[eventId] ?? 0}
                  onManage={() => router.push(`/organizer/check-in/${eventId}`)}
                />
              );
            })}
          </div>

          {(canLoadMore || isLoadingMore) && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-1.5 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                onClick={handleLoadMore}
                disabled={!canLoadMore || isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Muat lainnya
                  </>
                )}
              </Button>
            </div>
          )}
        </section>
      )}
    </PageSurface>
  );
}
