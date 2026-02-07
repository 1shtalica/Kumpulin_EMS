"use client";

import { useCreateEventStore } from "@/stores/create-event-store";
import CreateEventStepper from "@/components/organizer/create-event/CreateEventStepper";
import EventTypeStep from "@/components/organizer/create-event/steps/EventTypeStep";
import EventInfoStep from "@/components/organizer/create-event/steps/EventInfoStep";
import EventScheduleStep from "@/components/organizer/create-event/steps/EventScheduleStep";
import EventTicketStep from "@/components/organizer/create-event/steps/EventTicketStep";
import EventPreviewStep from "@/components/organizer/create-event/steps/EventPreviewStep";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CreateEventClient() {
  const {
    currentStep,
    formData,
    nextStep,
    prevStep,
    validateStep,
    updateEventType,
    updateTitle,
    updateCategory,
    updateDescription,
    updateBanner,
    updateSchedule,
    updateLocationType,
    updateAddress,
    updateMeetingUrl,
    updateIsPaid,
    addTicket,
    removeTicket,
    updateTicket,
  } = useCreateEventStore();

  const isStepValid = validateStep(currentStep);
  const canGoNext = isStepValid && currentStep < 5;
  const canGoPrev = currentStep > 1;
  // 🌟 Tambahkan kondisional jika jadi button submit
  const handleNext = () => {
    if (canGoNext) {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      prevStep();
    }
  };

  const handleSubmit = async () => {
    // TODO: Implement submit logic
    // 1. Upload banner to Supabase
    // 2. Create event via API
    // 3. Redirect to event detail or my events
    console.log("Submitting event:", formData);
    alert("Submit functionality will be implemented in next phase");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EventTypeStep
            selectedType={formData.eventType}
            onSelectType={updateEventType}
          />
        );
      case 2:
        return (
          <EventInfoStep
            title={formData.title}
            category={formData.category}
            description={formData.description}
            bannerFile={formData.bannerFile}
            bannerPreview={formData.bannerPreview}
            onTitleChange={updateTitle}
            onCategoryChange={updateCategory}
            onDescriptionChange={updateDescription}
            onBannerChange={updateBanner}
          />
        );
      case 3:
        return (
          <EventScheduleStep
            startDate={formData.startDate}
            endDate={formData.endDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onScheduleChange={updateSchedule}
            locationType={formData.locationType}
            onLocationTypeChange={updateLocationType}
            address={formData.address}
            onAddressChange={(field, value) =>
              updateAddress({ [field]: value })
            }
            meetingUrl={formData.meetingUrl}
            onMeetingUrlChange={updateMeetingUrl}
          />
        );
      case 4:
        return (
          <EventTicketStep
            isPaid={formData.isPaid}
            tickets={formData.tickets}
            onIsPaidChange={updateIsPaid}
            onAddTicket={addTicket}
            onRemoveTicket={removeTicket}
            onUpdateTicket={updateTicket}
          />
        );
      case 5:
        return <EventPreviewStep formData={formData} onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">Buat Event Baru</h1>
        <p className="mt-2 text-muted">
          Lengkapi informasi berikut untuk membuat event Anda
        </p>
      </div>

      {/* Stepper */}
      <CreateEventStepper currentStep={currentStep} />

      {/* Form Container */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:p-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={cn("rounded-lg", !canGoPrev && "invisible")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sebelumnya
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-accent">Step {currentStep} dari 5</span>
        </div>

        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          className={cn(
            "min-w-30 rounded-lg",
            !isStepValid && "cursor-not-allowed opacity-50",
          )}
        >
          {currentStep === 5 ? "Submit" : "Lanjut"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Validation Hint */}
      {!isStepValid && currentStep < 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600">
            {currentStep === 1 && "Pilih tipe event untuk melanjutkan"}
            {currentStep === 2 && "Lengkapi semua informasi event"}
            {currentStep === 3 && "Lengkapi jadwal dan lokasi event"}
            {currentStep === 4 && "Tentukan harga event"}
          </p>
        </div>
      )}
    </div>
  );
}
