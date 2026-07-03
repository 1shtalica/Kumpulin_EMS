"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    AlertCircle,
    ArrowUpRight,
    Banknote,
    CalendarCheck2,
    CheckCircle2,
    Clock3,
    FileText,
    MessageSquareText,
    Plus,
    RefreshCw,
    ScanLine,
    Ticket,
    Users,
    WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizerService } from "@/services/organizer-service";
import { formatFinanceCurrency } from "@/components/organizer/finance/finance-format";
import type {
    OrganizerDashboardData,
    OrganizerEventPerformance,
    OrganizerSalesByTicketCategory,
} from "@/types/organizer";
import { cn } from "@/lib/utils";

const numberFormatter = new Intl.NumberFormat("id-ID");
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
});
const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
});

const formatNumber = (value: number) => numberFormatter.format(value || 0);
const formatRate = (value: number) => `${numberFormatter.format(value || 0)}%`;
const clampRate = (value: number) => Math.min(Math.max(value || 0, 0), 100);

function WorkspaceTexture() {
    return (
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
    );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
            <WorkspaceTexture />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

function DashboardSkeleton() {
    return (
        <DashboardShell>
            <Skeleton className="h-48 rounded-2xl bg-slate-200/80" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="h-36 rounded-2xl bg-slate-200/80"
                    />
                ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                <Skeleton className="h-96 rounded-2xl bg-slate-200/80" />
                <Skeleton className="h-96 rounded-2xl bg-slate-200/80" />
            </div>
        </DashboardShell>
    );
}

function MetricCell({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 truncate font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function ProgressLine({
    label,
    valueLabel,
    value,
    className,
}: {
    label: string;
    valueLabel: string;
    value: number;
    className: string;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-900">{valueLabel}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className={cn("h-full rounded-full", className)}
                    style={{ width: `${clampRate(value)}%` }}
                />
            </div>
        </div>
    );
}

function EmptyPanel({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof AlertCircle;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-[13px] font-semibold text-slate-950">{title}</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                {description}
            </p>
        </div>
    );
}

function statusLabel(status: string) {
    const labels: Record<string, string> = {
        draft: "Draf",
        published: "Terbit",
        cancelled: "Dibatalkan",
        completed: "Selesai",
    };

    return labels[status] ?? status;
}

function statusClassName(status: string) {
    if (status === "published") return "border-primary/15 bg-primary-light text-primary";
    if (status === "draft") return "border-slate-200 bg-slate-100 text-slate-500";
    if (status === "cancelled") return "border-danger/15 bg-danger-light text-danger";
    return "border-success/15 bg-success-light text-success-hover";
}

function formatEventDate(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

function EventPerformanceRow({ event }: { event: OrganizerEventPerformance }) {
    return (
        <article className="p-4 transition-colors hover:bg-slate-50/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-950">
                            {event.title}
                        </h3>
                        <Badge
                            variant="outline"
                            className={cn(
                                "gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                                statusClassName(event.status),
                            )}
                        >
                            <span className="size-1.5 rounded-full bg-current" />
                            {statusLabel(event.status)}
                        </Badge>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatEventDate(event.event_start_date, event.event_end_date)}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-4 lg:min-w-[480px]">
                    <MetricCell
                        label="Tiket"
                        value={`${formatNumber(event.tickets_sold)}/${formatNumber(event.capacity)}`}
                    />
                    <MetricCell label="Pendapatan" value={formatFinanceCurrency(event.revenue)} />
                    <MetricCell label="Diterbitkan" value={formatNumber(event.issued_tickets)} />
                    <MetricCell
                        label="Presensi"
                        value={`${formatNumber(event.checked_in_tickets)} (${formatRate(event.checkin_rate)})`}
                    />
                </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ProgressLine
                    label="Okupansi"
                    valueLabel={formatRate(event.occupancy_rate)}
                    value={event.occupancy_rate}
                    className="bg-primary"
                />
                <ProgressLine
                    label="Presensi"
                    valueLabel={formatRate(event.checkin_rate)}
                    value={event.checkin_rate}
                    className="bg-success"
                />
            </div>
        </article>
    );
}
function TicketCategoryRow({
    category,
    maxSold,
}: {
    category: OrganizerSalesByTicketCategory;
    maxSold: number;
}) {
    const width = maxSold > 0 ? (category.quantity_sold / maxSold) * 100 : 0;

    return (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-slate-950">
                        {category.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                        {category.event_title}
                    </p>
                </div>
                <div className="shrink-0 text-right">
                    <p className="text-[13px] font-semibold text-slate-950">
                        {formatNumber(category.quantity_sold)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">terjual</p>
                </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${width}%` }}
                />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-700">
                {formatFinanceCurrency(category.revenue)}
            </p>
        </div>
    );
}

export default function DashboardStatisticRow() {
    const [dashboard, setDashboard] = useState<OrganizerDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboard = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await OrganizerService.getDashboard();
            setDashboard(data);
        } catch (err) {
            console.error("Failed to load organizer dashboard", err);
            setError("Dasbor organizer belum bisa dimuat.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const maxCategorySold = useMemo(() => {
        return Math.max(
            0,
            ...(dashboard?.sales.sales_by_ticket_category.map(
                (category) => category.quantity_sold,
            ) ?? []),
        );
    }, [dashboard]);

    if (isLoading) return <DashboardSkeleton />;

    if (error || !dashboard) {
        return (
            <DashboardShell>
                <div className="rounded-2xl border border-danger/20 bg-white p-5 shadow-sm shadow-slate-900/5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger-light text-danger">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold text-slate-950">
                                    Gagal memuat dasbor
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">{error}</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            className="h-10 rounded-xl text-sm font-semibold"
                            onClick={loadDashboard}
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Muat ulang
                        </Button>
                    </div>
                </div>
            </DashboardShell>
        );
    }

    const { overview, event_performance, sales, finance, community } = dashboard;
    const totalBalance =
        finance.available_amount +
        finance.pending_amount +
        finance.requested_withdrawal_amount;
    const stats = [
        {
            label: "Total pendapatan",
            value: formatFinanceCurrency(overview.total_revenue, overview.currency),
            helper: `${formatNumber(sales.paid_orders)} pesanan lunas dari ${formatNumber(sales.total_orders)} pesanan`,
            icon: Banknote,
            tone: "bg-primary-light text-primary",
        },
        {
            label: "Tiket terjual",
            value: formatNumber(overview.total_tickets_sold),
            helper: `${formatNumber(overview.total_capacity)} total kapasitas`,
            icon: Ticket,
            tone: "bg-success-light text-success-hover",
        },
        {
            label: "Event terbit",
            value: formatNumber(overview.published_events),
            helper: `${formatNumber(overview.upcoming_events)} mendatang, ${formatNumber(overview.past_events)} selesai`,
            icon: CalendarCheck2,
            tone: "bg-info-light text-info",
        },
        {
            label: "Saldo tersedia",
            value: formatFinanceCurrency(finance.available_amount, finance.currency),
            helper: `${formatFinanceCurrency(finance.pending_amount, finance.currency)} tertahan`,
            icon: WalletCards,
            tone: "bg-warning-light text-warning-hover",
        },
    ];

    return (
        <DashboardShell>
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="flex flex-col justify-between gap-6">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                Ruang kerja organizer
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">
                                Dasbor
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                                Pantau performa event, penjualan tiket, komunitas,
                                dan saldo organizer dari satu tempat.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="h-10 rounded-xl text-sm font-semibold">
                                <Link href="/organizer/create-event">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Event
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                            >
                                <Link href="/organizer/finance">
                                    Keuangan
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Okupansi keseluruhan
                                </p>
                                <p className="mt-2 text-xl font-semibold leading-none tabular-nums text-slate-950">
                                    {formatRate(overview.overall_occupancy_rate)}
                                </p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <ScanLine className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${clampRate(overview.overall_occupancy_rate)}%` }}
                            />
                        </div>
                        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                            <MetricCell label="Event" value={formatNumber(overview.total_events)} />
                            <MetricCell label="Terjual" value={formatNumber(overview.total_tickets_sold)} />
                            <MetricCell label="Draf" value={formatNumber(overview.draft_events)} />
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5"
                        >
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div
                                    className={cn(
                                        "flex h-11 w-11 items-center justify-center rounded-xl",
                                        item.tone,
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-slate-500">{item.label}</p>
                            <p className="mt-2 text-xl font-semibold leading-none tabular-nums text-slate-950">
                                {item.value}
                            </p>
                            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                                {item.helper}
                            </p>
                        </div>
                    );
                })}
            </section>
            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-950">
                                Performa event
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                Tiket, pendapatan, okupansi, dan presensi per event.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 w-fit rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                            <Link href="/organizer/my-event">
                                Kelola Event
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {event_performance.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {event_performance.map((event) => (
                                <EventPerformanceRow key={event.event_id} event={event} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4">
                            <EmptyPanel
                                icon={CalendarCheck2}
                                title="Belum ada event"
                                description="Event yang dibuat akan muncul di sini setelah tersedia dari API."
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-5">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-950">
                                    Konversi pesanan
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    Status pesanan dari semua event.
                                </p>
                            </div>
                            <Badge className="rounded-full border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                                {formatRate(sales.order_conversion_rate)}
                            </Badge>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${clampRate(sales.order_conversion_rate)}%` }}
                            />
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <MetricCell label="Lunas" value={formatNumber(sales.paid_orders)} />
                            <MetricCell label="Kedaluwarsa" value={formatNumber(sales.expired_orders)} />
                            <MetricCell label="Menunggu" value={formatNumber(sales.pending_orders)} />
                            <MetricCell label="Dibatalkan" value={formatNumber(sales.cancelled_orders)} />
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-950">
                                    Komunitas
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    Aktivitas komunitas organizer.
                                </p>
                            </div>
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCell label="Pengikut" value={formatNumber(community.followers)} />
                            <MetricCell label="Anggota" value={formatNumber(community.members)} />
                            <MetricCell label="Postingan" value={formatNumber(community.posts)} />
                            <MetricCell label="Komentar" value={formatNumber(community.comments)} />
                        </div>
                    </section>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-950">
                                Saldo organizer
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                Saldo tersedia, tertahan, dan pencairan.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                            <Link href="/organizer/finance/withdrawals">
                                Tarik saldo
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                            Total saldo tercatat
                        </p>
                        <p className="mt-2 text-xl font-semibold leading-none tabular-nums text-slate-950">
                            {formatFinanceCurrency(totalBalance, finance.currency)}
                        </p>
                    </div>

                    <div className="mt-4 space-y-4">
                        <ProgressLine
                            label="Tersedia"
                            valueLabel={formatFinanceCurrency(finance.available_amount, finance.currency)}
                            value={totalBalance > 0 ? (finance.available_amount / totalBalance) * 100 : 0}
                            className="bg-success"
                        />
                        <ProgressLine
                            label="Tertahan"
                            valueLabel={formatFinanceCurrency(finance.pending_amount, finance.currency)}
                            value={totalBalance > 0 ? (finance.pending_amount / totalBalance) * 100 : 0}
                            className="bg-warning-hover"
                        />
                        <ProgressLine
                            label="Pencairan diajukan"
                            valueLabel={formatFinanceCurrency(
                                finance.requested_withdrawal_amount,
                                finance.currency,
                            )}
                            value={
                                totalBalance > 0
                                    ? (finance.requested_withdrawal_amount / totalBalance) * 100
                                    : 0
                            }
                            className="bg-primary"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-950">
                                Penjualan kategori tiket
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                Kategori tiket dengan penjualan dari pesanan lunas.
                            </p>
                        </div>
                        <MessageSquareText className="h-5 w-5 text-primary" />
                    </div>

                    {sales.sales_by_ticket_category.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                            {sales.sales_by_ticket_category.map((category) => (
                                <TicketCategoryRow
                                    key={category.ticket_category_id}
                                    category={category}
                                    maxSold={maxCategorySold}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyPanel
                            icon={FileText}
                            title="Belum ada kategori terjual"
                            description="Kategori tiket akan tampil setelah ada pesanan lunas."
                        />
                    )}
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <CheckCircle2 className="mb-4 h-5 w-5 text-success-hover" />
                    <p className="text-xs font-medium text-slate-500">Event terbit</p>
                    <p className="mt-2 text-xl font-semibold leading-none tabular-nums text-slate-950">
                        {formatNumber(overview.published_events)}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <Users className="mb-4 h-5 w-5 text-primary" />
                    <p className="text-xs font-medium text-slate-500">Anggota komunitas</p>
                    <p className="mt-2 text-xl font-semibold leading-none tabular-nums text-slate-950">
                        {formatNumber(overview.community_members)}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <FileText className="mb-4 h-5 w-5 text-warning-hover" />
                    <p className="text-xs font-medium text-slate-500">Postingan komunitas</p>
                    <p className="mt-2 text-xl font-semibold leading-none tabular-nums text-slate-950">
                        {formatNumber(overview.community_posts)}
                    </p>
                </div>
            </section>
        </DashboardShell>
    );
}
