"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import {
    Loader2,
    MessageCircle,
    MoreHorizontal,
    RefreshCw,
    Share,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CommunityService } from "@/services/community-service";
import type { Post } from "@/types/community";
import PostImageCarousel from "./PostImageCarousel";

const FEED_LIMIT = 20;

type ApiErrorBody = {
    message?: string;
    error_code?: string;
    errors?: unknown[];
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    return (
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : fallback)
    );
};

const isInvalidCursorError = (error: unknown) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const errorCode = axiosError.response?.data?.error_code?.toLowerCase() ?? "";
    const message = axiosError.response?.data?.message?.toLowerCase() ?? "";

    return errorCode.includes("cursor") || message.includes("cursor");
};

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));

const formatNumber = (value: number) => new Intl.NumberFormat("id-ID").format(value);

const getCommunityLabel = (post: Post) =>
    post.organizer_name?.trim() || `Community ${post.community_id.slice(0, 8)}`;

const getAuthorLabel = (post: Post) =>
    post.author_name?.trim() || `User ${post.author_user_id}`;

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
        <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-6 h-7 w-3/4 animate-pulse rounded-full bg-slate-100" />
            <div className="mt-4 space-y-3">
                <div className="h-4 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            </div>
        </article>
    );
}

function FeedPostCard({ post }: { post: Post }) {
    const postHref = `/komunitas/${post.community_id}/post/${post.id}`;
    const communityHref = `/komunitas/${post.community_id}`;

    return (
        <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <Link
                                href={communityHref}
                                className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                            >
                                k/{getCommunityLabel(post)}
                            </Link>
                            <span className="text-xs font-medium text-slate-400">
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                            {getAuthorLabel(post)}
                        </p>
                    </div>
                    <button
                        className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                        aria-label="Opsi post"
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </button>
                </div>

                <Link href={postHref} className="group block">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {post.post_type === "announcement"
                                ? "Pengumuman"
                                : "Diskusi"}
                        </span>
                    </div>
                    <h2 className="mt-4 text-lg font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary sm:text-xl sm:leading-7">
                        {post.title}
                    </h2>
                    <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {post.body}
                    </p>
                </Link>

                <PostImageCarousel
                    imageUrls={post.image_urls}
                    href={postHref}
                    className="mt-0"
                    imageClassName="max-h-[460px]"
                />

                <div className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-5">
                    <Link
                        href={postHref}
                        className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary"
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span>{formatNumber(post.comment_count)} Komentar</span>
                    </Link>
                    <button className="group ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                        <Share className="h-5 w-5" />
                        <span>Bagikan</span>
                    </button>
                </div>
            </div>
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
    const isFetchingRef = useRef(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const loadFirstPage = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setIsInitialLoading(true);
        setErrorMessage(null);

        try {
            const result = await CommunityService.getNewestPosts({
                limit: FEED_LIMIT,
            });
            setPosts(dedupePosts(result.items));
            setNextCursor(result.next_cursor);
            setHasMore(Boolean(result.next_cursor));
        } catch (error) {
            setPosts([]);
            setNextCursor(null);
            setHasMore(false);
            setErrorMessage(
                getApiErrorMessage(error, "Gagal mengambil post terbaru."),
            );
        } finally {
            isFetchingRef.current = false;
            setIsInitialLoading(false);
        }
    }, []);

    const resetAfterInvalidCursor = useCallback(async () => {
        toast.error("Feed berubah. Memuat ulang dari awal.");
        setPosts([]);
        setNextCursor(null);
        setHasMore(true);

        const result = await CommunityService.getNewestPosts({
            limit: FEED_LIMIT,
        });
        setPosts(dedupePosts(result.items));
        setNextCursor(result.next_cursor);
        setHasMore(Boolean(result.next_cursor));
    }, []);

    const loadMore = useCallback(async () => {
        if (isFetchingRef.current || !hasMore || !nextCursor) return;
        isFetchingRef.current = true;
        setIsLoadingMore(true);

        try {
            const result = await CommunityService.getNewestPosts({
                limit: FEED_LIMIT,
                cursor: nextCursor,
            });

            setPosts((current) =>
                dedupePosts([...current, ...result.items]),
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

            toast.error(getApiErrorMessage(error, "Gagal memuat post lainnya."));
        } finally {
            isFetchingRef.current = false;
            setIsLoadingMore(false);
        }
    }, [hasMore, nextCursor, resetAfterInvalidCursor]);

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

    return (
        <main className="mx-auto w-full max-w-[800px] px-4 pb-24 pt-28 sm:px-6">
            <div className="flex flex-col gap-8">
                <header className="mb-2 pt-4 text-center">
                    <h1 className="text-xl font-semibold leading-7 text-slate-900 sm:text-2xl">
                        Post terbaru dari komunitas
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-500">
                        Diskusi dan pengumuman terbaru dari seluruh komunitas.
                    </p>
                </header>

                {isInitialLoading ? (
                    <>
                        <LoadingCard />
                        <LoadingCard />
                    </>
                ) : null}

                {!isInitialLoading && errorMessage ? (
                    <section className="rounded-3xl border border-red-100 bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <h2 className="text-base font-semibold text-slate-950">
                            Feed belum dapat dimuat
                        </h2>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            {errorMessage}
                        </p>
                        <Button
                            className="mt-6 rounded-full"
                            onClick={loadFirstPage}
                        >
                            <RefreshCw className="h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </section>
                ) : null}

                {!isInitialLoading && !errorMessage && posts.length === 0 ? (
                    <section className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <MessageCircle className="mx-auto h-8 w-8 text-slate-300" />
                        <h2 className="mt-4 text-base font-semibold text-slate-900">
                            Belum ada post komunitas
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Post terbaru akan muncul di sini setelah komunitas
                            mulai berdiskusi.
                        </p>
                    </section>
                ) : null}

                {posts.map((post) => (
                    <FeedPostCard key={post.id} post={post} />
                ))}

                <div ref={sentinelRef} className="h-1" />

                {!isInitialLoading && !errorMessage && hasMore ? (
                    <div className="flex justify-center pb-8 pt-2">
                        <Button
                            variant="outline"
                            disabled={isLoadingMore}
                            onClick={loadMore}
                            className="rounded-full border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
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
            </div>
        </main>
    );
}
