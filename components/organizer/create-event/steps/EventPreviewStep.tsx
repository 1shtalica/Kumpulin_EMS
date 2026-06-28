"use client";

import { useState } from "react";
import * as lucideReact from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import type { CreateEventFormState } from "@/types/create-event";
import TipTapViewer from "@/components/reusable/TipTapViewer";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface EventPreviewStepProps {
    formData: CreateEventFormState;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSubmitting?: boolean;
}

export default function EventPreviewStep(props: EventPreviewStepProps) {
    const { formData, onSubmit, isSubmitting = false } = props;
    const [publishDialogOpen, setPublishDialogOpen] = useState(false);

    const isPaid = formData.tickets.some((ticket) => ticket.type === "paid");
    const totalTicketQuota = formData.tickets.reduce(
        (sum, ticket) => sum + Number(ticket.quota || 0),
        0,
    );
    const capacityLabel =
        (formData.max_capacity ?? 0) > 0
            ? `${formData.max_capacity} Peserta`
            : "Tidak Terbatas";

    const previewImages = [
        ...(formData.banner_image_preview
            ? [formData.banner_image_preview]
            : []),
        ...(formData.image_previews || []),
    ];

    const formatDate = (date?: Date) => {
        if (!date) return "-";
        return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleConfirmPublish = async () => {
        await onSubmit();
        setPublishDialogOpen(false);
    };

    const SectionTitle = ({
        icon: Icon,
        title,
        description,
    }: {
        icon: lucideReact.LucideIcon;
        title: string;
        description?: string;
    }) => (
        <div className="space-y-1">
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Icon className="h-4.5 w-4.5" />
                </span>
                {title}
            </h3>
            {description && (
                <p className="text-sm leading-relaxed text-slate-500">
                    {description}
                </p>
            )}
        </div>
    );

    const DateBox = ({ label, value }: { label: string; value?: Date }) => (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug text-slate-950">
                {formatDate(value)}
            </p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                        <lucideReact.Info className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-slate-950">
                            Preview Event
                        </h2>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            Periksa tampilan akhir dan pastikan semua informasi
                            sudah siap dipublikasikan.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <SectionTitle
                    icon={lucideReact.Info}
                    title="Informasi Utama"
                    description="Ringkasan visual, kategori, judul, dan deskripsi event."
                />

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                    {previewImages.length > 0 ? (
                        <Carousel
                            className="group/carousel relative w-full"
                            plugins={[Autoplay({ delay: 4000 })]}
                            opts={{ loop: true }}
                        >
                            <CarouselContent>
                                {previewImages.map((src, index) => (
                                    <CarouselItem key={`${src}-${index}`}>
                                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                                            <Image
                                                src={src}
                                                alt={`Preview Gallery ${index + 1}`}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 768px) 100vw, 768px"
                                                className="object-cover transition-transform duration-700 group-hover/carousel:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
                                            <div className="absolute bottom-4 left-4 right-4 text-white">
                                                <span className="inline-flex rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ring-1 ring-white/25 backdrop-blur-md">
                                                    {index === 0
                                                        ? formData.category ||
                                                          "Kategori"
                                                        : `Poster ${index}`}
                                                </span>
                                                {index === 0 && (
                                                    <h4 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight md:text-3xl">
                                                        {formData.title ||
                                                            "Untitled Event"}
                                                    </h4>
                                                )}
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {previewImages.length > 1 && (
                                <>
                                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 border-0 bg-white/20 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-white/40 group-hover/carousel:opacity-100" />
                                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 border-0 bg-white/20 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-white/40 group-hover/carousel:opacity-100" />
                                </>
                            )}
                        </Carousel>
                    ) : (
                        <div className="px-5 py-8 text-center">
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-primary ring-1 ring-slate-200/80">
                                <lucideReact.Info className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-slate-950">
                                Belum ada gambar yang diunggah.
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
                                Gambar banner akan menjadi visual utama di
                                halaman event.
                            </p>
                        </div>
                    )}

                    <div className="space-y-4 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                                {formData.type === "external"
                                    ? "External Public"
                                    : "Internal Organization"}
                            </span>
                            {formData.category && (
                                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                                    {formData.category}
                                </span>
                            )}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold leading-tight text-slate-950">
                                {formData.title || "Untitled Event"}
                            </h4>
                            <div className="mt-3 border-t border-slate-200/80 pt-3 text-sm leading-relaxed text-slate-600">
                                {formData.description ? (
                                    <TipTapViewer
                                        content={formData.description}
                                    />
                                ) : (
                                    <p className="italic text-slate-500">
                                        Tidak ada deskripsi.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <SectionTitle
                    icon={lucideReact.Calendar}
                    title="Jadwal & Lokasi"
                    description="Pastikan periode pendaftaran, waktu event, dan akses lokasi sudah benar."
                />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm shadow-slate-900/5">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-primary/10">
                                <lucideReact.Clock className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                    Periode Pendaftaran
                                </p>
                                <p className="text-sm font-semibold text-slate-950">
                                    Akses pendaftaran peserta
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <DateBox
                                label="Dibuka"
                                value={formData.start_registration_date}
                            />
                            <div className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                                to
                            </div>
                            <DateBox
                                label="Ditutup"
                                value={formData.end_registration_date}
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                        <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80">
                                <lucideReact.Calendar className="h-4.5 w-4.5" />
                            </span>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                    Periode Event
                                </p>
                                <p className="text-sm font-semibold text-slate-950">
                                    Waktu pelaksanaan acara
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <DateBox
                                label="Mulai"
                                value={formData.event_start_date}
                            />
                            <div className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                                to
                            </div>
                            <DateBox
                                label="Selesai"
                                value={formData.event_end_date}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-3 mb-3 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                        {formData.is_online ? (
                            <lucideReact.Video className="h-4.5 w-4.5" />
                        ) : (
                            <lucideReact.MapPin className="h-4.5 w-4.5" />
                        )}
                    </span>
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            Lokasi
                        </p>
                        <p className="text-sm font-semibold text-slate-950">
                            {formData.is_online
                                ? "Online event"
                                : "Offline venue"}
                        </p>
                    </div>
                </div>
                {formData.is_online ? (
                    <div className="rounded-xl border border-primary/10 bg-primary/5 px-6 py-4 ">
                        <p className="text-xs font-medium text-slate-500">
                            Meeting Link
                        </p>
                        {formData.meeting_url ? (
                            <a
                                href={formData.meeting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 block break-all text-sm font-semibold text-primary hover:underline"
                            >
                                {formData.meeting_url}
                            </a>
                        ) : (
                            <p className="mt-1 text-sm text-slate-500">
                                Belum ada link
                            </p>
                        )}
                        {formData.hide_meeting_url && (
                            <p className="mt-2 text-xs text-slate-500">
                                Link disembunyikan sampai acara dimulai.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-6 py-4">
                        <p className="text-sm font-semibold text-slate-950">
                            {formData.address.title ||
                                "Nama lokasi belum diatur"}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {formData.address.raw_address ||
                                "Alamat belum diatur"}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-500">
                            {[
                                formData.address.city,
                                formData.address.province,
                                formData.address.postal_code,
                            ]
                                .filter(Boolean)
                                .join(", ") ||
                                "Kota dan provinsi belum lengkap"}
                        </p>
                        {formData.address.location_url && (
                            <a
                                href={formData.address.location_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex h-8 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-primary hover:border-primary/30"
                            >
                                Lihat di Peta
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-5">
                <SectionTitle
                    icon={lucideReact.Clock}
                    title="Susunan Acara"
                    description="Urutan sesi yang akan ditampilkan ke peserta."
                />
                {formData.rundowns.length > 0 ? (
                    <div className="relative space-y-4">
                        {formData.rundowns.map((item, index) => (
                            <div
                                key={index}
                                className="relative grid grid-cols-[44px_1fr] gap-3"
                            >
                                <div className="relative flex flex-col items-center">
                                    {index < formData.rundowns.length - 1 && (
                                        <span
                                            className="absolute top-11 bottom-0 w-px bg-slate-200"
                                            aria-hidden="true"
                                        />
                                    )}
                                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-white text-sm font-semibold text-primary shadow-sm shadow-slate-900/5 tabular-nums">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                </div>
                                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                                Sesi {index + 1}
                                            </p>
                                            <h4 className="mt-1 text-base font-semibold leading-snug text-slate-950">
                                                {item.title ||
                                                    "Untitled Rundown"}
                                            </h4>
                                        </div>
                                        <div className="flex shrink-0 items-center rounded-xl border border-primary/10 bg-white px-3 py-2 text-xs font-semibold text-primary shadow-sm shadow-slate-900/5">
                                            <span>
                                                {item.start_time || "--:--"}
                                            </span>
                                            <span className="mx-2 text-slate-300">
                                                to
                                            </span>
                                            <span>
                                                {item.end_time || "--:--"}
                                            </span>
                                        </div>
                                    </div>
                                    {item.description && (
                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.location && (
                                        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-white px-2.5 py-1 text-xs font-medium text-primary">
                                            <lucideReact.MapPin className="h-3 w-3" />
                                            {item.location}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 text-center">
                        <p className="text-sm font-semibold text-slate-950">
                            Belum ada rundown acara.
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
                            Tambahkan sesi jika event membutuhkan susunan acara.
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-5">
                <SectionTitle
                    icon={lucideReact.Ticket}
                    title="Tiket & Kapasitas"
                    description="Ringkasan kategori tiket dan kuota peserta."
                />
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            Tipe
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            {isPaid ? "Event Berbayar" : "Event Gratis"}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                            Kapasitas
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">
                            {capacityLabel}
                        </p>
                    </div>
                    <div className="rounded-xl border border-primary/10 bg-primary/5 p-3 shadow-sm shadow-slate-900/5">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Total Kuota
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                            {totalTicketQuota} Tiket
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {formData.tickets.map((ticket, index) => (
                        <div
                            key={index}
                            className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5"
                        >
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                        Tiket {index + 1}
                                    </p>
                                    <h4 className="mt-1 text-base font-semibold leading-snug text-slate-950">
                                        {ticket.name || "Untitled Ticket"}
                                    </h4>
                                </div>
                                <lucideReact.Ticket className="h-5 w-5 text-primary" />
                            </div>
                            {ticket.description && (
                                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                                    {ticket.description}
                                </p>
                            )}
                            <div className="flex items-end justify-between border-t border-slate-200/80 pt-3">
                                <div>
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                        Harga
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-primary">
                                        {Number(ticket.price) === 0
                                            ? "Gratis"
                                            : formatCurrency(
                                                  Number(ticket.price || 0),
                                              )}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                        Kuota
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-950">
                                        {ticket.quota}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-white/90 px-1 py-4 backdrop-blur supports-backdrop-filter:bg-white/75">
                {" "}
                <Button
                    size="sm"
                    onClick={() => setPublishDialogOpen(true)}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl bg-primary text-base  text-white shadow-md shadow-primary/20 hover:bg-primary-hover sm:w-auto sm:min-w-60"
                >
                    {isSubmitting ? "Memproses..." : "Publikasikan Event"}
                </Button>
            </div>

            <Dialog
                open={publishDialogOpen}
                onOpenChange={(open) => {
                    if (!isSubmitting) setPublishDialogOpen(open);
                }}
            >
                <DialogContent className="rounded-2xl border-slate-200 p-0 shadow-xl shadow-slate-950/15 sm:max-w-md">
                    <div className="p-6">
                        <DialogHeader>
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                                <lucideReact.Send className="h-5 w-5" />
                            </div>
                            <DialogTitle className="text-xl font-semibold tracking-normal text-slate-950">
                                Publikasikan event ini?
                            </DialogTitle>
                            <DialogDescription className="pt-2 text-sm leading-relaxed text-slate-600">
                                Setelah dipublikasikan, event akan tersedia
                                untuk peserta sesuai pengaturan yang sudah Anda
                                isi. Pastikan detail event, jadwal, lokasi, dan
                                tiket sudah benar.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                Event yang akan dipublikasi
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-950">
                                {formData.title || "Untitled Event"}
                            </p>
                        </div>

                        <DialogFooter className="mt-6 flex-row justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPublishDialogOpen(false)}
                                disabled={isSubmitting}
                                className="m-0 h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-none hover:border-primary/30 hover:bg-primary-light/40 hover:text-primary"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleConfirmPublish}
                                disabled={isSubmitting}
                                className="m-0 h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
                            >
                                {isSubmitting
                                    ? "Memproses..."
                                    : "Ya, Publikasikan"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
