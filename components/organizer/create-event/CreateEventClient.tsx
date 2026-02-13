"use client";

import { useCreateEventStore } from "@/stores/create-event-store";
import type { CreateEventFormState } from "@/types/create-event";
import CreateEventStepper from "@/components/organizer/create-event/CreateEventStepper";
import EventTypeStep from "@/components/organizer/create-event/steps/EventTypeStep";
import EventInfoStep from "@/components/organizer/create-event/steps/EventInfoStep";
import EventScheduleStep from "@/components/organizer/create-event/steps/EventScheduleStep";
import EventTicketStep from "@/components/organizer/create-event/steps/EventTicketStep";
import EventPreviewStep from "@/components/organizer/create-event/steps/EventPreviewStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useForm,
  FormProvider,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  CreateEventSchema,
} from "@/lib/validator/create-event.schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EventService } from "@/services/event-service";

export default function CreateEventClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentStep,
    nextStep: storeNextStep,
    prevStep: storePrevStep,
    formData: storeFormData,
    syncFormData,
    setStep,
  } = useCreateEventStore();

  const methods = useForm<CreateEventSchema>({
    resolver: zodResolver(createEventSchema) as any, // Type inference issue with z.coerce.number()
    mode: "onChange",
    defaultValues: storeFormData as Partial<CreateEventSchema>,
  });

  const { trigger, handleSubmit, watch, getValues } = methods;

  // Sync form data to store whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      // Type assertion needed because RHF returns DeepPartialFieldValues which makes array elements optional
      syncFormData(value as Partial<CreateEventFormState>);
    });
    return () => subscription.unsubscribe();
  }, [watch, syncFormData]);

  // Determine if we can go back
  const canGoPrev = currentStep > 1;

  const handleNext = async () => {
    let isStepValid = false;

    // Validate only fields for the current step
    switch (currentStep) {
      case 1:
        isStepValid = await trigger(["eventType"] as const);
        break;
      case 2:
        isStepValid = await trigger([
          "title",
          "category",
          "description",
          "bannerFile",
        ] as const);
        break;
      case 3:
        const step3Fields = [
          "startEventDateTime",
          "endEventDateTime",
          "startRegistrationDateTime",
          "endRegistrationDateTime",
          "rundown",
          "isOnline",
          "address",
          "meetingUrl",
        ] as const;
        isStepValid = await trigger(step3Fields);
        break;
      case 4:
        const fieldValid = await trigger();

        // 2. Manual cross-field validation for Paid Events
        // (Because trigger() doesn't run superRefine validations)
        const values = getValues();
        let manualValid = true;

        if (values.isPaid) {
          // Validate Tickets exist
          if (!values.tickets || values.tickets.length === 0) {
            methods.setError("tickets", {
              type: "manual",
              message: "Event berbayar wajib memiliki minimal 1 tiket",
            });
            manualValid = false;
          } else {
            // Validate Ticket Prices > 0
            const hasInvalidPrice = values.tickets.some(
              (t) => (t.price ?? 0) <= 0,
            );
            if (hasInvalidPrice) {
              methods.setError("tickets", {
                type: "manual",
                message: "Tiket berbayar harus memiliki harga > 0",
              });
              manualValid = false;
            }
          }

          // Validate Max Purchase Per User
          // It must be defined (can be 0 for unlimited)
          if (
            values.maxPurchasePerUser === undefined ||
            values.maxPurchasePerUser === null ||
            isNaN(values.maxPurchasePerUser)
          ) {
            methods.setError("maxPurchasePerUser", {
              type: "manual",
              message:
                "Batas pembelian per user wajib diisi untuk event berbayar",
            });
            manualValid = false;
          }
        }

        isStepValid = fieldValid && manualValid;
        break;
      case 5:
        isStepValid = true;
        break;
    }

    if (isStepValid) {
      storeNextStep();
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      storePrevStep();
      window.scrollTo(0, 0);
    }
  };

  // Helper to create slug
  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const onSubmit: SubmitHandler<CreateEventSchema> = async (data) => {
    setIsSubmitting(true);
    const promise = new Promise(async (resolve, reject) => {
      try {
        const formData = new FormData();

        // --- STEP 1: Event Type ---
        formData.append("type", data.eventType);

        // --- STEP 2: Basic Info ---
        formData.append("title", data.title);
        formData.append("category", data.category);
        formData.append("description", data.description);
        if (data.bannerFile) {
          formData.append("images", data.bannerFile);
        }

        // --- STEP 3: Date, Time, Location, Rundown ---
        formData.append("is_online", String(data.isOnline));
        if (data.startEventDateTime)
          formData.append("start_date", data.startEventDateTime.toISOString());
        if (data.endEventDateTime)
          formData.append("end_date", data.endEventDateTime.toISOString());
        if (data.startRegistrationDateTime)
          formData.append(
            "start_registration",
            data.startRegistrationDateTime.toISOString(),
          );
        if (data.endRegistrationDateTime)
          formData.append(
            "end_registration",
            data.endRegistrationDateTime.toISOString(),
          );

        // Location vs Meeting URL
        if (data.isOnline && data.meetingUrl) {
          formData.append("meeting_url", data.meetingUrl);
        } else if (!data.isOnline && data.address) {
          formData.append("address", JSON.stringify(data.address));
        }

        // Rundown
        formData.append("rundowns", JSON.stringify(data.rundown));

        // --- STEP 4: Tickets & Capacity ---
        formData.append("isPaid", String(data.isPaid)); // Sent as requested (pure form data)
        formData.append("max_capacity", String(data.maxCapacity));
        formData.append(
          "max_ticket_per_user",
          String(data.maxPurchasePerUser || 0),
        );

        if (data.isPaid && data.tickets) {
          formData.append("ticket_categories", JSON.stringify(data.tickets));
        }

        // 5. Call API
        await EventService.createEvent(formData);
        resolve("Event berhasil dibuat!");

        // 6. Redirect (Delayed to show success toast)
        setTimeout(() => {
          router.push("/organizer/events");
        }, 1000);
      } catch (error) {
        setIsSubmitting(false); // Enable button again if error
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: "Sedang mempublikasikan event...",
      success: (msg) => `${msg}`,
      error: "Gagal membuat event. Silakan coba lagi.",
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <EventTypeStep />;
      case 2:
        return <EventInfoStep />;
      case 3:
        return <EventScheduleStep />;
      case 4:
        return <EventTicketStep />;
      case 5:
        // For preview step, we can use watch or getValues since we sync to store anyway
        // But passing getValues() ensures fresh render data if component re-renders
        // Add step field from store since getValues() doesn't include it
        return (
          <EventPreviewStep
            formData={
              { ...getValues(), step: currentStep } as CreateEventFormState
            }
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">Buat Event Baru</h1>
        <p className="mt-2 text-muted-foreground">
          Lengkapi informasi berikut untuk membuat event Anda
        </p>
      </div>

      {/* Stepper */}
      <CreateEventStepper currentStep={currentStep} />

      <FormProvider {...methods}>
        {/* Form Container */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs md:p-8">
          {renderStep()}
        </div>
      </FormProvider>

      {/* Navigation Section */}
      <div className="mt-8 space-y-4">
        {/* Step Indicator - Separate Row, Centered */}
        <div className="flex justify-center">
          <span className="text-sm font-medium text-accent">
            Step {currentStep} dari 5
          </span>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {/* Prev Button */}
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={cn(
              "rounded-lg transition-opacity",
              !canGoPrev && "opacity-0 pointer-events-none",
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>

          {/* Next Button */}
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="min-w-30 rounded-lg"
            >
              Lanjut
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div /> /* Spacer */
          )}
        </div>
      </div>
    </div>
  );
}
