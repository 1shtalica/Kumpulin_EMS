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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/types/event";

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

  return (
    <section className="w-full flex flex-col items-center justify-between relative z-20">
      <div className="w-full h-fit p-6 bg-white shadow-xs border-slate-200 rounded-3xl sticky top-24">
        <div className="flex flex-col gap-4">
          <h3 className="text-base font-bold text-accent">Pilih Tiket</h3>

          {/* --- LIST TIKET --- */}
          <div className="flex flex-col gap-4">
            {effectiveTickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;
              const isSoldOut =
                ticket.quota > 0 && ticket.booked >= ticket.quota;

              return (
                <div
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket.id ?? "", isSoldOut)}
                  className={cn(
                    "relative p-3 border rounded-2xl cursor-pointer transition-all duration-200",
                    isSoldOut &&
                      "opacity-60 cursor-not-allowed bg-muted/10 border-border",
                    isSelected &&
                      !isSoldOut &&
                      "border-primary bg-primary-light ring-1 ring-primary",
                    !isSelected &&
                      !isSoldOut &&
                      "border-border bg-white hover:border-primary-hover",
                  )}
                >
                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-primary" : "text-slate-700",
                      )}
                    >
                      {ticket.name}
                    </h4>
                    {isSoldOut && (
                      <span className="bg-danger text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Habis
                      </span>
                    )}
                  </div>

                  {/* Harga */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg text-primary">
                      {formatRupiah(ticket.price)}
                    </p>
                  </div>

                  {/* Deskripsi */}
                  {ticket.description && (
                    <p className="text-xs text-muted mb-3">
                      {ticket.description}
                    </p>
                  )}

                  {/* Progress Bar (Hanya jika quota > 0 alias terbatas) */}
                  {ticket.quota > 0 ? (
                    <QuotaBar
                      booked={ticket.booked}
                      total={ticket.quota}
                      isSoldOut={isSoldOut}
                    />
                  ) : (
                    <div className="mt-3 flex items-center gap-2">
                       <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                       <span className="text-[10px] text-muted whitespace-nowrap">Tanpa Batas Kuota</span>
                    </div>
                  )}
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
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-slate-200"
              >
                <Facebook size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-slate-200"
              >
                <Twitter size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 shadow-xs border-0 hover:bg-slate-200"
              >
                <Share2 size={16} />
              </Button>
              <Button
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
