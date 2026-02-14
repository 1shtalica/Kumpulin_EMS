"use client";

import {
  Calendar,
  MapPin,
  Video,
  Ticket as TicketIcon,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreateEventFormState } from "@/types/create-event";

interface EventPreviewStepProps {
  formData: CreateEventFormState;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
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
      hour: "2-digit",
      minute: "2-digit",
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
        <h2 className="text-2xl font-bold text-foreground">Preview Event</h2>
        <p className="mt-2 text-muted-foreground">
          Periksa kembali semua informasi sebelum mempublikasikan event
        </p>
      </div>

      {/* Event Type */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-foreground">Tipe Event</h3>
        <div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
              formData.type === "external"
                ? "bg-primary-light text-primary"
                : "bg-secondary-light text-secondary",
            )}
          >
            {formData.type === "external" ? "External" : "Internal"}
          </span>
        </div>
      </div>

      {/* Banner & Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-foreground">Informasi Event</h3>

        <div className="space-y-4">
          {/* Banner */}
          {formData.imagePreviews && formData.imagePreviews.length > 0 && (
            <div className="space-y-2">
              <img
                src={formData.imagePreviews[0]}
                alt="Banner"
                className="h-48 w-full rounded-lg object-cover"
              />
              {formData.imagePreviews.length > 1 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{formData.imagePreviews.length - 1} gambar lainnya
                </p>
              )}
            </div>
          )}

          {/* Title & Category */}
          <div>
            <h4 className="text-xl font-bold text-foreground">{formData.title}</h4>
            <span className="mt-1 inline-block rounded-md bg-muted px-2 py-1 text-sm text-foreground">
              {formData.category}
            </span>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-accent">Deskripsi:</p>
            <div
              className="mt-1 text-sm text-muted-foreground prose prose-sm max-w-none break-words overflow-wrap-anywhere"
              dangerouslySetInnerHTML={{ __html: formData.description || "" }}
            />
          </div>
        </div>
      </div>

      {/* Schedule & Location */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-foreground">Jadwal & Lokasi</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Registration Schedule (First) */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Clock className="h-4 w-4" />
              Periode Pendaftaran
            </div>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between md:block">
                <span>Buka:</span>
                <span className="font-medium text-accent ml-2">
                  {formatDate(formData.startRegistrationDateTime)}
                </span>
              </div>
              <div className="flex justify-between md:block">
                <span>Tutup:</span>
                <span className="font-medium text-accent ml-2">
                  {formatDate(formData.endRegistrationDateTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule (Second) */}
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              <Calendar className="h-4 w-4" />
              Waktu Pelaksanaan
            </div>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between md:block">
                <span>Mulai:</span>
                <span className="font-medium text-accent ml-2">
                  {formatDate(formData.startEventDateTime)}
                </span>
              </div>
              <div className="flex justify-between md:block">
                <span>Selesai:</span>
                <span className="font-medium text-accent ml-2">
                  {formatDate(formData.endEventDateTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Location (Full Width) */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-sm font-medium text-accent">
              {!formData.isOnline ? (
                <MapPin className="h-4 w-4" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              Lokasi - {!formData.isOnline ? "Offline" : "Online"}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {!formData.isOnline ? (
                <div className="rounded-md bg-slate-50 p-3">
                  <p className="font-medium text-accent">
                    {formData.address.rawAddress}
                  </p>
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
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  Link Meeting
                  <span className="text-xs text-muted-foreground">
                    ({formData.meetingUrl})
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rundown */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-foreground">Susunan Acara</h3>

        {formData.rundown.length > 0 ? (
          <div className="space-y-3">
            {formData.rundown.map((item, index) => (
              <div
                key={index}
                className="flex gap-4 border-l-2 border-primary pl-4"
              >
                <div className="min-w-24 text-sm text-muted-foreground">
                  {item.startTime} - {item.endTime}
                </div>
                <div>
                  <p className="font-medium text-accent">{item.title}</p>
                  {item.location && (
                    <p className="text-xs text-muted-foreground">
                      {item.location}
                    </p>
                  )}
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">Belum ada rundown</p>
        )}
      </div>

      {/* Tickets & Capacity */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-foreground">Tiket & Kapasitas</h3>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {formData.isPaid ? (
              // For Paid Info: Sum of tickets
              <>
                Total Kapasitas:{" "}
                <strong>
                  {formData.tickets.reduce(
                    (sum, t) => sum + Number(t.quota || 0),
                    0,
                  )}{" "}
                  Peserta
                </strong>{" "}
                (Akumulasi Tiket)
              </>
            ) : (
              // For Free Info
              <>
                Kapasitas Maksimal:{" "}
                <strong>
                  {formData.maxCapacity > 0
                    ? `${formData.maxCapacity} Peserta`
                    : "Tidak Terbatas"}
                </strong>
              </>
            )}
          </span>
        </div>

        <div className="space-y-3">
          <div className="text-sm">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
                formData.isPaid
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700",
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
                <TicketIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-accent">{ticket.name}</p>
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground">
                      {ticket.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-accent">
                  {formatCurrency(Number(ticket.price || 0))}
                </p>
                <p className="text-sm text-muted-foreground">
                  Kuota: {ticket.quota}
                </p>
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
