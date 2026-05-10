"use client";

import Image from "next/image";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeDisplay({
  value,
  size = 200,
  className = "",
}: QRCodeDisplayProps) {
  if (!value) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`;

  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <div className="rounded-2xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <Image
          src={qrImageUrl}
          alt="QR Ticket"
          width={size}
          height={size}
          unoptimized
          className="h-auto w-auto"
        />
      </div>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
        Tunjukkan QR ini kepada panitia
      </p>
    </div>
  );
}
