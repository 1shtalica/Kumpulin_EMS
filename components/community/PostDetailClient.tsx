"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    error_code?: string;
    errors?: Array<string | { field?: string; message?: string }>;
};

type CommentsState = {
    byId: Record<string, Comment>;
    order: string[];
};

type ReplyTarget = {
    rootId: string;
    replyToLabel: string;
};

type CommentReply = {
    comment: Comment;
    displayBody: string;
};

type CommentThread = {
    root: Comment;
    replies: CommentReply[];
};

const EMPTY_COMMENTS_STATE: CommentsState = { byId: {}, order: [] };
const COLLAPSED_REPLY_PREVIEW_COUNT = 0;

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

const getTimeValue = (value: string) => {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const compareComments = (a: Comment, b: Comment) => {
    const timeDiff = getTimeValue(a.created_at) - getTimeValue(b.created_at);
    if (timeDiff !== 0) return timeDiff;
    return a.id.localeCompare(b.id);
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
    post.author_name?.trim() || "Unknown user";

const getOrganizerLabel = (post: Post) => post.organizer_name?.trim() || null;

const getCommentAuthorLabel = (comment: Comment) =>
    comment.author_name?.trim() || `User ${comment.author_user_id}`;

const getMentionHandle = (name: string) => name.trim().replace(/\s+/g, "_");

const getStreamUrl = (communityId: string, postId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return null;
    return `${baseUrl}/communities/${communityId}/posts/${postId}/comments/stream`;
};

const normalizeComments = (comments: Comment[]): CommentsState => {
    const sorted = [...comments].sort(compareComments);
    const byId: Record<string, Comment> = {};
    const order: string[] = [];

    sorted.forEach((comment) => {
        byId[comment.id] = comment;
        order.push(comment.id);
    });

    return { byId, order };
};

const mergeCommentsState = (
    current: CommentsState,
    incoming: Comment[],
): CommentsState => {
    const mergedById = { ...current.byId };
    incoming.forEach((comment) => {
        mergedById[comment.id] = comment;
    });

    return normalizeComments(Object.values(mergedById));
};

const removeCommentTree = (
    current: CommentsState,
    commentId: string,
): { next: CommentsState; removedCount: number } => {
    if (!current.byId[commentId]) return { next: current, removedCount: 0 };

    const childrenByParent = new Map<string, string[]>();
    Object.values(current.byId).forEach((comment) => {
        if (!comment.parent_comment_id) return;
        const siblings = childrenByParent.get(comment.parent_comment_id) ?? [];
        siblings.push(comment.id);
        childrenByParent.set(comment.parent_comment_id, siblings);
    });

    const toRemove = new Set<string>();
    const stack = [commentId];
    while (stack.length) {
        const currentId = stack.pop();
        if (!currentId || toRemove.has(currentId)) continue;
        toRemove.add(currentId);
        const children = childrenByParent.get(currentId) ?? [];
        children.forEach((childId) => stack.push(childId));
    }

    const nextById: Record<string, Comment> = {};
    Object.values(current.byId).forEach((comment) => {
        if (!toRemove.has(comment.id)) {
            nextById[comment.id] = comment;
        }
    });

    const next = normalizeComments(Object.values(nextById));
    return { next, removedCount: toRemove.size };
};

function CommentComposer({
    disabled,
    placeholder = "Tulis komentar...",
    submitLabel = "Kirim",
    value,
    replyingToLabel,
    onChange,
    onCancelReplyTarget,
    onSubmit,
    inputRef,
}: {
    disabled?: boolean;
    placeholder?: string;
    submitLabel?: string;
    value: string;
    replyingToLabel?: string;
    onChange: (value: string) => void;
    onCancelReplyTarget?: () => void;
    onSubmit: (body: string) => Promise<void>;
    inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!value.trim()) {
            toast.error("Komentar tidak boleh kosong.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(value.trim());
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-3">
            {replyingToLabel ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span>
                        Replying to <span className="font-semibold">{replyingToLabel}</span>
                    </span>
                    {onCancelReplyTarget ? (
                        <button
                            type="button"
                            onClick={onCancelReplyTarget}
                            className="font-semibold text-slate-500 transition hover:text-slate-700"
                        >
                            Batal
                        </button>
                    ) : null}
                </div>
            ) : null}

            <Textarea
                ref={inputRef}
                value={value}
                disabled={disabled || isSubmitting}
                onChange={(event) => onChange(event.target.value)}
                className="min-h-24 resize-y rounded-2xl border-slate-200 bg-slate-50 text-sm leading-6 text-slate-700 placeholder:text-slate-400"
                placeholder={placeholder}
            />

            <div className="flex justify-end">
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

function ThreadCommentRow({
    comment,
    displayBody,
    userId,
    canManage,
    isReply = false,
    onReply,
    onUpdate,
    onDelete,
}: {
    comment: Comment;
    displayBody: string;
    userId?: number;
    canManage: boolean;
    isReply?: boolean;
    onReply: () => void;
    onUpdate: (commentId: string, body: string) => Promise<void>;
    onDelete: (comment: Comment) => Promise<void>;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);
    const canEdit = userId === comment.author_user_id;
    const canDelete = canEdit || canManage;
    const author = getCommentAuthorLabel(comment);

    return (
        <div className={isReply ? "flex gap-3" : "flex gap-4"}>
            <div
                className={
                    isReply
                        ? "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600"
                        : "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white"
                }
            >
                U{comment.author_user_id}
            </div>

            <div className="min-w-0 flex-1">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p
                        className={
                            isReply
                                ? "text-xs font-semibold text-slate-700"
                                : "text-sm font-semibold text-slate-900"
                        }
                    >
                        {author}
                    </p>

                    {isEditing ? (
                        <div className="mt-2 space-y-3">
                            <Textarea
                                value={editBody}
                                onChange={(event) => setEditBody(event.target.value)}
                                className="min-h-20 rounded-xl border-slate-200 bg-white text-sm text-slate-700"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    className="rounded-full text-slate-500 hover:text-slate-700"
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
                        <p
                            className={
                                isReply
                                    ? "mt-1 whitespace-pre-line text-sm leading-6 text-slate-600"
                                    : "mt-1 whitespace-pre-line text-sm leading-6 text-slate-700"
                            }
                        >
                            {displayBody}
                        </p>
                    )}
                </div>

                {!isEditing ? (
                    <div className="mt-2 flex flex-wrap items-center gap-4 px-1 text-xs font-medium text-slate-400">
                        <span>{formatDate(comment.created_at)}</span>
                        <span>0 suka</span>
                        <button
                            type="button"
                            onClick={onReply}
                            className="flex items-center gap-1 text-slate-500 transition hover:text-primary"
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
                                className="flex items-center gap-1 text-slate-500 transition hover:text-primary"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        ) : null}
                        {canDelete ? (
                            <button
                                type="button"
                                onClick={() => void onDelete(comment)}
                                className="flex items-center gap-1 text-slate-500 transition hover:text-red-600"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Hapus
                            </button>
                        ) : null}
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
    const [commentsState, setCommentsState] = useState<CommentsState>(
        EMPTY_COMMENTS_STATE,
    );
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [postLoadError, setPostLoadError] = useState<{
        title: string;
        description: string;
    } | null>(null);
    const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
    const [composerBody, setComposerBody] = useState("");
    const [expandedRepliesByRootId, setExpandedRepliesByRootId] = useState<
        Record<string, boolean>
    >({});
    const composerRef = useRef<HTMLTextAreaElement | null>(null);

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

                setCommentsState((current) => {
                    if (!append) return normalizeComments(result.data);
                    return mergeCommentsState(current, result.data);
                });

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
                const [communityData, postData] = await Promise.all([
                    CommunityService.getCommunityById(communityId),
                    CommunityService.getCommunityPostById(communityId, postId),
                ]);
                if (!mounted) return;

                setCommunity(communityData);
                setPost(postData);
                setPostLoadError(null);
                await loadComments(1);
            } catch (error) {
                if (!mounted) return;
                const axiosError = error as AxiosError<ApiErrorBody>;
                const statusCode = axiosError.response?.status;
                const errorCode =
                    axiosError.response?.data?.error_code?.toLowerCase() ?? "";
                const message =
                    axiosError.response?.data?.message?.toLowerCase() ?? "";

                setCommunity(null);
                setPost(null);

                if (
                    statusCode === 400 ||
                    message.includes("invalid") ||
                    message.includes("uuid")
                ) {
                    setPostLoadError({
                        title: "ID tidak valid",
                        description:
                            "ID komunitas atau post tidak valid. Periksa kembali link yang dibuka.",
                    });
                    return;
                }

                if (
                    statusCode === 404 ||
                    errorCode.includes("not_found") ||
                    message.includes("not found") ||
                    message.includes("tidak ditemukan")
                ) {
                    setPostLoadError({
                        title: "Post tidak ditemukan",
                        description:
                            "Post mungkin sudah dihapus atau tidak berada pada komunitas ini.",
                    });
                    return;
                }

                setPostLoadError({
                    title: "Gagal memuat post",
                    description: getApiErrorMessage(
                        error,
                        "Terjadi kesalahan saat mengambil detail post.",
                    ),
                });
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
                setCommentsState((current) => mergeCommentsState(current, [created]));
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

                setCommentsState((current) => {
                    const { next, removedCount } = removeCommentTree(
                        current,
                        deleted.id!,
                    );
                    if (removedCount > 0) {
                        setPost((postState) =>
                            postState
                                ? {
                                      ...postState,
                                      comment_count: Math.max(
                                          postState.comment_count - removedCount,
                                          0,
                                      ),
                                  }
                                : postState,
                        );
                    }
                    return next;
                });
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

    const commentThreads = useMemo(() => {
        const comments = commentsState.order
            .map((id) => commentsState.byId[id])
            .filter((comment): comment is Comment => Boolean(comment));
        const byId = commentsState.byId;
        const childrenByParent = new Map<string, Comment[]>();

        comments.forEach((comment) => {
            if (!comment.parent_comment_id || !byId[comment.parent_comment_id]) {
                return;
            }
            const siblings = childrenByParent.get(comment.parent_comment_id) ?? [];
            siblings.push(comment);
            childrenByParent.set(comment.parent_comment_id, siblings);
        });

        const rootIdCache = new Map<string, string>();
        const resolveRootId = (comment: Comment): string => {
            const cached = rootIdCache.get(comment.id);
            if (cached) return cached;

            const visited = new Set<string>();
            let current: Comment | undefined = comment;
            while (current) {
                if (visited.has(current.id)) {
                    rootIdCache.set(comment.id, comment.id);
                    return comment.id;
                }
                visited.add(current.id);

                const parentId: string | null = current.parent_comment_id;
                if (!parentId || !byId[parentId]) {
                    rootIdCache.set(comment.id, current.id);
                    return current.id;
                }
                current = byId[parentId];
            }

            rootIdCache.set(comment.id, comment.id);
            return comment.id;
        };

        const rootMap = new Map<string, Comment>();
        comments.forEach((comment) => {
            const rootId = resolveRootId(comment);
            if (!rootMap.has(rootId) && byId[rootId]) {
                rootMap.set(rootId, byId[rootId]);
            }
        });

        const roots = Array.from(rootMap.values()).sort(compareComments);

        return roots.map<CommentThread>((root) => {
            const replies = comments
                .filter((comment) => comment.id !== root.id)
                .filter((comment) => resolveRootId(comment) === root.id)
                .sort(compareComments)
                .map((comment) => {
                    const parentId = comment.parent_comment_id;
                    const parent = parentId ? byId[parentId] : undefined;
                    const needsMention =
                        Boolean(parent) && parent?.id !== root.id;
                    let displayBody = comment.body;

                    if (needsMention && parent) {
                        const mentionHandle = getMentionHandle(
                            getCommentAuthorLabel(parent),
                        );
                        const mentionPrefix = `@${mentionHandle}`;
                        if (
                            !comment.body
                                .trimStart()
                                .toLowerCase()
                                .startsWith(mentionPrefix.toLowerCase())
                        ) {
                            displayBody = `${mentionPrefix} ${comment.body}`;
                        }
                    }

                    return { comment, displayBody };
                });

            return { root, replies };
        });
    }, [commentsState]);

    const activateReplyTarget = useCallback(
        (root: Comment, reply?: Comment) => {
            if (!user) {
                toast.error("Silakan login untuk menulis komentar.");
                return;
            }

            if (reply) {
                const mention = `@${getMentionHandle(getCommentAuthorLabel(reply))} `;
                setComposerBody((current) =>
                    current.startsWith(mention) ? current : `${mention}${current}`,
                );
            }

            setReplyTarget({
                rootId: root.id,
                replyToLabel: `@${getMentionHandle(
                    getCommentAuthorLabel(reply ?? root),
                )}`,
            });
            setExpandedRepliesByRootId((current) => ({
                ...current,
                [root.id]: true,
            }));

            queueMicrotask(() => {
                composerRef.current?.focus();
            });
        },
        [user],
    );

    const handleCreateComment = useCallback(async () => {
        if (!user) {
            toast.error("Silakan login untuk menulis komentar.");
            return;
        }

        const body = composerBody.trim();
        if (!body) {
            toast.error("Komentar tidak boleh kosong.");
            return;
        }

        const parentCommentId = replyTarget?.rootId;
        const now = new Date().toISOString();
        const tempId = `temp-${Date.now()}`;
        const optimisticComment: Comment = {
            id: tempId,
            community_id: communityId,
            post_id: postId,
            parent_comment_id: parentCommentId ?? null,
            author_user_id: userId ?? 0,
            body,
            created_at: now,
            updated_at: now,
        };

        setCommentsState((current) => mergeCommentsState(current, [optimisticComment]));
        setPost((current) =>
            current
                ? { ...current, comment_count: current.comment_count + 1 }
                : current,
        );

        if (parentCommentId) {
            setExpandedRepliesByRootId((current) => ({
                ...current,
                [parentCommentId]: true,
            }));
        }

        const previousBody = composerBody;
        setComposerBody("");
        setReplyTarget(null);

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

            setCommentsState((current) => {
                const withoutTemp = removeCommentTree(current, tempId).next;
                return mergeCommentsState(withoutTemp, [created]);
            });

            toast.success("Komentar terkirim.", { id: toastId });
        } catch (error) {
            setCommentsState((current) => removeCommentTree(current, tempId).next);
            setPost((current) =>
                current
                    ? {
                          ...current,
                          comment_count: Math.max(current.comment_count - 1, 0),
                      }
                    : current,
            );
            setComposerBody(previousBody);

            toast.error(getApiErrorMessage(error, "Gagal mengirim komentar."), {
                id: toastId,
            });
            throw error;
        }
    }, [communityId, composerBody, postId, replyTarget, user, userId]);

    const handleUpdateComment = useCallback(
        async (commentId: string, body: string) => {
            if (!body) {
                toast.error("Komentar tidak boleh kosong.");
                return;
            }

            const previousComment = commentsState.byId[commentId];
            if (!previousComment) return;

            setCommentsState((current) =>
                mergeCommentsState(current, [
                    {
                        ...previousComment,
                        body,
                        updated_at: new Date().toISOString(),
                    },
                ]),
            );

            const toastId = toast.loading("Menyimpan komentar...");
            try {
                const updated = await CommunityService.updateComment(
                    communityId,
                    postId,
                    commentId,
                    { body },
                );
                setCommentsState((current) => mergeCommentsState(current, [updated]));
                toast.success("Komentar diperbarui.", { id: toastId });
            } catch (error) {
                setCommentsState((current) =>
                    mergeCommentsState(current, [previousComment]),
                );
                toast.error(
                    getApiErrorMessage(error, "Gagal menyimpan komentar."),
                    {
                        id: toastId,
                    },
                );
                throw error;
            }
        },
        [commentsState.byId, communityId, postId],
    );

    const handleDeleteComment = useCallback(
        async (comment: Comment) => {
            const confirmed = window.confirm("Hapus komentar ini?");
            if (!confirmed) return;

            const snapshotState = commentsState;
            const snapshotCount = post?.comment_count ?? 0;
            const { next, removedCount } = removeCommentTree(commentsState, comment.id);
            if (!removedCount) return;

            setCommentsState(next);
            setPost((current) =>
                current
                    ? {
                          ...current,
                          comment_count: Math.max(
                              current.comment_count - removedCount,
                              0,
                          ),
                      }
                    : current,
            );

            if (replyTarget?.rootId === comment.id) {
                setReplyTarget(null);
            }

            const toastId = toast.loading("Menghapus komentar...");
            try {
                await CommunityService.deleteComment(
                    communityId,
                    postId,
                    comment.id,
                );
                toast.success("Komentar dihapus.", { id: toastId });
            } catch (error) {
                setCommentsState(snapshotState);
                setPost((current) =>
                    current ? { ...current, comment_count: snapshotCount } : current,
                );
                toast.error(getApiErrorMessage(error, "Gagal menghapus komentar."), {
                    id: toastId,
                });
            }
        },
        [commentsState, communityId, post, postId, replyTarget?.rootId],
    );

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
                    {postLoadError?.title ?? "Post tidak ditemukan"}
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                    {postLoadError?.description ??
                        "Post mungkin sudah dihapus atau tidak berada pada komunitas ini."}
                </p>
                <Button asChild className="mt-6 rounded-full">
                    <Link href={`/komunitas/${communityId}`}>Kembali ke komunitas</Link>
                </Button>
            </main>
        );
    }

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
                            {getOrganizerLabel(post) ? (
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    {getOrganizerLabel(post)}
                                </p>
                            ) : null}
                            <p className="mt-1 text-xs font-medium text-slate-400">
                                {getPostAuthorLabel(post)} - {formatDate(post.created_at)}
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
                            inputRef={composerRef}
                            disabled={!user}
                            value={composerBody}
                            onChange={setComposerBody}
                            replyingToLabel={replyTarget?.replyToLabel}
                            onCancelReplyTarget={() => setReplyTarget(null)}
                            placeholder={
                                user
                                    ? "Tulis komentar..."
                                    : "Login untuk menulis komentar"
                            }
                            onSubmit={handleCreateComment}
                        />
                    </div>

                    {commentThreads.length ? (
                        <div className="space-y-8">
                            {commentThreads.map((thread) => {
                                const isExpanded =
                                    expandedRepliesByRootId[thread.root.id] ?? false;
                                const visibleReplies = isExpanded
                                    ? thread.replies
                                    : thread.replies.slice(
                                          0,
                                          COLLAPSED_REPLY_PREVIEW_COUNT,
                                      );

                                return (
                                    <article
                                        key={thread.root.id}
                                        className="space-y-3 border-b border-slate-100 pb-6 last:border-b-0 last:pb-0"
                                    >
                                        <ThreadCommentRow
                                            comment={thread.root}
                                            displayBody={thread.root.body}
                                            userId={userId}
                                            canManage={canManage}
                                            onReply={() => activateReplyTarget(thread.root)}
                                            onUpdate={handleUpdateComment}
                                            onDelete={handleDeleteComment}
                                        />

                                        {thread.replies.length ? (
                                            <div className="pl-10 sm:pl-12">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedRepliesByRootId(
                                                            (current) => ({
                                                                ...current,
                                                                [thread.root.id]:
                                                                    !isExpanded,
                                                            }),
                                                        )
                                                    }
                                                    className="mb-3 text-xs font-semibold text-slate-500 transition hover:text-primary"
                                                >
                                                    {isExpanded
                                                        ? "Sembunyikan balasan"
                                                        : `Lihat ${formatNumber(
                                                              thread.replies.length,
                                                          )} balasan`}
                                                </button>

                                                {visibleReplies.length ? (
                                                    <div className="space-y-4">
                                                        {visibleReplies.map((reply) => (
                                                            <ThreadCommentRow
                                                                key={reply.comment.id}
                                                                comment={reply.comment}
                                                                displayBody={
                                                                    reply.displayBody
                                                                }
                                                                userId={userId}
                                                                canManage={canManage}
                                                                isReply
                                                                onReply={() =>
                                                                    activateReplyTarget(
                                                                        thread.root,
                                                                        reply.comment,
                                                                    )
                                                                }
                                                                onUpdate={
                                                                    handleUpdateComment
                                                                }
                                                                onDelete={
                                                                    handleDeleteComment
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </article>
                                );
                            })}
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
