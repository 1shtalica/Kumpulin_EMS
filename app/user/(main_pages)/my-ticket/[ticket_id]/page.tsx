"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Phone,
  QrCode,
  RefreshCw,
  Ticket,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TicketService,
  getTicketApiErrorCode,
  getTicketApiErrorMessage,
} from "@/services/ticket-service";
import type { MyTicketDetail, TicketStatus } from "@/types/ticket";

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
};

const getStatusPresentation = (status: TicketStatus) => {
  switch (status) {
    case "issued":
      return {
        label: "Issued",
        className:
          "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
      };
    case "checked_in":
      return {
        label: "Checked In",
        className:
          "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "border-transparent bg-red-50 text-red-700 hover:bg-red-50",
      };
    case "refunded":
      return {
        label: "Refunded",
        className:
          "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50",
      };
    default:
      return {
        label: "Invalidated",
        className:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100",
      };
  }
};

export default function MyTicketDetailPage({
  params,
}: {
  params: Promise<{ ticket_id: string }>;
}) {
  const { ticket_id: ticketId } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<MyTicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadTicket = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      setErrorCode("");

      try {
        const detail = await TicketService.getMyTicketDetail(ticketId);
        if (!isMounted) return;
        setTicket(detail);
      } catch (error) {
        const code = getTicketApiErrorCode(error);
        if (code === "UNAUTHORIZED") {
          router.replace("/login");
          return;
        }
        if (!isMounted) return;
        setTicket(null);
        setErrorCode(code);
        setErrorMessage(
          getTicketApiErrorMessage(error, "Gagal mengambil detail tiket."),
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadTicket();

    return () => {
      isMounted = false;
    };
  }, [ticketId, reloadCount, router]);

  const isCheckedIn = useMemo(() => {
    if (!ticket) return false;
    return ticket.status === "checked_in" || Boolean(ticket.checked_in_at);
  }, [ticket]);

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-center rounded-2xl border border-slate-200 bg-white py-20">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin text-slate-500" />
          <p className="text-sm text-slate-500">Memuat detail tiket...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">
            {errorCode === "TICKET_NOT_FOUND"
              ? "Tiket tidak ditemukan"
              : errorCode === "INVALID_INPUT"
                ? "Permintaan tidak valid"
                : "Detail tiket gagal dimuat"}
          </p>
          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={() => setReloadCount((n) => n + 1)}>
              Coba Lagi
            </Button>
            <Button asChild>
              <Link href="/user/my-ticket">Kembali ke List</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return null;
  }

  const status = getStatusPresentation(ticket.status);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(ticket.qr_code)}`;

  return (
    <main className="min-h-[calc(100vh-136px)] bg-slate-50 px-4 py-6 md:-mx-8 md:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-4">
        <Button variant="ghost" asChild className="w-fit px-0 text-slate-600">
          <Link href="/user/my-ticket">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Tiket Saya
          </Link>
        </Button>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {ticket.event.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {ticket.ticket_number} · {ticket.category.name}
              </p>
            </div>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Jadwal Event
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <p>Mulai: {formatDateTime(ticket.event.start_time)}</p>
                      <p>Selesai: {formatDateTime(ticket.event.end_time)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Informasi Peserta
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-slate-400" />
                    {ticket.participant.full_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {ticket.participant.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {ticket.participant.phone}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Status Check-in
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {isCheckedIn
                    ? `Sudah check-in (${formatDateTime(ticket.checked_in_at)})`
                    : "Belum check-in"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tiket diterbitkan: {formatDateTime(ticket.issued_at)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <QrCode className="h-4 w-4" />
                QR Ticket
              </p>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-2">
                <img
                  src={qrImageUrl}
                  alt="QR Ticket"
                  className="h-auto w-full rounded-md"
                />
              </div>
              <p className="mt-3 break-all rounded-md bg-slate-50 p-2 text-xs text-slate-500">
                {ticket.qr_code}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Tunjukkan QR ini saat proses check-in di lokasi event.
              </p>
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <Ticket className="h-3.5 w-3.5" />
                ID Tiket: {ticket.id}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
