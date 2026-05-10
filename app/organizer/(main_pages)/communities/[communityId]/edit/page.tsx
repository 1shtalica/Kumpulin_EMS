"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { AlertTriangle, ImageIcon, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Community } from "@/types/community";
import { CommunityService } from "@/services/community-service";

const fieldClassName =
    "h-10 rounded-xl border-input bg-gray-50 px-4 text-sm shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const textareaClassName =
    "rounded-xl border-input bg-gray-50 px-4 py-3 text-sm leading-6 shadow-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

type ApiErrorBody = {
    message?: string;
};

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
}

function EditPageLoading() {
    return (
        <main className="min-h-[calc(100vh-136px)] bg-white px-6 py-4 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-5xl space-y-6">
                <Skeleton className="h-61.5 rounded-2xl" />
                <Skeleton className="h-75 rounded-2xl" />
                <Skeleton className="h-75 rounded-2xl" />
            </div>
        </main>
    );
}

function SectionHeader({
    title,
    description,
}: {
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-border pb-4">
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
                {description}
            </p>
        </div>
    );
}

export default function EditCommunityPage() {
    const params = useParams<{ communityId: string }>();
    const router = useRouter();
    const [community, setCommunity] = useState<Community | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [banner, setBanner] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(
        null,
    );
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    useEffect(() => {
        if (!banner) {
            setBannerPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(banner);
        setBannerPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [banner]);

    useEffect(() => {
        if (!logo) {
            setLogoPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(logo);
        setLogoPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [logo]);

    useEffect(() => {
        let isMounted = true;

        const fetchCommunity = async () => {
            if (!params.communityId) {
                setErrorMessage("ID komunitas tidak ditemukan.");
                setIsLoading(false);
                return;
            }

            try {
                const data = await CommunityService.getCommunityByOrganizer();
                if (!isMounted) return;

                setCommunity(data);
                setErrorMessage(null);
            } catch {
                if (!isMounted) return;

                setCommunity(null);
                setErrorMessage("Gagal mengambil data komunitas.");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void fetchCommunity();

        return () => {
            isMounted = false;
        };
    }, [params.communityId]);

    const initials = useMemo(
        () => getInitials(community?.name ?? "") || "K",
        [community?.name],
    );
    const canConfirmDelete = deleteConfirmation === community?.name;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!community || isSubmitting) return;

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get("name") ?? "").trim();
        const slug = String(formData.get("slug") ?? "").trim();
        const description = String(formData.get("description") ?? "");
        const rules = String(formData.get("rules") ?? "");

        if (!name || !slug) {
            toast.error("Nama dan slug komunitas wajib diisi.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Sedang menyimpan komunitas...");

        try {
            const updatedCommunity =
                await CommunityService.updateOrganizerCommunity({
                    name,
                    slug,
                    description,
                    rules,
                    logo,
                    banner,
                });

            setCommunity(updatedCommunity);
            setLogo(null);
            setBanner(null);
            toast.success("Perubahan komunitas berhasil disimpan.", {
                id: toastId,
            });
            router.refresh();
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorBody>;
            const message =
                axiosError.response?.data?.message ||
                "Gagal menyimpan perubahan komunitas.";

            toast.error(message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <EditPageLoading />;
    }

    if (!community) {
        return (
            <main className="flex min-h-[calc(100vh-136px)] items-center justify-center bg-white px-6 py-4 md:-mx-8 md:px-8">
                <div className="max-w-md text-center">
                    <h1 className="text-xl font-semibold text-slate-950">
                        Komunitas tidak ditemukan
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        {errorMessage ??
                            "Data komunitas tidak dapat ditampilkan."}
                    </p>
                    <Button
                        asChild
                        className="mt-6 h-10 rounded-full px-5 text-sm font-semibold"
                    >
                        <Link href="/organizer/communities">
                            Kembali ke Komunitas
                        </Link>
                    </Button>
                </div>
            </main>
        );
    }

    const handleDeleteCommunity = async () => {
        if (!canConfirmDelete) return;
        setIsSubmitting(true);
        try {
            await CommunityService.deleteOrganizerCommunity();
            router.push("/organizer/communities");
        } catch {
            setErrorMessage("Gagal menghapus komunitas.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-136px)] bg-white px-6 py-4 md:-mx-8 md:px-8">
            <form
                onSubmit={handleSubmit}
                className="mx-auto w-full max-w-5xl space-y-6"
            >
                <section className="rounded-2xl border border-border bg-card px-5 py-5 shadow-sm sm:px-6">
                    <SectionHeader
                        title="Visual Komunitas"
                        description="Perbarui banner dan logo komunitas Anda."
                    />

                    <div className="mt-5">
                        <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-slate-100 sm:h-44">
                            {bannerPreviewUrl ? (
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                        backgroundImage: `url(${bannerPreviewUrl})`,
                                    }}
                                />
                            ) : community.banner_url ? (
                                <Image
                                    src={community.banner_url}
                                    alt=""
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 1280px) 100vw, 1024px"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-slate-400">
                                    <ImageIcon
                                        className="h-8 w-8"
                                        strokeWidth={1.8}
                                    />
                                </div>
                            )}
                            <label
                                htmlFor="community-banner"
                                className="absolute right-3 top-3 inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Ubah Banner
                            </label>
                            <input
                                id="community-banner"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(event) =>
                                    setBanner(event.target.files?.[0] ?? null)
                                }
                            />
                        </div>
                        {banner ? (
                            <p className="mt-2 text-xs text-slate-500">
                                Banner baru: {banner.name}
                            </p>
                        ) : null}

                        <div className="-mt-8 flex items-end gap-4 px-5">
                            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-slate-950 text-base font-semibold text-cyan-300 shadow-md">
                                {logoPreviewUrl ? (
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `url(${logoPreviewUrl})`,
                                        }}
                                    />
                                ) : community.logo_url ? (
                                    <Image
                                        src={community.logo_url}
                                        alt={community.name}
                                        fill
                                        className="object-cover"
                                        sizes="96px"
                                    />
                                ) : (
                                    initials
                                )}
                                <label
                                    htmlFor="community-logo"
                                    className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm"
                                    aria-label="Ubah logo komunitas"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </label>
                                <input
                                    id="community-logo"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(event) =>
                                        setLogo(event.target.files?.[0] ?? null)
                                    }
                                />
                            </div>
                            <div className="pb-2">
                                <p className="text-sm font-medium text-slate-950">
                                    Logo Komunitas
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {logo
                                        ? `Logo baru: ${logo.name}`
                                        : "Disarankan 512x512px, maks 2MB."}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card px-5 py-5 shadow-sm sm:px-6">
                    <SectionHeader
                        title="Informasi Dasar"
                        description="Detail utama tentang komunitas Anda."
                    />

                    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                        <div className="space-y-2">
                            <Label
                                htmlFor="community-name"
                                className="text-sm font-medium text-slate-950"
                            >
                                Nama Komunitas{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="community-name"
                                name="name"
                                defaultValue={community.name}
                                className={fieldClassName}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="community-slug"
                                className="text-sm font-medium text-slate-950"
                            >
                                URL Slug <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex rounded-xl border border-input bg-gray-50 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                                <span className="flex h-10 shrink-0 items-center rounded-l-xl border-r border-input bg-slate-200 px-4 text-sm text-slate-500">
                                    kumpul.in/c/
                                </span>
                                <input
                                    id="community-slug"
                                    name="slug"
                                    defaultValue={community.slug}
                                    className="h-10 min-w-0 flex-1 rounded-r-xl bg-transparent px-4 text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 lg:col-span-2">
                            <Label
                                htmlFor="community-description"
                                className="text-sm font-medium text-slate-950"
                            >
                                Deskripsi Komunitas{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="community-description"
                                name="description"
                                defaultValue={community.description}
                                maxLength={5000}
                                className={[
                                    textareaClassName,
                                    "min-h-28 resize-y",
                                ].join(" ")}
                            />
                            <p className="text-right text-xs text-slate-500">
                                0/5000 karakter
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-border bg-card px-5 py-5 shadow-sm sm:px-6">
                    <SectionHeader
                        title="Peraturan Komunitas"
                        description="Panduan perilaku untuk anggota komunitas."
                    />

                    <div className="mt-6 space-y-2">
                        <Label
                            htmlFor="community-rules"
                            className="text-sm font-medium text-slate-950"
                        >
                            Peraturan Komunitas
                        </Label>
                        <Textarea
                            id="community-rules"
                            name="rules"
                            defaultValue={community.rules}
                            maxLength={10000}
                            placeholder="Tuliskan peraturan yang harus ditaati oleh anggota komunitas..."
                            className={[
                                textareaClassName,
                                "min-h-52 resize-y",
                            ].join(" ")}
                        />
                        <p className="text-right text-xs text-slate-500">
                            0/10000 karakter
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-red-200 bg-red-50/60 px-5 py-5 sm:px-6">
                    <h2 className="text-base font-semibold text-red-600">
                        Zona Berbahaya
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                        Tindakan di bawah ini tidak dapat dibatalkan. Pastikan
                        Anda benar-benar yakin sebelum melanjutkannya.
                    </p>

                    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-red-100 bg-white/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-950">
                                Hapus Komunitas
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                Hapus komunitas beserta seluruh data, event, dan
                                anggotanya secara permanen.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setDeleteConfirmation("");
                                setIsDeleteDialogOpen(true);
                            }}
                            className="h-10 rounded-full border-red-300 bg-white px-5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Hapus Komunitas
                        </Button>
                    </div>
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        asChild
                        className="h-10 rounded-full px-6 text-sm font-semibold"
                    >
                        <Link href="/organizer/communities">Batal</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 rounded-full px-6 text-sm font-semibold"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>
            </form>

            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) {
                        setDeleteConfirmation("");
                    }
                }}
            >
                <DialogContent className="rounded-2xl border-red-100 p-0 sm:max-w-lg">
                    <div className="border-b border-red-100 bg-red-50/70 px-6 py-5">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-base text-red-600">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                </span>
                                Hapus Komunitas
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-sm leading-6 text-slate-600">
                                Tindakan ini akan menghapus komunitas secara
                                permanen. Untuk melanjutkan, ketik nama
                                komunitas di bawah ini.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="space-y-4 px-6 py-5">
                        <div className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-500">
                                Ketik persis
                            </p>
                            <p className="mt-1 wrap-break-words text-sm font-semibold text-slate-950">
                                {community.name}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="delete-community-confirmation"
                                className="text-sm font-medium text-slate-950"
                            >
                                Nama Komunitas
                            </Label>
                            <Input
                                id="delete-community-confirmation"
                                value={deleteConfirmation}
                                onChange={(event) =>
                                    setDeleteConfirmation(event.target.value)
                                }
                                placeholder={community.name}
                                className={fieldClassName}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border px-6 py-4">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-full px-5 text-sm font-semibold"
                            >
                                Batal
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleDeleteCommunity}
                            type="button"
                            variant="outline"
                            disabled={!canConfirmDelete}
                            className="h-10 rounded-full border-red-300 bg-white px-5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            Hapus Komunitas
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
