"use client";

import Link from "next/link";
import { type FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Hash,
    Sparkles,
    QrCode,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Ticket as TicketIcon,
    UserRound,
    WalletCards,
    X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { QRCodeDisplay } from "@/components/user/my-ticket/QRCodeDisplay";
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
    shortLabel: string;
    value: "all" | TicketStatus;
};

const STATUS_OPTIONS: StatusOption[] = [
    { label: "Semua tiket", shortLabel: "Semua", value: "all" },
    { label: "Aktif", shortLabel: "Aktif", value: "issued" },
    { label: "Sudah check-in", shortLabel: "Hadir", value: "checked_in" },
];

const DEFAULT_PAGINATION: TicketPagination = {
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1,
};

const VALID_STATUSES = new Set<TicketStatus>(["issued", "checked_in"]);

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
                Icon: CheckCircle2,
                dotClassName: "bg-emerald-500",
                badgeClassName:
                    "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
            };
        case "checked_in":
            return {
                label: "Sudah check-in",
                Icon: CheckCircle2,
                dotClassName: "bg-blue-500",
                badgeClassName:
                    "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50",
            };
        default:
            return {
                label: "Tidak valid",
                Icon: AlertCircle,
                dotClassName: "bg-slate-400",
                badgeClassName:
                    "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
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

function TicketWalletDoodle() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden opacity-80 lg:block"
        >
            <div className="absolute -right-10 top-4 h-28 w-28 rotate-12 rounded-2xl border border-primary/15 bg-primary/5" />
            <div className="absolute right-32 top-8 h-24 w-40 -rotate-6 rounded-xl border border-slate-200/80 bg-slate-50/80">
                <div className="absolute inset-x-4 top-5 h-2 rounded-full bg-slate-200" />
                <div className="absolute left-4 top-11 h-2 w-14 rounded-full bg-slate-200" />
                <div className="absolute bottom-0 left-8 h-5 w-5 translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute bottom-0 right-8 h-5 w-5 translate-y-1/2 rounded-full border border-slate-200 bg-white" />
            </div>
            <div className="absolute bottom-6 right-16 grid h-18 w-18 rotate-3 grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm">
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
            <Sparkles className="absolute right-16 top-8 h-4 w-4 text-primary/50" />
            <div className="absolute bottom-8 right-36 h-px w-40 rotate-[-8deg] border-t border-dashed border-slate-300" />
        </div>
    );
}

function TicketCardDoodle() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] overflow-hidden md:block"
        >
            <div className="absolute inset-y-0 right-0 w-72 bg-linear-to-l from-primary/8 via-primary/4 to-transparent" />
            <div className="absolute -right-14 -top-8 h-36 w-52 rotate-6 rounded-[1.75rem] border border-primary/15 bg-primary/8" />
            <div className="absolute right-7 top-5 h-30 w-50 -rotate-3 rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
                <div className="absolute inset-y-4 left-14 border-l border-dashed border-slate-300" />
                <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <TicketIcon className="h-5 w-5" />
                </div>
                <div className="absolute left-20 top-6 h-2 w-20 rounded-full bg-slate-300" />
                <div className="absolute left-20 top-12 h-1.5 w-14 rounded-full bg-slate-200" />
                <div className="absolute left-20 top-17 h-1.5 w-18 rounded-full bg-primary/25" />
                <div className="absolute bottom-5 left-20 flex h-8 items-end gap-1">
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-7 w-1 rounded-full bg-slate-400" />
                    <span className="h-5 w-1 rounded-full bg-slate-300" />
                    <span className="h-8 w-1 rounded-full bg-primary/40" />
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-6 w-1 rounded-full bg-slate-400" />
                    <span className="h-5 w-1 rounded-full bg-primary/30" />
                </div>
            </div>
            <Sparkles className="absolute right-10 top-10 h-4 w-4 text-primary/50" />
            <div className="absolute bottom-6 right-20 h-px w-52 rotate-[-5deg] border-t border-dashed border-slate-300" />
        </div>
    );
}

function TicketCardLeftGraphic() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            <div className="absolute left-0 top-0 h-full w-24 bg-linear-to-r from-slate-50/80 via-slate-50/35 to-transparent" />
            <div className="absolute -left-14 -top-10 h-32 w-32 rotate-12 rounded-[1.75rem] border border-primary/10 bg-primary/8" />
            <div className="absolute -bottom-12 left-18 h-24 w-36 -rotate-6 rounded-2xl border border-slate-200/70 bg-white/55" />
            <div className="absolute bottom-5 left-7 flex h-9 items-end gap-1.5 opacity-70">
                <span className="h-4 w-1.5 rounded-full bg-slate-300" />
                <span className="h-8 w-1.5 rounded-full bg-slate-400" />
                <span className="h-5 w-1.5 rounded-full bg-primary/35" />
                <span className="h-7 w-1.5 rounded-full bg-slate-300" />
                <span className="h-4 w-1.5 rounded-full bg-primary/25" />
            </div>
            <div className="absolute left-36 top-8 h-px w-36 rotate-[-6deg] border-t border-dashed border-slate-300/80" />
        </div>
    );
}

