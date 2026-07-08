"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
    TrendingUp,
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
import { useAuthStore } from "@/stores/auth-store";

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

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

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
}

/* ------------------------------------------------------------------ */
/*  Animated number hook                                               */
/* ------------------------------------------------------------------ */

function useAnimatedNumber(target: number, duration = 900) {
    const [value, setValue] = useState(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const start = performance.now();
        const from = 0;
        const diff = target - from;

        const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(from + diff * eased));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return value;
}

/* ------------------------------------------------------------------ */
/*  Shell + Texture                                                    */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Decorative Header SVG                                              */
/* ------------------------------------------------------------------ */

function HeaderDecoration() {
    return (
        <svg
            className="pointer-events-none absolute -right-4 -top-4 h-56 w-56 text-primary"
            viewBox="0 0 200 200"
            fill="none"
            aria-hidden="true"
        >
            {/* Curved path */}
            <path
                d="M140 20 C160 40, 180 80, 160 120 C140 160, 100 170, 60 150"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeOpacity="0.08"
                fill="none"
            />
            <path
                d="M120 10 C150 30, 190 70, 170 130 C150 180, 80 190, 40 160"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.06"
                fill="none"
            />
            {/* Small QR-like blocks */}
            <rect
                x="150"
                y="30"
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                fillOpacity="0.07"
            />
            <rect
                x="165"
                y="30"
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                fillOpacity="0.05"
            />
            <rect
                x="150"
                y="45"
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                fillOpacity="0.05"
            />
            <rect
                x="165"
                y="45"
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                fillOpacity="0.07"
            />
            <rect
                x="150"
                y="60"
                width="8"
                height="8"
                rx="2"
                fill="currentColor"
                fillOpacity="0.04"
            />
            {/* Circle accent */}
            <circle
                cx="130"
                cy="160"
                r="16"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.06"
                fill="none"
            />
            <circle cx="130" cy="160" r="6" fill="#10b981" fillOpacity="0.08" />
            {/* Rounded rect */}
            <rect
                x="30"
                y="140"
                width="40"
                height="24"
                rx="8"
                stroke="currentColor"
                strokeWidth="1"
                strokeOpacity="0.06"
                fill="none"
            />
        </svg>
    );
}

/* ------------------------------------------------------------------ */
/*  Reusable UI pieces                                                 */
/* ------------------------------------------------------------------ */

function MetricCell({
    label,
    value,
    compact = false,
}: {
    label: string;
    value: string;
    compact?: boolean;
}) {
    return (
        <div>
            <p
                className={cn(
                    "font-medium text-slate-500",
                    compact ? "text-[11px]" : "text-xs",
                )}
            >
                {label}
            </p>
            <p
                className={cn(
                    "truncate font-semibold text-slate-950",
                    compact ? "mt-0.5 text-xs" : "mt-1",
                )}
            >
                {value}
            </p>
        </div>
    );
}

function AnimatedProgressBar({
    value,
    className,
    delay = 0,
}: {
    value: number;
    className: string;
    delay?: number;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), delay + 100);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    className,
                )}
                style={{
                    width: mounted ? `${clampRate(value)}%` : "0%",
                }}
            />
        </div>
    );
}

