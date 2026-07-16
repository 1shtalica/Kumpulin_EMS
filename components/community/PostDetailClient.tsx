"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AxiosError } from "axios";
import {
    ArrowLeft,
    ChevronRight,
    Loader2,
    MessageCircle,
    Pencil,
    Reply,
    Share2,
    Trash2,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Textarea } from "@/components/ui/textarea";
import { CommunityService } from "@/services/community-service";
import { useAuthStore } from "@/stores/auth-store";
import type { Comment, Community, Post } from "@/types/community";
import PostImageCarousel from "./PostImageCarousel";
import RelatedEventCard from "./RelatedEventCard";
import Image from "next/image";
import ShareDialog from "@/components/reusable/ShareDialog";

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

const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const formatNumber = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

const getPostAuthorLabel = (post: Post) =>
    post.author_name?.trim() || "Unknown user";

const getOrganizerLabel = (post: Post) => post.organizer_name?.trim() || null;

const normalizeTextField = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const cleaned = value.trim();
    if (!cleaned) return null;
    const lowered = cleaned.toLowerCase();
    if (lowered === "undefined" || lowered === "null" || lowered === "nan") {
        return null;
    }
    return cleaned;
};

const isInvalidAuthorName = (value: string) => {
    const lowered = value.toLowerCase();
    return lowered === "user undefined" || lowered === "uundefined";
};

const getCommentAuthorIdText = (comment: Comment): string | null => {
    const rawAuthorId = comment.author_user_id as unknown;

    if (typeof rawAuthorId === "number" && Number.isFinite(rawAuthorId)) {
        return String(rawAuthorId);
    }

    if (typeof rawAuthorId === "string") {
        const normalized = normalizeTextField(rawAuthorId);
        return normalized;
    }

    return null;
};

const getCommentAuthorIdNumber = (comment: Comment): number | undefined => {
    const idText = getCommentAuthorIdText(comment);
    if (!idText) return undefined;
    const parsed = Number(idText);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const getCommentAuthorLabel = (comment: Comment) => {
    const authorName = normalizeTextField(comment.author_name);
    if (authorName && !isInvalidAuthorName(authorName)) return authorName;

    const authorIdText = getCommentAuthorIdText(comment);
    return authorIdText ? `User ${authorIdText}` : "Unknown user";
};

const getCommentAvatarFallback = (comment: Comment) => {
    const authorName = normalizeTextField(comment.author_name);
    if (authorName && !isInvalidAuthorName(authorName)) {
        const initials = authorName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase() ?? "")
            .join("");
        if (initials) return initials;
    }

    const authorIdText = getCommentAuthorIdText(comment);
    return authorIdText ? `U${authorIdText}` : "U";
};

const getMentionHandle = (name: string) => name.trim().replace(/\s+/g, "_");

const getStreamUrl = (communityId: string, postId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return null;
    return `${baseUrl}/communities/${communityId}/posts/${postId}/comments/stream`;
};

