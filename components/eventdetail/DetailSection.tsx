"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Dot,
  Plus,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import { Event } from "@/types/event";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";

export default function DetailSection({ event }: { event: Event }) {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  // Helper untuk format tanggal & waktu yang seragam
  const formatDateRange = (start: Date, end: Date) => {
    if (isSameDay(start, end)) {
      return format(start, "dd MMMM yyyy", { locale: id });
    }
    return `${format(start, "dd MMMM yyyy", { locale: id })} - ${format(
      end,
      "dd MMMM yyyy",
      { locale: id },
    )}`;
  };

  const formatTimeRange = (start: Date, end: Date) => {
    return `${format(start, "HH:mm", { locale: id })} - ${format(end, "HH:mm", {
      locale: id,
    })} WIB`;
  };

  // 1. Jadwal Event
  const eventDateString = formatDateRange(startDate, endDate);
  const eventTimeString = formatTimeRange(startDate, endDate);

  // 2. Masa Registrasi
  const regStartDate = event.registration_start_date
    ? new Date(event.registration_start_date)
    : null;
  const regEndDate = event.registration_end_date
    ? new Date(event.registration_end_date)
    : null;

  const regDateString =
    regStartDate && regEndDate
      ? formatDateRange(regStartDate, regEndDate)
      : "-";
  const regTimeString =
    regStartDate && regEndDate ? formatTimeRange(regStartDate, regEndDate) : "";

  // Copy Address Logic
  const [isCopied, setIsCopied] = useState(false);
  const handleCopyAddress = () => {
    if (event.address?.raw_address) {
      navigator.clipboard.writeText(event.address.raw_address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <section className="w-full flex flex-col items-center justify-between relative z-20">
      <div className="w-full h-fit p-10 bg-white shadow-xs border-slate-200 rounded-3xl">
        <div className="flex flex-col gap-4">
          {/* Baris Kategori */}
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="brand" className="">
              {event.category}
            </Badge>

            <Badge
              className={cn(
                event.is_online
                  ? "bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold border-none px-3 rounded-full uppercase text-[10px] tracking-wide shadow-sm"
                  : "bg-muted text-white shadow-sm",
              )}
            >
              {event.is_online ? "Online" : "Offline"}
            </Badge>

            <Badge className="bg-secondary-light text-secondary border border-secondary rounded-full px-2 flex items-center gap-1">
              {event.is_paid ? "Berbayar" : "Gratis"}
            </Badge>

            {/* 🌟 Mungkin nanti bisa ditambahkan bagde isrtpintar jika event internal  */}
          </div>

          {/* Judul event */}
          <h1 className="font-bold text-accent">{event.title}</h1>

          {/* Detail Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* 1. Jadwal Event (Unified Date & Time) */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-primary-light text-primary">
                <Calendar size={24} />
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm text-muted">Jadwal Event</p>
                <p className="font-semibold text-accent">{eventDateString}</p>
                <p className="text-sm text-slate-500">{eventTimeString}</p>
              </div>
            </div>

            {/* 2. Masa Registrasi */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-primary-light text-primary">
                <Clock size={24} />
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm text-muted">Masa Registrasi</p>
                <p className="font-semibold text-accent">{regDateString}</p>
                {regTimeString && (
                  <p className="text-sm text-slate-500">{regTimeString}</p>
                )}
              </div>
            </div>

            {/* 3. Lokasi */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-primary-light text-primary">
                <MapPin size={24} />
              </div>

              <div className="flex flex-col w-full">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted">Lokasi</p>
                  {!event.is_online && (
                    <Button
                      variant="ghost"
                      onClick={handleCopyAddress}
                      className="text-primary hover:text-primary-hover transition-colors p-1 rounded-full"
                      title="Salin Alamat"
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                    </Button>
                  )}
                </div>
                <p
                  className="font-semibold text-accent line-clamp-2"
                  title={event.address?.raw_address}
                >
                  {event.is_online
                    ? "Online Meeting"
                    : event.address?.raw_address || "Lokasi Event"}
                </p>
                {event.address?.city && event.address?.province && (
                  <p className="text-sm text-slate-500">
                    {event.address.city}, {event.address.province}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Kapasitas / Terjual */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-primary-light text-primary">
                <Users size={24} />
              </div>
              <div className="flex flex-col w-full">
                <p className="text-sm text-muted">Partisipan</p>
                <p className="font-semibold text-accent">
                  {event.sold_event}/{event.capacity || "-"} terdaftar
                </p>
              </div>
            </div>
          </div>

          {/* Pemisah  */}
          <Separator orientation="horizontal" />

          {/* Detail Profil Event Organizer  */}
          <div className="bg-primary-light p-6 rounded-3xl">
            {event.organizer && (
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Wrapper Kiri: Foto + Teks (Tetap sebaris di mobile) */}
                <div className="flex flex-row items-center gap-3 w-full md:w-auto">
                  {/* Avatar / Foto Profil */}
                  <div className="shrink-0">
                    {/* 🌟 Nanti update lagi untuk route ke halaman profile eo nya  */}
                    <Link
                      href={`/organizer/${event.organizer.id}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={event.organizer.avatar} />
                        <AvatarFallback>
                          {event.organizer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>

                  {/* Teks Profil */}
                  <div className="flex flex-col">
                    {/* Baris 1: Nama + Verified Badge */}
                    <div className="flex flex-row items-center gap-1">
                      <p className="font-semibold text-accent">
                        {event.organizer.name}
                      </p>
                      {event.organizer.verification_status === "verified" && (
                        <CheckCircle2
                          size={16}
                          className="text-blue-500 fill-blue-50"
                        />
                      )}
                    </div>
                    {/* Baris 2: Stats (Placeholder static for now as not in Event type commonly) */}
                    <div className="flex flex-row items-center text-sm text-muted">
                      <p>Organizer Terpercaya</p>
                      {/* <Dot size={16} />
                  <p>45 Events</p> */}{" "}
                      {/* 🌟Data update needed for event count */}
                    </div>
                  </div>
                </div>

                {/* Tombol Ikuti */}
                <Button
                  variant="default"
                  asChild
                  className="w-full md:w-fit rounded-full"
                  size="default"
                >
                  {/* 🌟 tambahkan fungsi mengeikuti nanti  */}
                  <Link href="#">
                    <Plus size={18} className="mr-1" />
                    Ikuti
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Bagian Deskripsi Event  */}
          <div>
            <h4 className="font-bold mb-4">Tentang Event</h4>
            <div
              className="prose prose-sm max-w-none text-slate-600"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>

          {/* Bagian Rundown Acara  */}
          {event.rundowns && event.rundowns.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h4 className="font-bold text-lg text-accent">Rundown Acara</h4>
              </div>

              <div className="flex flex-col gap-4">
                {event.rundowns.map((item) => (
                  <div
                    key={item.id}
                    className="group flex flex-col md:flex-row gap-3 md:gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-primary-light/10 transition-all duration-300"
                  >
                    {/* Waktu (Kiri) */}
                    <div className="md:w-32 shrink-0 flex flex-col justify-start pt-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary bg-white border border-primary/10 px-3 py-1.5 rounded-full w-fit shadow-xs">
                        <Clock size={14} className="md:w-5 md:h-5" />
                        <span>
                          {item.start_time} - {item.end_time}
                        </span>
                      </div>
                    </div>

                    {/* Detail (Kanan) */}
                    <div className="flex flex-col gap-2 w-full">
                      <h5 className="font-bold text-accent text-lg leading-tight group-hover:text-primary transition-colors">
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
                          <p className="text-sm text-muted leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
