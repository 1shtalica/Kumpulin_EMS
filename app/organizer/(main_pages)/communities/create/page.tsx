"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { ImageIcon, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommunityService } from "@/services/community-service";

const fieldClassName =
    "rounded-xl border-input bg-gray-50 shadow-none text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const textareaClassName =
    "rounded-xl border-input bg-gray-50 shadow-none text-sm leading-6 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

type ApiErrorBody = {
    message?: string;
};

export default function CreateCommunityPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [banner, setBanner] = useState<File | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(
        null,
    );
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) return;

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
        const toastId = toast.loading("Sedang membuat komunitas...");

        try {
            await CommunityService.createOrganizerCommunity({
                name,
                slug,
                description,
                rules,
                logo,
                banner,
            });

            toast.success("Komunitas berhasil dibuat.", { id: toastId });
            router.push("/organizer/communities");
            router.refresh();
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorBody>;
            const errorMessage =
                axiosError.response?.data?.message ||
                "Gagal membuat komunitas.";

            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-136px)] bg-white px-6 py-4 md:-mx-8 md:px-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-7">
                <header className="text-center">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Mulai Komunitas Anda
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        Bangun ruang untuk menghubungkan orang-orang dengan
                        minat yang sama.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-border bg-card px-6 py-7 shadow-sm sm:px-8"
                >
                    <section>
                        <div className="border-b border-border pb-3">
                            <h2 className="text-base font-semibold text-slate-950">
                                Branding (Logo & Banner)
                            </h2>
                        </div>

                        <div className="mt-5 space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="community-banner"
                                    className="text-sm font-medium text-slate-950"
                                >
                                    Banner (Opsional)
                                </Label>
                                <label
                                    htmlFor="community-banner"
                                    className="relative flex h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 text-center transition-colors hover:border-primary/40 hover:bg-indigo-50"
                                >
                                    {bannerPreviewUrl ? (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                backgroundImage: `url(${bannerPreviewUrl})`,
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className={[
                                            "relative z-10 flex flex-col items-center justify-center px-4",
                                            bannerPreviewUrl
                                                ? "rounded-xl bg-white/90 px-5 py-3 shadow-sm"
                                                : "",
                                        ].join(" ")}
                                    >
                                        <ImageIcon
                                            className="h-7 w-7 text-slate-500"
                                            strokeWidth={1.8}
                                        />
                                        <span className="mt-4 max-w-full truncate text-sm font-medium text-slate-500">
                                            {banner
                                                ? banner.name
                                                : "Klik untuk unggah banner"}
                                        </span>
                                        <span className="mt-1 text-xs font-semibold tracking-wide text-slate-500">
                                            1200 x 400px direkomendasikan
                                        </span>
                                    </div>
                                    <input
                                        id="community-banner"
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        onChange={(event) =>
                                            setBanner(
                                                event.target.files?.[0] ??
                                                    null,
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div className="space-y-3">
                                <Label
                                    htmlFor="community-logo"
                                    className="text-sm font-medium text-slate-950"
                                >
                                    Logo Komunitas (Opsional)
                                </Label>
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                    <label
                                        htmlFor="community-logo"
                                        className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-indigo-200 bg-indigo-50/60 bg-cover bg-center transition-colors hover:border-primary/40 hover:bg-indigo-50"
                                        style={
                                            logoPreviewUrl
                                                ? {
                                                      backgroundImage: `url(${logoPreviewUrl})`,
                                                  }
                                                : undefined
                                        }
                                    >
                                        {!logoPreviewUrl ? (
                                            <ImagePlus
                                                className="h-6 w-6 text-slate-500"
                                                strokeWidth={1.8}
                                            />
                                        ) : null}
                                        <input
                                            id="community-logo"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(event) =>
                                                setLogo(
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                    </label>
                                    <div className="min-w-0">
                                        <p className="text-sm leading-6 text-slate-500">
                                            {logo
                                                ? logo.name
                                                : "Upload logo atau gambar yang mewakili komunitas Anda."}
                                        </p>
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="mt-3 h-9 rounded-full border-primary/20 px-4 text-sm font-medium text-primary hover:bg-transparent hover:text-primary"
                                        >
                                            <label htmlFor="community-logo">
                                                Pilih File
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8">
                        <div className="border-b border-border pb-3">
                            <h2 className="text-base font-semibold text-slate-950">
                                Detail Komunitas
                            </h2>
                        </div>

                        <div className="mt-5 space-y-5">
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
                                    required
                                    minLength={3}
                                    maxLength={120}
                                    placeholder="Misal: Jakarta Tech Enthusiasts"
                                    className={fieldClassName}
                                />
                                <p className="text-xs leading-5 text-slate-500">
                                    3 hingga 120 karakter.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="community-slug"
                                    className="text-sm font-medium text-slate-950"
                                >
                                    Slug Komunitas{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="community-slug"
                                    name="slug"
                                    required
                                    minLength={3}
                                    maxLength={140}
                                    placeholder="jakarta-tech-enthusiasts"
                                    className={fieldClassName}
                                />
                                <p className="text-xs leading-5 text-slate-500">
                                    Akan digunakan sebagai URL: kumpul.in/c/
                                    <span className="font-semibold">
                                        nama-komunitas
                                    </span>{" "}
                                    (3-140 karakter).
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="community-description"
                                    className="text-sm font-medium text-slate-950"
                                >
                                    Deskripsi
                                </Label>
                                <Textarea
                                    id="community-description"
                                    name="description"
                                    maxLength={5000}
                                    placeholder="Ceritakan tentang komunitas Anda, tujuan, dan siapa saja yang cocok bergabung..."
                                    className={[
                                        textareaClassName,
                                        "min-h-36 resize-y px-4 py-3",
                                    ].join(" ")}
                                />
                                <p className="text-right text-xs font-semibold tracking-wide text-slate-500">
                                    Maksimal 5000 karakter
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="community-rules"
                                    className="text-sm font-medium text-slate-950"
                                >
                                    Peraturan Komunitas
                                </Label>
                                <Textarea
                                    id="community-rules"
                                    name="rules"
                                    maxLength={10000}
                                    placeholder="Tuliskan peraturan yang harus ditaati oleh anggota komunitas..."
                                    className={[
                                        textareaClassName,
                                        "min-h-36 resize-y px-4 py-3",
                                    ].join(" ")}
                                />
                                <p className="text-right text-xs font-semibold tracking-wide text-slate-500">
                                    Maksimal 10000 karakter
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            asChild
                            className="h-11 rounded-full px-7 text-sm font-semibold text-slate-500 hover:bg-transparent hover:text-slate-700"
                        >
                            <Link href="/organizer/communities">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-11 rounded-full px-8 text-sm font-semibold"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            {isSubmitting
                                ? "Membuat..."
                                : "Buat Komunitas Sekarang"}
                        </Button>
                    </div>
                </form>
            </div>
        </main>
    );
}
