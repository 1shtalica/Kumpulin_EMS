"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import {
    Loader2,
    MessageCircle,
    Pencil,
    Plus,
    Send,
    ShieldCheck,
    Trash2,
    UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommunityService } from "@/services/community-service";
import { SupportService } from "@/services/support-service";
import type { Comment, Community, Post } from "@/types/community";
import SupportPageSurface from "./SupportPageSurface";
import DeleteConfirmDialog from "@/components/community/DeleteConfirmDialog";

type ApiErrorBody = {
    message?: string;
    errors?: Array<string | { message?: string }>;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const firstError = axiosError.response?.data?.errors?.[0];
    if (typeof firstError === "string") return firstError;
    if (firstError?.message) return firstError.message;
    return (
        axiosError.response?.data?.message ||
        (error instanceof Error ? error.message : fallback)
    );
};

const getErrorStatus = (error: unknown) =>
    (error as AxiosError).response?.status;

const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatNumber = (value?: number) =>
    new Intl.NumberFormat("id-ID").format(value ?? 0);

function AccessMessage({ title, message }: { title: string; message: string }) {
    return (
        <SupportPageSurface>
            <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-14 text-center shadow-md shadow-slate-900/5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <UsersRound className="h-7 w-7" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-slate-950">
                    {title}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    {message}
                </p>
            </section>
        </SupportPageSurface>
    );
}

