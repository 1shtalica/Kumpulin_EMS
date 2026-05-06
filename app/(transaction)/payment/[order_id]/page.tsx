"use client";

import { useState, use } from "react";
import { ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

import { PaymentTimer } from "@/components/payment/PaymentTimer";
import { PaymentInstruction } from "@/components/payment/PaymentInstruction";
import { PaymentStatusUI, PaymentStatus } from "@/components/payment/PaymentStatusUI";
import { useSearchParams } from "next/navigation";

// --- DUMMY DATA ---
const DUMMY_TOTAL = 2230000;

export default function PaymentPage({ params }: { params: Promise<{ order_id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const methodId = searchParams.get("method") || "bca_va"; // Fallback ke bca_va jika tidak ada
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  const handleTimeout = () => {
    setPaymentStatus("failed");
  };

  // Fungsi simulasi untuk menguji 3 kondisi pembayaran (berdasarkan ERD)
  const handleMockPay = (statusType: PaymentStatus) => {
    setIsProcessing(true);
    // Simulasi memanggil endpoint POST /api/v1/orders/:order_id/mock-pay
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStatus(statusType);
    }, 1500);
  };

  // Jika pembayaran sudah memiliki status (sukses/gagal/sold_out), render UI Khusus
  if (paymentStatus) {
    return <PaymentStatusUI status={paymentStatus} orderId={resolvedParams.order_id} />;
  }

  // Jika belum dibayar, render halaman instruksi bayar
  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        <PaymentTimer initialSeconds={900} onTimeout={handleTimeout} />

        <PaymentInstruction 
          methodId={methodId} 
          totalAmount={DUMMY_TOTAL} 
          orderId={resolvedParams.order_id} 
        />

        {/* Action Panel Khusus Mock/Testing */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-semibold text-white">Simulasi Skenario (Testing)</h3>
            <div className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">Sandbox</div>
          </div>
          <p className="text-sm text-slate-400 mb-6 relative z-10">
            Pilih salah satu tombol di bawah untuk menguji ketiga status integrasi backend yang berbeda.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
            <Button 
              onClick={() => handleMockPay("success")}
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              Simulasi Sukses
            </Button>
            <Button 
              onClick={() => handleMockPay("failed")}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              Simulasi Gagal
            </Button>
            <Button 
              onClick={() => handleMockPay("sold_out")}
              disabled={isProcessing}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium whitespace-normal h-auto py-2 leading-tight"
            >
              Sukses, tapi Tiket Habis
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Memproses transaksi ke backend...
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Lock size={12} />
          <p>Powered by Mock Payment Gateway. Instruksi bayar ini hanya simulasi.</p>
        </div>
      </div>
    </main>
  );
}
