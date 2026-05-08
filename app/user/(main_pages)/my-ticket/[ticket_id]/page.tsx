"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
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
    month: "short",
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
        label: "Aktif",
        tone: "text-emerald-700",
        dotClassName: "bg-emerald-500",
        badgeClassName:
          "border-transparent bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
      };
    case "checked_in":
      return {
        label: "Checked In",
        tone: "text-blue-700",
        dotClassName: "bg-blue-500",
        badgeClassName:
          "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-50",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        tone: "text-red-700",
        dotClassName: "bg-red-500",
        badgeClassName: "border-transparent bg-red-50 text-red-700 hover:bg-red-50",
      };
    case "refunded":
      return {
        label: "Refunded",
        tone: "text-amber-700",
        dotClassName: "bg-amber-500",
        badgeClassName:
          "border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50",
      };
    default:
      return {
        label: "Invalidated",
        tone: "text-slate-700",
        dotClassName: "bg-slate-400",
        badgeClassName:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100",
      };
  }
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {label}
        </p>
        <div className="mt-1 min-w-0 text-sm font-medium text-slate-800">
          {value}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

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
      <main className="min-h-[calc(100vh-136px)] bg-slate-50 p-8 px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center rounded-[2rem] border border-slate-200 bg-white py-20 shadow-sm">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin text-slate-500" />
          <p className="text-sm text-slate-500">Memuat detail tiket...</p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[calc(100vh-136px)] bg-slate-50 p-8 px-6">
        <div className="mx-auto w-full max-w-5xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            {errorCode === "TICKET_NOT_FOUND"
              ? "Tiket tidak ditemukan"
              : errorCode === "INVALID_INPUT"
                ? "Permintaan tidak valid"
                : "Detail tiket gagal dimuat"}
          </p>
          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => setReloadCount((n) => n + 1)}>
              Coba Lagi
            </Button>
            <Button asChild variant="brand">
              <Link href="/user/my-ticket">Kembali ke List</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (!ticket) return null;

  const status = getStatusPresentation(ticket.status);
  const eventTitle = ticket.event.title || "Event";
  const categoryName = ticket.category.name || "Kategori tiket";
  const participantName = ticket.participant.full_name || "-";
  const participantEmail = ticket.participant.email || "-";
  const participantPhone = ticket.participant.phone || "-";
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(ticket.qr_code)}`;

  return (
    <main className="min-h-[calc(100vh-136px)] bg-slate-50 p-8 px-6">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <Button
          variant="ghost"
          asChild
          className="w-fit rounded-full px-0 text-slate-600 hover:px-3"
        >
          <Link href="/user/my-ticket">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Tiket Saya
          </Link>
        </Button>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative bg-linear-to-r from-primary via-primary to-secondary p-6 text-white sm:p-8">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-24 left-1/3 h-44 w-44 rounded-full bg-black/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                  E-ticket detail
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {eventTitle}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/75">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono backdrop-blur">
                    {ticket.ticket_number || "-"}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur">
                    {categoryName}
                  </span>
                </div>
              </div>
              <Badge className={status.badgeClassName}>{status.label}</Badge>
            </div>
          </div>

          <div className="grid gap-5 bg-slate-50/70 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              <SectionBlock title="Ringkasan Tiket">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow
                    icon={<Ticket className="h-4 w-4" />}
                    label="Kategori"
                    value={categoryName}
                  />
                  <DetailRow
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    label="Status"
                    value={
                      <span className={`inline-flex items-center gap-2 ${status.tone}`}>
                        <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
                        {status.label}
                      </span>
                    }
                  />
                </div>
              </SectionBlock>

              <SectionBlock title="Jadwal Event">
                <DetailRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Mulai"
                  value={formatDateTime(ticket.event.start_time)}
                />
                <DetailRow
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Selesai"
                  value={formatDateTime(ticket.event.end_time)}
                />
              </SectionBlock>

              <SectionBlock title="Informasi Peserta">
                <DetailRow
                  icon={<UserRound className="h-4 w-4" />}
                  label="Nama"
                  value={<span className="truncate">{participantName}</span>}
                />
                <DetailRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={<span className="truncate">{participantEmail}</span>}
                />
                <DetailRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Telepon"
                  value={<span className="truncate">{participantPhone}</span>}
                />
              </SectionBlock>

              <SectionBlock title="Status Check-in">
                <div className="rounded-2xl bg-slate-50 px-3 py-3 text-sm">
                  <p className="font-medium text-slate-800">
                    {isCheckedIn
                      ? `Sudah check-in (${formatDateTime(ticket.checked_in_at)})`
                      : "Belum check-in"}
                  </p>
                  <p className="mt-1 text-slate-500">
                    Tiket diterbitkan: {formatDateTime(ticket.issued_at)}
                  </p>
                </div>
              </SectionBlock>
            </div>

            <aside className="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-sm lg:sticky lg:top-24 lg:self-start">
              <div className="border-b border-dashed border-slate-200 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <QrCode className="h-4 w-4 text-primary" />
                  QR Ticket
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Tunjukkan kode ini saat check-in.
                </p>
              </div>

              <div className="relative p-5">
                <div className="pointer-events-none absolute -top-3 left-8 h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />
                <div className="pointer-events-none absolute -top-3 right-8 h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />

                {ticket.qr_code ? (
                  <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50 p-3">
                    <Image
                      src={qrImageUrl}
                      alt="QR Ticket"
                      width={320}
                      height={320}
                      unoptimized
                      className="h-auto w-full rounded-2xl bg-white"
                    />
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                    QR belum tersedia.
                  </div>
                )}

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      QR value
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                      {ticket.qr_code || "QR belum tersedia."}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      ID Tiket
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                      {ticket.id}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

