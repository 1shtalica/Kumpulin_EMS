import { ArrowRight, Loader2, ShieldCheck, TicketCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CheckoutOrderItem } from "@/types/checkout";

interface OrderSummaryProps {
  items: CheckoutOrderItem[];
  subtotal: number;
  total: number;
  isLoading: boolean;
  isRateLimited: boolean;
  retryCooldown: number;
  onRetry: () => void;
}

export function OrderSummarySection({
  items,
  subtotal,
  total,
  isLoading,
  isRateLimited,
  retryCooldown,
  onRetry,
}: OrderSummaryProps) {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const isFree = total === 0;

  return (
    <section className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Ringkasan
          </p>
          <h2 className="text-lg font-semibold text-slate-950">Pesanan tiket</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
          <TicketCheck size={20} />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold leading-snug text-slate-950">
                  {item.ticket_category_name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.quantity}x @ {formatRupiah(item.unit_price)}
                </p>
              </div>
              <p className="shrink-0 text-[13px] font-semibold text-slate-900">
                {formatRupiah(item.subtotal_amount)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      <div className="space-y-3 text-[13px] text-slate-600">
        <div className="flex justify-between gap-4">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Biaya layanan</span>
          <span className="font-medium text-slate-900">{formatRupiah(0)}</span>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="mb-5 flex items-end justify-between gap-4">
        <span className="text-sm font-semibold text-slate-950">Total</span>
        <span className="text-xl font-semibold leading-none text-primary tabular-nums">
          {formatRupiah(total)}
        </span>
      </div>

      <Button
        type="submit"
        disabled={isLoading || isRateLimited}
        className="h-11 w-full rounded-xl bg-primary text-[13px] font-semibold text-white shadow-sm shadow-slate-900/5 hover:bg-primary-hover"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating order…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {isFree ? "Konfirmasi Pesanan" : "Lanjut Pembayaran"}
            <ArrowRight size={18} />
          </span>
        )}
      </Button>

      {isRateLimited && (
        <div
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
          role="alert"
        >
          <p className="font-medium">
            Checkout is temporarily busy because many orders are being processed.
          </p>
          <p className="mt-1 text-amber-900">Please try again shortly.</p>
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            disabled={retryCooldown > 0}
            className="mt-3 h-9 w-full rounded-lg border-amber-300 bg-amber-50 text-xs font-semibold text-amber-950 hover:bg-amber-100"
          >
            {retryCooldown > 0 ? `Try again in ${retryCooldown}s` : "Try again"}
          </Button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <ShieldCheck size={14} className="text-success" />
        <span>Transaksi aman dan terenkripsi</span>
      </div>
    </section>
  );
}
