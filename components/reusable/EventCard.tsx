"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Heart, ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";

interface EventCardProps {
  key: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  location: string;
  price: number;
  originalPrice?: number;
  organizer: string;
  image: string;
  isHot?: boolean;
  isOnline?: boolean;
  isRtPintar?: boolean;
  ticketSold?: number;
  maxQuota?: number;
  variant?: "vertical" | "horizontal";
}

export default function EventCard({
  title,
  category,
  date,
  location,
  price,
  originalPrice,
  organizer,
  image,
  slug,
  isHot = false,
  isOnline = false,
  isRtPintar = false,
  ticketSold = 0,
  maxQuota = 100,
  variant = "vertical",
}: EventCardProps) {
  const [imgError, setImgError] = useState(false);

  // Parsing Date for the Box UI
  const dateObj = new Date(date);
  const day = !isNaN(dateObj.getDate()) ? dateObj.getDate() : date.split(" ")[0];
  const month = !isNaN(dateObj.getDate())
    ? dateObj.toLocaleString('default', { month: 'short' })
    : date.split(" ")[1]?.substring(0, 3);
  const year = !isNaN(dateObj.getFullYear())
    ? dateObj.getFullYear()
    : date.split(" ")[2] || new Date().getFullYear();

  return (
    <Link href={`/events/${slug}`} className="group block h-full w-full">
      <Card
        className={cn(
          "h-full flex overflow-hidden transition-all duration-300 transform hover:-translate-y-2 rounded-3xl bg-white border hover:border-primary/50 shadow-sm hover:shadow-lg",
          variant === "horizontal" ? "flex-row h-55" : "flex-col"
        )}
      >
        {/* === HEADER IMAGE === */}
        <div
          className={cn(
            "relative overflow-hidden bg-slate-50 shrink-0",
            variant === "horizontal" ? "w-65 h-full" : "w-full aspect-video"
          )}
        >
          {imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
              <ImageOff size={32} className="mb-2 opacity-50" />
              <span className="text-xs font-medium">Image not available</span>
            </div>
          ) : (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
          )}

          <div className="absolute top-4 left-4 z-10">
            {isOnline ? (
              <Badge className="bg-yellow-400 hover:bg-yellow-500 text-white border-none rounded-full px-4 py-1 font-bold shadow-sm text-xs">
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-700 rounded-full px-3 py-1 shadow-sm text-xs font-semibold">
                Offline
              </Badge>
            )}
          </div>

          <button className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm cursor-pointer">
            <Heart size={18} />
          </button>
        </div>

        {/* === CONTENT === */}
        <CardContent className="flex flex-col p-4 sm:p-5 h-full relative">

          <div className="flex gap-4 items-start">

            {/* Date Box */}
            <div className="flex flex-col items-center justify-center w-14 py-2 min-h-17 bg-indigo-50/80 text-indigo-600 rounded-2xl shrink-0 border border-indigo-100/50">
              <span className="text-xl font-bold leading-none tracking-tight">{day}</span>
              <span className="text-[9px] font-semibold mt-1 leading-none">{month}</span>
              <span className="text-[8px] font-semibold text-indigo-400 mt-0.5 leading-none tracking-wider">{year}</span>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs font-semibold text-indigo-500 tracking-wide line-clamp-1">
                {category}
              </span>

              <h3 className="font-bold text-base leading-snug text-slate-900 line-clamp-2" title={title}>
                {title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin size={12} className="shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Oleh <span className="font-medium text-slate-600">{organizer}</span>
              </div>
            </div>
          </div>

          {/* Price & Quota (Footer Area) */}
          <div className="mt-auto pt-6 flex items-end justify-between">

            {/* Price */}
            <div className="flex flex-col">
              {!!originalPrice && Number(originalPrice) > 0 && Number(originalPrice) > price && (
                <span className="text-[10px] text-slate-400 line-through decoration-slate-300">
                  {formatCurrency(originalPrice)}
                </span>
              )}
              <span className="font-bold text-slate-900 text-base">
                {price === 0 ? "Gratis" : formatCurrency(price)}
              </span>
            </div>

            {/* Quota */}
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Users size={14} />
              <span>{ticketSold}/{maxQuota}</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </Link>
  );
}

export function EventCardSkeleton({
  variant = "vertical",
}: {
  variant?: "vertical" | "horizontal";
}) {
  return (
    <Card
      className={cn(
        "h-full flex overflow-hidden rounded-3xl bg-white border shadow-sm",
        variant === "horizontal" ? "flex-row h-55" : "flex-col"
      )}
    >
      <Skeleton
        className={cn(
          "shrink-0 rounded-none",
          variant === "horizontal" ? "w-65 h-full" : "w-full aspect-video"
        )}
      />

      <CardContent className="flex flex-col p-4 sm:p-5 h-full relative">
        <div className="flex gap-4 items-start">
          <Skeleton className="w-14 h-17 rounded-2xl shrink-0" />
          <div className="flex flex-col gap-2 w-full pt-1">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="flex items-center gap-1.5 mt-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-2 w-1/3 mt-2" />
          </div>
        </div>

        <div className="mt-auto pt-6 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventCardSkeletonList({
  count = 4,
  variant = "vertical",
}: {
  count?: number;
  variant?: "vertical" | "horizontal";
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} variant={variant} />
      ))}
    </>
  );
}
