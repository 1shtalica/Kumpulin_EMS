"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Share2,
  Facebook,
  Twitter,
  Link as LinkIcon,
  Loader2,
  X,
  InstagramIcon,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types/event";
import { toast } from "sonner";

const TICKET_COLORS = [
  { bg: "bg-pink-100", border: "border-pink-200", ring: "ring-pink-400 border-pink-400", text: "text-pink-600" },
  { bg: "bg-blue-100", border: "border-blue-200", ring: "ring-blue-400 border-blue-400", text: "text-blue-600" },
  { bg: "bg-emerald-100", border: "border-emerald-200", ring: "ring-emerald-400 border-emerald-400", text: "text-emerald-600" },
  { bg: "bg-amber-100", border: "border-amber-200", ring: "ring-amber-400 border-amber-400", text: "text-amber-600" },
  { bg: "bg-violet-100", border: "border-violet-200", ring: "ring-violet-400 border-violet-400", text: "text-violet-600" },
];

// --- 1. KOMPONEN QUOTA BAR (Progress Bar) ---
function QuotaBar({
  booked,
  total,
  isSoldOut,
}: {
  booked: number;
  total: number;
  isSoldOut?: boolean;
}) {
  const percentage = Math.min((booked / total) * 100, 100);

  return (
    <div className="w-full flex flex-col gap-1 mt-3">
      <div className="w-full flex flex-row items-center gap-3">
        <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isSoldOut
                ? "bg-slate-400"
                : "bg-linear-to-r from-primary to-secondary",
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-[10px] text-muted whitespace-nowrap min-w-fit">
          {Math.max(0, total - booked)} tersisa
        </span>
      </div>
    </div>
  );
}

