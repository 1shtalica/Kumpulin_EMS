import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CheckoutOrderItem } from "@/types/checkout";

interface OrderSummaryProps {
  items: CheckoutOrderItem[];
  subtotal: number;
  total: number;
  isLoading: boolean;
}

export function OrderSummarySection({
  items,
  subtotal,
  total,
  isLoading,
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
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-start text-sm">
            <div>
              <p className="font-medium text-slate-800">{item.ticket_category_name}</p>
              <p className="text-slate-500">
                {item.quantity}x @ {formatRupiah(item.unit_price)}
              </p>
            </div>
            <p className="font-semibold text-slate-800">
              {formatRupiah(item.subtotal_amount)}
            </p>
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
      </div>

      <Separator className="my-4" />

      <div className="my-4 flex justify-between items-center">
        <span className="font-bold text-slate-800 text-lg">Total</span>
        <span className="font-bold text-lg text-primary tracking-tight">
          {formatRupiah(total)}
        </span>
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
        <span>Transaksi aman &amp; terenkripsi</span>
      </div>
    </div>
  );
}
