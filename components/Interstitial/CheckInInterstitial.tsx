"use client";

import { useEffect } from "react";
import { ScanFace, XCircle } from "lucide-react";

export type CheckInStatus = "success" | "failed";

export interface CheckInInterstitialProps {
  isOpen: boolean;
  status: CheckInStatus;
  
  // Payload dinamis dari BE
  participantName?: string;
  ticketCategory?: string;
  errorMessage?: string;
  
  onClose: () => void;
}

export default function CheckInInterstitial({
  isOpen,
  status,
  participantName,
  ticketCategory,
  errorMessage,
  onClose,
}: CheckInInterstitialProps) {
  const isSuccess = status === "success";

  // Auto-close setelah durasi tertentu
  useEffect(() => {
    if (isOpen) {
      // Waktu sukses lebih singkat (1.5s) agar flow antrean cepat, gagal agak lama (3s) agar sempat dibaca
      const timer = setTimeout(() => {
        onClose();
      }, isSuccess ? 2000 : 3000); 
      return () => clearTimeout(timer);
    }
  }, [isOpen, isSuccess, onClose]);

  const bgColor = isSuccess ? "bg-emerald-500" : "bg-rose-500";
  const iconColor = isSuccess ? "text-emerald-500" : "text-rose-500";

  return (
    <>
      {isOpen && (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 ${bgColor}`}
        >
          {/* Centered Content */}
          <div
            className="flex flex-col items-center text-center w-full max-w-md"
          >
            <div
              className="bg-white p-6 rounded-full shadow-2xl mb-8"
            >
              {isSuccess ? (
                <ScanFace className={`w-24 h-24 ${iconColor}`} strokeWidth={2.5} />
              ) : (
                <XCircle className={`w-24 h-24 ${iconColor}`} strokeWidth={2.5} />
              )}
            </div>

            <h1 
              className="text-4xl font-extrabold text-white mb-8 tracking-wide drop-shadow-md"
            >
              {isSuccess ? "Berhasil Masuk" : "Tiket Ditolak"}
            </h1>

            {/* Detail Section */}
            <div 
              className="w-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl"
            >
              {isSuccess ? (
                <>
                  <p className="text-white/80 text-sm mb-1 uppercase tracking-widest font-semibold">
                    {ticketCategory || "Peserta"}
                  </p>
                  <p className="text-2xl font-bold text-white line-clamp-2 drop-shadow-sm">
                    {participantName || "Nama Peserta"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-white font-bold mb-2 text-xl drop-shadow-sm">
                    Akses Ditolak
                  </p>
                  <p className="text-white/90 text-base leading-relaxed">
                    {errorMessage || "Tiket tidak valid atau sudah pernah digunakan sebelumnya."}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Progress bar visual indicator for auto-close at the bottom */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-black/10">
            <div 
              className="h-full bg-white/70"
            />
          </div>
        </div>
      )}
    </>
  );
}