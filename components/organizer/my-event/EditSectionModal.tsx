"use client";

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

            // Image Maps
            bannerImagePreview: event.images?.[0]?.image_url,
            bannerImage: event.images?.[0] ? new File([""], "existing-banner.jpg", { type: "image/jpeg" }) : undefined,
            imagePreviews: event.images?.slice(1)?.map(img => img.image_url) || [],
            images: event.images?.slice(1)?.map((img, i) => new File([""], `existing-gallery-${i + 1}.jpg`, { type: "image/jpeg" })) || [],

            // Schedule & Location
            startEventDateTime: event.event_start_date ? new Date(event.event_start_date) : undefined,
            endEventDateTime: event.event_end_date ? new Date(event.event_end_date) : undefined,
            startRegistrationDateTime: event.start_registration_date ? new Date(event.start_registration_date) : undefined,
            endRegistrationDateTime: event.end_registration_date ? new Date(event.end_registration_date) : undefined,
            rundown: event.rundowns?.map(r => ({
                title: r.title || "",
                description: r.description || "",
                start_time: r.start_time || "",
                end_time: r.end_time || "",
                location: r.location || "",
            })) || [],

            // Location
            isOnline: event.is_online,
            meetingUrl: event.meeting_url || "",
            address: {
                title: event.address?.title || "",
                rawAddress: event.address?.raw_address || "",
                city: event.address?.city || "",
                province: event.address?.province || "",
                postalCode: event.address?.postal_code || "",
            },

            // Tickets & Capacity
            maxCapacity: event.max_capacity || 0,
            maxPurchasePerUser: event.max_ticket_per_user || 0,
            isPaid: event.ticket_categories && event.ticket_categories.length > 0 ? event.ticket_categories.some((t) => t.price > 0) : false,
            tickets: event.ticket_categories?.map(t => ({
                name: t.name,
                price: t.price,
                quota: t.quota,
                description: t.description || ""
            })) || []
        }
    });

    const handleSubmit = async (data: CreateEventSchema) => {
        setIsLoading(true);

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
                return <EventInfoStep hideHeader={true} />;
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary shrink-0 transition-colors">
                    <Pencil className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-3xl w-[95vw] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl md:rounded-3xl pointer-events-auto">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(handleSubmit)} className="flex flex-col max-h-[90vh] md:max-h-[85vh]">
                        {/* Sticky Header */}
                        <DialogHeader className="px-6 py-5 md:px-8 md:py-6 border-b border-border/40 bg-background/60 backdrop-blur-lg shrink-0">
                            <DialogTitle className="text-xl tracking-tight font-bold">{titles[section]}</DialogTitle>
                            <DialogDescription className="text-sm">
                                Make changes to this section. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Scrollable Content Zone */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
                            {/* Inner Wrapper for safe padding on very long content */}
                            <div className="max-w-4xl mx-auto w-full pb-8">
                                {renderContent()}
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        <DialogFooter className="px-6 py-5 md:px-8 md:py-5 border-t border-border/40 bg-slate-50/50 backdrop-blur-lg shrink-0 flex items-center justify-end gap-3 rounded-b-2xl md:rounded-b-3xl">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isLoading} className="rounded-xl px-5">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="rounded-xl px-6 bg-primary hover:bg-primary-hover shadow-md">
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
}