function PostDialog({
    open,
    post,
    onOpenChange,
    onSubmit,
}: {
    open: boolean;
    post: Post | null;
    onOpenChange: (open: boolean) => void;
    onSubmit: (payload: {
        title: string;
        body: string;
        post_type: "text" | "announcement";
    }) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [postType, setPostType] = useState<"text" | "announcement">("text");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setTitle(post?.title ?? "");
        setBody(post?.body ?? "");
        setPostType(
            post?.post_type === "announcement" ? "announcement" : "text",
        );
    }, [open, post]);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            toast.error("Judul dan isi post wajib diisi.");
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                body: body.trim(),
                post_type: postType,
            });
            onOpenChange(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {post ? "Edit Post" : "Buat Post"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="support-post-title">Judul</Label>
                        <Input
                            id="support-post-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="rounded-xl bg-slate-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="support-post-body">Isi</Label>
                        <Textarea
                            id="support-post-body"
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            className="min-h-40 rounded-xl bg-slate-50"
                        />
                    </div>
                    {!post ? (
                        <div className="space-y-2">
                            <Label htmlFor="support-post-type">Tipe Post</Label>
                            <select
                                id="support-post-type"
                                value={postType}
                                onChange={(event) =>
                                    setPostType(
                                        event.target.value as
                                            "text" | "announcement",
                                    )
                                }
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-primary/40 focus:ring-3 focus:ring-primary/20"
                            >
                                <option value="text">Diskusi</option>
                                <option value="announcement">Pengumuman</option>
                            </select>
                        </div>
                    ) : null}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        className="rounded-xl"
                        disabled={submitting}
                        onClick={handleSubmit}
                    >
                        {submitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CommentPanel({
    communityId,
    post,
}: {
    communityId: string;
    post: Post;
}) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(
        null,
    );
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
        null,
    );

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const result = await CommunityService.listComments(
                communityId,
                post.id,
                1,
                50,
            );
            setComments(result.data);
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal mengambil komentar."));
        } finally {
            setLoading(false);
        }
    }, [communityId, post.id]);

    useEffect(() => {
        void loadComments();
    }, [loadComments]);

    const handleCreate = async () => {
        if (!body.trim()) return;
        try {
            const created = await CommunityService.createComment(
                communityId,
                post.id,
                {
                    body: body.trim(),
                },
            );
            setComments((current) => [...current, created]);
            setBody("");
            toast.success("Komentar ditambahkan.");
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menambah komentar."));
        }
    };

    const handleDelete = async () => {
        if (!commentToDelete) return;

        setDeletingCommentId(commentToDelete.id);
        try {
            await CommunityService.deleteComment(
                communityId,
                post.id,
                commentToDelete.id,
            );
            setComments((current) =>
                current.filter((item) => item.id !== commentToDelete.id),
            );
            setCommentToDelete(null);
            toast.success("Komentar dihapus.");
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menghapus komentar."));
        } finally {
            setDeletingCommentId(null);
        }
    };

    return (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-950">Komentar</p>
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : null}
            </div>
            <div className="mt-3 flex gap-2">
                <Input
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    placeholder="Tulis komentar..."
                    className="h-10 rounded-xl border-slate-200 bg-white"
                />
                <Button
                    className="h-10 rounded-xl"
                    onClick={handleCreate}
                    disabled={!body.trim()}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            <div className="mt-3 space-y-2">
                {comments.map((comment) => (
                    <div
                        key={comment.id}
                        className="rounded-xl border border-slate-200/80 bg-white p-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-500">
                                    {comment.author_name ||
                                        `User ${comment.author_user_id}`}{" "}
                                    - {formatDate(comment.created_at)}
                                </p>
                                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                                    {comment.body}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setCommentToDelete(comment)}
                                aria-label="Hapus komentar"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
                {!loading && comments.length === 0 ? (
                    <p className="py-3 text-center text-xs text-slate-500">
                        Belum ada komentar.
                    </p>
                ) : null}
            </div>

            <Dialog
                open={Boolean(commentToDelete)}
                onOpenChange={(open) => !open && setCommentToDelete(null)}
            >
                <DialogContent className="rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus komentar?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <p className="text-sm leading-6 text-slate-600">
                            Komentar dari{" "}
                            {commentToDelete?.author_name || "user ini"} akan
                            dihapus dari post ini.
                        </p>
                        {commentToDelete ? (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                <p className="line-clamp-3 whitespace-pre-line">
                                    {commentToDelete.body}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCommentToDelete(null)}
                            disabled={Boolean(deletingCommentId)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            className="rounded-xl"
                            onClick={handleDelete}
                            disabled={Boolean(deletingCommentId)}
                        >
                            {deletingCommentId ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
function SupportCommunityItem({ initialCommunity }: { initialCommunity: Community }) {
    const [community, setCommunity] = useState<Community>(initialCommunity);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

    const sortedPosts = useMemo(
        () =>
            [...posts].sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
            ),
        [posts],
    );

    useEffect(() => {
        const fetchPosts = async () => {
            setLoadingPosts(true);
            try {
                const postResult = await CommunityService.listPosts(
                    community.id,
                    1,
                    50,
                );
                setPosts(postResult.data);
            } catch (error) {
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Gagal mengambil post komunitas.",
                    ),
                );
            } finally {
                setLoadingPosts(false);
            }
        };
        void fetchPosts();
    }, [community.id]);

    const handlePostSubmit = async (payload: {
        title: string;
        body: string;
        post_type: "text" | "announcement";
    }) => {
        try {
            if (editingPost) {
                const updated = await CommunityService.updatePost(
                    community.id,
                    editingPost.id,
                    {
                        title: payload.title,
                        body: payload.body,
                    },
                );
                setPosts((current) =>
                    current.map((post) =>
                        post.id === editingPost.id ? updated : post,
                    ),
                );
                toast.success("Post diperbarui.");
                return;
            }

            const created = await CommunityService.createPost(
                community.id,
                payload,
            );
            setPosts((current) => [created, ...current]);
            setCommunity((current) => ({
                ...current,
                post_count: current.post_count + 1,
            }));
            toast.success("Post diterbitkan.");
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menyimpan post."));
            throw error;
        }
    };

    const handleDeletePost = async () => {
        if (!postToDelete) return;

        setDeletingPostId(postToDelete.id);
        try {
            await CommunityService.deletePost(community.id, postToDelete.id);
            setPosts((current) =>
                current.filter((item) => item.id !== postToDelete.id),
            );
            setCommunity((current) => ({
                ...current,
                post_count: Math.max(current.post_count - 1, 0),
            }));
            setPostToDelete(null);
            toast.success("Post dihapus.");
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menghapus post."));
        } finally {
            setDeletingPostId(null);
        }
    };

    return (
        <div className="mb-12 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
                {community.banner_url ? (
                    <div className="relative h-44 bg-slate-100 md:h-56">
                        <Image
                            src={community.banner_url}
                            alt=""
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 to-transparent" />
                        <div className="absolute bottom-5 left-5 right-5">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-white/75">
                                Support community
                            </p>
                            <h1 className="mt-1 text-3xl font-bold leading-tight text-white">
                                {community.name}
                            </h1>
                        </div>
                    </div>
                ) : (
                    <div className="p-5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Support community
                        </p>
                        <h1 className="mt-2 text-2xl font-bold text-slate-950">
                            {community.name}
                        </h1>
                    </div>
                )}
                <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_280px]">
                    <div>
                        <p className="text-sm leading-relaxed text-slate-600">
                            {community.description ||
                                "Komunitas ini belum memiliki deskripsi."}
                        </p>
                    </div>
                    <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/80 text-center">
                        <div className="px-3 py-3">
                            <p className="text-xl font-semibold text-slate-950">
                                {formatNumber(community.member_count)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Anggota
                            </p>
                        </div>
                        <div className="border-x border-slate-200/80 px-3 py-3">
                            <p className="text-xl font-semibold text-slate-950">
                                {formatNumber(community.post_count)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Post
                            </p>
                        </div>
                        <div className="px-3 py-3">
                            <p className="text-xl font-semibold text-slate-950">
                                {formatNumber(community.event_count)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Event
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-950">
                            Community posts
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buat, edit, hapus post, dan kelola komentar.
                        </p>
                    </div>
                    <Button
                        className="h-10 rounded-xl text-sm font-semibold"
                        onClick={() => {
                            setEditingPost(null);
                            setDialogOpen(true);
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Post
                    </Button>
                </div>
            </section>

            {loadingPosts ? (
                <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : sortedPosts.length ? (
                <section className="space-y-3">
                    {sortedPosts.map((post) => (
                        <article
                            key={post.id}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                                            {post.post_type ===
                                            "announcement"
                                                ? "Pengumuman"
                                                : "Diskusi"}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {formatDate(post.created_at)}
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-lg font-semibold text-slate-950">
                                        {post.title}
                                    </h3>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                        {post.body}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <button
                                        type="button"
                                        className="rounded-xl p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                                        onClick={() => {
                                            setEditingPost(post);
                                            setDialogOpen(true);
                                        }}
                                        aria-label="Edit post"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => setPostToDelete(post)}
                                        aria-label="Hapus post"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="mt-4 h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                                onClick={() =>
                                    setExpandedPostId((current) =>
                                        current === post.id ? null : post.id,
                                    )
                                }
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {expandedPostId === post.id
                                    ? "Tutup komentar"
                                    : "Kelola komentar"}
                            </Button>
                            {expandedPostId === post.id ? (
                                <CommentPanel
                                    communityId={community.id}
                                    post={post}
                                />
                            ) : null}
                        </article>
                    ))}
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm shadow-slate-900/5">
                    <ShieldCheck className="mx-auto h-8 w-8 text-slate-300" />
                    <h2 className="mt-4 text-lg font-semibold text-slate-950">
                        Belum ada post
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Buat post pertama untuk komunitas organizer ini.
                    </p>
                </section>
            )}

            <PostDialog
                open={dialogOpen}
                post={editingPost}
                onOpenChange={setDialogOpen}
                onSubmit={handlePostSubmit}
            />
            <DeleteConfirmDialog
                open={Boolean(postToDelete)}
                title="Hapus post?"
                description="Post ini akan dihapus dari komunitas organizer yang sedang Anda dukung."
                details={postToDelete?.title}
                isLoading={Boolean(deletingPostId)}
                onOpenChange={(open) => {
                    if (!open && !deletingPostId) setPostToDelete(null);
                }}
                onConfirm={handleDeletePost}
            />
        </div>
    );
}

export default function SupportCommunityClient() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const loadCommunities = useCallback(async () => {
        setLoading(true);
        setAccessDenied(false);
        setNotFound(false);
        try {
            const result = await SupportService.getSupportCommunities();
            if (result.data.length === 0) {
                setNotFound(true);
            } else {
                setCommunities(result.data);
            }
        } catch (error) {
            const status = getErrorStatus(error);
            if (status === 403) setAccessDenied(true);
            else if (status === 404) setNotFound(true);
            else
                toast.error(
                    getApiErrorMessage(
                        error,
                        "Gagal mengambil komunitas support.",
                    ),
                );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCommunities();
    }, [loadCommunities]);

    if (accessDenied) {
        return (
            <AccessMessage
                title="You do not have support access."
                message="Akun ini belum memiliki akses support komunitas."
            />
        );
    }

    if (notFound) {
        return (
            <AccessMessage
                title="No community is available for this organizer yet."
                message="Organizer yang Anda dukung belum memiliki komunitas."
            />
        );
    }

    return (
        <SupportPageSurface>
            {loading ? (
                <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-8">
                    {communities.map((community) => (
                        <SupportCommunityItem
                            key={community.id}
                            initialCommunity={community}
                        />
                    ))}
                </div>
            )}
        </SupportPageSurface>
    );
}
