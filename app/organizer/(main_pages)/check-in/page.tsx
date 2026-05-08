"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useDebouncedCallback } from "use-debounce";
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  MapPin,
  QrCode,
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

// ─── Status config ──────────────────────────────────────────────────────────

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
  closed: "bg-muted-foreground/50",
  draft: "bg-muted-foreground/50",
};

const closedStatuses = new Set(["finished", "archived", "cancelled"]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toStatusKey = (status?: string) => (status || "draft").toLowerCase();
const getEventKey = (event: OrganizerEventCard) =>
  event.id || event.event_id || event.slug;

const formatDateTime = (isoDate?: string) => {
  if (!isoDate) return "Tanggal belum diatur";
  try {
    return format(parseISO(isoDate), "dd MMM yyyy · HH:mm", { locale: id });
  } catch {
    return "Tanggal tidak valid";
  }
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof OrganizerApiRequestError) return error.message || fallback;
  if (error instanceof Error) return error.message;
  return fallback;
};

// ─── Event Card ──────────────────────────────────────────────────────────────

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

  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Title + status */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
            {event.title}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 gap-1.5 rounded-full border-transparent bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground",
            )}
          >
            <span className={cn("size-1.5 rounded-full", statusDotClass[variant])} />
            {statusLabel}
          </Badge>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-3.5 shrink-0 opacity-60" />
            {formatDateTime(event.start_date)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 opacity-60" />
            {event.is_online
              ? "Online"
              : event.address_title || "Lokasi belum diatur"}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-5 text-[13px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Ticket className="size-3.5 opacity-60" />
            <span className="font-semibold tabular-nums text-foreground">
              {(event.total_sold ?? 0).toLocaleString("id-ID")}
            </span>
            tiket
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="size-3.5 opacity-60" />
            <span className="font-semibold tabular-nums text-primary">
              {checkedInCount.toLocaleString("id-ID")}
            </span>
            check-in
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-border px-5 py-3">
        <Button
          size="sm"
          className="w-full gap-2 rounded-full text-xs font-semibold"
          disabled={isClosed}
          onClick={onManage}
        >
          <QrCode className="size-3.5" />
          {isClosed ? "Check-In Ditutup" : "Kelola Check-In"}
        </Button>
      </div>
    </article>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

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
            if (!merged.some((e) => getEventKey(e) === key)) merged.push(item);
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
    <div className="space-y-5 p-8 px-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Check-In
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Pilih event untuk mengelola check-in peserta.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => {
              const value = e.target.value;
              setSearchInput(value);
              debouncedSearch(value);
            }}
            placeholder="Cari event..."
            className="h-9 rounded-full border-input bg-card pl-9 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <p className="text-sm font-medium text-foreground">
            {query ? "Event tidak ditemukan" : "Belum ada event"}
          </p>
          <p className="text-xs text-muted-foreground">
            {query
              ? "Coba kata kunci lain."
              : "Event yang Anda buat akan muncul di sini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {events.length} dari {totalEvents} event
          </p>

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
            <div className="flex justify-center pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full text-xs text-muted-foreground hover:text-primary"
                onClick={handleLoadMore}
                disabled={!canLoadMore || isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5" />
                    Muat lainnya
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
