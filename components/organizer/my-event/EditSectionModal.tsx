"use client";

import { useState } from "react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    CalendarClock,
    FileText,
    Loader2,
    MapPin,
    Pencil,
    Route,
    Ticket,
    type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types/event";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CreateEventSchema } from "@/lib/validator/create-event.schema";
import EventInfoStep from "@/components/organizer/create-event/steps/EventInfoStep";
import EventScheduleStep from "@/components/organizer/create-event/steps/EventScheduleStep";
import EventTicketStep from "@/components/organizer/create-event/steps/EventTicketStep";
import axiosClient from "@/lib/axios-client";
import { EventService } from "@/services/event-service";
import { useRouter } from "next/navigation";

interface EditModalProps {
    event: Event;
    section: 'core' | 'location' | 'rundown' | 'datetime' | 'tickets';
    onUpdated?: () => Promise<void> | void;
}

const sectionMeta: Record<EditModalProps["section"], {
    title: string;
    description: string;
    badge: string;
    Icon: LucideIcon;
}> = {
    core: {
        title: "Edit Informasi Event",
        description: "Perbarui judul, kategori, deskripsi, status, dan materi visual utama.",
        badge: "Informasi",
        Icon: FileText,
    },
    location: {
        title: "Edit Lokasi Event",
        description: "Atur tipe event, link online, detail alamat, kota, provinsi, dan tautan maps.",
        badge: "Lokasi",
        Icon: MapPin,
    },
    datetime: {
        title: "Edit Jadwal Event",
        description: "Sesuaikan tanggal event dan periode registrasi tanpa mengubah bagian lain.",
        badge: "Jadwal",
        Icon: CalendarClock,
    },
    tickets: {
        title: "Kelola Tiket",
        description: "Tambah, ubah, atau hapus kategori tiket, harga, kuota, dan periode penjualan.",
        badge: "Tiket",
        Icon: Ticket,
    },
    rundown: {
        title: "Kelola Rundown",
        description: "Rapikan susunan agenda, durasi, deskripsi, dan lokasi tiap sesi.",
        badge: "Rundown",
        Icon: Route,
    },
};

const API_TIMEZONE_OFFSET = "+07:00";

function parseApiDateTime(value?: Date | string | null): Date | undefined {
    if (!value) return undefined;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/
    );

    if (match) {
        const [, year, month, day, hour, minute, second = "0"] = match;
        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second),
            0
        );
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

