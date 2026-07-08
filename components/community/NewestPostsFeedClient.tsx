"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import {
    Heart,
    Shuffle,
    Loader2,
    MessageCircle,
    RefreshCw,
    Search,
    UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CommunityService } from "@/services/community-service";
import type { Post } from "@/types/community";
import PublicPostCard, {
    getAuthorLabel,
    getCommunityLabel,
} from "./PublicPostCard";

const FEED_LIMIT = 20;

type ApiErrorBody = {
    message?: string;
    error_code?: string;
    errors?: unknown[];
};

type FeedMode = "random" | "followed";
type PostFilter = "all" | "announcement" | "text";

const feedModeOptions: Array<{ value: FeedMode; label: string }> = [
    { value: "random", label: "Acak" },
    { value: "followed", label: "Diikuti" },
];

const filterOptions: Array<{ value: PostFilter; label: string }> = [
    { value: "all", label: "Semua" },
    { value: "announcement", label: "Pengumuman" },
    { value: "text", label: "Diskusi" },
];

const numberFormatter = new Intl.NumberFormat("id-ID");
const formatNumber = (value: number) => numberFormatter.format(value || 0);

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    return (
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : fallback)
    );
};

const isInvalidCursorError = (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const errorCode =
        axiosError.response?.data?.error_code?.toLowerCase() ?? "";
    const message = axiosError.response?.data?.message?.toLowerCase() ?? "";

    return errorCode.includes("cursor") || message.includes("cursor");
};

const shufflePosts = (items: Post[]) => {
    const shuffled = [...items];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const targetIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[targetIndex]] = [
            shuffled[targetIndex],
            shuffled[index],
        ];
    }

    return shuffled;
};

const dedupePosts = (items: Post[]) => {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
};

function LoadingCard() {
    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-5 h-6 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-4 space-y-3">
                <div className="h-4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="mt-5 h-40 animate-pulse rounded-xl bg-slate-100" />
        </article>
    );
}

