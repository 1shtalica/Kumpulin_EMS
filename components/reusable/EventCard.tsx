import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Users, CheckCircle2 } from "lucide-react"; // Tambah icon CheckCircle2 untuk RT Pintar

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  quota?: number;
  maxQuota?: number;
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
  quota = 0,
  maxQuota = 100,
}: EventCardProps) {
  // Logic Diskon
  const hasDiscount = originalPrice && originalPrice > price;

  // Generate inisial untuk avatar organizer
  const organizerInitial = organizer.charAt(0).toUpperCase();

  const isFull = quota >= maxQuota;

  return (
    <Link href={`/events/${slug}`} className="group block h-full w-full">
      <article className="h-full w-full">
        <Card className="h-full flex flex-col p-0 gap-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xs hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] rounded-2xl bg-white border border-slate-100">
          {/* === BAGIAN GAMBAR === */}
          <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-50">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Badge Kiri Atas: HOT */}
            {isHot && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-linear-to-r from-red-600 to-red-800 text-white font-bold border-none px-3 rounded-full flex gap-1 items-center shadow-sm">
                  🔥 Hot
                </Badge>
              </div>
            )}

            {/* Badge Kanan Atas: ONLINE/OFFLINE */}
            <div className="absolute top-4 right-4 z-10">
              {isOnline ? (
                <Badge className="bg-linear-to-r from-blue-600 to-blue-800 text-white font-bold border-none px-3 rounded-full uppercase text-[10px] tracking-wide shadow-sm">
                  Online
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-muted text-white shadow-sm"
                >
                  Offline
                </Badge>
              )}
            </div>
          </div>

          {/* === BAGIAN KONTEN === */}
          <CardContent className="flex flex-col gap-4 p-5">
            {/* Row 1: Kategori, RT Pintar & Harga */}
            <div className="flex items-start justify-between">
              {/* Kiri: Group Badge (Kategori + RT Pintar) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Badge Kategori */}
                <Badge variant="brand">{category}</Badge>

                {/* Badge RT Pintar (Sebelah Kanan Kategori) */}
                {isRtPintar && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 rounded-full px-2 flex items-center gap-1">
                    <CheckCircle2
                      size={12}
                      className="fill-emerald-600 text-white"
                    />
                    <span className="text-[10px] font-bold">RT Pintar</span>
                  </Badge>
                )}
              </div>

              {/* Kanan: Harga */}
              <div className="text-right flex flex-col items-end">
                {hasDiscount ? (
                  // Layout Diskon: Harga asli DI BAWAH harga diskon
                  <div className="flex flex-col items-end">
                    {/* Harga Sekarang (Besar) */}
                    <span className="font-bold text-primary text-lg leading-none">
                      {price === 0 ? "Gratis" : formatCurrency(price)}
                    </span>
                    {/* Harga Coret (Kecil di bawah) */}
                    <span className="text-[11px] text-muted line-through decoration-muted mt-1">
                      {formatCurrency(originalPrice)}
                    </span>
                  </div>
                ) : (
                  // Harga Normal
                  <span className="font-bold text-primary text-lg">
                    {price === 0 ? "Gratis" : formatCurrency(price)}
                  </span>
                )}
              </div>
            </div>

            {/* Judul Event */}
            <h3 className="font-bold text-lg leading-snug text-accent line-clamp-2 group-hover:text-primary transition-colors min-h-14">
              {title}
            </h3>

            {/* Info Tanggal & Lokasi */}
            <div className="flex flex-col gap-2 text-sm text-muted mt-auto">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="line-clamp-1">{location}</span>
              </div>
            </div>
          </CardContent>

          {/* Separator Garis Tipis */}
          <Separator className="bg-slate-200" />

          {/* === BAGIAN FOOTER (Organizer & Kuota) === */}
          <CardFooter className="p-4 flex items-center justify-between text-sm ">
            {/* Kiri: Nama Organizer */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">
                {organizerInitial}
              </div>
              <span
                className="font-medium truncate max-w-28 md:max-w-36 text-accent"
                title={organizer}
              >
                {organizer}
              </span>
            </div>

            {/* Kanan: Kuota Peserta */}
            <div
              className={cn(
                "flex items-center gap-1.5",

                isFull ? "text-danger font-bold" : "text-muted"
              )}
            >
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">
                {isFull ? "Penuh" : `${quota}/${maxQuota}`}
              </span>
            </div>
          </CardFooter>
        </Card>
      </article>
    </Link>
  );
}
