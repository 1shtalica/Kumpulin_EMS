"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  RefreshCw,
  Search,
  Ticket as TicketIcon,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TicketService,
  getTicketApiErrorCode,
  getTicketApiErrorMessage,
} from "@/services/ticket-service";
import type {
  MyTicketListItem,
  TicketPagination,
  TicketStatus,
} from "@/types/ticket";

type StatusOption = {
  label: string;
  value: "all" | TicketStatus;
};

const STATUS_OPTIONS: StatusOption[] = [
  { label: "Semua", value: "all" },
  { label: "Issued", value: "issued" },
  { label: "Checked In", value: "checked_in" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Refunded", value: "refunded" },
  { label: "Invalidated", value: "invalidated" },
];

const DEFAULT_PAGINATION: TicketPagination = {
  page: 1,
  limit: 10,
  total_items: 0,
  total_pages: 1,
};

const VALID_STATUSES = new Set<TicketStatus>([
  "issued",
  "checked_in",
  "cancelled",
  "refunded",
  "invalidated",
]);

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeLimit = (value: number) => {
  if (value < 1) return 1;
  if (value > 100) return 100;
  return value;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
};

const getStatusPresentation = (status: TicketStatus) => {
  switch (status) {
    case "issued":
      return {
        label: "Issued",
        className:
          "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
      };
    case "checked_in":
      return {
        label: "Checked In",
        className:
          "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "border-transparent bg-red-50 text-red-700 hover:bg-red-50",
      };
    case "refunded":
      return {
        label: "Refunded",
        className:
          "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50",
      };
    default:
      return {
        label: "Invalidated",
        className:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100",
      };
  }
};

const updateQueryString = (
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) => {
  const nextParams = new URLSearchParams(searchParams.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      nextParams.delete(key);
      return;
    }
    nextParams.set(key, value);
  });

  const next = nextParams.toString();
  return next ? `?${next}` : "";
};

