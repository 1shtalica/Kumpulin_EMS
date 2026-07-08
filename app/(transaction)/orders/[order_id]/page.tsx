"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock3,
    CreditCard,
    Loader2,
    QrCode,
    RefreshCw,
    Ticket,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PaymentTimer } from "@/components/payment/PaymentTimer";
import { QRCodeDisplay } from "@/components/user/my-ticket/QRCodeDisplay";
import { OrderService } from "@/services/order-service";
import { saveLastOrderId } from "@/lib/order-session";
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

type StatusTone = "success" | "warning" | "danger";
type NormalizedOrderStatus =
    "awaiting_payment" | "paid" | "expired" | "cancelled" | "failed" | string;

function getStatusCopy(status: NormalizedOrderStatus): {
    eyebrow: string;
    label: string;
    title: string;
    description: string;
    tone: StatusTone;
    Icon: typeof CheckCircle2;
} {
    if (status === "paid") {
        return {
            eyebrow: "Order paid",
            label: "Dibayar",
            title: "Tiket siap digunakan",
            description:
                "Pembayaran sudah dikonfirmasi oleh backend. QR tiket dapat dibuka dari halaman ini atau menu Tiket Saya.",
            tone: "success",
            Icon: CheckCircle2,
        };
    }

    if (status === "awaiting_payment") {
        return {
            eyebrow: "Xendit return",
            label: "Menunggu Pembayaran",
            title: "Menunggu konfirmasi pembayaran",
            description:
                "Status order dipantau otomatis. Konfirmasi paid tetap berasal dari webhook Xendit di backend.",
            tone: "warning",
            Icon: Clock3,
        };
    }

    if (status === "expired") {
        return {
            eyebrow: "Payment expired",
            label: "Kedaluwarsa",
            title: "Batas pembayaran berakhir",
            description:
                "Order ini sudah tidak dapat dibayar. Buat pesanan baru jika masih ingin membeli tiket event ini.",
            tone: "danger",
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
            tone: "danger",
            Icon: XCircle,
        };
    }

    return {
        eyebrow: "Payment failed",
        label: "Tidak Berhasil",
        title: "Pembayaran tidak berhasil",
        description:
            "Pesanan ini tidak dapat dilanjutkan. Buat pesanan baru atau hubungi penyelenggara jika status tidak sesuai.",
        tone: "danger",
        Icon: XCircle,
    };
}

function toneClasses(tone: StatusTone) {
    if (tone === "success") {
        return {
            badge: "border-success/15 bg-success-light text-success-hover [&_.status-dot]:bg-success",
            icon: "bg-success-light text-success-hover ring-success/10",
            accent: "bg-success",
            label: "text-success-hover",
            softPanel: "border-success/15 bg-success-light/60",
        };
    }

    if (tone === "warning") {
        return {
            badge: "border-warning/20 bg-warning-light text-warning-hover [&_.status-dot]:bg-warning-hover",
            icon: "bg-warning-light text-warning-hover ring-warning/15",
            accent: "bg-warning-hover",
            label: "text-warning-hover",
            softPanel: "border-warning/20 bg-warning-light/60",
        };
    }

    return {
        badge: "border-danger/15 bg-danger-light text-danger [&_.status-dot]:bg-danger",
        icon: "bg-danger-light text-danger ring-danger/10",
        accent: "bg-danger",
        label: "text-danger",
        softPanel: "border-danger/15 bg-danger-light/60",
    };
}

