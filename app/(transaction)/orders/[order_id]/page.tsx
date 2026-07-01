"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Ticket,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PaymentTimer } from "@/components/payment/PaymentTimer";
import { QRCodeDisplay } from "@/components/user/my-ticket/QRCodeDisplay";
import { OrderService } from "@/services/order-service";
import type { OrderDataResponse, TicketSummaryInOrder } from "@/types/order";

const POLL_INTERVAL_MS = 4000;

function formatCurrency(value: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value?: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function getNormalizedStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "pending") return "awaiting_payment";
  return normalized;
}

function isTerminalStatus(status: string) {
  return ["paid", "expired", "cancelled", "failed"].includes(
    getNormalizedStatus(status),
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = getNormalizedStatus(status);

  if (normalized === "paid") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4" />
        Dibayar
      </span>
    );
  }

  if (normalized === "awaiting_payment") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
        <Clock3 className="h-4 w-4" />
        Menunggu Pembayaran
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
      <XCircle className="h-4 w-4" />
      {normalized === "expired" ? "Kedaluwarsa" : "Tidak Berhasil"}
    </span>
  );
}

function TicketPreview({ tickets }: { tickets: TicketSummaryInOrder[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        Tiket sudah dibayar, tetapi data tiket belum tersedia. Buka halaman tiket
        saya untuk memuat ulang daftar tiket.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                E-Ticket
              </p>
              <h3 className="mt-1 truncate text-base font-semibold text-slate-950">
                {ticket.participant_name}
              </h3>
              <p className="mt-1 font-mono text-sm text-slate-500">
                {ticket.ticket_number}
              </p>
            </div>
            <div className="flex shrink-0 justify-center sm:justify-end">
              <QRCodeDisplay value={ticket.qr_code} size={112} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = use(params);
  const [orderData, setOrderData] = useState<OrderDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      const data = await OrderService.getOrderDetail(order_id);
      setOrderData(data);
      setError(null);
    } catch {
      setError("Gagal memuat status pesanan.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order_id]);

  useEffect(() => {
    if (!orderData) return;

    const currentStatus = getNormalizedStatus(orderData.order.status);
    if (isTerminalStatus(currentStatus)) return;

    const timer = window.setInterval(() => {
      loadOrder(true);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData?.order.status, order_id]);

  const status = getNormalizedStatus(orderData?.order.status ?? "");
  const isAwaitingPayment = status === "awaiting_payment";
  const isPaid = status === "paid";
  const isFailed = orderData ? !isAwaitingPayment && !isPaid : false;

  const title = useMemo(() => {
    if (isPaid) return "Pesanan Dibayar";
    if (isAwaitingPayment) return "Menunggu Konfirmasi Pembayaran";
    if (status === "expired") return "Pesanan Kedaluwarsa";
    if (status === "cancelled") return "Pesanan Dibatalkan";
    return "Pembayaran Tidak Berhasil";
  }, [isAwaitingPayment, isPaid, status]);

  const description = useMemo(() => {
    if (isPaid) {
      return "Pembayaran sudah dikonfirmasi dan tiket sudah dapat digunakan.";
    }
    if (isAwaitingPayment) {
      return "Kami akan memperbarui halaman ini otomatis setelah webhook pembayaran dikonfirmasi.";
    }
    if (status === "expired") {
      return "Batas waktu pembayaran sudah habis. Silakan buat pesanan baru jika masih ingin membeli tiket.";
    }
    return "Pesanan ini tidak dapat dilanjutkan. Silakan buat pesanan baru atau hubungi penyelenggara.";
  }, [isAwaitingPayment, isPaid, status]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat status pesanan...</p>
        </div>
      </main>
    );
  }

  if (error || !orderData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-950">
            Status Pesanan Tidak Tersedia
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error ?? "Pesanan tidak ditemukan."}
          </p>
          <Button className="mt-6 w-full" onClick={() => loadOrder()}>
            Coba Lagi
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <StatusBadge status={orderData.order.status} />
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                variant="outline"
                onClick={() => loadOrder(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
              {isPaid && (
                <Button asChild>
                  <Link href="/user/my-ticket">
                    <Ticket className="mr-2 h-4 w-4" />
                    Lihat Tiket Saya
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {isAwaitingPayment && orderData.order.expires_at && (
          <PaymentTimer
            expiresAt={orderData.order.expires_at}
            onTimeout={() => loadOrder(true)}
          />
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Detail Pesanan
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Nomor pesanan {orderData.order.order_number}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {orderData.items.map((item) => (
                <div
                  key={item.ticket_category_id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {item.ticket_category_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.quantity} x {formatCurrency(item.unit_price, orderData.order.currency)}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-950">
                    {formatCurrency(item.subtotal_amount, orderData.order.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Ringkasan</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-950">
                  {formatCurrency(orderData.order.subtotal_amount, orderData.order.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Diskon</dt>
                <dd className="font-medium text-slate-950">
                  {formatCurrency(orderData.order.discount_amount, orderData.order.currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="font-semibold text-slate-950">Total</dt>
                <dd className="font-bold text-slate-950">
                  {formatCurrency(orderData.order.total_amount, orderData.order.currency)}
                </dd>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Dibuat</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {formatDateTime(orderData.order.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Batas pembayaran</dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {formatDateTime(orderData.order.expires_at)}
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        {isPaid && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-950">
                Tiket Diterbitkan
              </h2>
            </div>
            <TicketPreview tickets={orderData.tickets} />
          </section>
        )}

        {isFailed && (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
            Pesanan ini sudah berada pada status akhir. Frontend tidak mengubah
            status pembayaran secara manual; konfirmasi pembayaran berbayar
            tetap berasal dari webhook Xendit di backend.
          </section>
        )}
      </div>
    </main>
  );
}