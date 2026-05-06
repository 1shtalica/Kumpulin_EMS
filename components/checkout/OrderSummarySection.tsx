import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TicketItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  tickets: TicketItem[];
  subtotal: number;
  tax: number;
  platformFee: number;
  total: number;
  isLoading: boolean;
}

export function OrderSummarySection({ 
  tickets, 
  subtotal, 
  tax, 
  platformFee, 
  total, 
  isLoading
}: OrderSummaryProps) {
  
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-24">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Pesanan</h2>
      
      {/* Items */}
      <div className="space-y-4 mb-4">
        {tickets.map((ticket, idx) => (
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
          <span className="font-medium text-slate-800">{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Pajak (11%)</span>
          <span className="font-medium text-slate-800">{formatRupiah(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span>Biaya Layanan</span>
          <span className="font-medium text-slate-800">{formatRupiah(platformFee)}</span>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium text-slate-800 text-sm">Total</span>
          <span className="font-bold text-sm text-primary tracking-tight">{formatRupiah(total)}</span>
        </div>
      </div>

      <Button 
        type="submit"
        disabled={isLoading}
        className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/30 text-white font-bold text-lg transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
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
  );
}
