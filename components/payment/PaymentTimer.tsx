import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentTimerProps {
  initialSeconds: number;
  onTimeout?: () => void;
}

export function PaymentTimer({ initialSeconds, onTimeout }: PaymentTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onTimeout) onTimeout();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3 text-amber-800">
        <Clock size={20} className="animate-pulse" />
        <span className="font-medium text-sm">Selesaikan pembayaran sebelum</span>
      </div>
      <div className="text-lg font-mono font-bold text-amber-600 bg-white px-3 py-1 rounded-lg shadow-xs">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
