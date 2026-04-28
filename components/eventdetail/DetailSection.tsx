"use client";

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Event } from "@/types/event";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "../ui/badge";
import { EditSectionModal } from "@/components/organizer/my-event/EditSectionModal";
import TipTapViewer from "@/components/reusable/TipTapViewer";
import { UserService } from "@/services/user-service";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";

interface DetailSectionProps {
  event: Event;
  isEditable?: boolean;
}

export default function DetailSection({ event, isEditable = false }: DetailSectionProps) {
  // Guard: pastikan date string valid sebelum diparse
  const startDate = event.event_start_date ? new Date(event.event_start_date) : null;
  const endDate = event.event_end_date ? new Date(event.event_end_date) : null;

  // Helper untuk format tanggal & waktu yang seragam
  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "Tanggal belum ditentukan";
    if (isSameDay(start, end)) {
      return format(start, "dd MMMM yyyy", { locale: id });
    }
    return `${format(start, "dd MMMM yyyy", { locale: id })} - ${format(
      end,
      "dd MMMM yyyy",
      { locale: id },
    )}`;
  };

  const formatTimeRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "-";
    return `${format(start, "HH:mm", { locale: id })} - ${format(end, "HH:mm", {
      locale: id,
    })} WIB`;
  };

  // 1. Jadwal Event
  const eventDateString = formatDateRange(startDate, endDate);
  const eventTimeString = formatTimeRange(startDate, endDate);

  // 2. Masa Registrasi
  const regStartDate = event.start_registration_date
    ? new Date(event.start_registration_date)
    : null;
  const regEndDate = event.end_registration_date
    ? new Date(event.end_registration_date)
    : null;

  const regDateString = formatDateRange(regStartDate, regEndDate);
  const regTimeString = formatTimeRange(regStartDate, regEndDate);


  const { user } = useAuthStore();
  const [hasFollowed, setHasFollowed] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  useEffect(() => {
    if (user && event.organizer?.id) {
      const fetchFollowStatus = async () => {
        try {
          const res = await UserService.getFollowStatus(event.organizer.id.toString());
          if (res.data?.is_follow) {
            setHasFollowed(true);
          }
        } catch (err) {
          console.error("Failed to fetch follow status", err);
        }
      };
      fetchFollowStatus();
    }
  }, [user, event.organizer?.id]);

  const debouncedFollowToggle = useDebouncedCallback(async () => {
    try {
      if (hasFollowed) {
        await UserService.unfollowOrganizer(event.organizer.id.toString());
        toast.success("Berhasil berhenti mengikuti organizer");
        setHasFollowed(false);
      } else {
        await UserService.followOrganizer(event.organizer.id.toString());
        toast.success("Berhasil mengikuti organizer");
        setHasFollowed(true);
      }
    } catch (err) {
      toast.error(hasFollowed ? "Gagal berhenti mengikuti organizer" : "Gagal mengikuti organizer");
    } finally {
      setIsLoadingFollow(false);
    }
  }, 500);

  const handleFollowToggle = () => {
    if (isLoadingFollow) return;
    setIsLoadingFollow(true);
    debouncedFollowToggle();
  };

  return (
    <section className="w-full flex flex-col items-center justify-between relative ">
      <div className="w-full h-fit p-10 bg-white shadow-xs border-slate-200 rounded-3xl">
        <div className="flex flex-col gap-5">
          {/* Baris Kategori */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand">
              {event.category}
            </Badge>

            <Badge
              className={
                event.is_online
                  ? "bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold border-none px-3 rounded-full uppercase text-[10px] tracking-wide shadow-sm"
                  : "bg-muted text-white shadow-sm"
              }
            >
              {event.is_online ? "Online" : "Offline"}
            </Badge>

            <Badge className="bg-secondary-light text-secondary border border-secondary rounded-full px-2 flex items-center gap-1">
              {event.ticket_categories?.some((t) => t.price > 0) ? "Berbayar" : "Gratis"}
            </Badge>
          </div>

          {/* Judul event */}
          <div className="flex items-center gap-3 py-5">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h1 className="text-xl md:text-2xl font-bold text-accent leading-tight">{event.title}</h1>
            {isEditable && <EditSectionModal event={event as any} section="core" />}
          </div>

          {/* Detail Event Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            {/* 1. Jadwal Event */}
            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-primary-light text-primary">
                <Calendar size={16} />
              </div>
              <div className="flex flex-col ">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] tracking-wide font-medium text-muted">Jadwal Event</span>
                  {isEditable && <EditSectionModal event={event as any} section="datetime" />}
                </div>
                <p className="text-sm font-semibold text-accent mt-0.5">{eventDateString}</p>
                <p className="text-xs text-slate-400">{eventTimeString}</p>
              </div>
            </div>

            {/* 2. Masa Registrasi */}
            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-primary-light text-primary">
                <Clock size={16} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] tracking-wide font-medium text-muted">Masa Registrasi</span>
                  {isEditable && <EditSectionModal event={event as any} section="datetime" />}
                </div>
                <p className="text-sm font-semibold text-accent mt-0.5">{regDateString}</p>
                {regTimeString && <p className="text-xs text-slate-400">{regTimeString}</p>}
              </div>
            </div>

            {/* 3. Lokasi */}
            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-primary-light text-primary">
                <MapPin size={16} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] tracking-wide font-medium text-muted">Lokasi</span>
                  {isEditable && <EditSectionModal event={event as any} section="location" />}

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
                  <p className="text-xs text-slate-400">{event.address.city}, {event.address.province}</p>
                )}
                {!event.is_online && event.address?.maps_url && (
                  <a
                    href={event.address.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium text-primary hover:text-primary-hover transition-colors bg-primary-light hover:bg-primary/10 px-2.5 py-1 rounded-full w-fit"
                  >
                    <MapPin size={11} />
                    Lihat di Peta
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>

            {/* 4. Partisipan */}
            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-primary-light text-primary mt-0.5">
                <Users size={16} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] tracking-wide font-medium text-muted">Partisipan</span>
                  {isEditable && <EditSectionModal event={event as any} section="tickets" />}
                </div>
                <p className="font-semibold text-accent">
                  {event.total_sold}/{event.max_capacity || "-"} terdaftar
                </p>
              </div>
            </div>
          </div>

          {/* Pemisah  */}
          <Separator orientation="horizontal" />

          <div className="bg-primary-light py-4 px-6 rounded-3xl">
            {event.organizer && (
              <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-5 w-full md:w-auto">
                  <div className="shrink-0">
                    <Link href={`/organizer/${event.organizer.slug}`} className="hover:opacity-80 transition-opacity">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={event.organizer.profile_image_url} />
                        <AvatarFallback>
                          {event.organizer.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center gap-1">
                      <p className="font-semibold text-accent">{event.organizer.name}</p>
                      {event.organizer.verification_status === "verified" && (
                        <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />
                      )}
                    </div>
                    <div className="text-sm text-muted">
                      <p className="line-clamp-2">{event.organizer.description}</p>
                    </div>
                  </div>
                </div>
                {/* Kanan: Tombol Aksi */}
                <Button
                  variant={hasFollowed ? "outline" : "default"}
                  size="sm"
                  className="rounded-full px-6"
                  onClick={handleFollowToggle}
                  disabled={isLoadingFollow}
                >
                  {isLoadingFollow ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : hasFollowed ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} className="" />
                  )}
                  {isLoadingFollow
                    ? "Loading..."
                    : hasFollowed
                      ? "Unfollow"
                      : "Follow"}
                </Button>
              </div>
            )}
          </div>


          {/* Bagian Deskripsi Event  */}
          <div className="pt-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h4 className="text-lg font-bold text-accent">Tentang Event</h4>
              {isEditable && <EditSectionModal event={event as any} section="core" />}
            </div>
            <TipTapViewer content={event.description?.content || ""} />
          </div>

          {/* Bagian Rundown Acara  */}
          {event.rundowns && event.rundowns.length > 0 && (
            <div className="pt-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-1 bg-primary rounded-full"></div>
                <h4 className="text-lg font-bold text-accent">Rundown Acara</h4>
                {isEditable && <EditSectionModal event={event as any} section="rundown" />}
              </div>

              <div className="flex flex-col gap-4">
                {event.rundowns.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="group flex flex-col md:flex-row gap-3 md:gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:bg-primary-light/10 transition-all duration-300"
                  >
                    {/* Waktu (Kiri) */}
                    <div className=" shrink-0 flex flex-col justify-start md:justify-center pt-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-primary bg-white border border-primary/10 px-3 py-1.5 rounded-xl w-fit">
                        <Clock size={14} className="md:w-5 md:h-5" />
                        <span>
                          {item.start_time} - {item.end_time}
                        </span>
                      </div>
                    </div>

                    {/* Detail (Kanan) */}
                    <div className={`flex flex-col w-full ${(item.location || item.description) ? "gap-2" : "justify-center"}`}>

                      <h5 className="font-bold text-accent text-lg leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h5>

                      {item.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <MapPin size={16} className="text-primary shrink-0" />
                          <span className="font-medium">{item.location}</span>
                        </div>
                      )}

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

    </section >
  );
}
