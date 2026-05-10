"use client";

import { CheckCircle2, XCircle, AlertCircle, Ticket, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "@/types/payment";
import type { TicketSummaryInOrder } from "@/types/order";
import { QRCodeDisplay } from "@/components/user/my-ticket/QRCodeDisplay";

// Re-export for backward compat
export type { PaymentStatus };

interface PaymentStatusUIProps {
  status: PaymentStatus;
  orderId: string;
  tickets?: TicketSummaryInOrder[];
}

export function PaymentStatusUI({ status, orderId, tickets = [] }: PaymentStatusUIProps) {
  const router = useRouter();

  const config = {
    success: {
      icon: <CheckCircle2 size={48} />,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-500",
      title: "Pembayaran Berhasil! 🎉",
      desc: "Tiket Anda telah diterbitkan. Gunakan QR code di bawah untuk masuk ke event.",
      actionText: "Lihat Semua Tiket",
      actionAction: () => router.push("/user/my-ticket"),
    },
    failed: {
      icon: <XCircle size={48} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      title: "Pembayaran Gagal",
      desc: "Maaf, transaksi Anda ditolak atau waktu pembayaran telah habis. Silakan coba pesanan baru.",
      actionText: "Kembali ke Beranda",
      actionAction: () => router.push("/"),
    },
    sold_out: {
      icon: <AlertCircle size={48} />,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-500",
      title: "Pembayaran Berhasil, Namun Tiket Habis",
      desc: "Dana Anda telah masuk, namun kuota tiket habis. Dana akan di-refund dalam 1x24 jam.",
      actionText: "Hubungi Customer Service",
      actionAction: () => router.push("/"),
    },
  };

  const currentConfig = config[status];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      {/* Status Card */}
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center mb-6">
        <div
          className={`w-24 h-24 ${currentConfig.iconBg} ${currentConfig.iconColor} rounded-full flex items-center justify-center mb-6`}
        >
          {currentConfig.icon}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{currentConfig.title}</h1>
        <p className="text-slate-500 mb-6 px-2">{currentConfig.desc}</p>

        <div className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-8">
          <p className="text-sm text-slate-500 mb-1">Order ID</p>
          <p className="font-mono font-medium text-slate-800">{orderId}</p>
        </div>

        <Button
          onClick={currentConfig.actionAction}
          className="w-full h-12 rounded-xl text-md font-semibold"
          variant={status === "success" ? "default" : "outline"}
        >
          {currentConfig.actionText}
        </Button>
      </div>

      {/* Tiket yang diterbitkan (hanya tampil jika sukses dan ada tickets) */}
      {status === "success" && tickets.length > 0 && (
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Ticket size={20} className="text-primary" />
            Tiket Anda ({tickets.length} tiket)
          </h2>

          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <QrCode size={16} className="text-primary" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {ticket.ticket_category_id ? "E-TICKET" : "E-TICKET"}
                  </span>
                </div>
                <p className="font-bold text-slate-900">{ticket.participant_name}</p>
                <p className="text-sm text-slate-500 font-mono">{ticket.ticket_number}</p>
              </div>

              <div className="p-5 flex flex-col items-center">
                <QRCodeDisplay value={ticket.qr_code} size={160} />
                <p className="text-xs text-slate-400 mt-3 font-mono break-all text-center">
                  {ticket.qr_code}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