function toApiOffsetISOString(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");

    if (Number.isNaN(date.getTime())) {
        throw new Error("Tanggal tidak valid.");
    }

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${API_TIMEZONE_OFFSET}`;
}

function normalizeApiOffsetISOString(value?: Date | string | null): string | null {
    const date = parseApiDateTime(value);
    return date ? toApiOffsetISOString(date) : null;
}

function hasDateChanged(original?: string | null, next?: Date): boolean {
    return normalizeApiOffsetISOString(original) !== normalizeApiOffsetISOString(next);
}
export function EditSectionModal({ event, section, onUpdated }: EditModalProps): ReactNode {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const meta = sectionMeta[section];
    const SectionIcon = meta.Icon;

    // Initialize React Hook Form with mapped data from existing event
    const methods = useForm<CreateEventSchema>({
        mode: "onChange",
        defaultValues: {
            title: event.title || "",
            type: (event.type as any) || "public",
            category: event.category || "",
            description: (() => {
                const text = event.description as any;
                if (!text) return "";
                if (typeof text === 'string') {
                    try {
                        const parsed = JSON.parse(text);
                        if (parsed && typeof parsed.content === 'string') {
                            return parsed.content;
                        }
                    } catch (e) {
                        // ignore
                    }
                    return text;
                }
                if (typeof text === 'object') {
                    if (typeof text.content === 'string') {
                        return text.content;
                    }
                    return JSON.stringify(text);
                }
                return String(text);
            })(),
            status: (event.status as any) || "draft",

            // Image Maps -> Embed the original backend ID in the File name so the UI knows it's an existing file
            banner_image_preview: event.images?.[0]?.image_url,
            banner_image: event.images?.[0] ? new File([""], "existing-banner.jpg", { type: "image/jpeg" }) : (undefined as any),
            image_previews: event.images?.slice(1)?.map(img => img.image_url) || [],
            images: event.images?.slice(1)?.map((img) => new File([""], `existing-gallery-${img.id || "unknown"}.jpg`, { type: "image/jpeg" })) || [],

            // Schedule & Location
            event_start_date: parseApiDateTime(event.event_start_date) || (undefined as any),
            event_end_date: parseApiDateTime(event.event_end_date) || (undefined as any),
            start_registration_date: parseApiDateTime(event.start_registration_date) || (undefined as any),
            end_registration_date: parseApiDateTime(event.end_registration_date) || (undefined as any),
            rundowns: event.rundowns?.map(r => ({
                _dbId: r.id,
                title: r.title || "",
                description: r.description || "",
                start_time: r.start_time || "",
                end_time: r.end_time || "",
                location: r.location || "",
            })) || [],

            // Location
            is_online: event.is_online,
            meeting_url: event.meeting_url || "",
            address: {
                address_id: event.address.address_id!,
                title: event.address?.title || "",
                raw_address: event.address?.raw_address || "",
                city: event.address?.city || "",
                province: event.address?.province || "",
                postal_code: event.address?.postal_code || "",
                location_url: event.address?.maps_url || "",
            },

            // Tickets & Capacity
            max_capacity: event.max_capacity || 0,
            max_ticket_per_user: event.max_ticket_per_user || 0,
            tickets: event.ticket_categories?.map(t => ({
                _dbId: t.id,
                name: t.name,
                price: t.price,
                quota: t.quota,
                description: t.description || "",
                type: (t.price > 0 ? "paid" : "free") as "paid" | "free",
                start_date_time: parseApiDateTime(t.start_date_time) || parseApiDateTime(event.start_registration_date) || new Date(),
                end_date_time: parseApiDateTime(t.end_date_time) || parseApiDateTime(event.end_registration_date) || new Date(),
            })) || []
        }
    });

    const handleSubmit = async (data: CreateEventSchema) => {
        setIsLoading(true);
        let payloadToSubmit: any = {};

        // 1. Construct specific payload based on section (Approach B)
        try {
            switch (section) {
                case 'core':
                    // PATCH /api/v1/events/:id/core
                    payloadToSubmit = {
                        title: data.title,
                        category: data.category,
                        description: JSON.stringify({ content: data.description }),
                        status: data.status,
                    };

                    const isNewBanner = data.banner_image &&
                        data.banner_image.name !== "existing-banner.jpg";
                    const newGalleryImages = data.images.filter(file => !file.name.startsWith("existing-gallery-"));

                    console.log("[API Call] PATCH /core ->", payloadToSubmit);

                    const targetEventIdCore = event.event_id || (event as any).id;
                    await EventService.updateEventCore(targetEventIdCore, payloadToSubmit);

                    const originalGalleryImages = event.images?.slice(1) || [];
                    const keptGalleryIds = data.images
                        .filter(f => f.name.startsWith("existing-gallery-"))
                        .map(f => {
                            const match = f.name.match(/^existing-gallery-(.+)\.jpg$/);
                            return match ? parseInt(match[1]) : null;
                        })
                        .filter(id => id !== null);

                    const deletedGalleryImages = originalGalleryImages.filter(origImg =>
                        origImg.id !== undefined && !keptGalleryIds.includes(origImg.id)
                    );

                    let imageChanged = false;
                    const targetEventId = event.event_id || (event as any).id;

                    // 1. Upload new banner image (is_primary: true)
                    if (isNewBanner && data.banner_image) {
                        try {
                            // Delete existing banner first if one exists
                            const existingBannerId = event.images?.[0]?.id;
                            if (existingBannerId) {
                                await axiosClient.delete(`/organizer/events/${targetEventId}/image/${existingBannerId}`);
                                console.log(`[API Call Result] DELETE old banner /images/${existingBannerId} success`);
                            }

                            const bannerFormData = new FormData();
                            bannerFormData.append("images", data.banner_image);
                            bannerFormData.append("is_primary", "true");

                            const bannerResponse = await axiosClient.post(
                                `/organizer/events/${targetEventId}/image`,
                                bannerFormData,
                                { headers: { "Content-Type": "multipart/form-data" } }
                            );
                            console.log("[API Call Result] POST /image (banner) ->", bannerResponse.data);
                            imageChanged = true;
                        } catch (error: any) {
                            console.error("[API Call Error] POST /image (banner) ->", error);
                            throw new Error(error.response?.data?.message || "Gagal mengupload banner event");
                        }
                    }

                    // 2. Delete removed gallery images
                    for (const deletedImg of deletedGalleryImages) {
                        try {
                            await axiosClient.delete(`/organizer/events/${targetEventId}/image/${deletedImg.id}`);
                            console.log(`[API Call Result] DELETE /images/${deletedImg.id} success`);
                            imageChanged = true;
                        } catch (error: any) {
                            console.error(`[API Call Error] DELETE /images/${deletedImg.id} ->`, error);
                            throw new Error(error.response?.data?.message || `Gagal menghapus gambar ID ${deletedImg.id}`);
                        }
                    }

                    // 3. Upload new gallery images (is_primary: false)
                    if (newGalleryImages.length > 0) {
                        try {
                            const formData = new FormData();
                            newGalleryImages.forEach(file => {
                                formData.append("images", file);
                            });
                            formData.append("is_primary", "false");

                            const response = await axiosClient.post(`/organizer/events/${targetEventId}/image`, formData, {
                                headers: { "Content-Type": "multipart/form-data" },
                            });
                            console.log("[API Call Result] POST /images (gallery) ->", response.data);
                            imageChanged = true;
                        } catch (error: any) {
                            console.error("[API Call Error] POST /images (gallery) ->", error);
                            if (error.response?.status === 403) {
                                throw new Error("Akses ditolak: Anda bukan pemilik acara ini.");
                            }
                            throw new Error(error.response?.data?.message || "Gagal mengupload gambar event");
                        }
                    }

                    if (imageChanged && router) {
                        router.refresh();
                    }
                    break;

                case 'datetime':
                    payloadToSubmit = {
                        event_start_date: toApiOffsetISOString(data.event_start_date),
                        event_end_date: toApiOffsetISOString(data.event_end_date),
                        start_registration_date: toApiOffsetISOString(data.start_registration_date),
                        end_registration_date: toApiOffsetISOString(data.end_registration_date)
                    };

                    try {
                        const response = await axiosClient.patch(`/organizer/events/${event.event_id}/schedule`, payloadToSubmit);
                        console.log("[API Call Result] PATCH /schedule ->", response.data);
                    } catch (error: any) {
                        console.error("[API Call Error] PATCH /schedule ->", error);
                        throw new Error(error.response?.data?.message || "Gagal mengubah tanggal event");
                    }
                    break;

                case 'location':
                    // PATCH /api/v1/events/:id/location
                    payloadToSubmit = {
                        is_online: data.is_online,
                        meeting_url: data.meeting_url,
                        address: data.is_online ? null : {
                            address_id: data.address.address_id,
                            title: data.address.title,
                            raw_address: data.address.raw_address,
                            province: data.address.province,
                            city: data.address.city,
                            postal_code: data.address.postal_code,
                            location_url: data.address.location_url,
                        }
                    };
                    console.log("[API Call] PATCH /location ->", payloadToSubmit);

                    await EventService.updateEventLocation(event.event_id, {
                        address_id: payloadToSubmit.address.address_id,
                        title: payloadToSubmit.address.title,
                        raw_address: payloadToSubmit.address?.raw_address!,
                        city: payloadToSubmit.address?.city!,
                        province: payloadToSubmit.address?.province!,
                        postal_code: payloadToSubmit.address?.postal_code!,
                        location_url: payloadToSubmit.address?.location_url!
                    });
                    break;


                case 'rundown': {
                    // Diff against original event.rundowns by index position:
                    // same index = updated (carry original UUID); beyond original length = added (no id);
                    // original items reduced = deleted (collect their UUIDs).
                    const origRundowns = event.rundowns || [];
                    const formRundowns = data.rundowns;

                    const addedRundowns = formRundowns
                        .filter(r => !r._dbId)
                        .map(r => ({
                            title: r.title,
                            description: r.description || "",
                            start_time: r.start_time,
                            end_time: r.end_time,
                            location: r.location || "",
                        }));

                    // Only include rundowns that were actually modified
                    const updatedRundowns = formRundowns
                        .filter(r => {
                            if (!r._dbId) return false;
                            const orig = origRundowns.find(o => o.id === r._dbId);
                            if (!orig) return false;
                            return (
                                (orig.title || "") !== r.title ||
                                (orig.description || "") !== (r.description || "") ||
                                (orig.start_time || "") !== r.start_time ||
                                (orig.end_time || "") !== r.end_time ||
                                (orig.location || "") !== (r.location || "")
                            );
                        })
                        .map(r => ({
                            id: r._dbId,
                            title: r.title,
                            description: r.description || "",
                            start_time: r.start_time,
                            end_time: r.end_time,
                            location: r.location || "",
                        }));

                    const formRundownIds = formRundowns.map(r => r._dbId).filter(Boolean);
                    const deletedIds = origRundowns
                        .filter(r => !formRundownIds.includes(r.id))
                        .map(r => r.id)
                        .filter((id): id is string => !!id);

                    const rundownPayload = { added: addedRundowns, updated: updatedRundowns, deleted_ids: deletedIds };
                    console.log("[API Call] PATCH /rundowns ->", rundownPayload);

                    await EventService.updateOrganizerRundowns(
                        event.event_id || (event as any).id,
                        rundownPayload
                    );
                    break;
                }

                case 'tickets': {
                    // Diff against original event.ticket_categories using _dbId.
                    const origTickets = event.ticket_categories || [];
                    const formTickets = data.tickets;

                    console.log("[DEBUG] formTickets _dbId values:", formTickets.map(t => ({ name: t.name, _dbId: t._dbId })));

                    const addedTickets = formTickets
                        .filter(t => !t._dbId)
                        .map(t => ({
                            name: t.name,
                            price: Number(t.price),
                            quota: Number(t.quota),
                            description: t.description || "",
                            start_date_time: toApiOffsetISOString(t.start_date_time),
                            end_date_time: toApiOffsetISOString(t.end_date_time),
                        }));

                    // Only include tickets that were actually modified
                    const updatedTickets = formTickets
                        .filter(t => {
                            if (!t._dbId) return false;
                            const orig = origTickets.find(o => o.id === t._dbId);
                            if (!orig) return false;
                            // Compare fields to detect actual changes
                            return (
                                orig.name !== t.name ||
                                orig.price !== Number(t.price) ||
                                orig.quota !== Number(t.quota) ||
                                (orig.description || "") !== (t.description || "") ||
                                hasDateChanged(orig.start_date_time, t.start_date_time) ||
                                hasDateChanged(orig.end_date_time, t.end_date_time)
                            );
                        })
                        .map(t => ({
                            id: t._dbId,
                            name: t.name,
                            price: Number(t.price),
                            quota: Number(t.quota),
                            description: t.description || "",
                            start_date_time: toApiOffsetISOString(t.start_date_time),
                            end_date_time: toApiOffsetISOString(t.end_date_time),
                        }));

                    const formTicketIds = formTickets.map(t => t._dbId).filter(Boolean);
                    const deletedTicketIds = origTickets
                        .filter(t => !formTicketIds.includes(t.id))
                        .map(t => t.id)
                        .filter((id): id is string => !!id);

                    const ticketPayload = { added: addedTickets, updated: updatedTickets, deleted_ids: deletedTicketIds };
                    console.log("[API Call] PATCH /tickets ->", ticketPayload);

                    await EventService.updateOrganizerTickets(
                        event.event_id || (event as any).id,
                        ticketPayload
                    );
                    break;
                }
            }

            // Refresh page data to reflect changes
            router.refresh();
            await onUpdated?.();

            toast.success("Section berhasil diupdate", {
                description: `Perubahan pada bagian ${section} telah disimpan.`
            });
            setOpen(false);

        } catch (error: any) {
            console.error("Failed to update section:", error);
            const message = error instanceof Error ? error.message : "Gagal menyimpan perubahan";
            if (message === "Kategori event tidak valid") {
                methods.setError("category", {
                    type: "server",
                    message,
                });
            }
            if (error instanceof Error) {
                toast.error(message);
            } else {
                toast.error("Gagal menyimpan perubahan");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (section) {
            case 'core':
                return <EventInfoStep hideHeader={true} eventId={event.event_id || (event as any).id} />;
            case 'location':
            case 'datetime':
            case 'rundown':
                return <EventScheduleStep hideHeader={true} sectionOnly={section} />;
            case 'tickets':
                return <EventTicketStep hideHeader={true} sectionOnly={section} />;
            default:
                return null;
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Edit ${meta.badge}`}
                    title={`Edit ${meta.badge}`}
                    className="h-9 shrink-0 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 transition-all hover:border-primary/30 hover:bg-primary-light/60 hover:text-primary"
                >
                    <Pencil className="w-4 h-4" />
                    <span>Edit</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-screen max-w-3xl! gap-0 overflow-hidden border-l border-slate-200/80 bg-[#f9fafb] p-0 shadow-xl shadow-slate-950/10 pointer-events-auto"
            >
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSubmit as any)} className="flex h-dvh flex-col bg-[#f9fafb]">
                        {/* Sticky Header */}
                        <SheetHeader className="relative shrink-0 overflow-hidden border-b border-slate-200/80 bg-white px-5 py-5 pr-14 text-left shadow-sm shadow-slate-900/5 md:px-8 md:py-6">
                            <svg
                                className="pointer-events-none absolute -right-12 -top-14 h-40 w-56 text-primary"
                                viewBox="0 0 224 160"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M15 96C48 34 91 12 144 30C183 43 199 81 210 132"
                                    stroke="currentColor"
                                    strokeOpacity="0.1"
                                    strokeWidth="18"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M54 125C82 80 115 65 153 78C179 87 193 108 201 143"
                                    stroke="#10b981"
                                    strokeOpacity="0.1"
                                    strokeWidth="14"
                                    strokeLinecap="round"
                                />
                                <rect x="126" y="24" width="18" height="18" rx="5" fill="currentColor" fillOpacity="0.1" />
                                <rect x="155" y="43" width="26" height="26" rx="7" fill="currentColor" fillOpacity="0.08" />
                            </svg>
                            <div className="relative mb-3 flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                                    <SectionIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <span className="inline-flex rounded-full border border-primary/10 bg-primary-light px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                                        {meta.badge}
                                    </span>
                                    <SheetTitle className="mt-2 text-xl font-semibold leading-tight tracking-normal text-slate-950 md:text-2xl">
                                        {meta.title}
                                    </SheetTitle>
                                </div>
                            </div>
                            <SheetDescription className="relative max-w-2xl text-sm leading-relaxed text-slate-600">
                                {meta.description}
                            </SheetDescription>
                            <div className="relative mt-4 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                    Event yang diedit
                                </p>
                                <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-900">
                                    {event.title || "Untitled event"}
                                </p>
                            </div>
                        </SheetHeader>

                        {/* Scrollable Content Zone */}
                        <div className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 md:px-8 md:py-6">
                            {/* Inner Wrapper for safe padding on very long content */}
                            <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 md:p-5">
                                {renderContent()}
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <SheetFooter className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-slate-200/80 bg-white px-5 py-4 shadow-sm shadow-slate-900/5 md:px-8">
                            <p className="hidden text-xs text-slate-500 sm:block">
                                Perubahan hanya diterapkan ke section ini.
                            </p>
                            <div className="ml-auto flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isLoading}
                                    className="m-0 h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-none hover:border-primary/30 hover:bg-primary-light/40 hover:text-primary"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="m-0 h-10 min-w-34 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan"
                                    )}
                                </Button>
                            </div>
                        </SheetFooter>
                    </form>
                </FormProvider>
            </SheetContent>
        </Sheet>
    );
}