// --- 2. KOMPONEN UTAMA ---
export default function TicketSection({ event }: { event: Event }) {
  // --- LOGIC TIKET GRATIS ---
  // Jika event gratis & tidak ada tiket spesifik dari backend, buat tiket virtual
  const isPaid = event.ticket_categories?.some((t) => t.price > 0) || false;
  const isFreeEventWithNoTickets =
    !isPaid && (event.ticket_categories?.length ?? 0) === 0;

  const effectiveTickets = isFreeEventWithNoTickets
    ? [
      {
        id: "free-virtual",
        name: "Tiket Gratis",
        price: 0,
        quota: event.max_capacity || 0,
        booked: event.total_sold || 0,
        description: "Tiket masuk untuk event ini.",
        start_date_time: undefined as string | undefined,
        end_date_time: undefined as string | undefined,
      },
    ]
    : (event.ticket_categories ?? []);

  // Use first available ticket as default if exists
  const availableTicket = effectiveTickets.find(
    (t) => t.quota === 0 || t.booked < t.quota,
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(
    availableTicket?.id ?? null,
  );
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Cari data tiket yang sedang dipilih
  const selectedTicket = effectiveTickets.find(
    (t) => t.id === selectedTicketId,
  );

  // Hitung Total Harga
  const totalPrice = selectedTicket ? selectedTicket.price * qty : 0;

  // Helper format rupiah
  const formatRupiah = (num: number) => {
    if (num === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleSelectTicket = (id: string, isSoldOut: boolean) => {
    if (isSoldOut) return;
    setSelectedTicketId(id);
    setQty(1);
  };

  const handleShare = (platform: string) => {
    // Implementasi handle share sesuai platform
    switch (platform) {
      case "facebook":
        const url = window.location.href;
        const text = `Yuk ikut event seru ini: ${event.title} - ${url}`;
        const urlFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url,
        )}&text=${encodeURIComponent(text)}`;
        window.open(urlFacebook, "_blank");
        break;
      case "x":
        const urlX = window.location.href;
        const textX = `Yuk ikut event seru ini: ${event.title} - ${urlX}`;
        const urlXTweet = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          urlX,
        )}&text=${encodeURIComponent(textX)}`;
        window.open(urlXTweet, "_blank");
        break;
      case "instagram":
        const urlInsta = window.location.href;
        const textInsta = `Yuk ikut event seru ini: ${event.title} - ${urlInsta}`;
        const urlInstaPost = `https://www.instagram.com/share?url=${encodeURIComponent(
          urlInsta,
        )}&text=${encodeURIComponent(textInsta)}`;
        window.open(urlInstaPost, "_blank");
        break;
      case "whatsapp":
        const urlWhatsapp = window.location.href;
        const textWhatsapp = `Yuk ikut event seru ini: ${event.title} - ${urlWhatsapp}`;
        const urlWhatsappShare = `https://wa.me/?text=${encodeURIComponent(
          textWhatsapp,
        )}`;
        window.open(urlWhatsappShare, "_blank");
        break;
      case "telegram":
        const urlTelegram = window.location.href;
        const textTelegram = `Yuk ikut event seru ini: ${event.title} - ${urlTelegram}`;
        const urlTelegramShare = `https://t.me/share/url?url=${encodeURIComponent(
          urlTelegram,
        )}&text=${encodeURIComponent(textTelegram)}`;
        window.open(urlTelegramShare, "_blank");
        break;
      case "link":
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link berhasil disalin!");
        break;
    }
  };

  return (
    <section className="w-full flex flex-col items-center justify-between relative z-20">
      <div className="w-full h-fit p-6 bg-white shadow-xs border-slate-200 rounded-3xl sticky top-24">
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-accent">Pilih Tiket</h3>

          {/* --- LIST TIKET --- */}
          <div className="flex flex-col gap-4">
            {effectiveTickets.map((ticket, index) => {
              const isSelected = selectedTicketId === ticket.id;
              const isSoldOut = ticket.quota > 0 && ticket.booked >= ticket.quota;
              const color = TICKET_COLORS[index % TICKET_COLORS.length];

              return (
                <div
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket.id ?? "", isSoldOut)}
                  className={cn(
                    "group relative flex w-full rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden",
                    "border shadow-[0_2px_10px_rgba(0,0,0,0.04)]",
                    color.bg,
                    isSoldOut && "opacity-60 cursor-not-allowed grayscale",
                    isSelected && !isSoldOut ? `ring-1 scale-[1.01] ${color.ring}` : `hover:shadow-md hover:-translate-y-0.5 ${color.border}`
                  )}
                >
                  {/* Left Color Stub */}
                  <div className="w-12 sm:w-16 flex flex-col items-center justify-center shrink-0">
                    <span className={cn("-rotate-90 whitespace-nowrap font-bold tracking-[0.25em] text-[10px] sm:text-xs uppercase opacity-80", color.text)}>
                      TICKET
                    </span>
                  </div>

                  {/* Dotted Divider & Cutouts */}
                  <div className="relative w-0 flex flex-col justify-center border-l-2 border-dashed border-white/60">
                    {/* Top Hole */}
                    <div className={cn("absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border", color.border)} />
                    {/* Bottom Hole */}
                    <div className={cn("absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-5 h-5 bg-white rounded-full border", color.border)} />
                  </div>

                  {/* Ticket Content */}
                  <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between relative">
                    {/* Header Card */}
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={cn(
                          "font-semibold text-sm line-clamp-2",
                          isSelected ? "text-primary" : "text-slate-800",
                        )}
                      >
                        {ticket.name}
                      </h4>
                      {isSoldOut && (
                        <span className="bg-danger text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                          Habis
                        </span>
                      )}
                    </div>

                    {/* Harga */}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg text-slate-900">
                        {formatRupiah(ticket.price)}
                      </p>
                    </div>

                    {/* Deskripsi */}
                    {ticket.description && (
                      <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {ticket.quota > 0 ? (
                      <QuotaBar
                        booked={ticket.booked}
                        total={ticket.quota}
                        isSoldOut={isSoldOut}
                      />
                    ) : (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-1.5 w-full bg-white/60 rounded-full"></div>
                        <span className="text-[10px] text-slate-600 whitespace-nowrap font-medium">Tanpa Batas Kuota</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {effectiveTickets.length === 0 && (
              <div className="p-4 text-center text-muted text-sm border border-dashed rounded-xl">
                Belum ada tiket tersedia.
              </div>
            )}
          </div>

          {/* --- COUNTER JUMLAH (Hanya muncul jika ada tiket dipilih) --- */}
          {selectedTicket && (
            <>
              <div className="p-3 bg-primary-light rounded-xl flex items-center justify-between">
                <span className="font-medium text-sm text-accent">Jumlah Tiket</span>
                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-3xl border-slate-200">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-1 hover:bg-primary text-accent hover:text-white disabled:opacity-50 rounded-full cursor-pointer disabled:cursor-default"
                    disabled={qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-4 text-center text-sm">{qty}</span>
                  <button
                    onClick={() => {
                      const maxLimit = event.max_ticket_per_user || 10;

                      let maxPurchase = maxLimit;
                      if (selectedTicket.quota > 0) {
                        maxPurchase = Math.min(
                          selectedTicket.quota - selectedTicket.booked,
                          maxLimit
                        );
                      }

                      if (qty < maxPurchase) setQty(qty + 1);
                    }}
                    className="p-1 hover:bg-primary text-accent hover:text-white disabled:opacity-50 rounded-full cursor-pointer disabled:cursor-default"
                    disabled={
                      selectedTicket.quota > 0
                        ? qty >= Math.min(selectedTicket.quota - selectedTicket.booked, event.max_ticket_per_user || 10)
                        : qty >= (event.max_ticket_per_user || 10)
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {(event.max_ticket_per_user ?? 0) > 0 && (
                <p className="text-xs text-muted text-right mt-1 px-1">
                  Maksimal pembelian {event.max_ticket_per_user} tiket per transaksi
                </p>
              )}
            </>
          )}

          <Separator />

          {/* --- TOTAL & TOMBOL BELI --- */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-accent text-sm font-semibold">Total</span>
              <span className="font-bold text-xl text-primary">
                {selectedTicket ? formatRupiah(totalPrice) : "Rp 0"}
              </span>
            </div>

            <Button
              size="lg"
              onClick={() => {
                // TODO: implementasi handler beli/daftar
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 2000); // placeholder
              }}
              className="cursor-pointer w-full py-5 bg-linear-to-r from-primary to-secondary hover:opacity-90 rounded-2xl font-semibold text-md shadow-glow"
              disabled={!selectedTicket || isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
              ) : (
                totalPrice === 0 ? "Daftar Sekarang" : "Beli Tiket"
              )}
            </Button>
          </div>

          <Separator />

          {/* --- SHARE BUTTONS --- */}
          <div className="flex items-center justify-between text-muted">
            <span className="text-sm">Bagikan event ini</span>
            <div className="flex gap-2">
              <Button
                onClick={() => handleShare("facebook")}
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-slate-200"
              >
                <Facebook size={16} />
              </Button>
              <Button
                onClick={() => handleShare("x")}
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-slate-200"
              >
                <X size={16} />
              </Button>
              <Button
                onClick={() => handleShare("instagram")}
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-slate-200"
              >
                <Phone size={16} />
              </Button>
              <Button
                onClick={() => handleShare("link")}
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-muted/20"
              >
                <LinkIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
