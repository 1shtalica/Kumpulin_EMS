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

    // Step 1
    updateEventType,

    // Step 2
    updateTitle,
    updateCategory,
    updateDescription,
    updateBanner,

    // Step 3
    updateEventSchedule,
    updateRegistrationSchedule,
    addRundown,
    removeRundown,
    updateRundown,
    updateIsOnline,
    updateAddress,
    updateMeetingUrl,

    // Step 4
    updateIsPaid,
    updateMaxCapacity,
    addTicket,
    removeTicket,
    updateTicket,
  } = useCreateEventStore();

  const isStepValid = validateStep(currentStep);
  const canGoNext = isStepValid && currentStep < 5;
  const canGoPrev = currentStep > 1;

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
    // API Submission Logic Placeholder

    console.log("Submitting Event Payload:", JSON.stringify(formData, null, 2));
    // TODO: Connect to backend API
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
            // Event Schedule
            startEventDate={formData.startEventDate}
            endEventDate={formData.endEventDate}
            startEventTime={formData.startEventTime}
            endEventTime={formData.endEventTime}
            onEventScheduleChange={updateEventSchedule}
            // Registration Schedule
            startRegistration={formData.startRegistration}
            endRegistration={formData.endRegistration}
            startRegistrationTime={formData.startRegistrationTime}
            endRegistrationTime={formData.endRegistrationTime}
            onRegistrationScheduleChange={updateRegistrationSchedule}
            // Rundown
            rundown={formData.rundown}
            onAddRundown={addRundown}
            onRemoveRundown={removeRundown}
            onUpdateRundown={updateRundown}
            // Location
            isOnline={formData.isOnline}
            onIsOnlineChange={updateIsOnline}
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
            maxCapacity={formData.maxCapacity}
            tickets={formData.tickets}
            onIsPaidChange={updateIsPaid}
            onMaxCapacityChange={updateMaxCapacity}
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent">Buat Event Baru</h1>
        <p className="mt-2 text-muted">
          Lengkapi informasi berikut untuk membuat event Anda
        </p>
      </div>

      {/* Stepper */}
      <CreateEventStepper currentStep={currentStep} />

      {/* Form Container */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:p-8">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Step Indicator - Mobile Order 1, Desktop Order 2 */}
        <div className="order-1 flex justify-center md:order-2">
          <span className="text-sm font-medium text-accent">
            Step {currentStep} dari 5
          </span>
        </div>

        {/* Buttons - Mobile Order 2, Desktop Order 1 & 3 */}
        <div className="order-2 flex w-full items-center justify-between md:w-auto md:contents">
          {/* Prev Button */}
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={cn(
              "order-1 rounded-lg md:order-1",
              !canGoPrev && "invisible",
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>

          {/* Next Button */}
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className={cn(
                "order-2 min-w-30 rounded-lg md:order-3",
                !isStepValid && "cursor-not-allowed opacity-50",
              )}
            >
              Lanjut
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="order-2 md:order-3" /> /* Spacer */
          )}
        </div>
      </div>

      {/* Validation Hint */}
      {!isStepValid && currentStep < 5 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-600">
            {currentStep === 1 && "Pilih tipe event untuk melanjutkan"}
            {currentStep === 2 && "Lengkapi semua informasi event"}
            {currentStep === 3 &&
              "Lengkapi jadwal, pendaftaran, rundown, dan lokasi"}
            {currentStep === 4 && "Lengkapi kapasitas dan tiket event"}
          </p>
        </div>
      )}
    </div>
  );
}
