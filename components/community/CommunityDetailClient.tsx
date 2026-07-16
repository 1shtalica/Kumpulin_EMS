"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { AxiosError } from "axios";
import {
    ImagePlus,
    Loader2,
    Plus,
    Pencil,
    Search,
    Share,
    ShieldCheck,
    Trash2,
    UsersRound,
    X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommunityService } from "@/services/community-service";
import { EventService } from "@/services/event-service";
import { useAuthStore } from "@/stores/auth-store";
import type { Community, Post, RelatedEvent } from "@/types/community";
import type { OrganizerEventCard } from "@/types/event";
import PublicPostCard from "./PublicPostCard";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import Image from "next/image";
import ShareDialog from "@/components/reusable/ShareDialog";

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

const formatEventDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Tanggal belum tersedia";

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const formatStartingPrice = (price: number) =>
    price <= 0
        ? "Gratis"
        : `Mulai ${new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
          }).format(price)}`;

const toRelatedEvent = (event: OrganizerEventCard): RelatedEvent | null => {
    const id = event.event_id ?? event.id;
    if (!id) return null;

    return {
        id,
        slug: event.slug,
        title: event.title,
        image_url: event.image_url,
        event_start_date: event.event_start_date ?? event.start_date,
        starting_price: event.starting_price ?? 0,
    };
};

