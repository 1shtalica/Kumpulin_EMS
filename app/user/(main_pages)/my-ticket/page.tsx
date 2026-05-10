"use client";

import Link from "next/link";
import { type FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Search,
    Ticket as TicketIcon,
    UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    { label: "Aktif", value: "issued" },
    { label: "Checked In", value: "checked_in" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Refunded", value: "refunded" },
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
        month: "short",
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
                label: "Aktif",
                dotClassName: "bg-emerald-500",
                badgeClassName:
                    "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
            };
        case "checked_in":
            return {
                label: "Checked In",
                dotClassName: "bg-blue-500",
                badgeClassName:
                    "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50",
            };
        case "cancelled":
            return {
                label: "Cancelled",
                dotClassName: "bg-red-500",
                badgeClassName:
                    "border-transparent bg-red-50 text-red-700 hover:bg-red-50",
            };
        case "refunded":
            return {
                label: "Refunded",
                dotClassName: "bg-amber-500",
                badgeClassName:
                    "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50",
            };
        default:
            return {
                label: "Invalidated",
                dotClassName: "bg-slate-400",
                badgeClassName:
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
        <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
            <div className="grid min-h-44 md:grid-cols-[1fr_220px]">
                <div className="relative p-5 sm:p-6">
                    <div className="absolute inset-y-6 left-0 w-1 rounded-r-full bg-linear-to-b from-primary to-secondary" />
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-2 pl-2">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/70">
                                <span
                                    className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                                />
                                E-ticket
                            </div>
                            <div>
                                <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-950">
                                    {item.event_title || "Event"}
                                </h2>
                                <p className="mt-1 font-mono text-xs text-slate-400">
                                    {item.ticket_number || "-"}
                                </p>
                            </div>
                        </div>
                        <Badge className={status.badgeClassName}>
                            {status.label}
                        </Badge>
                    </div>

                    <div className="mt-6 grid gap-3 pl-2 text-sm text-slate-600 sm:grid-cols-2">
                        <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                            <UserRound className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">
                                {item.participant_name || "-"}
                            </span>
                        </div>
                        <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                            <span className="truncate">
                                {formatDateTime(item.issued_at)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col justify-between border-t border-dashed border-slate-200 bg-slate-50/70 p-5 md:border-l md:border-t-0">
                    <div className="pointer-events-none absolute -left-3 top-6 hidden h-6 w-6 rounded-full border border-slate-200 bg-slate-50 md:block" />
                    <div className="pointer-events-none absolute -left-3 bottom-6 hidden h-6 w-6 rounded-full border border-slate-200 bg-slate-50 md:block" />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Kategori
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                            {item.ticket_category_name || "Kategori tiket"}
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="brand"
                        className="mt-5 rounded-full px-6"
                    >
                        <Link href={`/user/my-ticket/${item.id}`}>
                            Lihat Tiket
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

function TicketPageFallback() {
    return (
        <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white py-20">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin text-slate-500" />
                <p className="text-sm text-slate-500">Menyiapkan tiket...</p>
            </div>
        </main>
    );
}

function MyTicketPageContent() {
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
    const limit = normalizeLimit(
        parsePositiveInt(searchParams.get("limit"), 10),
    );
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
                    getTicketApiErrorMessage(
                        error,
                        "Gagal mengambil data tiket.",
                    ),
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
            <div className="mx-auto w-full max-w-6xl space-y-6">
                <header className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-sm">
                    <div className="relative bg-linear-to-r from-primary via-primary to-secondary p-6 text-white sm:p-8">
                        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
                        <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-black/10 blur-2xl" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                                    Ticket wallet
                                </p>
                                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                    Tiket Saya
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                                    Kelola e-ticket, cek status check-in, dan
                                    buka QR saat masuk ke lokasi event.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                                        Total
                                    </p>
                                    <p className="mt-1 text-3xl font-bold">
                                        {pagination.total_items}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                                        Halaman
                                    </p>
                                    <p className="mt-1 text-3xl font-bold">
                                        {safePage}/{totalPages}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-5">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {STATUS_OPTIONS.map((option) => {
                                const isActive =
                                    option.value === selectedStatus;
                                return (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={isActive ? "brand" : "outline"}
                                        className="h-9 shrink-0 rounded-full px-5"
                                        onClick={() =>
                                            handleStatusChange(option.value)
                                        }
                                    >
                                        {option.label}
                                    </Button>
                                );
                            })}
                        </div>

                        <form
                            onSubmit={handleFilterSubmit}
                            className="grid gap-3 lg:grid-cols-[1fr_auto_auto]"
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={eventIdInput}
                                    onChange={(event) =>
                                        setEventIdInput(event.target.value)
                                    }
                                    placeholder="Filter berdasarkan event_id"
                                    className="h-11 rounded-full border-slate-200 bg-slate-50 pl-10"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="brand"
                                className="h-11 rounded-full px-6"
                            >
                                Terapkan
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-full px-6"
                                onClick={clearFilters}
                            >
                                Reset
                            </Button>
                        </form>
                    </div>
                </header>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            {summaryText}
                        </p>
                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="ticket-limit"
                                className="text-sm text-slate-500"
                            >
                                Tampilkan
                            </label>
                            <select
                                id="ticket-limit"
                                value={String(limit)}
                                onChange={(event) =>
                                    handleLimitChange(event.target.value)
                                }
                                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
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
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setReloadCount((current) => current + 1)
                                    }
                                >
                                    Coba Lagi
                                </Button>
                                {errorCode === "INVALID_INPUT" ? (
                                    <Button
                                        type="button"
                                        onClick={clearFilters}
                                    >
                                        Bersihkan Query
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && items.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                                <TicketIcon className="h-8 w-8" />
                            </div>
                            <p className="mt-4 text-base font-semibold text-slate-900">
                                Belum ada tiket
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                                Tiket Anda akan muncul di halaman ini setelah
                                pembelian berhasil.
                            </p>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && items.length > 0 ? (
                        <div className="mt-5 space-y-4">
                            {items.map((item) => (
                                <TicketCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && items.length > 0 ? (
                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                disabled={safePage <= 1}
                                onClick={() =>
                                    applyQuery({
                                        page: String(Math.max(safePage - 1, 1)),
                                    })
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Sebelumnya
                            </Button>
                            <p className="text-center text-sm text-slate-500">
                                Halaman {safePage} dari {totalPages}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="rounded-full"
                                disabled={safePage >= totalPages}
                                onClick={() =>
                                    applyQuery({
                                        page: String(
                                            Math.min(safePage + 1, totalPages),
                                        ),
                                    })
                                }
                            >
                                Berikutnya
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null}
                </section>
            </div>
        </main>
    );
}

export default function MyTicketPage() {
    return (
        <Suspense fallback={<TicketPageFallback />}>
            <MyTicketPageContent />
        </Suspense>
    );
}
