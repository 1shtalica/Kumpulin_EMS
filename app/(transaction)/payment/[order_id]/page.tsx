"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { PaymentTimer } from "@/components/payment/PaymentTimer";
import { PaymentInstruction } from "@/components/payment/PaymentInstruction";
import { PaymentStatusUI } from "@/components/payment/PaymentStatusUI";

import { OrderService } from "@/services/order-service";
import type { OrderDataResponse } from "@/types/order";
import type { PaymentStatus } from "@/types/payment";

export default function PaymentPage({
  params,
}: {
  params: Promise<{ order_id: string }>;
}) {
  const { order_id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const methodId = searchParams.get("method") || "bca_va";

  const [order, setOrder] = useState<OrderDataResponse | null>(null);
  const [isFetchingOrder, setIsFetchingOrder] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  // Fetch order detail untuk tampilkan amount yang nyata
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsFetchingOrder(true);
        const data = await OrderService.getOrderDetail(order_id);

        // Jika sudah paid sebelumnya, langsung tampilkan sukses
        if (data.order.status === "paid") {
          setPaymentStatus("success");
          setOrder(data);
          return;
        }
        if (data.order.status === "expired") {
          setPaymentStatus("failed");
          setOrder(data);
          return;
        }
        setOrder(data);
      } catch {
        setFetchError("Gagal memuat data pembayaran.");
      } finally {
        setIsFetchingOrder(false);
      }
    };
    fetchOrder();
  }, [order_id]);

  const handleTimeout = () => {
    setPaymentStatus("failed");
  };

  /**
   * Memanggil endpoint mock-pay ke backend secara nyata.
   * Backend akan:
   * 1. Validate order masih valid
   * 2. Set payment status = paid
   * 3. Generate tiket (QR codes)
   * 4. Return order detail lengkap dengan tickets
   */
  const handleMockPay = async () => {
    setIsProcessing(true);
    try {
      const result = await OrderService.mockPayOrder(order_id);
      setOrder(result);
      setPaymentStatus("success");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error?.response?.data?.message ?? "";
      if (msg.includes("expired") || msg.includes("kadaluarsa")) {
        setPaymentStatus("failed");
      } else {
        // Fallback general error
        setPaymentStatus("failed");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Loading state ──
  if (isFetchingOrder) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat halaman pembayaran...</p>
        </div>
      </main>
    );
  }

  // ── Fetch Error state ──
  if (fetchError || !order) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-slate-500 mb-6">{fetchError}</p>
          <Button onClick={() => router.push("/")} className="w-full">
            Kembali ke Beranda
          </Button>
        </div>
      </main>
    );
  }

  // ── Status result page ──
  if (paymentStatus) {
    return (
      <PaymentStatusUI
        status={paymentStatus}
        orderId={order.order.order_number}
        tickets={order.tickets}
      />
    );
  }

  const totalAmount = Number(order.order.total_amount);

  // ── Main payment page ──
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <PaymentTimer
          expiresAt={order.order.expires_at}
          onTimeout={handleTimeout}
        />

        <PaymentInstruction
          methodId={methodId}
          totalAmount={totalAmount}
          orderId={order.order.order_number}
        />

        {/* Action Panel Mock/Testing */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-semibold text-white">Simulasi Skenario (Testing)</h3>
            <div className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              Sandbox
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-6 relative z-10">
            Klik tombol di bawah untuk mensimulasikan pembayaran berhasil dan
            men-generate tiket secara nyata melalui backend.
          </p>

          <div className="grid grid-cols-1 gap-3 relative z-10">
            <Button
              onClick={handleMockPay}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium h-12"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses ke Backend...
                </span>
              ) : (
                "✅ Simulasi Bayar Sekarang"
              )}
            </Button>
          </div>

          {isProcessing && (
            <p className="mt-3 text-xs text-center text-slate-400">
              Backend sedang memvalidasi order dan men-generate tiket Anda...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Lock size={12} />
          <p>Powered by Mock Payment Gateway. Instruksi bayar ini hanya simulasi.</p>
        </div>
      </div>
    </main>
  );
}
