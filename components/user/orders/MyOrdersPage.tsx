"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  FileClock,
  Loader2,
  RefreshCw,
  RotateCcw,
  Ticket,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OrderService } from "@/services/order-service";
import type { MyOrderItemResponse, OrderStatus, PaginationMeta } from "@/types/order";

type StatusFilter = "all" | Extract<OrderStatus, "awaiting_payment" | "paid" | "expired" | "cancelled">;

type StatusTab = {
  label: string;
  value: StatusFilter;
  queryStatus?: StatusFilter;
};

const STATUS_TABS: StatusTab[] = [
  { label: "Semua", value: "all" },
  { label: "Menunggu", value: "awaiting_payment", queryStatus: "awaiting_payment" },
  { label: "Berhasil", value: "paid", queryStatus: "paid" },
  { label: "Kedaluwarsa", value: "expired", queryStatus: "expired" },
  { label: "Dibatalkan", value: "cancelled", queryStatus: "cancelled" },
];

const VALID_FILTERS = new Set<StatusFilter>([
  "all",
  "awaiting_payment",
  "paid",
  "expired",
  "cancelled",
]);

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 10,
  total_items: 0,
  total_pages: 1,
};

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeStatus(status: string): OrderStatus | string {
  const normalized = status.toLowerCase();
  if (normalized === "pending") return "awaiting_payment";
  return normalized;
}

function formatCurrency(value: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusPresentation(status: string) {
  switch (normalizeStatus(status)) {
    case "paid":
      return {
        label: "Dibayar",
        Icon: Ticket,
        dotClassName: "bg-success",
        badgeClassName: "border-success/15 bg-success-light text-success-hover",
      };
    case "awaiting_payment":
      return {
        label: "Menunggu Pembayaran",
        Icon: Clock3,
        dotClassName: "bg-warning-hover",
        badgeClassName: "border-warning/20 bg-warning-light text-warning-hover",
      };
    case "expired":
      return {
        label: "Kedaluwarsa",
        Icon: FileClock,
        dotClassName: "bg-danger",
        badgeClassName: "border-danger/15 bg-danger-light text-danger",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        Icon: XCircle,
        dotClassName: "bg-slate-400",
        badgeClassName: "border-slate-200 bg-slate-100 text-slate-500",
      };
    default:
      return {
        label: status || "Tidak Diketahui",
        Icon: AlertCircle,
        dotClassName: "bg-slate-400",
        badgeClassName: "border-slate-200 bg-slate-100 text-slate-500",
      };
  }
}

function updateQueryString(
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
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
}

function OrdersHeaderGraphic() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden opacity-90 lg:block"
    >
      <div className="absolute -right-12 top-5 h-32 w-52 rotate-6 rounded-2xl border border-primary/15 bg-primary/5" />
      <div className="absolute right-18 top-7 h-28 w-48 -rotate-3 rounded-xl border border-slate-200/80 bg-white/80 shadow-sm">
        <div className="absolute left-5 top-5 h-2 w-24 rounded-full bg-slate-300" />
        <div className="absolute left-5 top-11 h-2 w-16 rounded-full bg-slate-200" />
        <div className="absolute bottom-5 left-5 h-8 w-24 rounded-xl bg-primary/10" />
      </div>
      <div className="absolute bottom-8 right-24 grid h-18 w-18 grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <span className="rounded-sm bg-slate-900" />
        <span className="rounded-sm bg-primary" />
        <span className="rounded-sm bg-slate-900" />
        <span className="rounded-sm bg-primary/70" />
        <span className="rounded-sm bg-slate-200" />
        <span className="rounded-sm bg-primary" />
        <span className="rounded-sm bg-slate-900" />
        <span className="rounded-sm bg-primary/70" />
        <span className="rounded-sm bg-slate-900" />
      </div>
      <div className="absolute bottom-8 right-36 h-px w-44 rotate-[-7deg] border-t border-dashed border-slate-300" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const presentation = getStatusPresentation(status);
  const Icon = presentation.Icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", presentation.badgeClassName)}
    >
      <span className={cn("size-1.5 rounded-full", presentation.dotClassName)} />
      <Icon className="h-3.5 w-3.5" />
      {presentation.label}
    </Badge>
  );
}

function OrderAction({ order }: { order: MyOrderItemResponse }) {
  const status = normalizeStatus(order.status);

  if (status === "awaiting_payment") {
    return (
      <Button asChild className="h-10 rounded-xl text-sm font-semibold">
        <Link href={`/orders/${order.id}`}>
          <CreditCard className="h-4 w-4" />
          Lanjutkan Pembayaran
        </Link>
      </Button>
    );
  }

  if (status === "paid") {
    return (
      <Button asChild className="h-10 rounded-xl text-sm font-semibold">
        <Link href={`/orders/${order.id}`}>
          <Ticket className="h-4 w-4" />
          Lihat Pesanan
        </Link>
      </Button>
    );
  }

  if (status === "expired") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button disabled variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-400">
          Pesanan Kedaluwarsa
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary">
          <Link href={`/events/${order.event_id}`}>
            <RotateCcw className="h-4 w-4" />
            Beli Lagi
          </Link>
        </Button>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <Button disabled variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-400">
        Dibatalkan
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary">
      <Link href={`/orders/${order.id}`}>Lihat Detail</Link>
    </Button>
  );
}

