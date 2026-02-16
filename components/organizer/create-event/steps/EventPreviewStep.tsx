"use client";

import {
  Calendar,
  MapPin,
  Video,
  Ticket as TicketIcon,
  Clock,
  Users,
  Info,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CreateEventFormState } from "@/types/create-event";
import TipTapViewer from "@/components/reusable/TipTapViewer";

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
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const SectionHeader = ({ icon: Icon, title }: { icon?: any; title: string }) => (
    <div className="flex items-center gap-2 mb-6 text-foreground/80">
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          Preview Event
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm lg:text-base leading-relaxed">
          Periksa kembali detail event Anda. Pastikan semua informasi sudah tepat sebelum dipublikasikan kepada khalayak.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Event Type */}
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:p-8 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipe Event</h3>
              <p className="mt-1 text-sm text-foreground/70">
                Jenis event yang akan diselenggarakan
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset",
                formData.type === "external"
                  ? "bg-primary/10 text-primary ring-primary/20"
                  : "bg-secondary/50 text-secondary-foreground ring-secondary-foreground/10",
              )}
            >
              {formData.type === "external" ? <Users className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
              {formData.type === "external" ? "External Public" : "Internal Organization"}
            </span>
          </div>
        </div>

        {/* Banner & Info */}
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:p-8 shadow-sm transition-all hover:shadow-md overflow-hidden">
          <SectionHeader icon={Info} title="Informasi Utama" />

          <div className="space-y-8">
            {/* Image Gallery */}
            {formData.imagePreviews && formData.imagePreviews.length > 0 ? (
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative group rounded-2xl overflow-hidden bg-secondary/20 aspect-video w-full border border-border/50">
                  <img
                    src={formData.imagePreviews[0]}
                    alt="Main Event Banner"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Overlay Gradient for Text Readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                  <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                    <div className="inline-flex items-center rounded-md bg-white/20 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/30 mb-2">
                      {formData.category}
                    </div>
                    <h4 className="text-xl lg:text-3xl font-bold leading-tight shadow-black/10 drop-shadow-sm line-clamp-2">
                      {formData.title}
                    </h4>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                {formData.imagePreviews.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {formData.imagePreviews.slice(1, 5).map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border/50 bg-secondary/20 group"
                      >
                        <img
                          src={img}
                          alt={`Preview ${idx + 2}`}
                          className="h-full w-full object-cover transition-colors hover:opacity-90"
                        />
                        {/* Show +N overlay on the last item if there are more than 5 images total (1 main + 4 thumbs) */}
                        {idx === 3 && formData.imagePreviews && formData.imagePreviews.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm backdrop-blur-xs">
                            +{formData.imagePreviews.length - 5}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-secondary/10 rounded-2xl p-8 text-center border border-dashed border-border/60">
                <div className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3">
                  <Info className="h-full w-full" />
                </div>
                <h4 className="text-xl font-bold text-foreground mb-1">{formData.title}</h4>
                <span className="inline-block rounded-full bg-secondary px-3 py-1 text-sm font-medium text-muted-foreground">
                  {formData.category}
                </span>
                <p className="text-sm text-muted-foreground mt-4">Belum ada gambar yang diunggah.</p>
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <h5 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Deskripsi Event</h5>
              {formData.description ? (
                <TipTapViewer content={formData.description} />
              ) : (
                <p className="text-muted-foreground italic text-sm">Tidak ada deskripsi.</p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:p-8 shadow-sm transition-all hover:shadow-md">
          <SectionHeader icon={Calendar} title="Jadwal & Lokasi" />

          <div className="grid grid-cols-1 gap-y-8 gap-x-12 md:grid-cols-2">
            {/* Registration Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Clock className="h-4.5 w-4.5" />
                <span>Periode Pendaftaran</span>
              </div>
              <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                <div className="relative">
                  <div className="absolute -left-7.75 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Dibuka</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(formData.startRegistrationDateTime)}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-7.75 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-red-500" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Ditutup</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(formData.endRegistrationDateTime)}</p>
                </div>
              </div>
            </div>

            {/* Event Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Calendar className="h-4.5 w-4.5" />
                <span>Waktu Pelaksanaan</span>
              </div>
              <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                <div className="relative">
                  <div className="absolute -left-7.75 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Mulai</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(formData.startEventDateTime)}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-7.75 top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary-light" />
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Selesai</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{formatDate(formData.endEventDateTime)}</p>
                </div>
              </div>
            </div>

            {/* Location (Full Width) */}
            <div className="md:col-span-2 pt-4 border-t border-border/50 mt-2">
              <div className="flex items-center gap-2 text-foreground font-semibold mb-3">
                {!formData.isOnline ? <MapPin className="h-4.5 w-4.5 text-primary" /> : <Video className="h-4.5 w-4.5 text-primary" />}
                <span>Lokasi - {!formData.isOnline ? "Offline" : "Online"}</span>
              </div>

              <div className="bg-primary-light rounded-xl p-5 border border-border/40">
                {!formData.isOnline ? (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      Detail Lokasi
                    </p>
                    {formData.address.title && (
                      <p className="font-bold text-foreground text-lg">
                        {formData.address.title}
                      </p>
                    )}
                    <p className={cn("text-base", formData.address.title ? "text-muted-foreground" : "font-semibold text-foreground text-lg")}>
                      {formData.address.rawAddress || "Alamat belum diatur"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {[formData.address.city, formData.address.province, formData.address.postalCode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Meeting Link</p>
                      <a
                        href={formData.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline truncate block max-w-md"
                      >
                        {formData.meetingUrl}
                      </a>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={formData.meetingUrl} target="_blank" rel="noopener noreferrer">Buka Link</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rundown */}
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:p-8 shadow-sm transition-all hover:shadow-md">
          <SectionHeader icon={Clock} title="Susunan Acara" />

          {formData.rundown.length > 0 ? (
            <div className="flex flex-col gap-4">
              {formData.rundown.map((item, index) => (
                <div
                  key={index}
                  className="group flex flex-col md:flex-row gap-3 md:gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-primary-light/10 transition-all duration-300"
                >
                  {/* Waktu (Kiri) */}
                  <div className=" shrink-0 flex flex-col justify-start md:justify-center pt-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary bg-white border border-primary/10 px-3 py-1.5 rounded-xl w-fit">
                      <Clock size={14} className="md:w-5 md:h-5" />
                      <span>
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Detail (Kanan) */}
                  <div className={cn(
                    "flex flex-col w-full",
                    (item.location || item.description) ? "gap-2" : "justify-center"
                  )}>
                    <h5 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h5>

                    {item.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={16} className="text-primary shrink-0" />
                        <span className="font-medium">{item.location}</span>
                      </div>
                    )}

                    {/* Line Separator if description exists */}
                    {item.description && (
                      <div className="mt-1 pb-1 border-l-2 border-slate-200 pl-3 ml-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">Belum ada rundown acara yang ditambahkan.</p>
            </div>
          )}
        </div>



        {/* Tickets & Capacity */}
        <div className="rounded-xl border border-border/60 bg-card p-6 lg:p-8 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <SectionHeader icon={TicketIcon} title="Tiket & Kapasitas" />
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                formData.isPaid
                  ? "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10"
                  : "bg-green-50 text-green-700 ring-1 ring-green-700/10",
              )}
            >
              {formData.isPaid ? "Event Berbayar" : "Event Gratis"}
            </span>
          </div>

          <div className="mb-8 p-4 bg-primary-light rounded-xl border border-primary/10 flex items-center gap-3 text-primary-dark">
            <div className="p-2 bg-white rounded-full shadow-xs">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <span className="block text-xs font-bold uppercase tracking-wider text-primary/70 mb-0.5">
                {formData.isPaid ? "Total Kapasitas (Akumulasi)" : "Kapasitas Maksimal"}
              </span>
              <span className="font-bold text-lg text-foreground">
                {formData.isPaid ? (
                  formData.tickets.reduce((sum, t) => sum + Number(t.quota || 0), 0)
                ) : (
                  formData.maxCapacity > 0 ? formData.maxCapacity : "Tidak Terbatas"
                )}
                <span className="text-sm font-normal text-muted-foreground ml-1">{formData.maxCapacity > 0 ? "Peserta" : ""}</span>
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {formData.tickets.map((ticket, index) => (
              <div
                key={index}
                className="group relative flex flex-col justify-between rounded-2xl border bg-background p-5 transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-lg text-foreground line-clamp-1 pr-2" title={ticket.name}>{ticket.name}</p>
                    <TicketIcon className="h-5 w-5 text-primary/20 group-hover:text-primary transition-colors" />
                  </div>
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {ticket.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-border/40 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Harga</p>
                    <p className="font-bold text-primary text-xl">
                      {Number(ticket.price) === 0 ? "Gratis" : formatCurrency(Number(ticket.price || 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-medium uppercase">Kuota</p>
                    <p className="font-semibold text-foreground">
                      {ticket.quota}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-8 pb-4">
        <Button
          size="xl"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-60 shadow-lg shadow-primary/20 text-base"
        >
          {isSubmitting ? "Memproses..." : "Publikasikan Event"}
        </Button>
      </div>
    </div>
  );
}
