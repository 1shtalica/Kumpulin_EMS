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
import { EventService } from "@/services/event-service";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

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
    reset,
    loadFromExistingEvent,
  } = useCreateEventStore();

  const searchParams = useSearchParams();
  const duplicateId = searchParams.get("duplicateId");
  const [isInitializing, setIsInitializing] = useState(!!duplicateId);

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
      if (!isInitializing) {
        syncFormData(value as Partial<CreateEventFormState>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, syncFormData, isInitializing]);

  // Handle Duplication Initialization
  useEffect(() => {
    if (duplicateId) {
      const fetchAndPopulate = async () => {
        try {
          const originalEvent = await EventService.getEventByIdFull(duplicateId);
          if (originalEvent) {
            loadFromExistingEvent(originalEvent);
            // Refresh RHF defaults tightly hooked to our updated store state
            const freshState = useCreateEventStore.getState().formData;
            methods.reset(freshState as Partial<CreateEventSchema>);
            toast.success("Data event berhasil disalin");
          }
        } catch (error) {
          console.error("Failed to duplicate event:", error);
          toast.error("Gagal menyalin data event");
        } finally {
          setIsInitializing(false);
          // remove query param without refreshing page to prevent refetching
          router.replace("/organizer/create-event", { scroll: false });
        }
      };
      
      fetchAndPopulate();
    }
  }, [duplicateId, loadFromExistingEvent, methods, router]);

  // Determine if we can go back
  const canGoPrev = currentStep > 1;

  const handleNext = async () => {
    let isStepValid = false;

    // Validate only fields for the current step
    switch (currentStep) {
      case 1:
        isStepValid = await trigger(["type"] as const);
        break;
      case 2:
        isStepValid = await trigger([
          "title",
          "category",
          "description",
          "banner_image",
          "images",
        ] as const);
        break;
      case 3:
        const step3Fields = [
          "event_start_date",
          "event_end_date",
          "start_registration_date",
          "end_registration_date",
          "rundowns",
          "is_online",
          "address",
          "meeting_url",
          "hide_meeting_url",
        ] as const;
        isStepValid = await trigger(step3Fields);
        break;
      case 4:
        isStepValid = await trigger();
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

  const onSubmit: SubmitHandler<CreateEventSchema> = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Sedang Membuat Event...");
    try {
      await EventService.CreateEvent(data as CreateEventFormState);
      toast.success("Event berhasil dibuat", { id: toastId });
      reset();
      methods.reset();
      router.push("/organizer/my-event");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Gagal membuat event.";

      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
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

  if (isInitializing) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-4 py-32 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium animate-pulse text-lg">
          Menyiapkan formulir duplikasi...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-accent">Buat Event Baru</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Lengkapi informasi berikut untuk membuat event Anda
        </p>
      </div>

      {/* Stepper */}
      <CreateEventStepper currentStep={currentStep} />

      <FormProvider {...methods}>
        {/* Form Container */}
        <div className="rounded-2xl border shadow-lg bg-white p-6 md:p-8">
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
            variant="outline"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={cn(
              "rounded-full shadow-glow transition-opacity",
              !canGoPrev && "opacity-0 pointer-events-none",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Sebelumnya
          </Button>

          {/* Next Button */}
          {currentStep < 5 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="min-w-30 rounded-full shadow-glow"
            >
              Selanjutnya
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <div /> /* Spacer */
          )}
        </div>
      </div>
    </div>
  );
}