type PostFormPayload = {
    title: string;
    body: string;
    post_type: "text" | "announcement";
    images: File[];
    relatedEventId: string | null;
    relatedEvent: RelatedEvent | null;
};

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
    onSubmit: (payload: PostFormPayload) => Promise<void>;
}) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [postType, setPostType] = useState<"text" | "announcement">("text");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [publishedEvents, setPublishedEvents] = useState<RelatedEvent[]>([]);
    const [relatedEventId, setRelatedEventId] = useState<string | null>(null);
    const [eventSearch, setEventSearch] = useState("");
    const [isEventPickerOpen, setIsEventPickerOpen] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;
        setTitle(post?.title ?? "");
        setBody(post?.body ?? "");
        setPostType(
            post?.post_type === "announcement" ? "announcement" : "text",
        );
        setImages([]);
        setRelatedEventId(post?.related_event_id ?? post?.related_event?.id ?? null);
        setEventSearch("");
        setIsEventPickerOpen(false);
    }, [open, post]);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        setIsLoadingEvents(true);

        void EventService.getOrganizerEvents({ status: "published", limit: 100 })
            .then(({ data }) => {
                if (cancelled) return;
                setPublishedEvents(
                    data
                        .map(toRelatedEvent)
                        .filter((event): event is RelatedEvent => event !== null),
                );
            })
            .catch(() => {
                if (!cancelled) {
                    toast.error("Gagal memuat event yang dipublikasikan.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoadingEvents(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open]);

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
                relatedEventId,
                relatedEvent: selectedRelatedEvent,
            });
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedImages = Array.from(event.target.files ?? []).slice(0, 5);
        setImages(selectedImages);
        event.target.value = "";
    };

    const selectedRelatedEvent =
        publishedEvents.find((event) => event.id === relatedEventId) ??
        (post?.related_event_id === relatedEventId ||
        post?.related_event?.id === relatedEventId
            ? post.related_event
            : null) ??
        null;

    const normalizedEventSearch = eventSearch.trim().toLocaleLowerCase("id-ID");
    const matchingEvents = normalizedEventSearch
        ? publishedEvents
              .filter((event) =>
                  event.title.toLocaleLowerCase("id-ID").includes(normalizedEventSearch),
              )
        : publishedEvents;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-md shadow-slate-900/5 sm:max-w-2xl">
                <DialogHeader className="shrink-0 border-b border-slate-200/80 bg-slate-50/80 px-5 py-5 pr-14 text-left sm:px-6">
                    <span className="inline-flex w-fit rounded-full border border-primary/10 bg-primary-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {post ? "Edit post" : "Post baru"}
                    </span>
                    <DialogTitle className="mt-2 text-xl font-semibold tracking-normal text-slate-950">
                        {post ? "Edit Post" : "Buat Post"}
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm leading-relaxed text-slate-600">
                        {post
                            ? "Perbarui isi post dan pilih gambar baru bila ingin mengganti gambar lama."
                            : "Tulis diskusi atau pengumuman untuk komunitas ini."}
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="post-title"
                            className="text-xs font-medium text-slate-500"
                        >
                            Judul
                        </Label>
                        <Input
                            id="post-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Tulis judul diskusi"
                            className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="post-body"
                            className="text-xs font-medium text-slate-500"
                        >
                            Isi
                        </Label>
                        <Textarea
                            id="post-body"
                            value={body}
                            onChange={(event) => setBody(event.target.value)}
                            placeholder="Bagikan update, pertanyaan, atau pengumuman..."
                            className="min-h-40 rounded-xl border-slate-200 bg-slate-50 text-sm leading-6 shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                        />
                    </div>

                    {!post ? (
                        <div className="space-y-2">
                            <Label
                                htmlFor="post-type"
                                className="text-xs font-medium text-slate-500"
                            >
                                Tipe Post
                            </Label>
                            <select
                                id="post-type"
                                value={postType}
                                onChange={(event) =>
                                    setPostType(
                                        event.target.value as
                                            "text" | "announcement",
                                    )
                                }
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-primary/40 focus:ring-3 focus:ring-primary/20"
                            >
                                <option value="text">Diskusi</option>
                                <option value="announcement">Pengumuman</option>
                            </select>
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        <Label
                            htmlFor="related-event-search"
                            className="text-xs font-medium text-slate-500"
                        >
                            Event terkait <span className="font-normal">(opsional)</span>
                        </Label>
                        {selectedRelatedEvent ? (
                            <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary-light/35 p-3">
                                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                                    {selectedRelatedEvent.image_url ? (
                                        <Image
                                            src={selectedRelatedEvent.image_url}
                                            alt=""
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-950">
                                        {selectedRelatedEvent.title}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-600">
                                        {formatEventDate(selectedRelatedEvent.event_start_date)} - {formatStartingPrice(selectedRelatedEvent.starting_price)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRelatedEventId(null)}
                                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-red-600 hover:cursor-pointer"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Hapus event terkait
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        id="related-event-search"
                                        value={eventSearch}
                                        onChange={(event) => setEventSearch(event.target.value)}
                                        onFocus={() => setIsEventPickerOpen(true)}
                                        onBlur={() => setIsEventPickerOpen(false)}
                                        placeholder="Cari event yang dipublikasikan"
                                        className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-9 text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                    />
                                </div>
                                {isLoadingEvents ? (
                                    <p className="flex items-center gap-2 px-1 text-xs text-slate-500">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Memuat event...
                                    </p>
                                ) : null}
                                {isEventPickerOpen && !isLoadingEvents ? (
                                    matchingEvents.length ? (
                                        <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                                            {matchingEvents.map((event) => (
                                                <button
                                                    key={event.id}
                                                    type="button"
                                                    onMouseDown={(event) =>
                                                        event.preventDefault()
                                                    }
                                                    onClick={() => {
                                                        setRelatedEventId(event.id);
                                                        setEventSearch("");
                                                        setIsEventPickerOpen(false);
                                                    }}
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-primary-light/40 hover:cursor-pointer"
                                                >
                                                    <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                                        {event.image_url ? (
                                                            <Image src={event.image_url} alt="" fill sizes="56px" className="object-cover" />
                                                        ) : null}
                                                    </div>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block truncate text-sm font-semibold text-slate-800">
                                                            {event.title}
                                                        </span>
                                                        <span className="mt-0.5 block text-xs text-slate-500">
                                                            {formatEventDate(event.event_start_date)} - {formatStartingPrice(event.starting_price)}
                                                        </span>
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="px-1 text-xs text-slate-500">
                                            Event tidak ditemukan.
                                        </p>
                                    )
                                ) : null}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="post-images"
                            className="text-xs font-medium text-slate-500"
                        >
                            {post ? "Gambar Post" : "Gambar"}
                        </Label>
                        <label
                            htmlFor="post-images"
                            className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-primary/20 bg-primary-light/40 px-4 py-4 text-sm text-slate-600 transition hover:border-primary/40 hover:bg-primary-light/60"
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <ImagePlus className="h-5 w-5 shrink-0 text-primary" />
                                <span className="truncate">
                                    {images.length
                                        ? `${images.length} gambar baru dipilih`
                                        : post
                                          ? "Pilih gambar baru untuk mengganti gambar post"
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
                        {post?.image_urls?.length &&
                        !imagePreviewUrls.length ? (
                            <div className="space-y-2 pt-1">
                                <p className="text-xs font-medium text-slate-500">
                                    Gambar saat ini
                                </p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {post.image_urls.map((url, index) => (
                                        <div
                                            key={`${url}-${index}`}
                                            className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100"
                                        >
                                            <img
                                                src={url}
                                                alt={`Gambar post ${index + 1}`}
                                                className="aspect-square h-full w-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                        {imagePreviewUrls.length ? (
                            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3">
                                {imagePreviewUrls.map((url, index) => (
                                    <div
                                        key={`${images[index]?.name ?? "preview"}-${index}`}
                                        className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100"
                                    >
                                        <img
                                            src={url}
                                            alt={
                                                images[index]?.name ??
                                                `Preview ${index + 1}`
                                            }
                                            className="aspect-square h-full w-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImages((current) =>
                                                    current.filter(
                                                        (_, imageIndex) =>
                                                            imageIndex !==
                                                            index,
                                                    ),
                                                )
                                            }
                                            className="absolute right-2 top-2 rounded-xl bg-slate-950/70 p-1.5 text-white transition hover:bg-slate-950"
                                            aria-label="Hapus gambar"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {post && images.length > 0 ? (
                            <p className="rounded-xl border border-primary/10 bg-primary-light/40 px-3 py-2 text-xs leading-relaxed text-slate-600">
                                Gambar baru akan mengganti semua gambar post
                                saat disimpan.
                            </p>
                        ) : null}
                    </div>
                </div>

                <DialogFooter className="shrink-0 border-t border-slate-200/80 bg-white px-5 py-4 sm:px-6">
                    <Button
                        variant="outline"
                        className="m-0 h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        className="m-0 h-10 rounded-xl px-5 text-sm font-semibold"
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

function PublicCommunitySurface({ children }: { children: ReactNode }) {
    return (
        <main className="bg-[#f9fafb] px-4 pb-24 pt-20 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
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
    const [resolvedCommunityId, setResolvedCommunityId] = useState<
        string | null
    >(communityId ?? null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [isMutatingMembership, setIsMutatingMembership] = useState(false);
    const [joined, setJoined] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
    const [ownedCommunity, setOwnedCommunity] = useState<Community | null>(
        null,
    );

    const userIdText = user?.id == null ? null : String(user.id);
    const isCommunityOwner = Boolean(
        community &&
        ownedCommunity &&
        (ownedCommunity.id === community.id ||
            ownedCommunity.slug === community.slug),
    );
    const canManage = user?.role === "organizer" && isCommunityOwner;

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
                    : await CommunityService.getCommunityById(
                          communityId ?? "",
                      );
                if (!mounted) return;
                setCommunity(data);
                setResolvedCommunityId(data.id);
                setJoined(data.is_member ?? false);
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

    useEffect(() => {
        let mounted = true;

        if (user?.role !== "organizer") {
            setOwnedCommunity(null);
            return;
        }

        const loadOwnedCommunity = async () => {
            try {
                const data = await CommunityService.getCommunityByOrganizer();
                if (mounted) setOwnedCommunity(data);
            } catch {
                if (mounted) setOwnedCommunity(null);
            }
        };

        void loadOwnedCommunity();

        return () => {
            mounted = false;
        };
    }, [user?.id, user?.role]);
    const memberCount = community?.member_count ?? 0;

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
                setCommunity((current) =>
                    current
                        ? {
                              ...current,
                              member_count: Math.max(
                                  current.member_count - 1,
                                  0,
                              ),
                          }
                        : current,
                );
                toast.success("Anda keluar dari komunitas.");
            } else {
                await CommunityService.joinCommunity(resolvedCommunityId);
                setJoined(true);
                setCommunity((current) =>
                    current
                        ? {
                              ...current,
                              member_count: current.member_count + 1,
                          }
                        : current,
                );
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

    const handlePostSubmit = async (payload: PostFormPayload) => {
        if (!resolvedCommunityId) return;

        const toastId = toast.loading(
            editingPost ? "Menyimpan post..." : "Menerbitkan post...",
        );

        try {
            if (editingPost) {
                const updatedPost = await CommunityService.updatePost(
                    resolvedCommunityId,
                    editingPost.id,
                    {
                        title: payload.title,
                        body: payload.body,
                        related_event_id: payload.relatedEventId,
                    },
                );
                let finalPost = updatedPost;
                if (payload.images.length) {
                    finalPost = await CommunityService.replacePostImages(
                        resolvedCommunityId,
                        editingPost.id,
                        payload.images,
                    );
                }
                finalPost = {
                    ...finalPost,
                    related_event_id: payload.relatedEventId,
                    related_event:
                        payload.relatedEventId === null
                            ? null
                            : finalPost.related_event ?? payload.relatedEvent,
                };
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
                    related_event_id: payload.relatedEventId,
                },
            );
            const postWithRelatedEvent = {
                ...createdPost,
                related_event_id: payload.relatedEventId,
                related_event:
                    payload.relatedEventId === null
                        ? null
                        : createdPost.related_event ?? payload.relatedEvent,
            };
            setPosts((current) => [postWithRelatedEvent, ...current]);
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

    const handleDeletePost = async () => {
        if (!resolvedCommunityId || !postToDelete) return;

        setDeletingPostId(postToDelete.id);
        const toastId = toast.loading("Menghapus post...");
        try {
            await CommunityService.deletePost(
                resolvedCommunityId,
                postToDelete.id,
            );
            setPosts((current) =>
                current.filter((item) => item.id !== postToDelete.id),
            );
            setCommunity((current) =>
                current
                    ? {
                          ...current,
                          post_count: Math.max(current.post_count - 1, 0),
                      }
                    : current,
            );
            setPostToDelete(null);
            toast.success("Post berhasil dihapus.", { id: toastId });
        } catch (error) {
            toast.error(getApiErrorMessage(error, "Gagal menghapus post."), {
                id: toastId,
            });
        } finally {
            setDeletingPostId(null);
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
                    <h1 className="text-lg font-semibold text-slate-950">
                        Komunitas tidak ditemukan
                    </h1>
                    <Button
                        asChild
                        className="mt-5 h-10 rounded-xl text-[13px] font-semibold sm:text-sm"
                    >
                        <Link href="/komunitas">Kembali ke komunitas</Link>
                    </Button>
                </div>
            </PublicCommunitySurface>
        );
    }

    const communityHref = `/k/${community.slug}`;

    return (
        <PublicCommunitySurface>
            {community.banner_url ? (
                <section
                    className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm shadow-slate-900/5"
                    aria-label={`${community.name} banner`}
                >
                    <Image
                        alt=""
                        className="h-28 w-full object-cover sm:h-32 lg:h-36"
                        src={community.banner_url}
                        width={1600}
                        height={900}
                    />
                </section>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
                <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                        <div className="flex items-start gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                <CommunityAvatar community={community} />
                            </div>
                            <div className="min-w-0 pt-0.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    Publik
                                </span>
                                <h1 className="mt-2 line-clamp-2 text-xl font-bold leading-tight text-slate-950">
                                    {community.name}
                                </h1>
                                <p className="mt-1 truncate text-xs font-medium text-primary sm:text-sm">
                                    k/{community.slug}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 line-clamp-4 whitespace-pre-line text-[13px] leading-5 text-slate-600">
                            {community.description ||
                                "Komunitas ini belum memiliki deskripsi."}
                        </p>

                        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/70 text-center">
                            <div className="px-3 py-3">
                                <p className="text-base font-semibold leading-none tabular-nums text-slate-950">
                                    {formatNumber(memberCount)}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Anggota
                                </p>
                            </div>
                            <div className="border-x border-slate-200/80 px-3 py-3">
                                <p className="text-base font-semibold leading-none tabular-nums text-slate-950">
                                    {formatNumber(community.post_count)}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Post
                                </p>
                            </div>
                            <div className="px-3 py-3">
                                <p className="text-base font-semibold leading-none tabular-nums text-slate-950">
                                    {
                                        formatDate(community.created_at).split(
                                            " ",
                                        )[2]
                                    }
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Dibuat
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-2">
                            <Button
                                onClick={handleJoinToggle}
                                disabled={isMutatingMembership}
                                className={`h-10 rounded-xl text-[13px] font-semibold sm:text-sm ${
                                    joined
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                                        : ""
                                }`}
                                variant={joined ? "outline" : "default"}
                            >
                                {isMutatingMembership ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ShieldCheck className="h-4 w-4" />
                                )}
                                {joined ? "Sudah bergabung" : "Bergabung"}
                            </Button>
                            <ShareDialog
                                title={community.name}
                                description={community.description}
                                imageUrl={community.banner_url || community.logo_url || undefined}
                                url={communityHref}
                                contentType="komunitas"
                            >
                                <Button
                                    variant="outline"
                                    className="h-10 rounded-xl border-slate-200 bg-white text-[13px] font-semibold text-slate-700 sm:text-sm hover:border-primary/30 hover:text-primary"
                                >
                                    <Share className="h-4 w-4" />
                                    Bagikan
                                </Button>
                            </ShareDialog>
                        </div>
                    </section>

                    {community.rules ? (
                        <details className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-semibold text-slate-950">
                                Peraturan komunitas
                                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500 transition group-open:bg-primary-light group-open:text-primary">
                                    Lihat
                                </span>
                            </summary>
                            <div className="mt-4 max-h-64 overflow-y-auto pr-1 text-[13px] leading-5 text-slate-600">
                                <p className="whitespace-pre-line">
                                    {community.rules}
                                </p>
                            </div>
                        </details>
                    ) : null}
                </aside>

                <div className="flex min-w-0 flex-col gap-4">
                    <section className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-900/5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <h2 className="text-lg font-semibold text-slate-950">
                                    Post terbaru
                                </h2>
                                <p className="mt-1 text-[13px] text-slate-500">
                                    Diskusi dan pengumuman dari komunitas ini.
                                </p>
                            </div>
                            {canManage ? (
                                <Button
                                    className="h-10 rounded-xl text-[13px] font-semibold sm:text-sm"
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
                        <div className="flex flex-col gap-3">
                            {posts.map((post) => (
                                <PublicPostCard
                                    key={post.id}
                                    post={post}
                                    postHref={
                                        communityHref + "/post/" + post.id
                                    }
                                    communityHref={communityHref}
                                    communityLabel={community.name}
                                    actions={
                                        canManage ||
                                        (!!userIdText &&
                                            String(post.author_user_id) ===
                                                userIdText) ? (
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingPost(post);
                                                        setFormOpen(true);
                                                    }}
                                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-primary-light hover:text-primary"
                                                    aria-label="Edit post"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPostToDelete(post)
                                                    }
                                                    className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Hapus post"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : undefined
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm shadow-slate-900/5">
                            <UsersRound className="mx-auto h-8 w-8 text-slate-300" />
                            <h3 className="mt-4 text-base font-semibold text-slate-950">
                                Belum ada post
                            </h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Post yang dibuat pengelola komunitas akan tampil
                                di sini.
                            </p>
                        </div>
                    )}

                    {hasNext ? (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                disabled={
                                    isLoadingPosts || !resolvedCommunityId
                                }
                                onClick={() =>
                                    resolvedCommunityId
                                        ? loadPosts(
                                              resolvedCommunityId,
                                              page + 1,
                                              true,
                                          )
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
            </div>

            <PostFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                post={editingPost}
                onSubmit={handlePostSubmit}
            />
            <DeleteConfirmDialog
                open={Boolean(postToDelete)}
                title="Hapus post?"
                description="Post ini akan dihapus dari komunitas beserta akses diskusinya."
                details={postToDelete?.title}
                isLoading={Boolean(deletingPostId)}
                onOpenChange={(open) => {
                    if (!open && !deletingPostId) setPostToDelete(null);
                }}
                onConfirm={handleDeletePost}
            />
        </PublicCommunitySurface>
    );
}
