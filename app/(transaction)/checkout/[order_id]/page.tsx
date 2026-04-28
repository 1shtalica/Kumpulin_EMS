"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Ticket, 
  CalendarDays, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// --- DUMMY DATA ---
const DUMMY_ORDER = {
  order_id: "ORD-123456789",
  event_title: "Tech Conference 2026: Future of AI",
  date: "24 Mei 2026",
  time: "09:00 - 17:00 WIB",
  location: "Jakarta Convention Center, Senayan",
  tickets: [
    { id: 1, name: "VIP Pass", quantity: 1, price: 1500000 },
    { id: 2, name: "Workshop Add-on", quantity: 1, price: 500000 }
  ],
  subtotal: 2000000,
  tax: 220000, // 11% tax
  platform_fee: 10000,
  total: 2230000,
};

export default function CheckoutPage({ params }: { params: Promise<{ order_id: string }> }) {
  // Use React.use() to unwrap the params promise (Next.js 15 standard)
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);

  // Helper format rupiah
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const handleProceedToPayment = () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      router.push(`/payment/${resolvedParams.order_id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/events/dummy-slug">
            <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-100">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Checkout Tiket</h1>
            <p className="text-sm text-slate-500">Selesaikan pesanan Anda dalam waktu 15:00 menit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & Details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Ticket className="text-primary" size={20} />
                Informasi Event
              </h2>
              
              <div className="flex flex-col gap-3">
                <p className="font-bold text-xl text-slate-900">{DUMMY_ORDER.event_title}</p>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <CalendarDays size={16} className="text-slate-400" />
                  <span>{DUMMY_ORDER.date} • {DUMMY_ORDER.time}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{DUMMY_ORDER.location}</span>
                </div>
              </div>
            </div>

            {/* Buyer Info Form */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="text-primary" size={20} />
                Data Pemesan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" defaultValue="John Doe" placeholder="Masukkan nama lengkap" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nomor Identitas (KTP/Passport)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" defaultValue="3171234567890001" placeholder="Masukkan NIK" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Email Aktif</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="email" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" defaultValue="john.doe@example.com" placeholder="Email untuk pengiriman e-ticket" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="tel" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50 focus:bg-white" defaultValue="081234567890" placeholder="Cth: 0812..." />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-sm text-amber-800">
                <Info size={18} className="shrink-0 mt-0.5" />
                <p>Pastikan email dan nomor WhatsApp sudah benar. E-ticket akan dikirimkan ke kontak tersebut setelah pembayaran berhasil.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 sticky top-24">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Pesanan</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-4">
                {DUMMY_ORDER.tickets.map((ticket, idx) => (
                  <div key={idx} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{ticket.name}</p>
                      <p className="text-slate-500">{ticket.quantity}x @ {formatRupiah(ticket.price)}</p>
                    </div>
                    <p className="font-semibold text-slate-800">{formatRupiah(ticket.price * ticket.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Breakdown */}
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">{formatRupiah(DUMMY_ORDER.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (11%)</span>
                  <span className="font-medium text-slate-800">{formatRupiah(DUMMY_ORDER.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Layanan</span>
                  <span className="font-medium text-slate-800">{formatRupiah(DUMMY_ORDER.platform_fee)}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Pembayaran</span>
                  <span className="font-black text-xl text-primary">{formatRupiah(DUMMY_ORDER.total)}</span>
                </div>
              </div>

              <Button 
                onClick={handleProceedToPayment} 
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/30 text-white font-bold text-lg"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Lanjut Pembayaran
                    <ArrowRight size={20} />
                  </span>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Transaksi aman & terenkripsi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
