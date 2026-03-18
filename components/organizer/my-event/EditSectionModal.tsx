"use client";

import { useState } from "react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { BEEventResponse } from "@/types/event";
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
    event: BEEventResponse;
    section: 'core' | 'location' | 'rundown' | 'datetime' | 'tickets';
}

export function EditSectionModal({ event, section }: EditModalProps): ReactNode {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Initialize React Hook Form with mapped data from existing event
    const methods = useForm<CreateEventSchema>({
        mode: "onChange",
        defaultValues: {
            title: event.title || "",
            type: (event.type as any) || "public",
            category: "Umum", // Fallback (BEEventResponse doesn't have it explicitly right now)
            description: typeof event.description?.content === 'string' ? event.description.content : "",

            // Image Maps -> Embed the original backend ID in the File name so the UI knows it's an existing file
            banner_image_preview: event.images?.[0]?.image_url,
            banner_image: event.images?.[0] ? new File([""], "existing-banner.jpg", { type: "image/jpeg" }) : (undefined as any),
            image_previews: event.images?.slice(1)?.map(img => img.image_url) || [],
            images: event.images?.slice(1)?.map((img) => new File([""], `existing-gallery-${img.id || "unknown"}.jpg`, { type: "image/jpeg" })) || [],

            // Schedule & Location
            event_start_date: event.event_start_date ? new Date(event.event_start_date) : (undefined as any),
            event_end_date: event.event_end_date ? new Date(event.event_end_date) : (undefined as any),
            start_registration_date: event.start_registration_date ? new Date(event.start_registration_date) : (undefined as any),
            end_registration_date: event.end_registration_date ? new Date(event.end_registration_date) : (undefined as any),
            rundowns: event.rundowns?.map(r => ({
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
                title: event.address?.title || "",
                raw_address: event.address?.raw_address || "",
                city: event.address?.city || "",
                province: event.address?.province || "",
                postal_code: event.address?.postal_code || "",
                location_url: "",
            },

            // Tickets & Capacity
            max_capacity: event.max_capacity || 0,
            max_ticket_per_user: event.max_ticket_per_user || 0,
            tickets: event.ticket_categories?.map(t => ({
                name: t.name,
                price: t.price,
                quota: t.quota,
                description: t.description || "",
                type: (t.price > 0 ? "paid" : "free") as "paid" | "free",
                start_date_time: event.start_registration_date ? new Date(event.start_registration_date) : new Date(),
                end_date_time: event.end_registration_date ? new Date(event.end_registration_date) : new Date(),
            })) || []
        }
    });

    const handleSubmit = async (data: CreateEventSchema) => {
        setIsLoading(true);
        console.log("log edit data: ", data)

        let payloadToSubmit: any = {};

        // 1. Construct specific payload based on section (Approach B)
        try {
            switch (section) {
                case 'core':
                    // PATCH /api/v1/events/:id/core
                    payloadToSubmit = {
                        title: data.title,
                        category: data.category,
                        description: data.description,
                        type: data.type
                    };

                    const isNewBanner = data.banner_image && data.banner_image.name;
                    const newGalleryImages = data.images.filter(file => !file.name.startsWith("existing-gallery-"));

                    console.log("[API Call] PATCH /core ->", payloadToSubmit);
                    if (isNewBanner) console.log("[API Call] PUT /banner ->", data.banner_image);

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

                    // 1. Delete removed images
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

                    // 2. Upload new images
                    if (newGalleryImages.length > 0) {
                        try {
                            const formData = new FormData();
                            // Append each file using the field name "images" per instructions
                            newGalleryImages.forEach(file => {
                                formData.append("images", file);
                            });

                            const response = await axiosClient.post(`/organizer/events/${targetEventId}/image`, formData, {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                            });
                            console.log("[API Call Result] POST /images ->", response.data);
                            imageChanged = true;
                        } catch (error: any) {
                            console.error("[API Call Error] POST /images ->", error);
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
                        event_start_date: data.event_start_date.toISOString(),
                        event_end_date: data.event_end_date.toISOString(),
                        start_registration_date: data.start_registration_date.toISOString(),
                        end_registration_date: data.end_registration_date.toISOString()
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
                            title: data.address.title,
                            raw_address: data.address.raw_address,
                            province: data.address.province,
                            city: data.address.city,
                            postal_code: data.address.postal_code,
                            location_url: data.address.location_url
                        }
                    };
                    console.log("[API Call] PATCH /location ->", payloadToSubmit);
                    break;


                case 'rundown': {
                    // Diff against original event.rundowns by index position:
                    // same index = updated (carry original UUID); beyond original length = added (no id);
                    // original items reduced = deleted (collect their UUIDs).
                    const origRundowns = event.rundowns || [];
                    const formRundowns = data.rundowns;

                    const addedRundowns = formRundowns.slice(origRundowns.length).map(r => ({
                        title: r.title,
                        description: r.description || "",
                        start_time: r.start_time,
                        end_time: r.end_time,
                        location: r.location || "",
                    }));

                    const updatedRundowns = formRundowns.slice(0, origRundowns.length).map((r, i) => ({
                        id: origRundowns[i].id,
                        title: r.title,
                        description: r.description || "",
                        start_time: r.start_time,
                        end_time: r.end_time,
                        location: r.location || "",
                    }));

                    const deletedIds = origRundowns
                        .slice(formRundowns.length)
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
                    // Diff against original event.ticket_categories by index position.
                    const origTickets = event.ticket_categories || [];
                    const formTickets = data.tickets;

                    const addedTickets = formTickets.slice(origTickets.length).map(t => ({
                        name: t.name,
                        price: Number(t.price),
                        quota: Number(t.quota),
                        description: t.description || "",
                        start_date_time: t.start_date_time.toISOString(),
                        end_date_time: t.end_date_time.toISOString(),
                    }));

                    const updatedTickets = formTickets.slice(0, origTickets.length).map((t, i) => ({
                        id: origTickets[i].id,
                        name: t.name,
                        price: Number(t.price),
                        quota: Number(t.quota),
                        description: t.description || "",
                        start_date_time: t.start_date_time.toISOString(),
                        end_date_time: t.end_date_time.toISOString(),
                    }));

                    const deletedTicketIds = origTickets
                        .slice(formTickets.length)
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

            toast.success("Section berhasil diupdate", {
                description: `Perubahan pada bagian ${section} telah disimpan.`
            });
            setOpen(false);

        } catch (error: any) {
            console.error("Failed to update section:", error);
            if (error instanceof Error) {
                toast.error(error.message);
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

    const titles = {
        core: "Edit Core Information",
        location: "Edit Location Details",
        datetime: "Edit Time Constraints",
        tickets: "Manage Ticket Categories",
        rundown: "Manage Rundowns"
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0 transition-colors">
                    <Pencil className="w-4 h-4" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="!max-w-2xl w-[100vw] p-0 gap-0 overflow-hidden bg-background border-l border-border/50 shadow-2xl pointer-events-auto">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSubmit as any)} className="flex flex-col h-[100dvh]">
                        {/* Sticky Header */}
                        <SheetHeader className="px-6 py-5 md:px-8 md:py-6 border-b border-border/40 bg-background/60 backdrop-blur-lg shrink-0 text-left">
                            <SheetTitle className="text-xl tracking-tight font-bold">{titles[section]}</SheetTitle>
                            <SheetDescription className="text-sm">
                                Make changes to this section. Click save when you're done.
                            </SheetDescription>
                        </SheetHeader>

                        {/* Scrollable Content Zone */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar">
                            {/* Inner Wrapper for safe padding on very long content */}
                            <div className="max-w-xl mx-auto w-full pb-8">
                                {renderContent()}
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <SheetFooter className="px-6 py-5 md:px-8 md:py-5 border-t border-border/40 bg-slate-50/50 backdrop-blur-lg shrink-0 flex flex-row items-center justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading} className="rounded-full shadow-sm m-0 border-border">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="rounded-full m-0 bg-primary hover:bg-primary-hover shadow-md text-white">
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </SheetFooter>
                    </form>
                </FormProvider>
            </SheetContent>
        </Sheet>
    );
}
