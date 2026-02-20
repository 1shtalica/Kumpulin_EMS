import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Heart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";

interface EventCardProps {
  title: string;
  category: string;
  date: string;
  location: string;
  price: number;
  originalPrice?: number;
  organizer: string;
  image: string;
  slug: string;
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
  // Parsing Date for the Box UI
  const dateObj = new Date(date);
  const day = !isNaN(dateObj.getDate()) ? dateObj.getDate() : date.split(" ")[0];
  const month = !isNaN(dateObj.getDate())
    ? dateObj.toLocaleString('default', { month: 'short' }).toUpperCase()
    : date.split(" ")[1]?.substring(0, 3).toUpperCase();
  const year = !isNaN(dateObj.getFullYear())
    ? dateObj.getFullYear()
    : date.split(" ")[2] || new Date().getFullYear();

  const isFull = ticketSold >= maxQuota;

  return (
    <Link href={`/events/${slug}`} className="group block h-full w-full">
      <Card
        className={cn(
          "h-full flex overflow-hidden transition-all duration-300 transform hover:-translate-y-2 rounded-3xl bg-white border hover:border-primary/50 shadow-sm hover:shadow-lg",
          variant === "horizontal" ? "flex-row h-[220px]" : "flex-col"
        )}
      >
        {/* === HEADER IMAGE === */}
        <div
          className={cn(
            "relative overflow-hidden bg-slate-50 shrink-0",
            variant === "horizontal" ? "w-[260px] h-full" : "w-full aspect-video"
          )}
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

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

          <button className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full text-slate-400 hover:text-red-500 hover:scale-110 transition-all shadow-sm">
            <Heart size={18} />
          </button>
        </div>

        {/* === CONTENT === */}
        <CardContent className="flex flex-col p-5 h-full relative">

          <div className="flex gap-4 items-start">

            {/* Date Box */}
            <div className="flex flex-col items-center justify-center w-14 py-2 min-h-[68px] bg-indigo-50/80 text-indigo-600 rounded-2xl shrink-0 border border-indigo-100/50">
              <span className="text-xl font-bold leading-none tracking-tight">{day}</span>
              <span className="text-[9px] font-bold uppercase mt-1 leading-none">{month}</span>
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
              {originalPrice && originalPrice > price && (
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

        {/* Removing duplicate Footer Component since design merges it into the main flow nicely */}
      </Card>
    </Link>
  );
}
