"use client";

import Link from "next/link";
import {
    type FormEvent,
    Suspense,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Heart,
    ImageOff,
    Loader2,
    MapPin,
    RefreshCw,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { APPROVED_EVENT_CATEGORIES } from "@/constants/event-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import {
    UserService,
    type WishlistedEventItem,
    type WishlistMeta,
} from "@/services/user-service";

const DEFAULT_META: WishlistMeta = {
    page: 1,
    limit: 20,
    total: 0,
};

const TYPE_OPTIONS = [
    { label: "Semua tipe", value: "" },
    { label: "External", value: "external" },
    { label: "Internal", value: "internal" },
];

const STATUS_OPTIONS = [
    { label: "Semua status", value: "" },
    { label: "Published", value: "published" },
    { label: "Draft", value: "draft" },
    { label: "Archived", value: "archived" },
    { label: "Cancelled", value: "cancelled" },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const parsePositiveInt = (value: string | null, fallback: number) => {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeLimit = (value: number) => Math.min(Math.max(value, 1), 100);

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

const formatDateTime = (value?: string | null) => {
    if (!value) return "-";

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

const formatDateShort = (value?: string | null) => {
    if (!value) return { day: "--", month: "---", year: "----" };

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return { day: "--", month: "---", year: "----" };
    }

    return {
        day: new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(date),
        month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(date),
        year: new Intl.DateTimeFormat("id-ID", { year: "numeric" }).format(date),
    };
};

const formatPrice = (value: number, currency: string) => {
    if (value <= 0) return "Gratis";
    if (currency === "IDR") return formatCurrency(value);

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
};

const getEventHref = (event: WishlistedEventItem) =>
    `/events/${event.slug || event.event_id}`;

function WishlistDoodle() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] overflow-hidden opacity-90 lg:block"
        >
            <div className="absolute -right-14 -top-12 h-48 w-48 rounded-full bg-primary/5" />
            <div className="absolute right-14 top-8 h-24 w-52 -rotate-3 rounded-3xl border border-primary/15 bg-white/70 shadow-sm" />
            <div className="absolute right-30 top-14 flex h-14 w-14 rotate-6 items-center justify-center rounded-2xl bg-danger-light text-danger">
                <Heart className="h-7 w-7 fill-current" />
            </div>
            <div className="absolute bottom-7 right-15 h-px w-52 rotate-[-7deg] border-t border-dashed border-slate-300" />
            <div className="absolute bottom-10 right-40 h-18 w-30 rotate-6 rounded-2xl border border-slate-200 bg-slate-50/80" />
        </div>
    );
}

function WishlistPageFallback() {
    return (
        <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-4 w-36 animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-3 h-8 w-60 animate-pulse rounded-lg bg-slate-100" />
                    <div className="mt-3 h-4 w-full max-w-lg animate-pulse rounded-full bg-slate-100" />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="grid gap-3 md:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-10 animate-pulse rounded-xl bg-slate-100"
                            />
                        ))}
                    </div>
                </div>
                <WishlistSkeletonList />
            </div>
        </main>
    );
}

