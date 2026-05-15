"use client";

import { useCreateEventStore } from "@/stores/create-event-store";
import type { CreateEventFormState } from "@/types/create-event";
import CreateEventStepper, {
  createEventSteps,
} from "@/components/organizer/create-event/CreateEventStepper";
import EventTypeStep from "@/components/organizer/create-event/steps/EventTypeStep";
import EventInfoStep from "@/components/organizer/create-event/steps/EventInfoStep";
import EventScheduleStep from "@/components/organizer/create-event/steps/EventScheduleStep";
import EventTicketStep from "@/components/organizer/create-event/steps/EventTicketStep";
import EventPreviewStep from "@/components/organizer/create-event/steps/EventPreviewStep";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useForm,
  FormProvider,
  SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEventSchema,
  CreateEventSchema,
} from "@/lib/validator/create-event.schema";
import { useEffect, useState } from "react";
import { EventService } from "@/services/event-service";
import { useRouter, useSearchParams } from "next/navigation";
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
  const stepMeta = createEventSteps[currentStep - 1] ?? createEventSteps[0];
  const progressPercentage = Math.round(
    (currentStep / createEventSteps.length) * 100,
  );
  const StepIcon = stepMeta.Icon;

  const methods = useForm<CreateEventSchema>({
    resolver: zodResolver(createEventSchema) as Resolver<CreateEventSchema>,
    mode: "onChange",
    defaultValues: storeFormData as Partial<CreateEventSchema>,
  });

  const { trigger, handleSubmit, watch, getValues, setError } = methods;

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
    } else {
      toast.error("Ada isian yang belum lengkap atau tidak valid. Silakan periksa kembali.", {
        duration: 4000,
      });
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
      const axiosError = error as AxiosError<{
        message?: string;
        error_code?: string;
      }>;
      const responseData = axiosError.response?.data;
      const errorMessage = responseData?.message || "Gagal membuat event.";

      if (
        responseData?.error_code === "INVALID_INPUT" &&
        responseData.message === "Kategori event tidak valid"
      ) {
        setError("category", {
          type: "server",
          message: responseData.message,
        });
        setStep(2);
        window.scrollTo(0, 0);
      }

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
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-4 py-32">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-md shadow-slate-900/5">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="text-base font-semibold text-slate-950">
            Menyiapkan formulir duplikasi
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Data event lama sedang disalin ke draft baru.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-xl bg-primary-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Organizer workspace
            </div>
            <h1 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
              Buat Event Baru
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Susun detail event, jadwal, tiket, dan preview akhir sebelum
              dipublikasikan ke peserta.
            </p>
          </div>

          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:max-w-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200">
                  <StepIcon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Step {currentStep} dari {createEventSteps.length}
                  </p>
                  <p className="text-sm font-semibold text-slate-950">
                    {stepMeta.title}
                  </p>
                </div>
              </div>
              <span className="text-sm font-semibold tabular-nums text-primary">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CreateEventStepper currentStep={currentStep} />
          <div className="mt-4 hidden rounded-2xl border border-primary/10 bg-primary-light/40 p-4 text-sm leading-relaxed text-slate-600 shadow-sm shadow-slate-900/5 lg:block">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <ClipboardList className="h-4 w-4" />
              Fokus saat ini
            </div>
            {stepMeta.description}
          </div>
        </aside>

        <section className="min-w-0">
          <FormProvider {...methods}>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4 md:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary ring-1 ring-slate-200">
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Step {currentStep}
                    </p>
                    <h2 className="text-lg font-semibold text-slate-950">
                      {stepMeta.title}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-7">{renderStep()}</div>
            </div>
          </FormProvider>

          <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>
                  Perubahan tersimpan di draft lokal saat kamu berpindah step.
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  className={cn(
                    "h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary",
                    !canGoPrev && "pointer-events-none opacity-0",
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Sebelumnya
                </Button>

                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="h-10 min-w-32 rounded-xl px-5 font-semibold"
                  >
                    Selanjutnya
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="min-w-32" />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
