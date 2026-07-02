"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
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

type NormalizedOrderStatus = "awaiting_payment" | "paid" | "expired" | "cancelled" | "failed" | string;

function getStatusCopy(status: NormalizedOrderStatus) {
  if (status === "paid") {
    return {
      eyebrow: "Payment confirmed",
      label: "Dibayar",
      title: "Tiket siap digunakan",
      description:
        "Pembayaran sudah dikonfirmasi oleh backend. QR tiket dapat dibuka dari halaman ini atau dari menu Tiket Saya.",
      tone: "emerald",
      Icon: CheckCircle2,
    };
  }

  if (status === "awaiting_payment") {
    return {
      eyebrow: "Xendit checkout return",
      label: "Menunggu Pembayaran",
      title: "Menunggu konfirmasi Xendit",
      description:
        "Halaman ini memantau status order otomatis. Konfirmasi paid tetap berasal dari webhook Xendit, bukan dari browser.",
      tone: "amber",
      Icon: Clock3,
    };
  }

  if (status === "expired") {
    return {
      eyebrow: "Payment window closed",
      label: "Kedaluwarsa",
      title: "Batas pembayaran berakhir",
      description:
        "Order ini sudah tidak dapat dibayar. Buat pesanan baru jika masih ingin membeli tiket event ini.",
      tone: "red",
      Icon: XCircle,
    };
  }

  if (status === "cancelled") {
    return {
      eyebrow: "Order cancelled",
      label: "Dibatalkan",
      title: "Pesanan dibatalkan",
      description:
        "Order ini sudah berada pada status akhir dan tidak dapat dilanjutkan.",
      tone: "red",
      Icon: XCircle,
    };
  }

  return {
    eyebrow: "Payment not completed",
    label: "Tidak Berhasil",
    title: "Pembayaran tidak berhasil",
    description:
      "Pesanan ini tidak dapat dilanjutkan. Buat pesanan baru atau hubungi penyelenggara jika status terlihat tidak sesuai.",
    tone: "red",
    Icon: XCircle,
  };
}

function toneClasses(tone: string) {
  if (tone === "emerald") {
    return {
      shell: "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: "bg-emerald-600 text-white",
      line: "bg-emerald-500",
      text: "text-emerald-700",
    };
  }

  if (tone === "amber") {
    return {
      shell: "border-amber-200 bg-amber-50 text-amber-800",
      icon: "bg-amber-500 text-white",
      line: "bg-amber-500",
      text: "text-amber-700",
    };
  }

  return {
    shell: "border-red-200 bg-red-50 text-red-800",
    icon: "bg-red-600 text-white",
    line: "bg-red-500",
    text: "text-red-700",
  };
}

function StatusPill({ status }: { status: string }) {
  const copy = getStatusCopy(getNormalizedStatus(status));
  const classes = toneClasses(copy.tone);
  const Icon = copy.Icon;

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${classes.shell}`}>
      <Icon className="h-4 w-4" />
      {copy.label}
    </span>
  );
}

function TimelineStep({
  icon: Icon,
  title,
  description,
  active,
  done,
}: {
  icon: typeof CreditCard;
  title: string;
  description: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={
          done
            ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white"
            : active
              ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white"
              : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
        }
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function TicketPreview({ tickets }: { tickets: TicketSummaryInOrder[] }) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
        Tiket sudah dibayar, tetapi data tiket belum tersedia. Buka halaman Tiket Saya untuk memuat ulang daftar tiket.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_132px] sm:items-center"
        >
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              <QrCode className="h-3.5 w-3.5" />
              E-Ticket
            </div>
            <h3 className="truncate text-base font-semibold text-slate-950">
              {ticket.participant_name}
            </h3>
            <p className="mt-1 font-mono text-sm text-slate-500">
              {ticket.ticket_number}
            </p>
          </div>
          <div className="flex justify-center rounded-lg bg-slate-50 p-3">
            <QRCodeDisplay value={ticket.qr_code} size={108} />
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
  const statusCopy = useMemo(() => getStatusCopy(status), [status]);
  const statusTone = toneClasses(statusCopy.tone);
  const StatusIcon = statusCopy.Icon;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat status pesanan...</p>
        </div>
      </main>
    );
  }

  if (error || !orderData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] p-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-red-50 text-red-600">
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
    <main className="min-h-screen bg-[#f6f7f9]">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" className="-ml-3 text-slate-600">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Beranda
            </Link>
          </Button>
          <p className="hidden font-mono text-xs text-slate-400 sm:block">
            {orderData.order.order_number}
          </p>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className={`h-1.5 ${statusTone.line}`} />
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_340px] lg:p-8">
            <div>
              <StatusPill status={orderData.order.status} />
              <p className={`mt-5 text-sm font-semibold uppercase ${statusTone.text}`}>
                {statusCopy.eyebrow}
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                {statusCopy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                {statusCopy.description}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                  Refresh Status
                </Button>
                {isPaid && (
                  <Button asChild>
                    <Link href="/user/my-ticket">
                      <Ticket className="mr-2 h-4 w-4" />
                      Buka Tiket Saya
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg ${statusTone.icon}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500">Total pembayaran</dt>
                  <dd className="mt-1 text-2xl font-bold text-slate-950">
                    {formatCurrency(orderData.order.total_amount, orderData.order.currency)}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <dt className="text-slate-500">Dibuat</dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {formatDateTime(orderData.order.created_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Batas bayar</dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {formatDateTime(orderData.order.expires_at)}
                    </dd>
                  </div>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        {isAwaitingPayment && orderData.order.expires_at && (
          <PaymentTimer
            expiresAt={orderData.order.expires_at}
            onTimeout={() => loadOrder(true)}
          />
        )}

        <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">
              Alur Konfirmasi
            </h2>
            <div className="mt-5 space-y-5">
              <TimelineStep
                icon={CreditCard}
                title="Checkout Xendit"
                description="Pembayaran dilakukan di halaman aman Xendit."
                done
              />
              <TimelineStep
                icon={ShieldCheck}
                title="Webhook backend"
                description="Backend menunggu notifikasi resmi dari Xendit."
                active={isAwaitingPayment}
                done={isPaid}
              />
              <TimelineStep
                icon={Ticket}
                title="Tiket diterbitkan"
                description="QR tiket muncul setelah status order paid."
                done={isPaid}
              />
            </div>
          </aside>

          <div className="grid gap-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Detail Pesanan
                  </h2>
                  <p className="text-sm text-slate-500">
                    Nomor pesanan {orderData.order.order_number}
                  </p>
                </div>
                <StatusPill status={orderData.order.status} />
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

              <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
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
              </dl>
            </section>

            {isPaid && (
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        Tiket Diterbitkan
                      </h2>
                      <p className="text-sm text-slate-500">
                        {orderData.tickets.length} tiket tersedia untuk order ini.
                      </p>
                    </div>
                  </div>
                </div>
                <TicketPreview tickets={orderData.tickets} />
              </section>
            )}

            {isFailed && (
              <section className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm leading-6 text-red-700">
                Pesanan ini sudah berada pada status akhir. Frontend tidak mengubah status pembayaran secara manual; konfirmasi pembayaran berbayar tetap berasal dari webhook Xendit di backend.
              </section>
            )}

            {isAwaitingPayment && (
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Halaman ini aman untuk ditinggalkan
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Jika webhook Xendit diproses setelah Anda menutup halaman, tiket tetap akan muncul di menu Tiket Saya setelah status order berubah menjadi paid.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}