function StatusGraphic({ tone }: { tone: StatusTone }) {
    const strokeColor = tone === "success" ? "#10b981" : "currentColor";

    return (
        <svg
            className="pointer-events-none absolute bottom-0 right-0 h-44 w-64 translate-x-8 translate-y-8 text-primary"
            viewBox="0 0 260 180"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M22 134C54 84 88 58 124 56C168 54 180 88 220 72"
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="2"
            />
            <path
                d="M48 152C92 104 126 96 150 104C184 116 192 140 238 114"
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeWidth="2"
            />
            <rect
                x="154"
                y="28"
                width="68"
                height="68"
                rx="18"
                stroke="currentColor"
                strokeOpacity="0.11"
                strokeWidth="2"
            />
            <rect
                x="174"
                y="48"
                width="12"
                height="12"
                rx="3"
                fill="currentColor"
                fillOpacity="0.12"
            />
            <rect
                x="194"
                y="48"
                width="12"
                height="12"
                rx="3"
                fill="currentColor"
                fillOpacity="0.12"
            />
            <rect
                x="174"
                y="68"
                width="12"
                height="12"
                rx="3"
                fill="currentColor"
                fillOpacity="0.12"
            />
            <path
                d="M70 76L88 94L124 54"
                stroke={strokeColor}
                strokeOpacity="0.18"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function StatusPill({ status }: { status: string }) {
    const copy = getStatusCopy(getNormalizedStatus(status));
    const classes = toneClasses(copy.tone);
    const Icon = copy.Icon;

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${classes.badge}`}
        >
            <span className="status-dot size-1.5 rounded-full" />
            <Icon className="h-3.5 w-3.5" />
            {copy.label}
        </span>
    );
}

function TicketPreview({ tickets }: { tickets: TicketSummaryInOrder[] }) {
    if (tickets.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600">
                Tiket sudah dibayar, tetapi data tiket belum tersedia. Buka
                halaman Tiket Saya untuk memuat ulang daftar tiket.
            </div>
        );
    }

    return (
        <div className="grid gap-3">
            {tickets.map((ticket) => (
                <div
                    key={ticket.id}
                    className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10 md:grid-cols-[1fr_132px] md:items-center"
                >
                    <div className="min-w-0">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                            <QrCode className="h-3.5 w-3.5" />
                            E-Ticket
                        </div>
                        <h3 className="truncate text-lg font-semibold leading-snug text-slate-950">
                            {ticket.participant_name}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-slate-500 sm:text-sm">
                            {ticket.ticket_number}
                        </p>
                    </div>
                    <div className="flex justify-center rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
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
        saveLastOrderId(order_id);
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
    const paymentUrl = orderData?.payment?.payment_url;

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4">
                <div className="flex flex-col items-center gap-4 text-slate-600">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="font-medium">Memuat status pesanan...</p>
                </div>
            </main>
        );
    }

    if (error || !orderData) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-md shadow-slate-900/5">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-danger-light text-danger">
                        <AlertTriangle className="h-7 w-7" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-950">
                        Status Pesanan Tidak Tersedia
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {error ?? "Pesanan tidak ditemukan."}
                    </p>
                    <Button
                        className="mt-6 h-10 w-full rounded-xl text-sm font-semibold"
                        onClick={() => loadOrder()}
                    >
                        Coba Lagi
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f9fafb]">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.16,
                }}
            />

            <div className="relative border-b border-slate-200/80 bg-white/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Button
                        asChild
                        variant="ghost"
                        className="-ml-3 h-10 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary"
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Beranda
                        </Link>
                    </Button>
                    <p className="hidden font-mono text-xs text-slate-500 sm:block">
                        {orderData.order.order_number}
                    </p>
                </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5 sm:p-6 lg:p-8">
                    <StatusGraphic tone={statusCopy.tone} />
                    <div className="relative grid gap-6 xl:grid-cols-[1fr_300px] xl:items-start">
                        <div>
                            <StatusPill status={orderData.order.status} />
                            <p
                                className={`mt-5 text-[11px] font-medium uppercase tracking-wider ${statusTone.label}`}
                            >
                                {statusCopy.eyebrow}
                            </p>
                            <h1 className="mt-2 max-w-xl text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
                                {statusCopy.title}
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                                {statusCopy.description}
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                {isAwaitingPayment && paymentUrl && (
                                    <Button
                                        className="h-10 rounded-xl text-sm font-semibold"
                                        onClick={() => {
                                            window.location.href = paymentUrl;
                                        }}
                                    >
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Lanjutkan Pembayaran
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
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
                                    <Button
                                        asChild
                                        className="h-10 rounded-xl text-sm font-semibold"
                                    >
                                        <Link href="/user/my-ticket">
                                            <Ticket className="mr-2 h-4 w-4" />
                                            Buka Tiket Saya
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <aside
                            className={`relative rounded-xl border p-4 sm:max-w-sm xl:max-w-none ${statusTone.softPanel}`}
                        >
                            <div
                                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ring-4 ${statusTone.icon}`}
                            >
                                <StatusIcon className="h-6 w-6" />
                            </div>
                            <dl className="space-y-4 text-sm">
                                <div>
                                    <dt className="text-slate-500">
                                        Total pembayaran
                                    </dt>
                                    <dd className="mt-2 text-2xl font-semibold leading-none text-slate-950 tabular-nums">
                                        {formatCurrency(
                                            orderData.order.total_amount,
                                            orderData.order.currency,
                                        )}
                                    </dd>
                                </div>
                                <div className="grid grid-cols-2 gap-3 border-t border-slate-200/80 pt-4">
                                    <div>
                                        <dt className="text-xs text-slate-500">
                                            Dibuat
                                        </dt>
                                        <dd className="mt-1 text-sm font-medium text-slate-900">
                                            {formatDateTime(
                                                orderData.order.created_at,
                                            )}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-slate-500">
                                            Batas bayar
                                        </dt>
                                        <dd className="mt-1 text-sm font-medium text-slate-900">
                                            {formatDateTime(
                                                orderData.order.expires_at,
                                            )}
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

                <section className="grid gap-5">
                    <div className="grid gap-5">
                        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-950">
                                        Detail Pesanan
                                    </h2>
                                    <p className="mt-1 font-mono text-xs text-slate-500">
                                        {orderData.order.order_number}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Event ID:{" "}
                                        <span className="font-mono">
                                            {orderData.order.event_id}
                                        </span>
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
                                            <p className="text-sm font-semibold text-slate-950 sm:text-base">
                                                {item.ticket_category_name}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.quantity} x{" "}
                                                {formatCurrency(
                                                    item.unit_price,
                                                    orderData.order.currency,
                                                )}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-950 sm:text-base">
                                            {formatCurrency(
                                                item.subtotal_amount,
                                                orderData.order.currency,
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <dl className="mt-5 border-t border-slate-100 pt-5 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="font-semibold text-slate-950">
                                        Total
                                    </dt>
                                    <dd className="font-semibold text-slate-950">
                                        {formatCurrency(
                                            orderData.order.total_amount,
                                            orderData.order.currency,
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <section className="grid gap-5 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                                        <CreditCard className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-950">
                                            Detail Pembayaran
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Provider, metode, dan status
                                            pembayaran order.
                                        </p>
                                    </div>
                                </div>
                                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Status
                                        </dt>
                                        <dd className="mt-1 font-medium text-slate-900">
                                            {orderData.payment?.status || "-"}
                                        </dd>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Provider
                                        </dt>
                                        <dd className="mt-1 font-medium text-slate-900">
                                            {orderData.payment?.provider || "-"}
                                        </dd>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Metode
                                        </dt>
                                        <dd className="mt-1 font-medium text-slate-900">
                                            {orderData.payment?.method || "-"}
                                        </dd>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2">
                                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                            Dibayar
                                        </dt>
                                        <dd className="mt-1 font-medium text-slate-900">
                                            {formatDateTime(
                                                orderData.payment?.paid_at ||
                                                    orderData.order.paid_at,
                                            )}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                                        <Ticket className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-950">
                                            Peserta
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {orderData.participants?.length ??
                                                0}{" "}
                                            peserta tercatat pada order ini.
                                        </p>
                                    </div>
                                </div>
                                {orderData.participants &&
                                orderData.participants.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {orderData.participants.map(
                                            (participant, index) => (
                                                <div
                                                    key={`${participant.ticket_category_id}-${index}`}
                                                    className="py-3 first:pt-0 last:pb-0"
                                                >
                                                    <p className="font-semibold text-slate-950">
                                                        {participant.full_name ||
                                                            "-"}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {participant.email ||
                                                            "-"}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {participant.phone ||
                                                            "-"}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600">
                                        Data peserta belum tersedia untuk order
                                        ini.
                                    </div>
                                )}
                            </div>
                        </section>

                        {isPaid && (
                            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                                <div className="mb-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-light text-success-hover">
                                        <Ticket className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-950">
                                            Tiket Diterbitkan
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            {orderData.tickets.length} tiket
                                            tersedia untuk order ini.
                                        </p>
                                    </div>
                                </div>
                                <TicketPreview tickets={orderData.tickets} />
                            </section>
                        )}

                        {isFailed && (
                            <section className="rounded-2xl border border-danger/15 bg-danger-light p-4 text-sm leading-relaxed text-danger shadow-sm shadow-slate-900/5">
                                Pesanan ini sudah berada pada status akhir.
                                Frontend tidak mengubah status pembayaran secara
                                manual; konfirmasi pembayaran berbayar tetap
                                berasal dari webhook Xendit di backend.
                            </section>
                        )}

                        {isAwaitingPayment && paymentUrl && (
                            <section className="rounded-2xl border border-primary/15 bg-primary-light p-4 shadow-sm shadow-slate-900/5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-950">
                                            Pembayaran belum selesai
                                        </h2>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                            Lanjutkan ke checkout Xendit untuk
                                            menyelesaikan pembayaran order ini.
                                        </p>
                                    </div>
                                    <Button
                                        className="h-10 shrink-0 rounded-xl text-sm font-semibold"
                                        onClick={() => {
                                            window.location.href = paymentUrl;
                                        }}
                                    >
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Bayar di Xendit
                                    </Button>
                                </div>
                            </section>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