const extractCommentFromEventPayload = (payload: unknown): Comment | null => {
    if (!payload || typeof payload !== "object") return null;
    const record = payload as Record<string, unknown>;

    if ("id" in record && typeof record.id === "string") {
        return record as unknown as Comment;
    }

    const data = record.data;
    if (data && typeof data === "object") {
        const dataRecord = data as Record<string, unknown>;
        if ("id" in dataRecord && typeof dataRecord.id === "string") {
            return dataRecord as unknown as Comment;
        }
    }

    return null;
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
                <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary-light px-3.5 py-2.5 text-xs text-slate-700">
                    <span className="flex items-center gap-1.5">
                        <Reply className="h-3.5 w-3.5 text-primary" />
                        Membalas{" "}
                        <span className="font-semibold text-primary">
                            {replyingToLabel}
                        </span>
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
                className="min-h-24 resize-y rounded-xl border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                placeholder={placeholder}
            />

            <div className="flex justify-end">
                <Button
                    type="button"
                    className="h-10 rounded-xl px-6 text-sm font-semibold"
                    disabled={disabled || isSubmitting}
                    onClick={handleSubmit}
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <MessageCircle className="mr-2 h-4 w-4" />
                    )}
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
    onDelete: (comment: Comment) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);
    const commentAuthorId = getCommentAuthorIdNumber(comment);
    const canEdit = userId !== undefined && commentAuthorId === userId;
    const canDelete = canEdit || canManage;
    const author = getCommentAuthorLabel(comment);
    const avatarFallback = getCommentAvatarFallback(comment);

    return (
        <div className={isReply ? "flex gap-3" : "flex gap-3.5"}>
            <div
                className={
                    isReply
                        ? "relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-200"
                        : "relative mt-0.5 h-10 w-10 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-primary/80 to-primary"
                }
            >
                <span
                    className={
                        isReply
                            ? "flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-600"
                            : "flex h-full w-full items-center justify-center text-xs font-semibold text-white"
                    }
                >
                    {avatarFallback}
                </span>
                {comment.author_profile_url ? (
                    <Image
                        src={comment.author_profile_url}
                        alt={author}
                        fill
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(event) => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                ) : null}
            </div>

            <div className="min-w-0 flex-1">
                <div
                    className={
                        isReply
                            ? "rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                            : "rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 shadow-sm shadow-slate-900/5"
                    }
                >
                    <div className="flex items-center gap-2">
                        <p
                            className={
                                isReply
                                    ? "text-xs font-semibold text-slate-800"
                                    : "text-sm font-semibold text-slate-950"
                            }
                        >
                            {author}
                        </p>
                        <span className="text-[11px] text-slate-400">
                            {formatDate(comment.created_at)}
                        </span>
                    </div>

                    {isEditing ? (
                        <div className="mt-2.5 space-y-3">
                            <Textarea
                                value={editBody}
                                onChange={(event) =>
                                    setEditBody(event.target.value)
                                }
                                className="min-h-20 rounded-xl border-slate-200 bg-white text-sm leading-relaxed text-slate-700 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    className="h-9 rounded-xl border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                                    onClick={() => {
                                        setEditBody(comment.body);
                                        setIsEditing(false);
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="h-9 rounded-xl px-3.5 text-sm font-semibold"
                                    onClick={async () => {
                                        await onUpdate(
                                            comment.id,
                                            editBody.trim(),
                                        );
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
                                    ? "mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600"
                                    : "mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700"
                            }
                        >
                            {displayBody}
                        </p>
                    )}
                </div>

                {!isEditing ? (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1 px-1 text-xs font-medium text-slate-400">
                        <button
                            type="button"
                            onClick={onReply}
                            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
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
                                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                        ) : null}
                        {canDelete ? (
                            <button
                                type="button"
                                onClick={() => void onDelete(comment)}
                                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
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
    const [commentsState, setCommentsState] =
        useState<CommentsState>(EMPTY_COMMENTS_STATE);
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
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
                const parsed = JSON.parse(event.data) as unknown;
                const created = extractCommentFromEventPayload(parsed);
                if (!created) return;
                setCommentsState((current) =>
                    mergeCommentsState(current, [created]),
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
                                          postState.comment_count -
                                              removedCount,
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
            if (
                !comment.parent_comment_id ||
                !byId[comment.parent_comment_id]
            ) {
                return;
            }
            const siblings =
                childrenByParent.get(comment.parent_comment_id) ?? [];
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
                    current.startsWith(mention)
                        ? current
                        : `${mention}${current}`,
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
        const optimisticAuthorName =
            [user.first_name, user.last_name]
                .filter(Boolean)
                .join(" ")
                .trim() ||
            user.username?.trim() ||
            undefined;
        const optimisticComment: Comment = {
            id: tempId,
            community_id: communityId,
            post_id: postId,
            parent_comment_id: parentCommentId ?? null,
            author_user_id: userId ?? 0,
            author_name: optimisticAuthorName,
            author_profile_url: user.profile_url ?? null,
            body,
            created_at: now,
            updated_at: now,
        };

        setCommentsState((current) =>
            mergeCommentsState(current, [optimisticComment]),
        );
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
            setCommentsState(
                (current) => removeCommentTree(current, tempId).next,
            );
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
                setCommentsState((current) =>
                    mergeCommentsState(current, [updated]),
                );
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
            const snapshotState = commentsState;
            const snapshotCount = post?.comment_count ?? 0;
            const { next, removedCount } = removeCommentTree(
                commentsState,
                comment.id,
            );
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

            setDeletingCommentId(comment.id);
            const toastId = toast.loading("Menghapus komentar...");
            try {
                await CommunityService.deleteComment(
                    communityId,
                    postId,
                    comment.id,
                );
                setCommentToDelete(null);
                toast.success("Komentar dihapus.", { id: toastId });
            } catch (error) {
                setCommentsState(snapshotState);
                setPost((current) =>
                    current
                        ? { ...current, comment_count: snapshotCount }
                        : current,
                );
                toast.error(
                    getApiErrorMessage(error, "Gagal menghapus komentar."),
                    {
                        id: toastId,
                    },
                );
            } finally {
                setDeletingCommentId(null);
            }
        },
        [commentsState, communityId, post, postId, replyTarget?.rootId],
    );

    if (isLoading) {
        return (
            <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f9fafb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
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
                <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-4">
                    <div className="h-14 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5" />
                    <div className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5" />
                    <div className="h-64 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5" />
                </div>
            </main>
        );
    }

    if (!post || !community) {
        return (
            <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f9fafb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
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
                <div className="relative mx-auto w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-md shadow-slate-900/5">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <MessageCircle className="h-6 w-6 text-slate-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-950">
                        {postLoadError?.title ?? "Post tidak ditemukan"}
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        {postLoadError?.description ??
                            "Post mungkin sudah dihapus atau tidak berada pada komunitas ini."}
                    </p>
                    <Button
                        asChild
                        className="mt-6 h-10 rounded-xl text-sm font-semibold"
                    >
                        <Link href={`/komunitas/${communityId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke komunitas
                        </Link>
                    </Button>
                </div>
            </main>
        );
    }

    const postAuthor = getPostAuthorLabel(post);
    const postAuthorInitials =
        postAuthor
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0]?.toUpperCase() ?? "")
            .join("") || "U";

    return (
        <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f9fafb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
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
            <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-4">
                {/* Breadcrumb / Context Header */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                    <svg
                        className="pointer-events-none absolute -right-3 -top-3 h-24 w-24 text-primary"
                        viewBox="0 0 96 96"
                        fill="none"
                    >
                        <rect
                            x="20"
                            y="20"
                            width="56"
                            height="56"
                            rx="12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeOpacity="0.08"
                            fill="currentColor"
                            fillOpacity="0.03"
                        />
                        <path
                            d="M10 50 Q30 30 50 50 T90 50"
                            stroke="currentColor"
                            strokeWidth="1"
                            strokeOpacity="0.06"
                            fill="none"
                        />
                    </svg>
                    <div className="relative flex items-center gap-3">
                        <Link
                            href={`/k/${community.slug}`}
                            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50 transition hover:border-primary/30"
                        >
                            {community.logo_url ? (
                                <Image
                                    src={community.logo_url}
                                    alt={community.name}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <Users className="h-4 w-4 text-slate-400" />
                            )}
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Link
                                    href={`/k/${community.slug}`}
                                    className="font-semibold text-primary transition hover:underline"
                                >
                                    k/{community.slug}
                                </Link>
                                <ChevronRight className="h-3 w-3 text-slate-400" />
                                <span className="truncate font-medium text-slate-500">
                                    Post
                                </span>
                            </div>
                            {getOrganizerLabel(post) ? (
                                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                                    {getOrganizerLabel(post)}
                                </p>
                            ) : null}
                        </div>
                        <Button
                            variant="outline"
                            asChild
                            className="hidden h-9 rounded-xl border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary sm:flex"
                        >
                            <Link href={`/k/${community.slug}`}>
                                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Post Article */}
                <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
                    <div className="flex flex-col gap-5 p-5 sm:p-7">
                        {/* Author Bar */}
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-linear-to-br from-primary/80 to-primary">
                                <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
                                    {postAuthorInitials}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">
                                    {postAuthor}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {formatDate(post.created_at)}
                                </p>
                            </div>
                            {post.post_type === "announcement" ? (
                                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Pengumuman
                                </span>
                            ) : null}
                        </div>

                        {/* Post Content */}
                        <div>
                            <h1 className="text-xl font-bold leading-snug text-slate-950 sm:text-2xl">
                                {post.title}
                            </h1>
                            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 md:text-base">
                                {post.body}
                            </p>

                            <PostImageCarousel
                                imageUrls={post.image_urls}
                                className="mt-5"
                                imageClassName="max-h-[620px]"
                            />
                            <RelatedEventCard
                                relatedEvent={post.related_event}
                                className="mt-5"
                            />
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                <MessageCircle className="h-4.5 w-4.5" />
                                {formatNumber(post.comment_count)} Komentar
                            </span>
                            <ShareDialog
                                title={post.title}
                                description={post.body}
                                imageUrl={post.image_urls?.[0]}
                                contentType="post"
                            >
                                <button
                                    type="button"
                                    className="ml-auto flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-primary hover:shadow-sm"
                                >
                                    <Share2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Bagikan
                                    </span>
                                </button>
                            </ShareDialog>
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 sm:p-7">
                    <div className="mb-5 flex items-center gap-3">
                        <h2 className="text-base font-semibold text-slate-950">
                            Komentar
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-primary-light px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
                            {formatNumber(post.comment_count)}
                        </span>
                    </div>

                    <div className="mb-6">
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
                        <div className="space-y-6">
                            {commentThreads.map((thread, threadIndex) => {
                                const isExpanded =
                                    expandedRepliesByRootId[thread.root.id] ??
                                    false;
                                const visibleReplies = isExpanded
                                    ? thread.replies
                                    : thread.replies.slice(
                                          0,
                                          COLLAPSED_REPLY_PREVIEW_COUNT,
                                      );

                                return (
                                    <article
                                        key={`${thread.root.id || "thread"}-${threadIndex}`}
                                        className="space-y-3 border-b border-slate-200/60 pb-6 last:border-b-0 last:pb-0"
                                    >
                                        <ThreadCommentRow
                                            comment={thread.root}
                                            displayBody={thread.root.body}
                                            userId={userId}
                                            canManage={canManage}
                                            onReply={() =>
                                                activateReplyTarget(thread.root)
                                            }
                                            onUpdate={handleUpdateComment}
                                            onDelete={setCommentToDelete}
                                        />

                                        {thread.replies.length ? (
                                            <div className="pl-9 sm:pl-14">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedRepliesByRootId(
                                                            (current) => ({
                                                                ...current,
                                                                [thread.root
                                                                    .id]:
                                                                    !isExpanded,
                                                            }),
                                                        )
                                                    }
                                                    className="mb-3 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-light"
                                                >
                                                    <MessageCircle className="h-3.5 w-3.5" />
                                                    {isExpanded
                                                        ? "Sembunyikan balasan"
                                                        : `Lihat ${formatNumber(
                                                              thread.replies
                                                                  .length,
                                                          )} balasan`}
                                                </button>

                                                {visibleReplies.length ? (
                                                    <div className="space-y-3">
                                                        {visibleReplies.map(
                                                            (
                                                                reply,
                                                                replyIndex,
                                                            ) => (
                                                                <ThreadCommentRow
                                                                    key={`${reply.comment.id || "reply"}-${replyIndex}`}
                                                                    comment={
                                                                        reply.comment
                                                                    }
                                                                    displayBody={
                                                                        reply.displayBody
                                                                    }
                                                                    userId={
                                                                        userId
                                                                    }
                                                                    canManage={
                                                                        canManage
                                                                    }
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
                                                                        setCommentToDelete
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="px-5 py-10 text-center">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                                <MessageCircle className="h-5 w-5 text-slate-400" />
                            </div>
                            <p className="text-sm font-medium text-slate-600">
                                Belum ada komentar.
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Jadilah yang pertama berkomentar!
                            </p>
                        </div>
                    )}

                    {hasNext ? (
                        <Button
                            variant="outline"
                            disabled={isLoadingComments}
                            onClick={() => loadComments(page + 1, true)}
                            className="mt-6 flex h-10 w-full items-center justify-center rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                        >
                            {isLoadingComments ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Muat lebih banyak komentar
                        </Button>
                    ) : null}
                </section>
            </div>
            <DeleteConfirmDialog
                open={Boolean(commentToDelete)}
                title="Hapus komentar?"
                description="Komentar ini akan dihapus dari diskusi. Jika komentar memiliki balasan, balasan di bawahnya juga ikut terhapus."
                details={commentToDelete?.body}
                isLoading={Boolean(deletingCommentId)}
                onOpenChange={(open) => {
                    if (!open && !deletingCommentId) setCommentToDelete(null);
                }}
                onConfirm={() => {
                    if (commentToDelete) void handleDeleteComment(commentToDelete);
                }}
            />
        </main>
    );
}