function TicketCard({ item }: { item: MyTicketListItem }) {
    const status = getStatusPresentation(item.status);
    const StatusIcon = status.Icon;

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/5">
            <div
                className={`absolute inset-y-0 left-0 w-1.5 ${status.dotClassName}`}
                aria-hidden="true"
            />
            <TicketCardDoodle />
            <div className="relative z-10 grid gap-0 lg:grid-cols-[1fr_280px]">
                <div className="relative overflow-hidden p-4 pl-8 sm:p-5 sm:pl-10">
                    <TicketCardLeftGraphic />
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    <span
                                        className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                                    />
                                    E-ticket
                                </div>
                                <Link
                                    href={`/user/my-ticket/${item.id}`}
                                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                    <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-950 transition-colors hover:text-primary">
                                        {item.event_title || "Event"}
                                    </h2>
                                </Link>
                            </div>
                            <Badge
                                variant="outline"
                                className={`w-fit shrink-0 gap-1.5 rounded-lg px-2.5 py-1 ${status.badgeClassName}`}
                            >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {status.label}
                            </Badge>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Peserta
                                </p>
                                <div className="flex min-w-0 items-center gap-2">
                                    <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                        {item.participant_name || "-"}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Terbit
                                </p>
                                <div className="flex min-w-0 items-center gap-2">
                                    <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                        {formatDateTime(item.issued_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Kode
                                </p>
                                <div className="flex min-w-0 items-center gap-2">
                                    <Hash className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate font-mono text-xs">
                                        {item.ticket_number || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative flex flex-col gap-4 border-t border-dashed border-slate-200 bg-white/70 p-4 backdrop-blur-[2px] lg:border-l lg:border-t-0 lg:bg-slate-50/80 lg:p-5">
                    <div className="pointer-events-none absolute -left-3 top-5 hidden h-6 w-6 rounded-full border border-slate-200 bg-white lg:block" />
                    <div className="pointer-events-none absolute -left-3 bottom-5 hidden h-6 w-6 rounded-full border border-slate-200 bg-white lg:block" />

                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            <TicketIcon className="h-4 w-4 text-primary" />
                            Akses masuk
                        </div>
                        <p className="truncate text-lg font-semibold text-slate-950">
                            {item.ticket_category_name || "Kategori tiket"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Buka QR saat berada di gate check-in.
                        </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:mt-auto lg:grid-cols-1">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="brand"
                                    className="h-10 rounded-lg"
                                    disabled={!item.qr_code}
                                >
                                    <QrCode className="h-4 w-4" />
                                    Tampilkan QR
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm rounded-2xl border-slate-200 p-0">
                                <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
                                    <DialogTitle className="line-clamp-1 text-base">
                                        QR Ticket
                                    </DialogTitle>
                                    <DialogDescription className="line-clamp-2">
                                        {item.event_title || "Event"}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="px-5 pb-5 pt-4 text-center">
                                    <QRCodeDisplay
                                        value={item.qr_code}
                                        size={260}
                                        className="w-full"
                                    />
                                    <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">
                                        {item.ticket_number || "-"}
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            asChild
                            variant="outline"
                            className="h-10 rounded-lg border-slate-200 bg-white"
                        >
                            <Link href={`/user/my-ticket/${item.id}`}>
                                Detail tiket
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}
function TicketSkeletonList() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[1fr_280px]"
                >
                    <div className="space-y-4 p-4 sm:p-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-100" />
                        <div className="grid gap-2 md:grid-cols-3">
                            <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                            <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                            <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                        </div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 bg-slate-50/70 p-4 lg:border-l lg:border-t-0 lg:p-5">
                        <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                        <div className="mt-3 h-5 w-28 animate-pulse rounded-md bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TicketPageFallback() {
    return (
        <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-4 h-8 w-52 animate-pulse rounded-lg bg-slate-100" />
                </div>
                <TicketSkeletonList />
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
    const selectedStatusOption =
        STATUS_OPTIONS.find((option) => option.value === selectedStatus) ??
        STATUS_OPTIONS[0];
    const hasFilters = selectedStatus !== "all" || Boolean(eventId);

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
        if (pagination.total_items <= 0) return "Tidak ada tiket ditampilkan.";

        const start = (safePage - 1) * limit + 1;
        const end = Math.min(safePage * limit, pagination.total_items);
        return `${start}-${end} dari ${pagination.total_items} tiket`;
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
            <div className="mx-auto w-full max-w-6xl space-y-5">
                <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
                    <TicketWalletDoodle />
                    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                                Ticket wallet
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                                Tiket Saya
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                Buka e-ticket, cek status check-in, dan temukan
                                QR sebelum masuk ke lokasi event.
                            </p>
                        </div>
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 w-fit rounded-lg border-slate-200 bg-white text-slate-700 hover:border-primary/25 hover:bg-slate-50 hover:text-slate-950"
                                onClick={() =>
                                    setReloadCount((current) => current + 1)
                                }
                                disabled={isLoading}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {STATUS_OPTIONS.map((option) => {
                                const isActive =
                                    option.value === selectedStatus;
                                return (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={isActive ? "brand" : "ghost"}
                                        className={`h-9 shrink-0 rounded-lg px-4 ${
                                            isActive
                                                ? ""
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                        onClick={() =>
                                            handleStatusChange(option.value)
                                        }
                                    >
                                        <span className="hidden sm:inline">
                                            {option.label}
                                        </span>
                                        <span className="sm:hidden">
                                            {option.shortLabel}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>

                        <form
                            onSubmit={handleFilterSubmit}
                            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-[420px]"
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={eventIdInput}
                                    onChange={(event) =>
                                        setEventIdInput(event.target.value)
                                    }
                                    placeholder="Cari dengan kode event"
                                    className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="h-10 rounded-lg border-slate-200 bg-white"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </form>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span>{summaryText}</span>
                            {hasFilters ? (
                                <>
                                    <span className="hidden text-slate-300 sm:inline">
                                        |
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-primary/15 bg-primary/5 text-primary"
                                    >
                                        {selectedStatusOption.label}
                                    </Badge>
                                    {eventId ? (
                                        <Badge
                                            variant="outline"
                                            className="max-w-full rounded-full border-slate-200 bg-slate-50 text-slate-600"
                                        >
                                            <span className="truncate">
                                                Kode event: {eventId}
                                            </span>
                                        </Badge>
                                    ) : null}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 rounded-lg px-2 text-slate-500 hover:text-slate-900"
                                        onClick={clearFilters}
                                    >
                                        Reset
                                    </Button>
                                </>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="ticket-limit"
                                className="text-sm text-slate-500"
                            >
                                Per halaman
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
                </section>

                <section className="space-y-3">
                    {isLoading ? <TicketSkeletonList /> : null}

                    {!isLoading && errorMessage ? (
                        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm shadow-slate-900/5">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-base font-semibold text-slate-950">
                                {errorCode === "INVALID_INPUT"
                                    ? "Filter tidak valid"
                                    : "Tiket gagal dimuat"}
                            </p>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                {errorMessage}
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg"
                                    onClick={() =>
                                        setReloadCount((current) => current + 1)
                                    }
                                >
                                    Coba Lagi
                                </Button>
                                {errorCode === "INVALID_INPUT" ? (
                                    <Button
                                        type="button"
                                        className="rounded-lg"
                                        onClick={clearFilters}
                                    >
                                        Reset Filter
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && items.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <WalletCards className="h-7 w-7" />
                            </div>
                            <p className="mt-4 text-base font-semibold text-slate-950">
                                {hasFilters
                                    ? "Tidak ada tiket yang cocok"
                                    : "Belum ada tiket"}
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {hasFilters
                                    ? "Coba ubah status atau hapus kode event untuk melihat tiket lainnya."
                                    : "Tiket Anda akan muncul di sini setelah pembelian berhasil."}
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                {hasFilters ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-lg"
                                        onClick={clearFilters}
                                    >
                                        Reset Filter
                                    </Button>
                                ) : null}
                                <Button asChild className="rounded-lg">
                                    <Link href="/">
                                        Cari Event
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && items.length > 0 ? (
                        <>
                            {items.map((item) => (
                                <TicketCard key={item.id} item={item} />
                            ))}

                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg"
                                    disabled={safePage <= 1}
                                    onClick={() =>
                                        applyQuery({
                                            page: String(
                                                Math.max(safePage - 1, 1),
                                            ),
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
                                    className="rounded-lg"
                                    disabled={safePage >= totalPages}
                                    onClick={() =>
                                        applyQuery({
                                            page: String(
                                                Math.min(
                                                    safePage + 1,
                                                    totalPages,
                                                ),
                                            ),
                                        })
                                    }
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

export default function MyTicketPage() {
    return (
        <Suspense fallback={<TicketPageFallback />}>
            <MyTicketPageContent />
        </Suspense>
    );
}