function OrderCard({ order }: { order: MyOrderItemResponse }) {
  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <span className="font-mono text-xs text-slate-500">{order.order_number}</span>
          </div>
          <Link href={`/orders/${order.id}`} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
            <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary">
              {order.event_title || "Event"}
            </h2>
          </Link>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
              <p className="mt-1 font-semibold text-slate-950 tabular-nums">
                {formatCurrency(order.total_amount, order.currency || "IDR")}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dipesan</p>
              <p className="mt-1 text-slate-700">{formatDateTime(order.created_at)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Dibayar</p>
              <p className="mt-1 text-slate-700">{formatDateTime(order.paid_at ?? null)}</p>
            </div>
          </div>
        </div>
        <div className="flex lg:justify-end">
          <OrderAction order={order} />
        </div>
      </div>
    </article>
  );
}

function OrderSkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-6 w-36 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/5" />
              <div className="grid gap-3 md:grid-cols-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MyOrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<MyOrderItemResponse[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 10), 100);
  const statusParam = searchParams.get("status") as StatusFilter | null;
  const selectedStatus: StatusFilter = statusParam && VALID_FILTERS.has(statusParam) ? statusParam : "all";

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await OrderService.getMyOrders(
          page,
          limit,
          selectedStatus === "all" ? undefined : selectedStatus,
        );

        if (!isMounted) return;
        setItems(data.items ?? []);
        setPagination(data.pagination ?? DEFAULT_PAGINATION);
      } catch {
        if (!isMounted) return;
        setItems([]);
        setPagination(DEFAULT_PAGINATION);
        setErrorMessage("Gagal memuat riwayat pesanan");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [page, limit, selectedStatus, reloadCount]);

  const totalPages = Math.max(pagination.total_pages || 1, 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const selectedTab = useMemo(
    () => STATUS_TABS.find((tab) => tab.value === selectedStatus) ?? STATUS_TABS[0],
    [selectedStatus],
  );

  const summaryText = useMemo(() => {
    if (pagination.total_items <= 0) return "Tidak ada pesanan ditampilkan.";

    const start = (safePage - 1) * limit + 1;
    const end = Math.min(safePage * limit, pagination.total_items);
    return `${start}-${end} dari ${pagination.total_items} pesanan`;
  }, [limit, pagination.total_items, safePage]);

  const applyQuery = (updates: Record<string, string | null>) => {
    const nextQuery = updateQueryString(new URLSearchParams(searchParams.toString()), updates);
    router.replace(`/my-orders${nextQuery}`);
  };

  const handleTabChange = (tab: StatusTab) => {
    applyQuery({
      status: tab.queryStatus ?? null,
      page: "1",
    });
  };

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

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
          <OrdersHeaderGraphic />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Riwayat transaksi
              </p>
              <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
                Riwayat Pesanan
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                Pantau pembelian tiket, status pembayaran, dan lanjutkan checkout Xendit yang belum selesai.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
              disabled={isLoading}
              onClick={() => setReloadCount((current) => current + 1)}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Muat Ulang
            </Button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_TABS.map((tab) => {
              const isActive = tab.value === selectedTab.value;
              return (
                <Button
                  key={tab.value}
                  type="button"
                  variant={isActive ? "brand" : "ghost"}
                  className={cn(
                    "h-9 shrink-0 rounded-lg px-4 text-sm font-semibold",
                    !isActive && "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  )}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>{summaryText}</span>
              {selectedTab.value !== "all" ? (
                <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/5 text-primary">
                  {selectedTab.label}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="order-limit" className="text-sm text-slate-500">
                Per halaman
              </label>
              <select
                id="order-limit"
                value={String(limit)}
                onChange={(event) => applyQuery({ limit: event.target.value, page: "1" })}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {isLoading ? <OrderSkeletonList /> : null}

          {!isLoading && errorMessage ? (
            <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm shadow-slate-900/5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">
                Gagal memuat riwayat pesanan
              </p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {errorMessage}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 rounded-xl border-slate-200 bg-white"
                onClick={() => setReloadCount((current) => current + 1)}
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </Button>
            </div>
          ) : null}

          {!isLoading && !errorMessage && items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary-light text-primary">
                <WalletCards className="h-7 w-7" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">Belum ada pesanan</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Pesanan tiket Anda akan muncul di sini setelah checkout dimulai.
              </p>
              <Button asChild className="mt-5 rounded-xl">
                <Link href="/events">
                  Jelajahi Event
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : null}

          {!isLoading && !errorMessage && items.length > 0 ? (
            <>
              <div className="space-y-3">
                {items.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600"
                  disabled={safePage <= 1}
                  onClick={() => applyQuery({ page: String(Math.max(safePage - 1, 1)) })}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  Halaman {safePage} dari {totalPages}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600"
                  disabled={safePage >= totalPages}
                  onClick={() => applyQuery({ page: String(Math.min(safePage + 1, totalPages)) })}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function MyOrdersFallback() {
  return (
    <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>
        <OrderSkeletonList />
      </div>
    </main>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<MyOrdersFallback />}>
      <MyOrdersPageContent />
    </Suspense>
  );
}

