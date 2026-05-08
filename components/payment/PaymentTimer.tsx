"use client";

import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentTimerProps {
  /** ISO string waktu kadaluarsa order dari backend, contoh: order.expires_at */
  expiresAt: string;
  onTimeout?: () => void;
}

export function PaymentTimer({ expiresAt, onTimeout }: PaymentTimerProps) {
  const calcRemaining = () => {
    const diff = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / 1000
    );
    return diff > 0 ? diff : 0;
  };

  const [timeLeft, setTimeLeft] = useState(calcRemaining);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeout) onTimeout();
      return;
    }
    const timer = setInterval(() => {
      const remaining = calcRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0 && onTimeout) onTimeout();
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60;

  return (
    <div
      className={`rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm border transition-colors ${
        isUrgent
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${
          isUrgent ? "text-red-800" : "text-amber-800"
        }`}
      >
        <Clock size={20} className="animate-pulse" />
        <span className="font-medium text-sm">Selesaikan pembayaran sebelum</span>
      </div>
      <div
        className={`text-lg font-mono font-bold px-3 py-1 rounded-lg shadow-xs ${
          isUrgent
            ? "text-red-600 bg-white"
            : "text-amber-600 bg-white"
        }`}
      >
        {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