export default function NewestPostsFeedClient() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [communityQuery, setCommunityQuery] = useState("");
    const [feedMode, setFeedMode] = useState<FeedMode>("random");
    const [activeType, setActiveType] = useState<PostFilter>("all");
    const isFetchingRef = useRef(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadFirstPage = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setIsInitialLoading(true);
        setErrorMessage(null);

        try {
            const result = await (feedMode === "followed"
                ? CommunityService.getFollowedPosts({ limit: FEED_LIMIT })
                : CommunityService.getNewestPosts({ limit: FEED_LIMIT }));
            setPosts(
                dedupePosts(
                    feedMode === "random"
                        ? shufflePosts(result.items)
                        : result.items,
                ),
            );
            setNextCursor(result.next_cursor);
            setHasMore(Boolean(result.next_cursor));
        } catch (error) {
            setPosts([]);
            setNextCursor(null);
            setHasMore(false);
            setErrorMessage(
                getApiErrorMessage(
                    error,
                    feedMode === "followed"
                        ? "Gagal mengambil post dari komunitas yang diikuti."
                        : "Gagal mengambil post acak.",
                ),
            );
        } finally {
            isFetchingRef.current = false;
            setIsInitialLoading(false);
        }
    }, [feedMode]);

    const resetAfterInvalidCursor = useCallback(async () => {
        toast.error("Feed berubah. Memuat ulang dari awal.");
        setPosts([]);
        setNextCursor(null);
        setHasMore(true);

        const result = await (feedMode === "followed"
            ? CommunityService.getFollowedPosts({ limit: FEED_LIMIT })
            : CommunityService.getNewestPosts({ limit: FEED_LIMIT }));
        setPosts(
            dedupePosts(
                feedMode === "random"
                    ? shufflePosts(result.items)
                    : result.items,
            ),
        );
        setNextCursor(result.next_cursor);
        setHasMore(Boolean(result.next_cursor));
    }, [feedMode]);

    const loadMore = useCallback(async () => {
        if (isFetchingRef.current || !hasMore || !nextCursor) return;
        isFetchingRef.current = true;
        setIsLoadingMore(true);

        try {
            const result = await (feedMode === "followed"
                ? CommunityService.getFollowedPosts({
                      limit: FEED_LIMIT,
                      cursor: nextCursor,
                  })
                : CommunityService.getNewestPosts({
                      limit: FEED_LIMIT,
                      cursor: nextCursor,
                  }));

            setPosts((current) =>
                dedupePosts([
                    ...current,
                    ...(feedMode === "random"
                        ? shufflePosts(result.items)
                        : result.items),
                ]),
            );
            setNextCursor(result.next_cursor);
            setHasMore(Boolean(result.next_cursor));
        } catch (error) {
            if (isInvalidCursorError(error)) {
                try {
                    await resetAfterInvalidCursor();
                } catch (resetError) {
                    setErrorMessage(
                        getApiErrorMessage(
                            resetError,
                            "Gagal memuat ulang feed.",
                        ),
                    );
                    setHasMore(false);
                }
                return;
            }

            toast.error(
                getApiErrorMessage(error, "Gagal memuat post lainnya."),
            );
        } finally {
            isFetchingRef.current = false;
            setIsLoadingMore(false);
        }
    }, [feedMode, hasMore, nextCursor, resetAfterInvalidCursor]);

    useEffect(() => {
        void loadFirstPage();
    }, [loadFirstPage]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasMore || isInitialLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void loadMore();
                }
            },
            { rootMargin: "420px 0px" },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [hasMore, isInitialLoading, loadMore]);

    const topCommunities = Array.from(
        posts.reduce((map, post) => {
            const current = map.get(post.community_id);
            map.set(post.community_id, {
                id: post.community_id,
                slug: post.community_slug ?? null,
                label: getCommunityLabel(post),
                count: (current?.count ?? 0) + 1,
            });
            return map;
        }, new Map<
            string,
            { id: string; slug: string | null; label: string; count: number }
        >()),
    )
        .map(([, community]) => community)
        .sort((a, b) => b.count - a.count);

    const normalizedCommunityQuery = communityQuery.trim().toLowerCase();
    const visibleTopCommunities = topCommunities
        .filter((community) =>
            community.label.toLowerCase().includes(normalizedCommunityQuery),
        )
        .slice(0, 5);

    const normalizedQuery = query.trim().toLowerCase();
    const filteredPosts = posts.filter((post) => {
        const matchesType =
            activeType === "all" ||
            (activeType === "announcement"
                ? post.post_type === "announcement"
                : post.post_type !== "announcement");
        const matchesQuery =
            !normalizedQuery ||
            post.title.toLowerCase().includes(normalizedQuery) ||
            post.body.toLowerCase().includes(normalizedQuery) ||
            getCommunityLabel(post).toLowerCase().includes(normalizedQuery) ||
            getAuthorLabel(post).toLowerCase().includes(normalizedQuery);

        return matchesType && matchesQuery;
    });

    return (
        <main className="relative min-h-[calc(100vh-76px)] overflow-hidden bg-[#f9fafb] px-4 pb-24 pt-28 sm:px-6 lg:px-8">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px), linear-gradient(45deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
                    backgroundSize: "34px 34px, 56px 56px",
                    opacity: 0.55,
                }}
            />
            <div
                className="pointer-events-none absolute left-0 top-32 hidden h-96 w-60 text-primary lg:block"
                aria-hidden="true"
            >
                <svg
                    viewBox="0 0 320 540"
                    fill="none"
                    className="h-full w-full"
                >
                    <path
                        d="M24 78H136M24 118H98M24 158H168M24 198H122"
                        stroke="currentColor"
                        strokeOpacity="0.07"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M128 84L218 142L162 220L260 294L188 384"
                        stroke="currentColor"
                        strokeOpacity="0.07"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <rect
                        x="202"
                        y="126"
                        width="34"
                        height="34"
                        rx="9"
                        fill="currentColor"
                        fillOpacity="0.07"
                    />
                    <rect
                        x="145"
                        y="203"
                        width="34"
                        height="34"
                        rx="9"
                        fill="#10b981"
                        fillOpacity="0.09"
                    />
                    <rect
                        x="243"
                        y="276"
                        width="34"
                        height="34"
                        rx="9"
                        fill="currentColor"
                        fillOpacity="0.06"
                    />
                    <rect
                        x="171"
                        y="367"
                        width="34"
                        height="34"
                        rx="9"
                        fill="#10b981"
                        fillOpacity="0.08"
                    />
                </svg>
            </div>
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 lg:gap-6">
                <header className="relative hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5 sm:p-6 lg:block">
                    <div
                        className="pointer-events-none absolute right-0 top-0 hidden h-full w-72 text-primary md:block"
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 360 220"
                            fill="none"
                            className="h-full w-full"
                        >
                            <path
                                d="M94 42H278C294 42 306 54 306 70V150C306 166 294 178 278 178H94C78 178 66 166 66 150V70C66 54 78 42 94 42Z"
                                stroke="currentColor"
                                strokeOpacity="0.1"
                                strokeWidth="10"
                            />
                            <path
                                d="M126 76H248M126 110H286M126 144H214"
                                stroke="currentColor"
                                strokeOpacity="0.1"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M82 70H54M82 96H54M82 122H54M82 148H54"
                                stroke="#10b981"
                                strokeOpacity="0.12"
                                strokeWidth="7"
                                strokeLinecap="round"
                            />
                            <rect
                                x="250"
                                y="132"
                                width="34"
                                height="34"
                                rx="9"
                                fill="#10b981"
                                fillOpacity="0.1"
                            />
                            <rect
                                x="286"
                                y="70"
                                width="22"
                                height="22"
                                rx="7"
                                fill="currentColor"
                                fillOpacity="0.08"
                            />
                        </svg>
                    </div>

                    <div
                        className="pointer-events-none absolute bottom-5 right-10 hidden h-16 w-24 text-primary md:block"
                        aria-hidden="true"
                    >
                        <svg
                            viewBox="0 0 128 96"
                            fill="none"
                            className="h-full w-full"
                        >
                            <path
                                d="M14 24H84C100 24 114 38 114 54C114 70 100 82 82 82H56L36 92V82H24C14 82 6 74 6 64V32C6 28 10 24 14 24Z"
                                stroke="currentColor"
                                strokeOpacity="0.12"
                                strokeWidth="6"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M30 44H86M30 60H70"
                                stroke="#10b981"
                                strokeOpacity="0.16"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                            <rect
                                x="92"
                                y="8"
                                width="20"
                                height="20"
                                rx="6"
                                fill="currentColor"
                                fillOpacity="0.08"
                            />
                        </svg>
                    </div>

                    <div className="relative max-w-3xl">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Ruang komunitas
                        </p>
                        <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
                            Post terbaru dari komunitas
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                            Ikuti diskusi dan pengumuman dari komunitas event
                            yang aktif di Kumpul.in.
                        </p>
                    </div>
                </header>
                <div className="lg:hidden">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                        Ruang komunitas
                    </p>
                    <h1 className="mt-1 text-2xl font-bold leading-[1.12] text-slate-950">
                        Komunitas
                    </h1>
                </div>
                <div className="sticky top-16 z-30 -mx-4 border-y border-slate-200/80 bg-white/95 px-4 py-2 shadow-sm shadow-slate-900/5 backdrop-blur lg:hidden">
                    <div className="mx-auto grid max-w-sm grid-cols-2 rounded-xl bg-slate-100 p-1">
                        {feedModeOptions.map((option) => {
                            const active = feedMode === option.value;
                            const Icon =
                                option.value === "random" ? Shuffle : Heart;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setFeedMode(option.value);
                                        setQuery("");
                                        setActiveType("all");
                                    }}
                                    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition ${
                                        active
                                            ? "bg-primary text-white shadow-sm shadow-primary/20"
                                            : "text-slate-500 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-4 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="flex min-w-0 flex-col gap-5">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                            <div
                                className="pointer-events-none absolute right-0 top-0 hidden h-full w-40 text-primary sm:block"
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 208 96"
                                    fill="none"
                                    className="h-full w-full"
                                >
                                    <path
                                        d="M86 24H174M104 48H194M130 72H178"
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="7"
                                        strokeLinecap="round"
                                    />
                                    <path
                                        d="M24 24H56V72H24V24Z"
                                        stroke="#10b981"
                                        strokeOpacity="0.12"
                                        strokeWidth="6"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M40 22V74"
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        Feed komunitas
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {isInitialLoading
                                            ? "Memuat post terbaru."
                                            : `${formatNumber(filteredPosts.length)} dari ${formatNumber(posts.length)} post ditampilkan.`}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 md:items-end">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                value={query}
                                                onChange={(event) =>
                                                    setQuery(event.target.value)
                                                }
                                                placeholder="Cari post"
                                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20 sm:w-56"
                                            />
                                        </div>
                                        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                            {filterOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveType(
                                                            option.value,
                                                        )
                                                    }
                                                    className={`h-8 rounded-lg px-3 text-xs font-semibold transition hover:cursor-pointer ${
                                                        activeType ===
                                                        option.value
                                                            ? "bg-white text-primary shadow-sm"
                                                            : "text-slate-500 hover:text-slate-900"
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isInitialLoading ? (
                            <>
                                <LoadingCard />
                                <LoadingCard />
                            </>
                        ) : null}

                        {!isInitialLoading && errorMessage ? (
                            <section className="rounded-2xl border border-danger/20 bg-white px-6 py-10 text-center shadow-sm shadow-slate-900/5">
                                <h2 className="text-base font-semibold text-slate-950">
                                    Feed belum dapat dimuat
                                </h2>
                                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                                    {errorMessage}
                                </p>
                                <Button
                                    className="mt-6 h-10 rounded-xl text-sm font-semibold"
                                    onClick={loadFirstPage}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Coba Lagi
                                </Button>
                            </section>
                        ) : null}

                        {!isInitialLoading &&
                        !errorMessage &&
                        posts.length === 0 ? (
                            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm shadow-slate-900/5">
                                <MessageCircle className="mx-auto h-7 w-7 text-primary" />
                                <h2 className="mt-4 text-base font-semibold text-slate-900">
                                    Belum ada post komunitas
                                </h2>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Post terbaru akan muncul di sini setelah
                                    komunitas mulai berdiskusi.
                                </p>
                            </section>
                        ) : null}

                        {!isInitialLoading &&
                        !errorMessage &&
                        posts.length > 0 &&
                        filteredPosts.length === 0 ? (
                            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm shadow-slate-900/5">
                                <Search className="mx-auto h-7 w-7 text-primary" />
                                <h2 className="mt-4 text-base font-semibold text-slate-900">
                                    Tidak ada post yang cocok
                                </h2>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                    Ubah kata kunci atau filter untuk melihat
                                    post lainnya.
                                </p>
                            </section>
                        ) : null}

                        {filteredPosts.map((post) => (
                            <PublicPostCard key={post.id} post={post} showCommunityMeta />
                        ))}

                        <div ref={sentinelRef} className="h-1" />

                        {!isInitialLoading && !errorMessage && hasMore ? (
                            <div className="flex justify-center pb-8 pt-2">
                                <Button
                                    variant="outline"
                                    disabled={isLoadingMore}
                                    onClick={loadMore}
                                    className="h-10 rounded-xl border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                >
                                    {isLoadingMore ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isLoadingMore
                                        ? "Memuat..."
                                        : "Muat lebih banyak"}
                                </Button>
                            </div>
                        ) : null}

                        {!isInitialLoading &&
                        !errorMessage &&
                        posts.length > 0 &&
                        !hasMore ? (
                            <p className="pb-8 text-center text-sm font-medium text-slate-400">
                                Semua post terbaru sudah ditampilkan.
                            </p>
                        ) : null}
                    </section>

                    <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start lg:space-y-5">
                        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                            <div
                                className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 text-primary"
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 96 96"
                                    fill="none"
                                    className="h-full w-full"
                                >
                                    <path
                                        d="M18 30H66M30 50H78M18 70H54"
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="7"
                                        strokeLinecap="round"
                                    />
                                    <rect
                                        x="62"
                                        y="16"
                                        width="18"
                                        height="18"
                                        rx="6"
                                        fill="#10b981"
                                        fillOpacity="0.1"
                                    />
                                </svg>
                            </div>
                            <div className="relative">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                    Mode feed
                                </p>
                                <div
                                    className="relative mt-3 grid h-11 grid-cols-2 rounded-xl border border-primary/15 bg-primary-light/70 p-1 shadow-sm shadow-primary/5"
                                    aria-label="Mode feed"
                                >
                                    <span
                                        className={`pointer-events-none absolute left-1 top-1 h-9 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-sm shadow-primary/20 transition-transform duration-200 ease-out ${
                                            feedMode === "followed"
                                                ? "translate-x-full"
                                                : "translate-x-0"
                                        }`}
                                    />
                                    {feedModeOptions.map((option) => {
                                        const active =
                                            feedMode === option.value;
                                        const Icon =
                                            option.value === "random"
                                                ? Shuffle
                                                : Heart;

                                        return (
                                            <span
                                                key={option.value}
                                                className={`pointer-events-none relative z-10 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                                                    active
                                                        ? "text-white"
                                                        : "text-primary"
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5" />
                                                {option.label}
                                            </span>
                                        );
                                    })}
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={1}
                                        value={feedMode === "followed" ? 1 : 0}
                                        aria-label="Mode feed"
                                        aria-valuetext={
                                            feedMode === "followed"
                                                ? "Diikuti"
                                                : "Acak"
                                        }
                                        onChange={(event) => {
                                            const nextMode =
                                                event.target.value === "1"
                                                    ? "followed"
                                                    : "random";

                                            if (nextMode === feedMode) return;

                                            setFeedMode(nextMode);
                                            setQuery("");
                                            setActiveType("all");
                                        }}
                                        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                                    />
                                </div>
                            </div>
                        </section>
                        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                            <div
                                className="pointer-events-none absolute -right-4 -top-3 h-24 w-24 text-primary"
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 128 128"
                                    fill="none"
                                    className="h-full w-full"
                                >
                                    <path
                                        d="M28 34H94M40 62H108M24 90H78"
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                    />
                                    <rect
                                        x="82"
                                        y="22"
                                        width="22"
                                        height="22"
                                        rx="7"
                                        fill="#10b981"
                                        fillOpacity="0.1"
                                    />
                                    <rect
                                        x="26"
                                        y="74"
                                        width="22"
                                        height="22"
                                        rx="7"
                                        fill="currentColor"
                                        fillOpacity="0.07"
                                    />
                                </svg>
                            </div>
                            <div className="relative flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                                    <UsersRound className="h-4 w-4" />
                                </span>
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        Komunitas aktif
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Berdasarkan feed terbaru.
                                    </p>
                                </div>
                            </div>
                            <div className="relative mt-4">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={communityQuery}
                                        onChange={(event) =>
                                            setCommunityQuery(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Cari komunitas"
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                                    />
                                </div>
                                <div className="mt-3 space-y-2">
                                    {visibleTopCommunities.length ? (
                                        visibleTopCommunities.map(
                                            (community) => (
                                                <Link
                                                    key={community.id}
                                                    href={
                                                        community.slug
                                                            ? "/k/" + community.slug
                                                            : "/komunitas/" + community.id
                                                    }
                                                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 transition hover:border-primary/30 hover:bg-white"
                                                >
                                                    <span className="min-w-0 truncate text-sm font-medium text-slate-950">
                                                        {community.label}
                                                    </span>
                                                    <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                        {formatNumber(
                                                            community.count,
                                                        )}
                                                    </span>
                                                </Link>
                                            ),
                                        )
                                    ) : (
                                        <p className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm text-slate-500">
                                            {topCommunities.length
                                                ? "Tidak ada komunitas yang cocok."
                                                : "Komunitas aktif akan tampil setelah feed dimuat."}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <Button
                                        asChild
                                        className="h-10 w-full rounded-xl text-sm font-semibold"
                                    >
                                        <Link href="/komunitas/explore">
                                            <Search className="h-4 w-4" />
                                            Jelajahi Semua Komunitas
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-primary/15 bg-primary-light/70 p-4 shadow-sm shadow-slate-900/5">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                Ringkas
                            </p>
                            <h2 className="mt-2 text-base font-semibold text-slate-950">
                                Cari percakapan sebelum memilih komunitas.
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Gunakan filter untuk membedakan pengumuman resmi
                                dan diskusi anggota.
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    );
}