function WishlistSkeletonList() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[220px_1fr]"
                >
                    <div className="h-48 animate-pulse bg-slate-100 md:h-full" />
                    <div className="space-y-4 p-4 sm:p-5">
                        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-6 w-3/4 animate-pulse rounded-lg bg-slate-100" />
                        <div className="grid gap-2 md:grid-cols-3">
                            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function WishlistEventImage({ event }: { event: WishlistedEventItem }) {
    const [hasError, setHasError] = useState(false);

    if (!event.poster_url || hasError) {
        return (
            <div className="flex h-full min-h-48 flex-col items-center justify-center bg-slate-100 text-slate-400">
                <ImageOff className="h-8 w-8" />
                <span className="mt-2 text-xs font-semibold">
                    Poster tidak tersedia
                </span>
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={event.poster_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
        />
    );
}

function WishlistEventRow({
    event,
    isRemoving,
    onRemove,
}: {
    event: WishlistedEventItem;
    isRemoving: boolean;
    onRemove: () => void;
}) {
    const date = formatDateShort(event.event_start_at);
    const isOpen = event.is_registration_open;

    return (
        <article className="group relative grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:border-primary/25 hover:shadow-md hover:shadow-slate-900/5 md:grid-cols-[220px_1fr]">
            <Link
                href={getEventHref(event)}
                className="relative block min-h-48 overflow-hidden bg-slate-100"
            >
                <WishlistEventImage event={event} />
                <div className="absolute left-4 top-4 flex w-15 flex-col items-center rounded-2xl bg-white/95 p-2 text-center shadow-sm backdrop-blur">
                    <span className="text-xl font-bold leading-none text-primary">
                        {date.day}
                    </span>
                    <span className="mt-1 text-[10px] font-semibold uppercase text-slate-500">
                        {date.month}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                        {date.year}
                    </span>
                </div>
            </Link>

            <div className="relative flex min-w-0 flex-col gap-4 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full border border-danger/15 bg-danger-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-danger">
                                Wishlisted
                            </span>
                            <span
                                className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                                    isOpen
                                        ? "bg-success-light text-success-hover"
                                        : "bg-slate-100 text-slate-500",
                                )}
                            >
                                {isOpen ? "Registrasi buka" : "Registrasi tutup"}
                            </span>
                        </div>

                        <Link
                            href={getEventHref(event)}
                            className="mt-3 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                            <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-950 transition-colors hover:text-primary">
                                {event.title}
                            </h2>
                        </Link>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-xl border-danger/20 text-danger hover:bg-danger-light hover:text-danger"
                        disabled={isRemoving}
                        onClick={onRemove}
                        aria-label={`Hapus ${event.title} dari wishlist`}
                    >
                        {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Jadwal
                        </p>
                        <div className="flex min-w-0 items-center gap-2">
                            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="truncate">
                                {formatDateTime(event.event_start_at)}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Lokasi
                        </p>
                        <div className="flex min-w-0 items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="truncate">
                                {event.location_label || "-"}
                            </span>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Harga mulai
                        </p>
                        <p className="truncate font-semibold text-slate-950">
                            {formatPrice(event.price_from ?? 0, event.currency || "IDR")}
                        </p>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-slate-500">
                        Disimpan {formatDateTime(event.wishlisted_at)}
                    </p>
                    <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:border-primary/30 hover:text-primary"
                    >
                        <Link href={getEventHref(event)}>
                            Lihat event
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}

function EmptyWishlistState({
    hasFilters,
    onReset,
}: {
    hasFilters: boolean;
    onReset: () => void;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-light text-danger">
                {hasFilters ? (
                    <Search className="h-8 w-8" />
                ) : (
                    <Heart className="h-8 w-8" />
                )}
            </div>
            <p className="mt-5 text-lg font-semibold text-slate-950">
                {hasFilters
                    ? "Event wishlist tidak ditemukan"
                    : "Wishlist masih kosong"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {hasFilters
                    ? "Coba ubah kata kunci, kategori, tipe, atau status untuk melihat event lain."
                    : "Simpan event yang menarik agar mudah ditemukan sebelum membeli tiket."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
                {hasFilters ? (
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl border-slate-200"
                        onClick={onReset}
                    >
                        Reset filter
                    </Button>
                ) : null}
                <Button asChild className="rounded-xl">
                    <Link href="/events">
                        Jelajahi event
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}

function WishlistPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = normalizeLimit(parsePositiveInt(searchParams.get("limit"), 20));
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category")?.trim() ?? "";
    const type = searchParams.get("type")?.trim() ?? "";
    const status = searchParams.get("status")?.trim() ?? "";
    const [queryInput, setQueryInput] = useState(q);
    const [events, setEvents] = useState<WishlistedEventItem[]>([]);
    const [meta, setMeta] = useState<WishlistMeta>(DEFAULT_META);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);
    const [removingIds, setRemovingIds] = useState<string[]>([]);

    const hasFilters = Boolean(q || category || type || status);
    const totalPages = Math.max(Math.ceil((meta.total || 0) / limit), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);

    useEffect(() => {
        setQueryInput(q);
    }, [q]);

    useEffect(() => {
        let isMounted = true;

        const loadWishlist = async () => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const response = await UserService.getWishlistedEvents({
                    page,
                    limit,
                    q,
                    category,
                    type,
                    status,
                });

                if (!isMounted) return;
                setEvents(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Failed to fetch wishlisted events", error);
                if (!isMounted) return;
                setEvents([]);
                setMeta({ ...DEFAULT_META, page, limit });
                setErrorMessage("Gagal memuat wishlist event.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadWishlist();

        return () => {
            isMounted = false;
        };
    }, [page, limit, q, category, type, status, reloadCount]);

    const summaryText = useMemo(() => {
        if (meta.total <= 0) return "Tidak ada event ditampilkan.";

        const start = (safePage - 1) * limit + 1;
        const end = Math.min(safePage * limit, meta.total);
        return `${start}-${end} dari ${meta.total} event`;
    }, [limit, meta.total, safePage]);

    const applyQuery = (updates: Record<string, string | null>) => {
        const nextQuery = updateQueryString(
            new URLSearchParams(searchParams.toString()),
            updates,
        );
        router.replace(`/user/wishlist${nextQuery}`);
    };

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyQuery({ q: queryInput.trim() || null, page: "1" });
    };

    const clearFilters = () => {
        setQueryInput("");
        router.replace("/user/wishlist");
    };

    const handleRemove = async (eventId: string) => {
        setRemovingIds((current) => [...current, eventId]);

        try {
            await UserService.unwishlistEvent(eventId);
            setEvents((current) =>
                current.filter((item) => item.event_id !== eventId),
            );
            setMeta((current) => ({
                ...current,
                total: Math.max((current.total ?? 0) - 1, 0),
            }));
        } catch (error) {
            console.error(`Failed to remove event ${eventId} from wishlist`, error);
            setErrorMessage("Gagal menghapus event dari wishlist.");
        } finally {
            setRemovingIds((current) => current.filter((id) => id !== eventId));
        }
    };

    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.14,
                }}
            />
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                    <WishlistDoodle />
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-danger">
                                Event wishlist
                            </p>
                            <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                                Wishlist Saya
                            </h1>
                            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 md:text-sm">
                                Kumpulkan event incaran, cek jadwal, lalu lanjutkan
                                pembelian saat registrasi dibuka.
                            </p>
                        </div>
                        <div className="grid min-w-44 grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2">
                            <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm shadow-slate-900/5">
                                <p className="text-lg font-semibold leading-none text-danger">
                                    {meta.total}
                                </p>
                                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Total
                                </p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm shadow-slate-900/5">
                                <p className="text-lg font-semibold leading-none text-primary">
                                    {events.filter((item) => item.is_registration_open).length}
                                </p>
                                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                    Buka
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                    <form
                        onSubmit={handleFilterSubmit}
                        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px_160px_auto]"
                    >
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={queryInput}
                                onChange={(event) =>
                                    setQueryInput(event.target.value)
                                }
                                placeholder="Cari event wishlist"
                                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-9"
                            />
                            {queryInput ? (
                                <button
                                    type="button"
                                    onClick={() => setQueryInput("")}
                                    aria-label="Hapus pencarian"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            ) : null}
                        </div>

                        <select
                            value={category}
                            onChange={(event) =>
                                applyQuery({
                                    category: event.target.value || null,
                                    page: "1",
                                })
                            }
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Semua kategori</option>
                            {APPROVED_EVENT_CATEGORIES.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>

                        <select
                            value={type}
                            onChange={(event) =>
                                applyQuery({
                                    type: event.target.value || null,
                                    page: "1",
                                })
                            }
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {TYPE_OPTIONS.map((item) => (
                                <option key={item.value || "all"} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(event) =>
                                applyQuery({
                                    status: event.target.value || null,
                                    page: "1",
                                })
                            }
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {STATUS_OPTIONS.map((item) => (
                                <option key={item.value || "all"} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        <Button
                            type="submit"
                            variant="outline"
                            className="h-10 rounded-xl border-slate-200 bg-white"
                        >
                            Filter
                        </Button>
                    </form>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span>{summaryText}</span>
                            {hasFilters ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-lg px-2 text-slate-500 hover:text-slate-900"
                                    onClick={clearFilters}
                                >
                                    Reset filter
                                </Button>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <label
                                htmlFor="wishlist-limit"
                                className="text-sm text-slate-500"
                            >
                                Per halaman
                            </label>
                            <select
                                id="wishlist-limit"
                                value={String(limit)}
                                onChange={(event) =>
                                    applyQuery({
                                        limit: event.target.value,
                                        page: "1",
                                    })
                                }
                                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                {LIMIT_OPTIONS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9 rounded-xl border-slate-200 bg-white"
                                disabled={isLoading}
                                onClick={() =>
                                    setReloadCount((current) => current + 1)
                                }
                            >
                                <RefreshCw
                                    className={cn(
                                        "h-4 w-4",
                                        isLoading && "animate-spin",
                                    )}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    {isLoading ? <WishlistSkeletonList /> : null}

                    {!isLoading && errorMessage ? (
                        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm shadow-slate-900/5">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-base font-semibold text-slate-950">
                                Wishlist gagal dimuat
                            </p>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                {errorMessage}
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-5 rounded-xl border-slate-200"
                                onClick={() =>
                                    setReloadCount((current) => current + 1)
                                }
                            >
                                Coba lagi
                            </Button>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && events.length === 0 ? (
                        <EmptyWishlistState
                            hasFilters={hasFilters}
                            onReset={clearFilters}
                        />
                    ) : null}

                    {!isLoading && !errorMessage && events.length > 0 ? (
                        <>
                            {events.map((event) => (
                                <WishlistEventRow
                                    key={event.event_id}
                                    event={event}
                                    isRemoving={removingIds.includes(event.event_id)}
                                    onRemove={() => void handleRemove(event.event_id)}
                                />
                            ))}

                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-xl border-slate-200"
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
                                    className="rounded-xl border-slate-200"
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
                        </>
                    ) : null}
                </section>
            </div>
        </main>
    );
}

export default function WishlistPage() {
    return (
        <Suspense fallback={<WishlistPageFallback />}>
            <WishlistPageContent />
        </Suspense>
    );
}