function TicketCard({ item }: { item: MyTicketListItem }) {
  const status = getStatusPresentation(item.status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">
            {item.event_title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {item.ticket_category_name} · {item.ticket_number}
          </p>
        </div>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <UserRound className="h-4 w-4 text-slate-400" />
          <span className="truncate">{item.participant_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <span className="truncate">{formatDateTime(item.issued_at)}</span>
        </div>
      </div>

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <Button asChild className="rounded-full px-6">
          <Link href={`/user/my-ticket/${item.id}`}>Lihat Tiket</Link>
        </Button>
      </div>
    </article>
  );
}

export default function MyTicketPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MyTicketListItem[]>([]);
  const [pagination, setPagination] =
    useState<TicketPagination>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string>("");
  const [reloadCount, setReloadCount] = useState(0);
  const [eventIdInput, setEventIdInput] = useState("");

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = normalizeLimit(parsePositiveInt(searchParams.get("limit"), 10));
  const rawStatus = searchParams.get("status") ?? "";
  const status = VALID_STATUSES.has(rawStatus as TicketStatus)
    ? (rawStatus as TicketStatus)
    : undefined;
  const eventId = searchParams.get("event_id")?.trim() ?? "";

  const selectedStatus = status ?? "all";

  useEffect(() => {
    setEventIdInput(eventId);
  }, [eventId]);

  useEffect(() => {
    let isMounted = true;

    const loadTickets = async () => {
      setIsLoading(true);
      setErrorCode("");
      setErrorMessage(null);

      try {
        const data = await TicketService.getMyTickets({
          page,
          limit,
          ...(status ? { status } : {}),
          ...(eventId ? { event_id: eventId } : {}),
        });

        if (!isMounted) return;
        setItems(data.items ?? []);
        setPagination(data.pagination ?? DEFAULT_PAGINATION);
      } catch (error) {
        const code = getTicketApiErrorCode(error);
        if (code === "UNAUTHORIZED") {
          router.replace("/login");
          return;
        }

        if (!isMounted) return;
        setItems([]);
        setPagination(DEFAULT_PAGINATION);
        setErrorCode(code);
        setErrorMessage(
          getTicketApiErrorMessage(error, "Gagal mengambil data tiket."),
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadTickets();

    return () => {
      isMounted = false;
    };
  }, [page, limit, status, eventId, reloadCount, router]);

  const totalPages = Math.max(pagination.total_pages || 1, 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const summaryText = useMemo(() => {
    if (pagination.total_items <= 0) return "Belum ada tiket.";

    const start = (safePage - 1) * limit + 1;
    const end = Math.min(safePage * limit, pagination.total_items);
    return `Menampilkan ${start}-${end} dari ${pagination.total_items} tiket.`;
  }, [limit, pagination.total_items, safePage]);

  const applyQuery = (updates: Record<string, string | null>) => {
    const nextQuery = updateQueryString(
      new URLSearchParams(searchParams.toString()),
      updates,
    );
    router.replace(`/user/my-ticket${nextQuery}`);
  };

  const handleStatusChange = (nextStatus: StatusOption["value"]) => {
    applyQuery({
      status: nextStatus === "all" ? null : nextStatus,
      page: "1",
    });
  };

  const handleLimitChange = (nextLimit: string) => {
    applyQuery({ limit: nextLimit, page: "1" });
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyQuery({
      event_id: eventIdInput.trim() || null,
      page: "1",
    });
  };

  const clearFilters = () => {
    setEventIdInput("");
    router.replace("/user/my-ticket");
  };

  return (
    <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Tiket Saya</h1>
          <p className="mt-2 text-sm text-slate-500">
            Kelola tiket dan riwayat event Anda.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isActive = option.value === selectedStatus;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  className="h-9 rounded-full px-5"
                  onClick={() => handleStatusChange(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>

          <form
            onSubmit={handleFilterSubmit}
            className="mt-4 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={eventIdInput}
                onChange={(event) => setEventIdInput(event.target.value)}
                placeholder="Filter event_id (UUID)"
                className="h-11 rounded-xl border-slate-200 pl-10"
              />
            </div>
            <Button type="submit" className="h-11 rounded-xl px-6">
              Terapkan
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl px-6"
              onClick={clearFilters}
            >
              Reset
            </Button>
          </form>
        </header>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">{summaryText}</p>
            <div className="flex items-center gap-2">
              <label htmlFor="ticket-limit" className="text-sm text-slate-500">
                Limit
              </label>
              <select
                id="ticket-limit"
                value={String(limit)}
                onChange={(event) => handleLimitChange(event.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Memuat tiket...
            </div>
          ) : null}

          {!isLoading && errorMessage ? (
            <div className="py-12 text-center">
              <p className="text-base font-semibold text-slate-900">
                {errorCode === "INVALID_INPUT"
                  ? "Permintaan tidak valid"
                  : "Data tiket gagal dimuat"}
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                {errorMessage}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReloadCount((current) => current + 1)}
                >
                  Coba Lagi
                </Button>
                {errorCode === "INVALID_INPUT" ? (
                  <Button type="button" onClick={clearFilters}>
                    Bersihkan Query
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          {!isLoading && !errorMessage && items.length === 0 ? (
            <div className="py-16 text-center">
              <TicketIcon className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-4 text-base font-semibold text-slate-900">
                Belum ada tiket
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Tiket Anda akan muncul di halaman ini setelah pembelian berhasil.
              </p>
            </div>
          ) : null}

          {!isLoading && !errorMessage && items.length > 0 ? (
            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <TicketCard key={item.id} item={item} />
              ))}
            </div>
          ) : null}

          {!isLoading && !errorMessage && items.length > 0 ? (
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={safePage <= 1}
                onClick={() =>
                  applyQuery({ page: String(Math.max(safePage - 1, 1)) })
                }
              >
                Sebelumnya
              </Button>
              <p className="text-sm text-slate-500">
                Halaman {safePage} dari {totalPages}
              </p>
              <Button
                type="button"
                variant="outline"
                disabled={safePage >= totalPages}
                onClick={() =>
                  applyQuery({
                    page: String(Math.min(safePage + 1, totalPages)),
                  })
                }
              >
                Berikutnya
              </Button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
