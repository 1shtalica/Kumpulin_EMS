"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import {
    CalendarDays,
    ImagePlus,
    Loader2,
    MessageCircle,
    MoreHorizontal,
    Pencil,
    Share,
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
import { useAuthStore } from "@/stores/auth-store";
import type { Community, Post } from "@/types/community";
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
    }).format(new Date(value));

const formatNumber = (value: number) =>
    new Intl.NumberFormat("id-ID").format(value);

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "K";

function CommunityAvatar({ community }: { community: Community }) {
    if (community.logo_url) {
        return (
            <img
                src={community.logo_url}
                alt={community.name}
                className="h-full w-full object-cover"
            />
        );
    }

    return (
        <span className="flex h-full w-full items-center justify-center bg-slate-950 text-lg font-semibold text-white">
            {getInitials(community.name)}
        </span>
    );
}

function PostFormDialog({
    open,
    onOpenChange,
    post,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    post?: Post | null;
    onSubmit: (payload: {
        title: string;
        body: string;
        post_type: "text" | "announcement";
        images: File[];
        replaceImages: boolean;
    }) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [postType, setPostType] = useState<"text" | "announcement">("text");
    const [images, setImages] = useState<File[]>([]);
    const [replaceImages, setReplaceImages] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setTitle(post?.title ?? "");
        setBody(post?.body ?? "");
        setPostType(
            post?.post_type === "announcement" ? "announcement" : "text",
        );
        setImages([]);
        setReplaceImages(false);
    }, [open, post]);

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim()) {
            toast.error("Judul dan isi post wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                title: title.trim(),
                body: body.trim(),
                post_type: postType,
                images,
                replaceImages,
            });
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        {post ? "Edit Post" : "Buat Post"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="post-title">Judul</Label>
                        <Input
                            id="post-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Tulis judul diskusi"
                            className="rounded-xl bg-slate-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-body">Isi</Label>
                        <Textarea
                            id="post-body"
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            placeholder="Bagikan update, pertanyaan, atau pengumuman..."
                            className="min-h-40 rounded-xl bg-slate-50 leading-6"
                        />
                    </div>

                    {!post ? (
                        <div className="space-y-2">
                            <Label htmlFor="post-type">Tipe Post</Label>
                            <select
                                id="post-type"
                                value={postType}
                                onChange={(event) =>
                                    setPostType(
                                        event.target.value as
                                            | "text"
                                            | "announcement",
                                    )
                                }
                                className="h-10 w-full rounded-xl border border-input bg-slate-50 px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
                            >
                                <option value="text">Diskusi</option>
                                <option value="announcement">Pengumuman</option>
                            </select>
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        <Label htmlFor="post-images">
                            {post ? "Ganti Gambar" : "Gambar"}
                        </Label>
                        <label
                            htmlFor="post-images"
                            className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/60 px-4 py-4 text-sm text-slate-600 transition hover:border-primary/40"
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <ImagePlus className="h-5 w-5 shrink-0 text-primary" />
                                <span className="truncate">
                                    {images.length
                                        ? `${images.length} gambar dipilih`
                                        : "Pilih maksimal 5 gambar, 5 MB per gambar"}
                                </span>
                            </span>
                            <span className="shrink-0 font-semibold text-primary">
                                Pilih
                            </span>
                        </label>
                        <input
                            id="post-images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(event) =>
                                setImages(Array.from(event.target.files ?? []))
                            }
                        />
                        {post && images.length > 0 ? (
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                    type="checkbox"
                                    checked={replaceImages}
                                    onChange={(event) =>
                                        setReplaceImages(event.target.checked)
                                    }
                                />
                                Ganti semua gambar post dengan pilihan ini
                            </label>
                        ) : null}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        className="rounded-full"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {post ? "Simpan" : "Terbitkan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PostCard({
    post,
    communityId,
    canManage,
    onEdit,
    onDelete,
}: {
    post: Post;
    communityId: string;
    canManage: boolean;
    onEdit: (post: Post) => void;
    onDelete: (post: Post) => void;
}) {
    return (
        <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                {post.post_type === "announcement"
                                    ? "Pengumuman"
                                    : "Diskusi"}
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    </div>
                    {canManage ? (
                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onEdit(post)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-primary"
                                aria-label="Edit post"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(post)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                aria-label="Hapus post"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <MoreHorizontal className="h-5 w-5 text-slate-300" />
                    )}
                </div>

                <Link
                    href={`/komunitas/${communityId}/post/${post.id}`}
                    className="group block"
                >
                    <h2 className="mb-2.5 text-lg font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary sm:text-xl sm:leading-7">
                        {post.title}
                    </h2>
                    <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
                        {post.body}
                    </p>
                </Link>

                <PostImageCarousel
                    imageUrls={post.image_urls}
                    href={`/komunitas/${communityId}/post/${post.id}`}
                    className="mt-0"
                />

                <div className="mt-1 flex items-center gap-2 border-t border-slate-100 pt-5">
                    <Link
                        href={`/komunitas/${communityId}/post/${post.id}`}
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

export default function CommunityDetailClient({
    communityId,
}: {
    communityId: string;
}) {
    const user = useAuthStore((state) => state.user);
    const [community, setCommunity] = useState<Community | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [isMutatingMembership, setIsMutatingMembership] = useState(false);
    const [joined, setJoined] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const canManage = user?.role === "organizer";

    const loadPosts = useCallback(
        async (targetPage = 1, append = false) => {
            setIsLoadingPosts(true);
            try {
                const result = await CommunityService.listPosts(
                    communityId,
                    targetPage,
                    10,
                );
                setPosts((current) =>
                    append ? [...current, ...result.data] : result.data,
                );
                setPage(result.page);
                setHasNext(result.hasNext);
            } catch (error) {
                toast.error(getApiErrorMessage(error, "Gagal mengambil post."));
            } finally {
                setIsLoadingPosts(false);
            }
        },
        [communityId],
    );

    useEffect(() => {
        let mounted = true;

        const loadCommunity = async () => {
            setIsLoading(true);
            try {
                const data =
                    await CommunityService.getCommunityById(communityId);
                if (!mounted) return;
                setCommunity(data);
                await loadPosts(1);
            } catch (error) {
                if (!mounted) return;
                toast.error(
                    getApiErrorMessage(error, "Gagal mengambil komunitas."),
                );
                setCommunity(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void loadCommunity();

        return () => {
            mounted = false;
        };
    }, [communityId, loadPosts]);

    const memberCount = useMemo(() => {
        if (!community) return 0;
        return community.member_count + (joined ? 1 : 0);
    }, [community, joined]);

    const handleJoinToggle = async () => {
        if (!user) {
            toast.error("Silakan login untuk bergabung dengan komunitas.");
            return;
        }

        setIsMutatingMembership(true);
        try {
            if (joined) {
                await CommunityService.leaveCommunity(communityId);
                setJoined(false);
                toast.success("Anda keluar dari komunitas.");
            } else {
                await CommunityService.joinCommunity(communityId);
                setJoined(true);
                toast.success("Berhasil bergabung dengan komunitas.");
            }
        } catch (error) {
            toast.error(
                getApiErrorMessage(
                    error,
                    joined
                        ? "Gagal keluar dari komunitas."
                        : "Gagal bergabung dengan komunitas.",
                ),
            );
        } finally {
            setIsMutatingMembership(false);
        }
    };

    const handlePostSubmit = async (payload: {
        title: string;
        body: string;
        post_type: "text" | "announcement";
        images: File[];
        replaceImages: boolean;
    }) => {
        const toastId = toast.loading(
            editingPost ? "Menyimpan post..." : "Menerbitkan post...",
        );

        try {
            if (editingPost) {
                const updatedPost = await CommunityService.updatePost(
                    communityId,
                    editingPost.id,
                    { title: payload.title, body: payload.body },
                );
                let finalPost = updatedPost;
                if (payload.replaceImages && payload.images.length) {
                    finalPost = await CommunityService.replacePostImages(
                        communityId,
                        editingPost.id,
                        payload.images,
                    );
                }
                setPosts((current) =>
                    current.map((post) =>
                        post.id === editingPost.id ? finalPost : post,
                    ),
                );
                toast.success("Post berhasil diperbarui.", { id: toastId });
                return;
            }

            const createdPost = await CommunityService.createPost(communityId, {
                title: payload.title,
                body: payload.body,
                post_type: payload.post_type,
                images: payload.images,
            });
            setPosts((current) => [createdPost, ...current]);
            setCommunity((current) =>
                current
                    ? { ...current, post_count: current.post_count + 1 }
                    : current,
            );
            toast.success("Post berhasil diterbitkan.", { id: toastId });
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menyimpan post."), {
                id: toastId,
            });
            throw error;
        }
    };

    const handleDeletePost = async (post: Post) => {
        const confirmed = window.confirm(`Hapus post "${post.title}"?`);
        if (!confirmed) return;

        const toastId = toast.loading("Menghapus post...");
        try {
            await CommunityService.deletePost(communityId, post.id);
            setPosts((current) =>
                current.filter((item) => item.id !== post.id),
            );
            setCommunity((current) =>
                current
                    ? {
                          ...current,
                          post_count: Math.max(current.post_count - 1, 0),
                      }
                    : current,
            );
            toast.success("Post berhasil dihapus.", { id: toastId });
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menghapus post."), {
                id: toastId,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto w-full max-w-[800px] px-4 pb-24 pt-28 sm:px-6">
                    <div className="h-96 animate-pulse rounded-3xl bg-white" />
                    <div className="mt-8 h-52 animate-pulse rounded-3xl bg-white" />
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 pt-32 text-center">
                <h1 className="text-xl font-semibold text-slate-950">
                    Komunitas tidak ditemukan
                </h1>
                <Button asChild className="mt-5 rounded-full">
                    <Link href="/komunitas">Kembali ke komunitas</Link>
                </Button>
            </div>
        );
    }

    return (
        <main className="mx-auto w-full max-w-[800px] px-4 pb-24 pt-28 sm:px-6">
            <div className="flex w-full flex-col gap-8">
                <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <div className="h-56 w-full bg-slate-200 sm:h-64">
                        {community.banner_url ? (
                            <img
                                alt=""
                                className="h-full w-full object-cover"
                                src={community.banner_url}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-slate-900 text-sm font-semibold text-white">
                                {community.name}
                            </div>
                        )}
                    </div>

                    <div className="relative px-6 pb-7 sm:px-8">
                        <div className="mb-6 -mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm">
                                <CommunityAvatar community={community} />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="rounded-full border-slate-200"
                                >
                                    <Share className="h-4 w-4" />
                                    Bagikan
                                </Button>
                                <Button
                                    onClick={handleJoinToggle}
                                    disabled={isMutatingMembership}
                                    className="rounded-full px-6"
                                    variant={joined ? "outline" : "default"}
                                >
                                    {isMutatingMembership ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : null}
                                    {joined ? "Keluar" : "Bergabung"}
                                </Button>
                            </div>
                        </div>

                        <div>
                            <h1 className="mb-1 text-xl font-semibold leading-7 text-slate-900 sm:text-2xl">
                                {community.name}
                            </h1>
                            <p className="text-sm font-medium text-slate-500">
                                k/{community.slug}
                            </p>
                            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
                                {community.description ||
                                    "Komunitas ini belum memiliki deskripsi."}
                            </p>

                            {community.rules ? (
                                <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-4">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Peraturan Komunitas
                                    </p>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                        {community.rules}
                                    </p>
                                </div>
                            ) : null}

                            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6 text-sm text-slate-700">
                                <div>
                                    <span className="block text-base font-semibold text-slate-900">
                                        {formatNumber(memberCount)}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Anggota
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-base font-semibold text-slate-900">
                                        {formatNumber(community.post_count)}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Post
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="flex items-center justify-end gap-2 text-sm font-medium text-slate-400">
                                        <CalendarDays className="h-4 w-4" />
                                        {formatDate(community.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-950">
                            Post Komunitas
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Diskusi dan pengumuman terbaru.
                        </p>
                    </div>
                    {canManage ? (
                        <Button
                            className="rounded-full"
                            onClick={() => {
                                setEditingPost(null);
                                setFormOpen(true);
                            }}
                        >
                            Buat Post
                        </Button>
                    ) : null}
                </div>

                {posts.length ? (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            communityId={community.id}
                            canManage={canManage}
                            onEdit={(targetPost) => {
                                setEditingPost(targetPost);
                                setFormOpen(true);
                            }}
                            onDelete={handleDeletePost}
                        />
                    ))
                ) : (
                    <div className="rounded-3xl border border-slate-100 bg-white px-6 py-12 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <UsersRound className="mx-auto h-8 w-8 text-slate-300" />
                        <h3 className="mt-4 text-base font-semibold text-slate-900">
                            Belum ada post
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Post yang dibuat pengelola komunitas akan tampil di
                            sini.
                        </p>
                    </div>
                )}

                {hasNext ? (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            disabled={isLoadingPosts}
                            onClick={() => loadPosts(page + 1, true)}
                            className="rounded-full px-7"
                        >
                            {isLoadingPosts ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Muat lebih banyak
                        </Button>
                    </div>
                ) : null}
            </div>

            <PostFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                post={editingPost}
                onSubmit={handlePostSubmit}
            />
        </main>
    );
}
