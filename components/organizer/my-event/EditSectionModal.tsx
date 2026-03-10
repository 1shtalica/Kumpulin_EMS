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

interface EditModalProps {
    event: BEEventResponse;
    section: 'core' | 'location' | 'rundown' | 'datetime' | 'capacity' | 'tickets';
}

export function EditSectionModal({ event, section }: EditModalProps): ReactNode {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

        // Jika section === 'core', lakukan Diff check untuk file baru yang akan dikirim:
        if (section === 'core') {
            const isNewBanner = data.banner_image && data.banner_image.name !== "existing-banner.jpg";
            const newGalleryImages = data.images.filter(file => !file.name.startsWith("existing-gallery-"));

            console.log("Diffing Results untuk Gambar:");
            console.log("- Kirim banner baru?", isNewBanner ? "Ya" : "Tidak");
            console.log("- Jumlah poster baru yang perlu diupload:", newGalleryImages.length);
        }

        // Simulating API call
        setTimeout(() => {
            setIsLoading(false);
            setOpen(false);
            toast.success("Feature in development", {
                description: `Endpoint untuk update ${section} belum tersedia.`
            });
        }, 800);
    };

    const renderContent = () => {
        switch (section) {
            case 'core':
                return <EventInfoStep hideHeader={true} eventId={event.event_id || (event as any).id} />;
            case 'location':
            case 'datetime':
            case 'rundown':
                return <EventScheduleStep hideHeader={true} sectionOnly={section} />;
            case 'capacity':
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
        capacity: "Edit Capacity Parameters",
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
