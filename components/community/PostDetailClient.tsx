"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import {
    Loader2,
    MessageCircle,
    Pencil,
    Reply,
    Share,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommunityService } from "@/services/community-service";
import { useAuthStore } from "@/stores/auth-store";
import type { Comment, Community, Post } from "@/types/community";
import PostImageCarousel from "./PostImageCarousel";

type ApiErrorBody = {
    message?: string;
    errors?: Array<string | { field?: string; message?: string }>;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const errors = axiosError.response?.data?.errors;
    const firstError = Array.isArray(errors) ? errors[0] : undefined;

    if (typeof firstError === "string") return firstError;
    if (firstError?.message) return firstError.message;

    return (
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : fallback)
    );
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

const getPostAuthorLabel = (post: Post) =>
    post.author_name?.trim() || `User ${post.author_user_id}`;

const getStreamUrl = (communityId: string, postId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return null;
    return `${baseUrl}/communities/${communityId}/posts/${postId}/comments/stream`;
};

function CommentComposer({
    disabled,
    placeholder = "Tulis komentar...",
    submitLabel = "Kirim",
    onSubmit,
    onCancel,
}: {
    disabled?: boolean;
    placeholder?: string;
    submitLabel?: string;
    onSubmit: (body: string) => Promise<void>;
    onCancel?: () => void;
}) {
    const [body, setBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!body.trim()) {
            toast.error("Komentar tidak boleh kosong.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(body.trim());
            setBody("");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-3">
            <Textarea
                value={body}
                disabled={disabled || isSubmitting}
                onChange={(event) => setBody(event.target.value)}
                className="min-h-24 resize-y rounded-2xl border-slate-200 bg-slate-50 p-4 text-sm leading-6"
                placeholder={placeholder}
            />
            <div className="flex justify-end gap-2">
                {onCancel ? (
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full"
                        onClick={onCancel}
                    >
                        Batal
                    </Button>
                ) : null}
                <Button
                    type="button"
                    className="rounded-full px-6"
                    disabled={disabled || isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                    {submitLabel}
                </Button>
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    replies,
    userId,
    canManage,
    onCreateReply,
    onUpdate,
    onDelete,
}: {
    comment: Comment;
    replies: Comment[];
    userId?: number;
    canManage: boolean;
    onCreateReply: (parentCommentId: string, body: string) => Promise<void>;
    onUpdate: (commentId: string, body: string) => Promise<void>;
    onDelete: (comment: Comment) => Promise<void>;
}) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);
    const canEdit = userId === comment.author_user_id;
    const canDelete = canEdit || canManage;

    return (
        <div className="flex gap-4">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                U{comment.author_user_id}
            </div>
            <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                        User {comment.author_user_id}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                        {formatDate(comment.created_at)}
                    </span>
                </div>

                {isEditing ? (
                    <div className="space-y-3">
                        <Textarea
                            value={editBody}
                            onChange={(event) =>
                                setEditBody(event.target.value)
                            }
                            className="min-h-24 rounded-2xl bg-slate-50 text-sm leading-6"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                className="rounded-full"
                                onClick={() => {
                                    setEditBody(comment.body);
                                    setIsEditing(false);
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                className="rounded-full"
                                onClick={async () => {
                                    await onUpdate(comment.id, editBody.trim());
                                    setIsEditing(false);
                                }}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                        {comment.body}
                    </p>
                )}

                {!isEditing ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsReplying(true)}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                            <Reply className="h-3.5 w-3.5" />
                            Balas
                        </button>
                        {canEdit ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditBody(comment.body);
                                    setIsEditing(true);
                                }}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        ) : null}
                        {canDelete ? (
                            <button
                                type="button"
                                onClick={() => onDelete(comment)}
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                            </button>
                        ) : null}
                    </div>
                ) : null}

                {isReplying ? (
                    <div className="mt-4">
                        <CommentComposer
                            submitLabel="Balas"
                            placeholder="Tulis balasan..."
                            onCancel={() => setIsReplying(false)}
                            onSubmit={async (body) => {
                                await onCreateReply(comment.id, body);
                                setIsReplying(false);
                            }}
                        />
                    </div>
                ) : null}

                {replies.length ? (
                    <div className="mt-6 space-y-6 border-l border-slate-100 pl-5">
                        {replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                replies={[]}
                                userId={userId}
                                canManage={canManage}
                                onCreateReply={onCreateReply}
                                onUpdate={onUpdate}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function PostDetailClient({
    communityId,
    postId,
}: {
    communityId: string;
    postId: string;
}) {
    const user = useAuthStore((state) => state.user);
    const [community, setCommunity] = useState<Community | null>(null);
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    const userId = user?.id ? Number(user.id) : undefined;
    const canManage = user?.role === "organizer";

    const loadComments = useCallback(
        async (targetPage = 1, append = false) => {
            setIsLoadingComments(true);
            try {
                const result = await CommunityService.listComments(
                    communityId,
                    postId,
                    targetPage,
                    20,
                );
                setComments((current) =>
                    append ? [...current, ...result.data] : result.data,
                );
                setPage(result.page);
                setHasNext(result.hasNext);
            } catch (error) {
                toast.error(
                    getApiErrorMessage(error, "Gagal mengambil komentar."),
                );
            } finally {
                setIsLoadingComments(false);
            }
        },
        [communityId, postId],
    );

    useEffect(() => {
        let mounted = true;

        const loadPost = async () => {
            setIsLoading(true);
            try {
                const [communityData, postList] = await Promise.all([
                    CommunityService.getCommunityById(communityId),
                    CommunityService.listPosts(communityId, 1, 100),
                ]);
                if (!mounted) return;
                setCommunity(communityData);
                setPost(
                    postList.data.find((candidate) => candidate.id === postId) ??
                        null,
                );
                await loadComments(1);
            } catch (error) {
                if (!mounted) return;
                toast.error(getApiErrorMessage(error, "Gagal mengambil post."));
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void loadPost();

        return () => {
            mounted = false;
        };
    }, [communityId, postId, loadComments]);

    useEffect(() => {
        const streamUrl = getStreamUrl(communityId, postId);
        if (!streamUrl || typeof EventSource === "undefined") return;

        const source = new EventSource(streamUrl, { withCredentials: true });

        const handleCreated = (event: MessageEvent) => {
            try {
                const created = JSON.parse(event.data) as Comment;
                setComments((current) =>
                    current.some((comment) => comment.id === created.id)
                        ? current
                        : [created, ...current],
                );
                setPost((current) =>
                    current
                        ? {
                              ...current,
                              comment_count: current.comment_count + 1,
                          }
                        : current,
                );
            } catch {
                // Ignore malformed SSE payloads.
            }
        };

        const handleDeleted = (event: MessageEvent) => {
            try {
                const deleted = JSON.parse(event.data) as { id?: string };
                if (!deleted.id) return;
                setComments((current) =>
                    current.filter((comment) => comment.id !== deleted.id),
                );
                setPost((current) =>
                    current
                        ? {
                              ...current,
                              comment_count: Math.max(
                                  current.comment_count - 1,
                                  0,
                              ),
                          }
                        : current,
                );
            } catch {
                // Ignore malformed SSE payloads.
            }
        };

        source.addEventListener("comment_created", handleCreated);
        source.addEventListener("comment_deleted", handleDeleted);

        return () => {
            source.close();
        };
    }, [communityId, postId]);

    const commentsByParent = useMemo(() => {
        const map = new Map<string, Comment[]>();
        comments.forEach((comment) => {
            const key = comment.parent_comment_id ?? "root";
            map.set(key, [...(map.get(key) ?? []), comment]);
        });
        return map;
    }, [comments]);

    const handleCreateComment = async (
        body: string,
        parentCommentId?: string,
    ) => {
        if (!user) {
            toast.error("Silakan login untuk menulis komentar.");
            return;
        }

        const toastId = toast.loading("Mengirim komentar...");
        try {
            const created = await CommunityService.createComment(
                communityId,
                postId,
                {
                    body,
                    parent_comment_id: parentCommentId,
                },
            );
            setComments((current) =>
                current.some((comment) => comment.id === created.id)
                    ? current
                    : [created, ...current],
            );
            setPost((current) =>
                current
                    ? { ...current, comment_count: current.comment_count + 1 }
                    : current,
            );
            toast.success("Komentar terkirim.", { id: toastId });
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal mengirim komentar."), {
                id: toastId,
            });
            throw error;
        }
    };

    const handleUpdateComment = async (commentId: string, body: string) => {
        if (!body) {
            toast.error("Komentar tidak boleh kosong.");
            return;
        }

        const toastId = toast.loading("Menyimpan komentar...");
        try {
            const updated = await CommunityService.updateComment(
                communityId,
                postId,
                commentId,
                { body },
            );
            setComments((current) =>
                current.map((comment) =>
                    comment.id === commentId ? updated : comment,
                ),
            );
            toast.success("Komentar diperbarui.", { id: toastId });
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menyimpan komentar."), {
                id: toastId,
            });
            throw error;
        }
    };

    const handleDeleteComment = async (comment: Comment) => {
        const confirmed = window.confirm("Hapus komentar ini?");
        if (!confirmed) return;

        const toastId = toast.loading("Menghapus komentar...");
        try {
            await CommunityService.deleteComment(communityId, postId, comment.id);
            setComments((current) =>
                current.filter((item) => item.id !== comment.id),
            );
            setPost((current) =>
                current
                    ? {
                          ...current,
                          comment_count: Math.max(
                              current.comment_count - 1,
                              0,
                          ),
                      }
                    : current,
            );
            toast.success("Komentar dihapus.", { id: toastId });
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menghapus komentar."), {
                id: toastId,
            });
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto w-full max-w-[800px] px-4 pb-32 pt-28 sm:px-6">
                <div className="h-80 animate-pulse rounded-3xl bg-white" />
                <div className="mt-8 h-72 animate-pulse rounded-3xl bg-white" />
            </main>
        );
    }

    if (!post || !community) {
        return (
            <main className="mx-auto w-full max-w-[800px] px-4 pb-32 pt-32 text-center sm:px-6">
                <h1 className="text-xl font-semibold text-slate-950">
                    Post tidak ditemukan
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    Post mungkin sudah dihapus atau tidak berada pada komunitas
                    ini.
                </p>
                <Button asChild className="mt-6 rounded-full">
                    <Link href={`/komunitas/${communityId}`}>
                        Kembali ke komunitas
                    </Link>
                </Button>
            </main>
        );
    }

    const rootComments = commentsByParent.get("root") ?? [];

    return (
        <main className="mx-auto w-full max-w-[800px] px-4 pb-32 pt-28 sm:px-6">
            <div className="flex w-full flex-col gap-8">
                <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="flex flex-col gap-5 p-6 sm:p-8">
                        <div>
                            <Link
                                href={`/komunitas/${community.id}`}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                k/{community.slug}
                            </Link>
                            <p className="mt-1 text-xs font-medium text-slate-400">
                                {getPostAuthorLabel(post)} ·{" "}
                                {formatDate(post.created_at)}
                            </p>
                        </div>

                        <div>
                            <h1 className="mb-4 text-xl font-semibold leading-7 text-slate-900 sm:text-2xl">
                                {post.title}
                            </h1>
                            <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                                {post.body}
                            </p>

                            <PostImageCarousel
                                imageUrls={post.image_urls}
                                className="mt-6"
                                imageClassName="max-h-[620px]"
                            />
                        </div>

                        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-5">
                            <span className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500">
                                <MessageCircle className="h-5 w-5" />
                                {formatNumber(post.comment_count)} Komentar
                            </span>
                            <button className="group ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                                <Share className="h-5 w-5" />
                                <span className="hidden sm:inline">Bagikan</span>
                            </button>
                        </div>
                    </div>
                </article>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
                    <h2 className="mb-6 text-lg font-semibold text-slate-900">
                        Komentar ({formatNumber(post.comment_count)})
                    </h2>

                    <div className="mb-8">
                        <CommentComposer
                            disabled={!user}
                            placeholder={
                                user
                                    ? "Tulis komentar..."
                                    : "Login untuk menulis komentar"
                            }
                            onSubmit={(body) => handleCreateComment(body)}
                        />
                    </div>

                    {rootComments.length ? (
                        <div className="space-y-8">
                            {rootComments.map((comment) => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    replies={
                                        commentsByParent.get(comment.id) ?? []
                                    }
                                    userId={userId}
                                    canManage={canManage}
                                    onCreateReply={(parentCommentId, body) =>
                                        handleCreateComment(
                                            body,
                                            parentCommentId,
                                        )
                                    }
                                    onUpdate={handleUpdateComment}
                                    onDelete={handleDeleteComment}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-8 text-center">
                            <MessageCircle className="mx-auto h-7 w-7 text-slate-300" />
                            <p className="mt-3 text-sm font-medium text-slate-600">
                                Belum ada komentar.
                            </p>
                        </div>
                    )}

                    {hasNext ? (
                        <Button
                            variant="outline"
                            disabled={isLoadingComments}
                            onClick={() => loadComments(page + 1, true)}
                            className="mt-8 w-full rounded-2xl py-3.5 text-sm font-semibold text-primary"
                        >
                            {isLoadingComments ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Muat lebih banyak komentar
                        </Button>
                    ) : null}
                </section>
            </div>
        </main>
    );
}
