"use client";

import { Calendar, MapPin, Video, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreateEventFormState } from "@/types/create-event";

interface EventPreviewStepProps {
  formData: CreateEventFormState;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function EventPreviewStep(props: EventPreviewStepProps) {
  const { formData, onSubmit, isSubmitting = false } = props;

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent">Preview Event</h2>
        <p className="mt-2 text-muted">
          Periksa kembali semua informasi sebelum mempublikasikan event
        </p>
      </div>

      {/* Event Type */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
        <h3 className="mb-3 font-semibold text-accent">Tipe Event</h3>
        <div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
              formData.eventType === "public"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            )}
          >
            {formData.eventType === "public" ? "Publik" : "Internal"}
          </span>
        </div>
      </div>

      {/* Banner & Info */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
        <h3 className="mb-3 font-semibold text-accent">Informasi Event</h3>

        <div className="space-y-4">
          {/* Banner */}
          {formData.bannerPreview && (
            <img
              src={formData.bannerPreview}
              alt="Banner"
              className="h-48 w-full rounded-lg object-cover"
            />
          )}

          {/* Title & Category */}
          <div>
            <h4 className="text-xl font-bold text-accent">{formData.title}</h4>
            <span className="mt-1 inline-block rounded-md bg-slate-100 px-2 py-1 text-sm text-muted">
              {formData.category}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-accent">Deskripsi:</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
              {formData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule & Location */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
        <h3 className="mb-3 font-semibold text-accent">Jadwal & Lokasi</h3>

        <div className="space-y-4">
          {/* Schedule */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Calendar className="h-4 w-4" />
              Jadwal
            </div>
            <div className="mt-2 space-y-1 text-sm text-muted">
              <p>
                <strong>Mulai:</strong> {formatDate(formData.startDate)} •{" "}
                {formData.startTime || "-"}
              </p>
              <p>
                <strong>Selesai:</strong> {formatDate(formData.endDate)} •{" "}
                {formData.endTime || "-"}
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              {formData.locationType === "offline" ? (
                <MapPin className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              Lokasi - {formData.locationType === "offline" ? "Offline" : "Online"}
            </div>
            <div className="mt-2 text-sm text-muted">
              {formData.locationType === "offline" ? (
                <div className="space-y-1">
                  <p>{formData.address.rawAddress}</p>
                  <p>
                    {formData.address.city}, {formData.address.province} •{" "}
                    {formData.address.postalCode || "-"}
                  </p>
                </div>
              ) : (
                <a
                  href={formData.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {formData.meetingUrl}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tickets */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
        <h3 className="mb-3 font-semibold text-accent">Tiket</h3>

        <div className="space-y-3">
          <div className="text-sm">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                formData.isPaid
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              )}
            >
              {formData.isPaid ? "Berbayar" : "Gratis"}
            </span>
          </div>

          {formData.tickets.map((ticket, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-slate-200 p-3"
            >
              <div className="flex items-center gap-3">
                <TicketIcon className="h-5 w-5 text-muted" />
                <div>
                  <p className="font-medium text-accent">{ticket.name}</p>
                  {ticket.description && (
                    <p className="text-sm text-muted">{ticket.description}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent">
                  {formatCurrency(ticket.price)}
                </p>
                <p className="text-sm text-muted">Kuota: {ticket.quota}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="min-w-50"
        >
          {isSubmitting ? "Memproses..." : "Publikasikan Event"}
        </Button>
      </div>
    </div>
  );
}
