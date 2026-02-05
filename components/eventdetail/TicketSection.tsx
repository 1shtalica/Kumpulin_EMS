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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // Pastikan punya utility cn dari shadcn

// --- 1. KOMPONEN QUOTA BAR (Progress Bar) ---
function QuotaBar({
  sold,
  total,
  isSoldOut,
}: {
  sold: number;
  total: number;
  isSoldOut?: boolean;
}) {
  const percentage = Math.min((sold / total) * 100, 100);

  return (
    <div className="w-full flex flex-row items-center gap-3 mt-3">
      <div className="relative w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isSoldOut
              ? "bg-slate-400" // Warna abu jika habis
              : "bg-linear-to-r from-primary to-secondary", // Warna gradasi jika ada
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] text-muted whitespace-nowrap min-w-fit">
        {total - sold} tersisa
      </span>
    </div>
  );
}

// --- 2. DATA DUMMY TIKET ---
const TICKETS = [
  {
    id: 1,
    name: "Early Bird",
    price: 150000,
    originalPrice: 200000,
    desc: "Akses penuh + makan malam",
    sold: 50,
    total: 50,
    isSoldOut: true,
  },
  {
    id: 2,
    name: "Reguler",
    price: 200000,
    originalPrice: null,
    desc: "Akses penuh + makan malam",
    sold: 28,
    total: 50,
    isSoldOut: false,
  },
  {
    id: 3,
    name: "VIP",
    price: 500000,
    originalPrice: null,
    desc: "Akses penuh + meet & greet + exclusive swag",
    sold: 28,
    total: 50,
    isSoldOut: false,
  },
];

// --- 3. KOMPONEN UTAMA ---
export default function TicketSection() {
  // State untuk tiket yang dipilih (Default ID 3 / VIP sesuai gambar)
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(3);
  const [qty, setQty] = useState(1);

  // Cari data tiket yang sedang dipilih
  const selectedTicket = TICKETS.find((t) => t.id === selectedTicketId);

  // Hitung Total Harga
  const totalPrice = selectedTicket ? selectedTicket.price * qty : 0;

  // Helper format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleSelectTicket = (id: number, isSoldOut: boolean) => {
    if (isSoldOut) return; // Cegah klik jika habis
    setSelectedTicketId(id);
    setQty(1); // Reset jumlah jadi 1 tiap ganti tiket
  };

  return (
    <section className="w-full flex flex-col items-center justify-between relative z-20">
      <div className="w-full h-fit p-6 bg-white shadow-sm border border-border rounded-2xl sticky top-24">
        <div className="flex flex-col gap-6">
          <h3 className="font-bold text-lg text-accent">Pilih Tiket</h3>

          {/* --- LIST TIKET --- */}
          <div className="flex flex-col gap-4">
            {TICKETS.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;

              return (
                <div
                  key={ticket.id}
                  onClick={() =>
                    handleSelectTicket(ticket.id, ticket.isSoldOut)
                  }
                  className={cn(
                    "relative p-4 border rounded-2xl cursor-pointer transition-all duration-200",
                    // Logic Styling:
                    // 1. Jika Habis -> Opacity rendah & cursor not-allowed
                    ticket.isSoldOut &&
                      "opacity-60 cursor-not-allowed bg-muted/10 border-border",
                    // 2. Jika Dipilih -> Border Primary & Background Primary Light
                    isSelected &&
                      !ticket.isSoldOut &&
                      "border-primary bg-primary-light ring-1 ring-primary",
                    // 3. Jika Tidak Dipilih -> Border Biasa & Hover effect
                    !isSelected &&
                      !ticket.isSoldOut &&
                      "border-border bg-white hover:border-primary-hover",
                  )}
                >
                  {/* Header Card */}
                  <div className="flex justify-between items-start mb-1">
                    <h4
                      className={cn(
                        "font-bold text-base",
                        isSelected ? "text-primary" : "text-slate-700",
                      )}
                    >
                      {ticket.name}
                    </h4>
                    {ticket.isSoldOut && (
                      <span className="bg-red-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        Habis
                      </span>
                    )}
                  </div>

                  {/* Harga */}
                  <div className="flex items-center gap-2 mb-1">
                    <p
                      className={cn(
                        "font-bold text-lg",
                        isSelected ? "text-primary" : "text-primary",
                      )}
                    >
                      {formatRupiah(ticket.price)}
                    </p>
                    {ticket.originalPrice && (
                      <p className="text-xs text-slate-400 line-through decoration-slate-400">
                        {formatRupiah(ticket.originalPrice)}
                      </p>
                    )}
                  </div>

                  {/* Deskripsi */}
                  <p className="text-xs text-muted mb-3">{ticket.desc}</p>

                  {/* Progress Bar */}
                  <QuotaBar
                    sold={ticket.sold}
                    total={ticket.total}
                    isSoldOut={ticket.isSoldOut}
                  />
                </div>
              );
            })}
          </div>

          {/* --- COUNTER JUMLAH (Hanya muncul jika ada tiket dipilih) --- */}
          {selectedTicket && (
            <div className="p-4 bg-muted/10 rounded-xl flex items-center justify-between">
              <span className="font-medium text-sm text-slate-700">Jumlah</span>
              <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-border">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-50"
                  disabled={qty <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold w-4 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          <Separator />

          {/* --- TOTAL & TOMBOL BELI --- */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-end">
              <span className="text-muted text-sm">Total</span>
              <span className="font-bold text-2xl text-primary">
                {selectedTicket ? formatRupiah(totalPrice) : "Rp 0"}
              </span>
            </div>

            <Button
              size="lg"
              variant="brand"
              className="w-full font-bold text-base rounded-xl py-6"
              disabled={!selectedTicket}
            >
              Beli Tiket
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
                className="w-8 h-8 rounded-full bg-slate-50 border-0 hover:bg-slate-200"
              >
                <Facebook size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-slate-50 border-0 hover:bg-slate-200"
              >
                <Twitter size={16} />
              </Button>
              {/* WhatsApp icon tidak ada di Lucide default, pakai LinkIcon sbg ganti atau import library lain */}
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-slate-50 border-0 hover:bg-slate-200"
              >
                <Share2 size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full bg-muted/10 border-0 hover:bg-muted/20"
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
