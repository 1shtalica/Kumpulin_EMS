"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  /** Nilai string yang di-encode ke QR (ticket.qr_code dari backend) */
  value: string;
  size?: number;
  className?: string;
}

/**
 * Render QR code dari string value menggunakan qrcode.react.
 * Backend menyimpan qr_code sebagai UUID string — komponen ini mengubahnya menjadi gambar QR.
 */
export function QRCodeDisplay({ value, size = 200, className = "" }: QRCodeDisplayProps) {
  if (!value) return null;

  return (
    <div
      className={`inline-flex flex-col items-center gap-3 ${className}`}
    >
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0f172a"
        />
      </div>
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
        Tunjukkan QR ini kepada panitia
      </p>
    </div>
  );
}
