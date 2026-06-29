"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AxiosError } from "axios";
import {
    CalendarDays,
    FileText,
    ImagePlus,
    Loader2,
    MessageCircle,
    MoreHorizontal,
    Plus,
    Pencil,
    Share,
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
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
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

    useEffect(() => {
        const previewUrls = images.map((image) => URL.createObjectURL(image));
        setImagePreviewUrls(previewUrls);

        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

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

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImages = Array.from(event.target.files ?? []);
        setImages(selectedImages);
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
                            onChange={handleImageChange}
                        />
                        {imagePreviewUrls.length ? (
                            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                                {imagePreviewUrls.map((url, index) => (
                                    <div
                                        key={`${images[index]?.name ?? "preview"}-${index}`}
                                        className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                                    >
                                        <img
                                            src={url}
                                            alt={images[index]?.name ?? `Preview ${index + 1}`}
                                            className="aspect-square h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImages((current) =>
                                                    current.filter(
                                                        (_, imageIndex) =>
                                                            imageIndex !== index,
                                                    ),
                                                )
                                            }
                                            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition hover:bg-black/80"
                                            aria-label="Hapus gambar"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
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
    postHref,
    canManage,
    onEdit,
    onDelete,
}: {
    post: Post;
    postHref: string;
    canManage: boolean;
    onEdit: (post: Post) => void;
    onDelete: (post: Post) => void;
}) {
    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/10">
            <div className="flex flex-col gap-5 p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                                {post.post_type === "announcement"
                                    ? "Pengumuman"
                                    : "Diskusi"}
                            </span>
                            <span className="text-xs font-medium text-slate-500">
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    </div>
                    {canManage ? (
                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onEdit(post)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-primary-light hover:text-primary"
                                aria-label="Edit post"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => onDelete(post)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                aria-label="Hapus post"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <MoreHorizontal className="h-5 w-5 text-slate-300" />
                    )}
                </div>

                <Link href={postHref} className="group block">
                    <h2 className="mb-2.5 line-clamp-2 text-lg font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary">
                        {post.title}
                    </h2>
                    <p className="line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {post.body}
                    </p>
                </Link>

                <PostImageCarousel
                    imageUrls={post.image_urls}
                    href={postHref}
                    className="mt-0"
                />

                <div className="mt-1 flex items-center gap-2 border-t border-slate-200/80 pt-5">
                    <Link
                        href={postHref}
                        className="group flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary-light hover:text-primary"
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span>{formatNumber(post.comment_count)} Komentar</span>
                    </Link>
                    <button className="group ml-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary-light hover:text-primary">
                        <Share className="h-5 w-5" />
                        <span>Bagikan</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

function PublicCommunitySurface({ children }: { children: ReactNode }) {
    return (
        <main className="relative overflow-hidden bg-[#f9fafb] px-4 pb-24 pt-20 sm:px-6 lg:px-8">
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
            <svg
                className="pointer-events-none absolute inset-x-0 top-20 h-96 w-full text-primary"
                viewBox="0 0 1440 420"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    d="M64 274C224 154 332 334 514 196C666 81 806 155 962 94C1128 29 1264 122 1384 54"
                    stroke="currentColor"
                    strokeOpacity="0.07"
                    strokeWidth="2"
                />
                <path
                    d="M88 116C244 198 368 72 526 148C704 234 842 90 1032 184C1170 252 1262 286 1370 230"
                    stroke="#10b981"
                    strokeOpacity="0.055"
                    strokeWidth="2"
                />
            </svg>
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

export default function CommunityDetailClient({
    communityId,
    communitySlug,
}: {
    communityId?: string;
    communitySlug?: string;
}) {
    const user = useAuthStore((state) => state.user);
    const [community, setCommunity] = useState<Community | null>(null);
    const [resolvedCommunityId, setResolvedCommunityId] = useState<string | null>(
        communityId ?? null,
    );
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
        async (targetCommunityId: string, targetPage = 1, append = false) => {
            setIsLoadingPosts(true);
            try {
                const result = await CommunityService.listPosts(
                    targetCommunityId,
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
        [],
    );

    useEffect(() => {
        let mounted = true;

        const loadCommunity = async () => {
            setIsLoading(true);
            try {
                const data = communitySlug
                    ? await CommunityService.getCommunityBySlug(communitySlug)
                    : await CommunityService.getCommunityById(communityId ?? "");
                if (!mounted) return;
                setCommunity(data);
                setResolvedCommunityId(data.id);
                await loadPosts(data.id, 1);
            } catch (error) {
                if (!mounted) return;
                toast.error(
                    getApiErrorMessage(error, "Gagal mengambil komunitas."),
                );
                setCommunity(null);
                setResolvedCommunityId(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        if (communityId || communitySlug) {
            void loadCommunity();
        }

        return () => {
            mounted = false;
        };
    }, [communityId, communitySlug, loadPosts]);

    const memberCount = useMemo(() => {
        if (!community) return 0;
        return community.member_count + (joined ? 1 : 0);
    }, [community, joined]);

    const handleJoinToggle = async () => {
        if (!user) {
            toast.error("Silakan login untuk bergabung dengan komunitas.");
            return;
        }

        if (!resolvedCommunityId) return;

        setIsMutatingMembership(true);
        try {
            if (joined) {
                await CommunityService.leaveCommunity(resolvedCommunityId);
                setJoined(false);
                toast.success("Anda keluar dari komunitas.");
            } else {
                await CommunityService.joinCommunity(resolvedCommunityId);
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
        if (!resolvedCommunityId) return;

        const toastId = toast.loading(
            editingPost ? "Menyimpan post..." : "Menerbitkan post...",
        );

        try {
            if (editingPost) {
                const updatedPost = await CommunityService.updatePost(
                    resolvedCommunityId,
                    editingPost.id,
                    { title: payload.title, body: payload.body },
                );
                let finalPost = updatedPost;
                if (payload.replaceImages && payload.images.length) {
                    finalPost = await CommunityService.replacePostImages(
                        resolvedCommunityId,
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

            const createdPost = await CommunityService.createPost(
                resolvedCommunityId,
                {
                    title: payload.title,
                    body: payload.body,
                    post_type: payload.post_type,
                    images: payload.images,
                },
            );
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
        if (!resolvedCommunityId) return;

        const confirmed = window.confirm(`Hapus post "${post.title}"?`);
        if (!confirmed) return;

        const toastId = toast.loading("Menghapus post...");
        try {
            await CommunityService.deletePost(resolvedCommunityId, post.id);
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
            <PublicCommunitySurface>
                <div className="h-80 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5" />
                <div className="h-52 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5" />
            </PublicCommunitySurface>
        );
    }

    if (!community) {
        return (
            <PublicCommunitySurface>
                <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-md shadow-slate-900/5">
                    <h1 className="text-xl font-semibold text-slate-950">
                        Komunitas tidak ditemukan
                    </h1>
                    <Button asChild className="mt-5 h-10 rounded-xl text-sm font-semibold">
                        <Link href="/komunitas">Kembali ke komunitas</Link>
                    </Button>
                </div>
            </PublicCommunitySurface>
        );
    }

    const communityHref = `/k/${community.slug}`;

    return (
        <PublicCommunitySurface>
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
                <div className="h-2 bg-linear-to-r from-primary via-emerald-400 to-sky-400" />
                <div className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-60"
                        aria-hidden="true"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 16px 16px, rgba(99,102,241,0.10) 0 1px, transparent 1px), linear-gradient(135deg, rgba(99,102,241,0.06), rgba(16,185,129,0.05) 45%, transparent 70%)",
                            backgroundSize: "32px 32px, 100% 100%",
                        }}
                    />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/10 sm:h-28 sm:w-28">
                                <CommunityAvatar community={community} />
                            </div>

                            <div className="min-w-0 pt-1">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                        <span className="size-1.5 rounded-full bg-emerald-500" />
                                        Komunitas publik
                                    </span>
                                    <span className="rounded-full border border-primary/15 bg-white px-2.5 py-1 text-xs font-semibold text-primary shadow-sm shadow-slate-900/5">
                                        k/{community.slug}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
                                    {community.name}
                                </h1>
                                <p className="mt-3 line-clamp-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-slate-600 md:text-base">
                                    {community.description ||
                                        "Komunitas ini belum memiliki deskripsi."}
                                </p>
                            </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:pt-8">
                            <Button
                                onClick={handleJoinToggle}
                                disabled={isMutatingMembership}
                                className="h-10 rounded-xl px-5 text-sm font-semibold shadow-sm shadow-primary/20"
                                variant={joined ? "secondary" : "default"}
                            >
                                {isMutatingMembership ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ShieldCheck className="h-4 w-4" />
                                )}
                                {joined ? "Sudah bergabung" : "Bergabung"}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:border-primary/30 hover:text-primary"
                            >
                                <Share className="h-4 w-4" />
                                Bagikan
                            </Button>
                        </div>
                    </div>

                    <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-slate-900/5 backdrop-blur">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <UsersRound className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold leading-none tabular-nums text-slate-950">
                                    {formatNumber(memberCount)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Anggota</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-slate-900/5 backdrop-blur">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold leading-none tabular-nums text-slate-950">
                                    {formatNumber(community.post_count)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Post</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-slate-900/5 backdrop-blur">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-950">
                                    {formatDate(community.created_at)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">Dibuat</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex min-w-0 flex-col gap-5">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                    Feed komunitas
                                </p>
                                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                                    Post terbaru
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Diskusi dan pengumuman terbaru dari komunitas ini.
                                </p>
                            </div>
                            {canManage ? (
                                <Button
                                    className="h-10 rounded-xl text-sm font-semibold"
                                    onClick={() => {
                                        setEditingPost(null);
                                        setFormOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    Buat Post
                                </Button>
                            ) : null}
                        </div>
                    </section>

                    {posts.length ? (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    postHref={`${communityHref}/post/${post.id}`}
                                    canManage={canManage}
                                    onEdit={(targetPost) => {
                                        setEditingPost(targetPost);
                                        setFormOpen(true);
                                    }}
                                    onDelete={handleDeletePost}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-sm shadow-slate-900/5">
                            <UsersRound className="mx-auto h-8 w-8 text-slate-300" />
                            <h3 className="mt-4 text-base font-semibold text-slate-950">
                                Belum ada post
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Post yang dibuat pengelola komunitas akan tampil di sini.
                            </p>
                        </div>
                    )}

                    {hasNext ? (
                        <div className="flex justify-center">
                            <Button
                                variant="outline"
                                disabled={isLoadingPosts || !resolvedCommunityId}
                                onClick={() =>
                                    resolvedCommunityId
                                        ? loadPosts(resolvedCommunityId, page + 1, true)
                                        : undefined
                                }
                                className="h-10 rounded-xl border-slate-200 bg-white px-7 text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                            >
                                {isLoadingPosts ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : null}
                                Muat lebih banyak
                            </Button>
                        </div>
                    ) : null}
                </div>

                <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Tentang komunitas
                        </p>
                        <h2 className="mt-1 text-base font-semibold text-slate-950">
                            {community.name}
                        </h2>
                        <div className="mt-3 max-h-56 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-600">
                            <p className="whitespace-pre-line">
                                {community.description ||
                                    "Komunitas ini belum memiliki deskripsi."}
                            </p>
                        </div>
                    </section>

                    {community.rules ? (
                        <details className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                                Peraturan komunitas
                                <span className="rounded-full bg-primary-light px-2 py-1 text-[11px] font-semibold text-primary transition group-open:bg-slate-100 group-open:text-slate-500">
                                    Lihat
                                </span>
                            </summary>
                            <div className="mt-4 max-h-72 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-600">
                                <p className="whitespace-pre-line">{community.rules}</p>
                            </div>
                        </details>
                    ) : null}

                    <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            Link publik
                        </p>
                        <Link
                            href={communityHref}
                            className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
                        >
                            <span className="min-w-0 truncate">k/{community.slug}</span>
                            <Share className="h-4 w-4 shrink-0" />
                        </Link>
                    </section>
                </aside>
            </div>

            <PostFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                post={editingPost}
                onSubmit={handlePostSubmit}
            />
        </PublicCommunitySurface>
    );
}
