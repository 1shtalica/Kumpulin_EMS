"use client";

import { CheckCircle2, XCircle, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type PaymentStatus = "success" | "failed";

export interface PaymentInterstitialProps {
  isOpen: boolean;
  status: PaymentStatus;
  orderNumber?: string;
  customerName?: string;
  errorMessage?: string;
  
  onClose: () => void;
  onPrimaryAction?: () => void;
}

export default function PaymentInterstitial({
  isOpen,
  status,
  orderNumber,
  customerName,
  errorMessage,
  onClose,
  onPrimaryAction,
}: PaymentInterstitialProps) {
  const isSuccess = status === "success";
  
  const bgColor = isSuccess ? "bg-secondary" : "bg-danger";
  const iconColor = isSuccess ? "text-secondary" : "text-danger";
  
  const title = isSuccess ? "Pembayaran Berhasil!" : "Pembayaran Gagal";
  const description = isSuccess 
    ? "Terima kasih! Tiket kamu sudah aman dan siap digunakan." 
    : errorMessage || "Maaf, transaksi kamu tidak dapat diproses saat ini. Silakan coba metode pembayaran lain.";

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-100 flex flex-col items-center justify-center p-6 ${bgColor}`}
        >
          {/* Centered Content */}
          <div
            className="w-full max-w-md flex flex-col items-center text-center"
          >
            <div
              className="bg-white p-5 rounded-full shadow-2xl mb-6"
            >
              {isSuccess ? (
                <CheckCircle2 className={`w-20 h-20 ${iconColor}`} strokeWidth={2.5} />
              ) : (
                <XCircle className={`w-20 h-20 ${iconColor}`} strokeWidth={2.5} />
              )}
            </div>

            <h2
              className="text-3xl font-extrabold text-white mb-3 tracking-wide drop-shadow-md"
            >
              {title}
            </h2>

            <p
              className="text-white/90 mb-8 leading-relaxed text-lg drop-shadow-sm"
            >
              {description}
            </p>

            {/* Data Dinamis (Opsional) */}
            {isSuccess && orderNumber && (
              <div 
                className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-5 mb-8 border border-white/20 shadow-xl"
              >
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/80 font-medium tracking-wide">Order ID</span>
                  <span className="font-bold text-white">{orderNumber}</span>
                </div>
                {customerName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80 font-medium tracking-wide">Nama Customer</span>
                    <span className="font-bold text-white truncate max-w-37.5" title={customerName}>
                      {customerName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div
              className="w-full flex flex-col gap-3"
            >
              {isSuccess ? (
                <Button
                  onClick={onPrimaryAction}
                  className="w-full py-6 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-900/20 bg-white text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  Lanjutkan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <>
                  <Button
                    onClick={onPrimaryAction}
                    className="w-full py-6 text-lg font-bold rounded-2xl shadow-xl shadow-rose-900/20 bg-white text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <RefreshCcw className="mr-2 w-5 h-5" />
                    Coba Lagi
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    className="w-full py-6 text-base font-semibold rounded-2xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