function ProgressLine({
    label,
    valueLabel,
    value,
    className,
    delay = 0,
}: {
    label: string;
    valueLabel: string;
    value: number;
    className: string;
    delay?: number;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-900">{valueLabel}</span>
            </div>
            <AnimatedProgressBar
                value={value}
                className={className}
                delay={delay}
            />
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

/* ------------------------------------------------------------------ */
/*  Ring Progress (for conversion rate)                                */
/* ------------------------------------------------------------------ */

function RingProgress({
    value,
    size = 80,
    strokeWidth = 7,
    label,
}: {
    value: number;
    size?: number;
    strokeWidth?: number;
    label: string;
}) {
    const [mounted, setMounted] = useState(false);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clampRate(value) / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="-rotate-90"
                    viewBox={`0 0 ${size} ${size}`}
                >
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-slate-100"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        className="text-primary"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={mounted ? offset : circumference}
                        style={{
                            transition:
                                "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold tabular-nums text-slate-950">
                        {formatRate(value)}
                    </span>
                </div>
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {label}
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

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
    if (status === "published")
        return "border-primary/15 bg-primary-light text-primary";
    if (status === "draft")
        return "border-slate-200 bg-slate-100 text-slate-500";
    if (status === "cancelled")
        return "border-danger/15 bg-danger-light text-danger";
    return "border-success/15 bg-success-light text-success-hover";
}

function formatEventDate(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`;
}

/* ------------------------------------------------------------------ */
/*  Event Performance Row                                              */
/* ------------------------------------------------------------------ */

function EventPerformanceRow({
    event,
    index,
}: {
    event: OrganizerEventPerformance;
    index: number;
}) {
    const [barMounted, setBarMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setBarMounted(true), 300 + index * 100);
        return () => clearTimeout(timer);
    }, [index]);

    return (
        <article className="group relative p-4 transition-colors duration-200 hover:bg-slate-50/80">
            {/* Hover accent line */}
            <div className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Rank badge */}
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-semibold tabular-nums text-slate-500">
                            {index + 1}
                        </span>
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
                        {formatEventDate(
                            event.event_start_date,
                            event.event_end_date,
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
                    <MetricCell
                        label="Tiket"
                        value={`${formatNumber(event.tickets_sold)}/${formatNumber(event.capacity)}`}
                        compact
                    />
                    <MetricCell
                        label="Pendapatan"
                        value={formatFinanceCurrency(event.revenue)}
                        compact
                    />
                    <MetricCell
                        label="Diterbitkan"
                        value={formatNumber(event.issued_tickets)}
                        compact
                    />
                    <MetricCell
                        label="Presensi"
                        value={`${formatNumber(event.checked_in_tickets)} (${formatRate(event.checkin_rate)})`}
                        compact
                    />
                </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-medium">
                        <span className="text-slate-500">Okupansi</span>
                        <span className="text-slate-900">
                            {formatRate(event.occupancy_rate)}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                            style={{
                                width: barMounted
                                    ? `${clampRate(event.occupancy_rate)}%`
                                    : "0%",
                            }}
                        />
                    </div>
                </div>
                <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px] font-medium">
                        <span className="text-slate-500">Presensi</span>
                        <span className="text-slate-900">
                            {formatRate(event.checkin_rate)}
                        </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-success transition-all duration-1000 ease-out"
                            style={{
                                width: barMounted
                                    ? `${clampRate(event.checkin_rate)}%`
                                    : "0%",
                            }}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}

/* ------------------------------------------------------------------ */
/*  Ticket Category Row                                                */
/* ------------------------------------------------------------------ */

function TicketCategoryRow({
    category,
    maxSold,
    rank,
}: {
    category: OrganizerSalesByTicketCategory;
    maxSold: number;
    rank: number;
}) {
    const width = maxSold > 0 ? (category.quantity_sold / maxSold) * 100 : 0;
    const [barMounted, setBarMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setBarMounted(true), 400 + rank * 80);
        return () => clearTimeout(timer);
    }, [rank]);

    return (
        <div className="group rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10">
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-light text-[11px] font-semibold tabular-nums text-primary">
                        #{rank}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-slate-950">
                            {category.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                            {category.event_title}
                        </p>
                    </div>
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
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: barMounted ? `${width}%` : "0%" }}
                />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-700">
                {formatFinanceCurrency(category.revenue)}
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Animated Stat Card                                                 */
/* ------------------------------------------------------------------ */

function StatCard({
    label,
    rawValue,
    formattedValue,
    helper,
    icon: Icon,
    tone,
    accentColor,
    delay,
}: {
    label: string;
    rawValue: number;
    formattedValue: string;
    helper: string;
    icon: typeof Banknote;
    tone: string;
    accentColor: string;
    delay: number;
}) {
    const [visible, setVisible] = useState(false);
    // Only animate count for simple numbers (not currency)
    const isCurrency = formattedValue.startsWith("Rp");
    const animatedVal = useAnimatedNumber(isCurrency ? 0 : rawValue, 1200);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10",
                visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-3 opacity-0",
            )}
        >
            {/* Top accent line */}
            <div
                className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                style={{ background: accentColor }}
            />

            <div className="mb-5 flex items-center justify-between gap-4">
                <div
                    className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl",
                        tone,
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-slate-300" />
            </div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-semibold leading-none tabular-nums text-slate-950">
                {isCurrency ? formattedValue : formatNumber(animatedVal)}
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
                {helper}
            </p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Bottom Quick-Stat Card                                             */
/* ------------------------------------------------------------------ */

function QuickStatCard({
    icon: Icon,
    iconColor,
    label,
    value,
    delay,
}: {
    icon: typeof CheckCircle2;
    iconColor: string;
    label: string;
    value: number;
    delay: number;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 transition-all duration-500 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10",
                visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0",
            )}
        >
            {/* Watermark icon */}
            <Icon className="pointer-events-none absolute -bottom-2 -right-2 h-16 w-16 text-slate-100 transition-colors duration-300 group-hover:text-primary/[0.06]" />

            <div className="relative">
                <Icon className={cn("mb-4 h-5 w-5", iconColor)} />
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-base font-semibold leading-none tabular-nums text-slate-950">
                    {formatNumber(value)}
                </p>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardStatisticRow() {
    const [dashboard, setDashboard] = useState<OrganizerDashboardData | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();

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
                                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                    {error}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            className="h-10 rounded-xl text-xs font-semibold"
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

    const { overview, event_performance, sales, finance, community } =
        dashboard;
    const totalBalance =
        finance.available_amount +
        finance.pending_amount +
        finance.requested_withdrawal_amount;

    const displayName =
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        user?.username ||
        "Organizer";

    const stats = [
        {
            label: "Total pendapatan",
            rawValue: overview.total_revenue,
            value: formatFinanceCurrency(
                overview.total_revenue,
                overview.currency,
            ),
            helper: `${formatNumber(sales.paid_orders)} pesanan lunas dari ${formatNumber(sales.total_orders)} pesanan`,
            icon: Banknote,
            tone: "bg-primary-light text-primary",
            accentColor: "var(--color-primary)",
        },
        {
            label: "Tiket terjual",
            rawValue: overview.total_tickets_sold,
            value: formatNumber(overview.total_tickets_sold),
            helper: `${formatNumber(overview.total_capacity)} total kapasitas`,
            icon: Ticket,
            tone: "bg-success-light text-success-hover",
            accentColor: "var(--color-success)",
        },
        {
            label: "Event terbit",
            rawValue: overview.published_events,
            value: formatNumber(overview.published_events),
            helper: `${formatNumber(overview.upcoming_events)} mendatang, ${formatNumber(overview.past_events)} selesai`,
            icon: CalendarCheck2,
            tone: "bg-info-light text-info",
            accentColor: "var(--color-info)",
        },
        {
            label: "Saldo tersedia",
            rawValue: finance.available_amount,
            value: formatFinanceCurrency(
                finance.available_amount,
                finance.currency,
            ),
            helper: `${formatFinanceCurrency(finance.pending_amount, finance.currency)} tertahan`,
            icon: WalletCards,
            tone: "bg-warning-light text-warning-hover",
            accentColor: "var(--color-warning)",
        },
    ];

    return (
        <DashboardShell>
            {/* ── Hero Header ── */}
            <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <HeaderDecoration />

                <div className="relative grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="flex flex-col justify-between gap-6">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                Organizer workspace
                            </p>
                            <h2 className="mt-2 text-xl font-bold leading-[1.12] text-slate-950 md:text-2xl">
                                {getGreeting()},{" "}
                                <span className="text-primary">
                                    {displayName}
                                </span>
                            </h2>
                            <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-600 md:text-sm">
                                Pantau performa event, penjualan tiket,
                                komunitas, dan saldo organizer dari satu tempat.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                asChild
                                className="h-10 rounded-xl text-xs font-semibold"
                            >
                                <Link href="/organizer/create-event">
                                    <Plus className="h-4 w-4" />
                                    Buat Event
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="h-10 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                            >
                                <Link href="/organizer/finance">
                                    Keuangan
                                    <ArrowUpRight className=" h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Occupancy inset panel */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Okupansi keseluruhan
                                </p>
                                <p className="mt-2 text-base font-semibold leading-none tabular-nums text-slate-950">
                                    {formatRate(
                                        overview.overall_occupancy_rate,
                                    )}
                                </p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <ScanLine className="h-5 w-5" />
                            </div>
                        </div>
                        <AnimatedProgressBar
                            value={overview.overall_occupancy_rate}
                            className="bg-primary"
                            delay={200}
                        />
                        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                            <MetricCell
                                label="Event"
                                value={formatNumber(overview.total_events)}
                            />
                            <MetricCell
                                label="Terjual"
                                value={formatNumber(
                                    overview.total_tickets_sold,
                                )}
                            />
                            <MetricCell
                                label="Draf"
                                value={formatNumber(overview.draft_events)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Cards ── */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item, i) => (
                    <StatCard
                        key={item.label}
                        label={item.label}
                        rawValue={item.rawValue}
                        formattedValue={item.value}
                        helper={item.helper}
                        icon={item.icon}
                        tone={item.tone}
                        accentColor={item.accentColor}
                        delay={100 + i * 100}
                    />
                ))}
            </section>

            {/* ── Event Performance + Sidebar ── */}
            <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
                {/* Event Performance */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Performa event
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                Tiket, pendapatan, okupansi, dan presensi per
                                event.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 w-fit rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                            <Link href="/organizer/my-event">
                                Kelola Event
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {event_performance.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                            {event_performance.map((event, i) => (
                                <EventPerformanceRow
                                    key={event.event_id}
                                    event={event}
                                    index={i}
                                />
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

                {/* Sidebar: Conversion + Community */}
                <div className="flex flex-col gap-5">
                    {/* Order Conversion — Ring Progress */}
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
                        </div>

                        <div className="flex items-center gap-5">
                            <RingProgress
                                value={sales.order_conversion_rate}
                                label="Konversi"
                                size={88}
                                strokeWidth={8}
                            />
                            <div className="grid flex-1 grid-cols-2 gap-3">
                                <div className="rounded-lg bg-success-light/60 px-2.5 py-2">
                                    <p className="text-[11px] font-medium text-success-hover">
                                        Lunas
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                                        {formatNumber(sales.paid_orders)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-warning-light/60 px-2.5 py-2">
                                    <p className="text-[11px] font-medium text-warning-hover">
                                        Kedaluwarsa
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                                        {formatNumber(sales.expired_orders)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-info-light/60 px-2.5 py-2">
                                    <p className="text-[11px] font-medium text-info">
                                        Menunggu
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                                        {formatNumber(sales.pending_orders)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-slate-100 px-2.5 py-2">
                                    <p className="text-[11px] font-medium text-slate-500">
                                        Dibatalkan
                                    </p>
                                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-950">
                                        {formatNumber(sales.cancelled_orders)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Community */}
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
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    label: "Pengikut",
                                    value: community.followers,
                                    color: "bg-primary-light/60 text-primary",
                                },
                                {
                                    label: "Anggota",
                                    value: community.members,
                                    color: "bg-success-light/60 text-success-hover",
                                },
                                {
                                    label: "Postingan",
                                    value: community.posts,
                                    color: "bg-info-light/60 text-info",
                                },
                                {
                                    label: "Komentar",
                                    value: community.comments,
                                    color: "bg-warning-light/60 text-warning-hover",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors duration-200 hover:border-primary/20"
                                >
                                    <p className="text-xs font-medium text-slate-500">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-none tabular-nums text-slate-950">
                                        {formatNumber(item.value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </section>

            {/* ── Saldo + Ticket Categories ── */}
            <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                {/* Saldo */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Saldo organizer
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                Saldo tersedia, tertahan, dan pencairan.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                            <Link href="/organizer/finance/withdrawals">
                                Tarik saldo
                                <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Total balance card */}
                    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                        {/* Subtle gradient */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-success/[0.03]" />
                        <div className="relative">
                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                Total saldo tercatat
                            </p>
                            <p className="mt-2 text-lg font-semibold leading-none tabular-nums text-slate-950">
                                {formatFinanceCurrency(
                                    totalBalance,
                                    finance.currency,
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Stacked bar */}
                    {totalBalance > 0 && (
                        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full bg-success transition-all duration-1000"
                                style={{
                                    width: `${(finance.available_amount / totalBalance) * 100}%`,
                                }}
                            />
                            <div
                                className="h-full bg-warning-hover transition-all duration-1000"
                                style={{
                                    width: `${(finance.pending_amount / totalBalance) * 100}%`,
                                }}
                            />
                            <div
                                className="h-full bg-primary transition-all duration-1000"
                                style={{
                                    width: `${(finance.requested_withdrawal_amount / totalBalance) * 100}%`,
                                }}
                            />
                        </div>
                    )}

                    <div className="mt-4 space-y-4">
                        <ProgressLine
                            label="Tersedia"
                            valueLabel={formatFinanceCurrency(
                                finance.available_amount,
                                finance.currency,
                            )}
                            value={
                                totalBalance > 0
                                    ? (finance.available_amount /
                                          totalBalance) *
                                      100
                                    : 0
                            }
                            className="bg-success"
                            delay={200}
                        />
                        <ProgressLine
                            label="Tertahan"
                            valueLabel={formatFinanceCurrency(
                                finance.pending_amount,
                                finance.currency,
                            )}
                            value={
                                totalBalance > 0
                                    ? (finance.pending_amount / totalBalance) *
                                      100
                                    : 0
                            }
                            className="bg-warning-hover"
                            delay={350}
                        />
                        <ProgressLine
                            label="Pencairan diajukan"
                            valueLabel={formatFinanceCurrency(
                                finance.requested_withdrawal_amount,
                                finance.currency,
                            )}
                            value={
                                totalBalance > 0
                                    ? (finance.requested_withdrawal_amount /
                                          totalBalance) *
                                      100
                                    : 0
                            }
                            className="bg-primary"
                            delay={500}
                        />
                    </div>
                </div>

                {/* Ticket Categories */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                    <div className="mb-5 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-slate-950">
                                Penjualan kategori tiket
                            </h2>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                                Kategori tiket dengan penjualan dari pesanan
                                lunas.
                            </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                            <MessageSquareText className="h-4 w-4" />
                        </div>
                    </div>

                    {sales.sales_by_ticket_category.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                            {sales.sales_by_ticket_category.map(
                                (category, i) => (
                                    <TicketCategoryRow
                                        key={category.ticket_category_id}
                                        category={category}
                                        maxSold={maxCategorySold}
                                        rank={i + 1}
                                    />
                                ),
                            )}
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

            {/* ── Bottom Quick Stats ── */}
            <section className="grid gap-4 md:grid-cols-3">
                <QuickStatCard
                    icon={CheckCircle2}
                    iconColor="text-success-hover"
                    label="Event terbit"
                    value={overview.published_events}
                    delay={100}
                />
                <QuickStatCard
                    icon={Users}
                    iconColor="text-primary"
                    label="Anggota komunitas"
                    value={overview.community_members}
                    delay={200}
                />
                <QuickStatCard
                    icon={FileText}
                    iconColor="text-warning-hover"
                    label="Postingan komunitas"
                    value={overview.community_posts}
                    delay={300}
                />
            </section>
        </DashboardShell>
    );
}
