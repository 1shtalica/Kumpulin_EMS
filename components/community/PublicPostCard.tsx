"use client";

import Link from "next/link";
import type { ReactNode, SyntheticEvent } from "react";
import {
    ArrowUpRight,
    Bell,
    MessageCircle,
    MoreHorizontal,
    Share,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Post } from "@/types/community";
import PostImageCarousel from "./PostImageCarousel";
import RelatedEventCard from "./RelatedEventCard";
import ShareDialog from "@/components/reusable/ShareDialog";

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));

const formatNumber = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

const COMMUNITY_LOGO_FALLBACK = "/kumpulin_k_logo.svg";

const handleCommunityLogoError = (
    event: SyntheticEvent<HTMLImageElement>,
) => {
    const image = event.currentTarget;
    image.onerror = null;
    image.src = COMMUNITY_LOGO_FALLBACK;
};

export const getCommunityLabel = (post: Post) =>
    post.community_name?.trim() ||
    post.organizer_name?.trim() ||
    `Community ${post.community_id.slice(0, 8)}`;

export const getCommunityHref = (post: Post) =>
    post.community_slug
        ? `/k/${post.community_slug}`
        : `/komunitas/${post.community_id}`;

export const getPostHref = (post: Post) =>
    `${getCommunityHref(post)}/post/${post.id}`;

export const getAuthorLabel = (post: Post) => {
    const username = post.author_name?.trim() || post.username?.trim();
    return username
        ? `@${username.replace(/^@+/, "")}`
        : `User ${post.author_user_id}`;
};

const getPostTypeLabel = (post: Post) =>
    post.post_type === "announcement" ? "Pengumuman" : "Diskusi";

function TypeBadge({ post }: { post: Post }) {
    const isAnnouncement = post.post_type === "announcement";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                isAnnouncement
                    ? "border-primary/15 bg-primary-light text-primary"
                    : "border-slate-200 bg-slate-50 text-slate-600"
            }`}
        >
            {isAnnouncement ? (
                <Bell className="h-3.5 w-3.5" />
            ) : (
                <MessageCircle className="h-3.5 w-3.5 text-primary" />
            )}
            {getPostTypeLabel(post)}
        </span>
    );
}

interface PublicPostCardProps {
    post: Post;
    postHref?: string;
    communityHref?: string;
    communityLabel?: string;
    showCommunityMeta?: boolean;
    actions?: ReactNode;
}

export default function PublicPostCard({
    post,
    postHref = getPostHref(post),
    communityHref = getCommunityHref(post),
    communityLabel = getCommunityLabel(post),
    showCommunityMeta = false,
    actions,
}: PublicPostCardProps) {
    const authorLabel = getAuthorLabel(post);

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10">
            <header className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                <Link
                    href={communityHref}
                    className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-primary-light ring-1 ring-primary/10 transition group-hover:ring-primary/20 hover:cursor-pointer"
                    aria-label={`Buka komunitas ${communityLabel}`}
                >
                    <img
                        src={post.community_logo_url ?? COMMUNITY_LOGO_FALLBACK}
                        alt={`${communityLabel} logo`}
                        className="h-full w-full object-cover"
                        onError={handleCommunityLogoError}
                    />
                </Link>

                <div className="min-w-0 flex-1 self-center">
                    {showCommunityMeta ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Komunitas
                            </span>
                            <Link
                                href={communityHref}
                                className="truncate text-sm font-semibold text-slate-950 transition-colors hover:text-primary"
                            >
                                {communityLabel}
                            </Link>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-medium text-slate-400">
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                Post
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    )}
                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        oleh{" "}
                        <span className="text-slate-700">{authorLabel}</span>
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 self-center">
                    <TypeBadge post={post} />
                    {actions ? (
                        actions
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
                                    aria-label="Opsi post"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={postHref}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowUpRight className="h-4 w-4" />
                                        Buka post
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            <Link href={postHref} className="block px-4 pb-4 sm:px-5">
                <h2 className="text-lg font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary">
                    {post.title}
                </h2>
                <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {post.body}
                </p>
            </Link>

            <PostImageCarousel
                imageUrls={post.image_urls}
                href={postHref}
                className="mx-4 mb-4 sm:mx-5"
                imageClassName="max-h-[420px]"
            />

            <RelatedEventCard
                relatedEvent={post.related_event}
                className="mx-4 mb-4 sm:mx-5"
            />

            <div className="flex items-center justify-end gap-1 border-t border-slate-200/80 px-3 py-2 sm:px-4">
                <Link
                    href={postHref}
                    className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition-all hover:bg-primary-light hover:text-primary"
                >
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(post.comment_count)}</span>
                    <span className="hidden sm:inline">Komentar</span>
                </Link>
                <ShareDialog
                    title={post.title}
                    description={post.body}
                    imageUrl={post.image_urls?.[0]}
                    url={postHref}
                    contentType="post"
                >
                    <button
                        type="button"
                        className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition-all hover:bg-primary-light hover:text-primary"
                    >
                        <Share className="h-4 w-4" />
                        <span className="hidden sm:inline">Bagikan</span>
                    </button>
                </ShareDialog>
            </div>
        </article>
    );
}
