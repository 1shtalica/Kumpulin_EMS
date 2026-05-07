"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  CalendarDays,
  MapPin,
  User,
  Mail,
  Phone,
  Ticket as TicketIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketService } from "@/services/ticket-service";
import type { MyTicketDetailResponse } from "@/types/ticket";
import { QRCodeDisplay } from "@/components/user/my-ticket/QRCodeDisplay";

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(isoString));
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    issued: {
      label: "Aktif",
      className: "bg-emerald-100 text-emerald-700",
      icon: <TicketIcon size={12} />,
    },
    checked_in: {
      label: "Sudah Check In",
      className: "bg-blue-100 text-blue-700",
      icon: <CheckCircle2 size={12} />,
    },
    cancelled: {
      label: "Dibatalkan",
      className: "bg-red-100 text-red-700",
      icon: <XCircle size={12} />,
    },
    refunded: {
      label: "Direfund",
      className: "bg-amber-100 text-amber-700",
      icon: <XCircle size={12} />,
    },
  };
  const c = config[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-700",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.className}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

export default function MyTicketDetailPage({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) {
  const { ticket_id } = use(params);
  const router = useRouter();

  const [ticket, setTicket] = useState<MyTicketDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await TicketService.getMyTicketDetail(ticket_id);
        setTicket(data);
      } catch {
        setError("Tiket tidak ditemukan atau Anda tidak memiliki akses.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [ticket_id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-600">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="font-medium">Memuat e-ticket...</p>
        </div>
      </main>
    );
  }

  if (error || !ticket) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Tiket Tidak Ditemukan</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button onClick={() => router.push("/user/my-ticket")} className="w-full">
            Kembali ke Daftar Tiket
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          Kembali ke Tiket Saya
        </button>

        {/* Ticket Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
                  E-Ticket
                </p>
                <h1 className="text-xl font-bold leading-snug">{ticket.event.title}</h1>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <CalendarDays size={14} />
                <span>{formatDate(ticket.event.start_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <TicketIcon size={14} />
                <span>{ticket.category.name}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 border-b border-dashed border-slate-200 flex flex-col items-center">
            <QRCodeDisplay value={ticket.qr_code} size={220} />
            <div className="mt-4 text-center">
              <p className="text-xs font-mono text-slate-400 break-all">{ticket.qr_code}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">{ticket.ticket_number}</p>
            </div>
          </div>

          {/* Peserta */}
          <div className="p-6 space-y-4">
            <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
              Detail Peserta
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                  <User size={14} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Nama</p>
                  <p className="font-semibold text-slate-800">{ticket.participant.full_name}</p>
                </div>
              </div>

              {ticket.participant.email && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="font-semibold text-slate-800">{ticket.participant.email}</p>
                  </div>
                </div>
              )}

              {ticket.participant.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                    <Phone size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Telepon</p>
                    <p className="font-semibold text-slate-800">{ticket.participant.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Issued Info */}
          <div className="px-6 pb-6 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Diterbitkan</span>
              <span className="font-mono">{formatDate(ticket.issued_at)}</span>
            </div>
            {ticket.checked_in_at && (
              <div className="flex justify-between text-xs text-blue-500 mt-1">
                <span>Check-in</span>
                <span className="font-mono">{formatDate(ticket.checked_in_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
