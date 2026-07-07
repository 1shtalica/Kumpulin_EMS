"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Download,
    Hash,
    Mail,
    Phone,
    QrCode,
    RefreshCw,
    Ticket as TicketIcon,
    UserRound,
    X,
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
                Icon: CheckCircle2,
                tone: "text-emerald-700",
                dotClassName: "bg-emerald-500",
                stripClassName: "bg-emerald-500",
                badgeClassName:
                    "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
            };
        case "checked_in":
            return {
                label: "Sudah check-in",
                Icon: CheckCircle2,
                tone: "text-blue-700",
                dotClassName: "bg-blue-500",
                stripClassName: "bg-blue-500",
                badgeClassName:
                    "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50",
            };
        case "cancelled":
            return {
                label: "Dibatalkan",
                Icon: X,
                tone: "text-red-700",
                dotClassName: "bg-red-500",
                stripClassName: "bg-red-500",
                badgeClassName:
                    "border-red-100 bg-red-50 text-red-700 hover:bg-red-50",
            };
        case "refunded":
            return {
                label: "Direfund",
                Icon: RefreshCw,
                tone: "text-amber-700",
                dotClassName: "bg-amber-500",
                stripClassName: "bg-amber-500",
                badgeClassName:
                    "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50",
            };
        default:
            return {
                label: "Tidak valid",
                Icon: AlertCircle,
                tone: "text-slate-700",
                dotClassName: "bg-slate-400",
                stripClassName: "bg-slate-400",
                badgeClassName:
                    "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
            };
    }
};

const downloadSingleTicket = (ticket: MyTicketDetail) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const eventTitle = ticket.event.title || "Event";
    const categoryName = ticket.category.name || "Kategori tiket";
    const participantName = ticket.participant.full_name || "-";
    const participantEmail = ticket.participant.email || "-";
    const participantPhone = ticket.participant.phone || "-";
    const issuedAt = ticket.issued_at
        ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(ticket.issued_at))
        : "-";
    const startTime = ticket.event.start_time
        ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(ticket.event.start_time))
        : "-";
    const endTime = ticket.event.end_time
        ? new Intl.DateTimeFormat("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(ticket.event.end_time))
        : "-";
    const status = getStatusPresentation(ticket.status);
    const statusColor =
        ticket.status === "issued"
            ? "#10b981"
            : ticket.status === "checked_in"
              ? "#3b82f6"
              : ticket.status === "cancelled"
                ? "#ef4444"
                : ticket.status === "refunded"
                  ? "#f59e0b"
                  : "#94a3b8";
    const qrUrl = ticket.qr_code
        ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(ticket.qr_code)}`
        : "";

    const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>E-Ticket — ${eventTitle}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            <style>
                @page {
                    size: 210mm 148mm;
                    margin: 8mm 10mm;
                }

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'Poppins', sans-serif;
                    background: #f8fafc;
                    color: #0f172a;
                    padding: 24px 20px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 36px;
                    width: 100%;
                    max-width: 720px;
                }

                .page-header .brand {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #7c3aed;
                    margin-bottom: 6px;
                }

                .page-header h1 {
                    font-size: 22px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.2;
                    margin-bottom: 4px;
                }

                .page-header .subtitle {
                    font-size: 13px;
                    color: #64748b;
                }

                .ticket-card {
                    display: flex;
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                    overflow: hidden;
                    width: 100%;
                    max-width: 720px;
                    page-break-inside: avoid;
                }

                .ticket-accent {
                    width: 6px;
                    flex-shrink: 0;
                    background: ${statusColor};
                }

                .ticket-left {
                    display: flex;
                    flex: 1;
                    min-width: 0;
                    flex-direction: column;
                }

                .ticket-main {
                    flex: 1;
                    padding: 24px 24px 20px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .ticket-label {
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #94a3b8;
                }

                .ticket-event {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.25;
                }

                .ticket-category {
                    font-size: 12px;
                    font-weight: 500;
                    color: #7c3aed;
                    background: #f5f3ff;
                    border: 1px solid #ede9fe;
                    border-radius: 6px;
                    padding: 3px 10px;
                    display: inline-block;
                    width: fit-content;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .info-item {
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 10px;
                    padding: 10px 12px;
                }

                .info-label {
                    font-size: 8.5px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 3px;
                }

                .info-value {
                    font-size: 12px;
                    font-weight: 500;
                    color: #1e293b;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .info-code {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10.5px;
                    color: #475569;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    border: 1px solid ${statusColor}25;
                    border-radius: 999px;
                    padding: 2px 9px;
                    font-size: 11px;
                    font-weight: 600;
                    color: ${statusColor};
                    background: ${statusColor}10;
                }

                .status-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: ${statusColor};
                    flex-shrink: 0;
                }

                .ticket-divider {
                    position: relative;
                    width: 28px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                }

                .dashed-line {
                    width: 1px;
                    border-left: 2px dashed #e2e8f0;
                    height: 100%;
                    margin: 0 auto;
                }

                .notch {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 22px;
                    height: 22px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 50%;
                    z-index: 1;
                }

                .notch-top { top: -11px; }
                .notch-bottom { bottom: -11px; }

                .ticket-right {
                    width: 260px;
                    flex-shrink: 0;
                    background: #fafafa;
                    padding: 24px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .qr-label {
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    text-align: center;
                }

                .qr-img {
                    width: 200px;
                    height: 200px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    padding: 5px;
                    background: #ffffff;
                }

                .qr-placeholder {
                    width: 200px;
                    height: 200px;
                    border-radius: 12px;
                    border: 2px dashed #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #94a3b8;
                    text-align: center;
                    padding: 10px;
                }

                .qr-number {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 9px;
                    color: #64748b;
                    text-align: center;
                    word-break: break-all;
                    max-width: 160px;
                }

                .page-footer {
                    text-align: center;
                    margin-top: 32px;
                    font-size: 11px;
                    color: #94a3b8;
                    max-width: 720px;
                    width: 100%;
                }

                @media print {
                    body { background: #ffffff; padding: 0; display: block; }
                    .page-header { display: none; }
                    .page-footer { display: none; }
                    .ticket-card { box-shadow: none; border-radius: 0; width: 100%; max-width: 100%; height: 100vh; }
                    .notch { background: #ffffff; }
                }
            </style>
        </head>
        <body>
            <div class="page-header">
                <div class="brand">Kumpulin EMS · E-Ticket</div>
                <h1>${eventTitle}</h1>
                <div class="subtitle">Dicetak ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>

            <div class="ticket-card">
                <div class="ticket-left">
                    <div class="ticket-accent"></div>
                    <div class="ticket-main">
                        <div class="ticket-label">E-TICKET · KUMPULIN EMS</div>
                        <div class="ticket-event">${eventTitle}</div>
                        <div class="ticket-category">${categoryName}</div>

                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Peserta</div>
                                <div class="info-value">${participantName}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Email</div>
                                <div class="info-value">${participantEmail}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Telepon</div>
                                <div class="info-value">${participantPhone}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Status</div>
                                <div class="info-value">
                                    <span class="status-pill">
                                        <span class="status-dot"></span>
                                        ${status.label}
                                    </span>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Mulai event</div>
                                <div class="info-value">${startTime}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Selesai event</div>
                                <div class="info-value">${endTime}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Diterbitkan</div>
                                <div class="info-value">${issuedAt}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Nomor tiket</div>
                                <div class="info-value info-code">${ticket.ticket_number || "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ticket-divider">
                    <div class="notch notch-top"></div>
                    <div class="notch notch-bottom"></div>
                    <div class="dashed-line"></div>
                </div>

                <div class="ticket-right">
                    <div class="qr-label">Scan untuk check-in</div>
                    ${
                        qrUrl
                            ? `<img class="qr-img" src="${qrUrl}" alt="QR Code" />`
                            : `<div class="qr-placeholder">QR belum tersedia</div>`
                    }
                    <div class="qr-number">${ticket.ticket_number || "-"}</div>
                </div>
            </div>

            <div class="page-footer">Dokumen ini diterbitkan oleh Kumpulin EMS. Tunjukkan QR code saat check-in di lokasi event.</div>
            <script>
                window.addEventListener('load', function() {
                    setTimeout(function() { window.print(); }, 800);
                });
            <\/script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
};

function TicketPassBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] overflow-hidden opacity-90 lg:block"
        >
            <div className="absolute inset-y-0 right-0 w-80 bg-linear-to-l from-primary/8 via-primary/4 to-transparent" />
            <div className="absolute -right-10 top-5 h-34 w-56 rotate-6 rounded-[1.75rem] border border-primary/15 bg-primary/8" />
            <div className="absolute right-12 top-8 h-32 w-56 -rotate-3 rounded-2xl border border-slate-200 bg-white/85 shadow-sm">
                <div className="absolute inset-y-4 left-16 border-l border-dashed border-slate-300" />
                <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <TicketIcon className="h-5 w-5" />
                </div>
                <div className="absolute left-22 top-6 h-2 w-24 rounded-full bg-slate-300" />
                <div className="absolute left-22 top-12 h-1.5 w-16 rounded-full bg-slate-200" />
                <div className="absolute left-22 top-17 h-1.5 w-20 rounded-full bg-primary/25" />
                <div className="absolute bottom-5 left-22 flex h-8 items-end gap-1">
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-7 w-1 rounded-full bg-slate-400" />
                    <span className="h-5 w-1 rounded-full bg-slate-300" />
                    <span className="h-8 w-1 rounded-full bg-primary/40" />
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-6 w-1 rounded-full bg-slate-400" />
                    <span className="h-5 w-1 rounded-full bg-primary/30" />
                </div>
            </div>
            <div className="absolute bottom-7 right-24 h-px w-56 rotate-[-5deg] border-t border-dashed border-slate-300" />
        </div>
    );
}

function HeaderLeftGraphic() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            <div className="absolute left-0 top-0 h-full w-24 bg-linear-to-r from-slate-50/80 via-slate-50/35 to-transparent" />
            <div className="absolute -left-14 -top-10 h-32 w-32 rotate-12 rounded-[1.75rem] border border-primary/10 bg-primary/8" />
            <div className="absolute -bottom-12 left-18 h-24 w-36 -rotate-6 rounded-2xl border border-slate-200/70 bg-white/55" />
            <div className="absolute bottom-5 left-7 flex h-9 items-end gap-1.5 opacity-70">
                <span className="h-4 w-1.5 rounded-full bg-slate-300" />
                <span className="h-8 w-1.5 rounded-full bg-slate-400" />
                <span className="h-5 w-1.5 rounded-full bg-primary/35" />
                <span className="h-7 w-1.5 rounded-full bg-slate-300" />
                <span className="h-4 w-1.5 rounded-full bg-primary/25" />
            </div>
            <div className="absolute left-36 top-8 h-px w-36 rotate-[-6deg] border-t border-dashed border-slate-300/80" />
        </div>
    );
}

function DetailItem({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800">
                <span className="shrink-0 text-slate-400">{icon}</span>
                <span className="min-w-0 truncate">{value}</span>
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
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5">
            <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
            <div className="mt-4 grid gap-3">{children}</div>
        </section>
    );
}

function LoadingState() {
    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] -mx-6 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-4 h-8 w-3/5 animate-pulse rounded-lg bg-slate-100" />
                    <div className="mt-3 h-4 w-1/3 animate-pulse rounded-md bg-slate-100" />
                </div>
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                                <div className="h-4 w-28 animate-pulse rounded-md bg-slate-100" />
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                                    <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-96 rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="h-full animate-pulse rounded-xl bg-slate-100" />
                    </div>
                </div>
            </div>
        </main>
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
                    getTicketApiErrorMessage(
                        error,
                        "Gagal mengambil detail tiket.",
                    ),
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

    if (isLoading) return <LoadingState />;

    if (errorMessage) {
        return (
            <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] -mx-6 px-4 py-6 md:-mx-8 md:px-8">
                <div className="mx-auto w-full max-w-4xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm shadow-slate-900/5">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-slate-950">
                        {errorCode === "TICKET_NOT_FOUND"
                            ? "Tiket tidak ditemukan"
                            : errorCode === "INVALID_INPUT"
                              ? "Permintaan tidak valid"
                              : "Detail tiket gagal dimuat"}
                    </p>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        {errorMessage}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <Button
                            variant="outline"
                            className="rounded-lg"
                            onClick={() => setReloadCount((n) => n + 1)}
                        >
                            Coba Lagi
                        </Button>
                        <Button asChild variant="brand" className="rounded-lg">
                            <Link href="/user/my-ticket">Kembali ke Tiket</Link>
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    if (!ticket) return null;

    const status = getStatusPresentation(ticket.status);
    const StatusIcon = status.Icon;
    const eventTitle = ticket.event.title || "Event";
    const categoryName = ticket.category.name || "Kategori tiket";
    const participantName = ticket.participant.full_name || "-";
    const participantEmail = ticket.participant.email || "-";
    const participantPhone = ticket.participant.phone || "-";
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(ticket.qr_code)}`;

    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] -mx-6 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-5">
                <Button
                    variant="ghost"
                    asChild
                    className="h-10 w-fit rounded-lg px-2 text-slate-600 hover:bg-white hover:text-slate-950"
                >
                    <Link href="/user/my-ticket">
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Tiket Saya
                    </Link>
                </Button>

                <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5">
                    <div
                        className={`absolute inset-y-0 left-0 w-1.5 ${status.stripClassName}`}
                        aria-hidden="true"
                    />
                    <TicketPassBackground />
                    <div className="relative z-10 grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]">
                        <div className="relative overflow-hidden p-5 pl-8 sm:pl-10">
                            <HeaderLeftGraphic />
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            <span
                                                className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                                            />
                                            E-ticket detail
                                        </div>
                                        <h1 className="text-2xl font-bold leading-[1.12] tracking-tight text-slate-950 md:text-3xl">
                                            {eventTitle}
                                        </h1>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`w-fit shrink-0 gap-1.5 rounded-lg px-2.5 py-1 ${status.badgeClassName}`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Kode
                                        </p>
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Hash className="h-4 w-4 shrink-0 text-slate-400" />
                                            <span className="truncate font-mono text-xs">
                                                {ticket.ticket_number || "-"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Kategori
                                        </p>
                                        <div className="flex min-w-0 items-center gap-2">
                                            <TicketIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                            <span className="truncate">
                                                {categoryName}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative flex flex-col gap-4 border-t border-dashed border-slate-200 bg-white/70 p-4 backdrop-blur-[2px] lg:border-l lg:border-t-0 lg:bg-slate-50/80 lg:p-5">
                            <div className="pointer-events-none absolute -left-3 top-5 hidden h-6 w-6 rounded-full border border-slate-200 bg-white lg:block" />
                            <div className="pointer-events-none absolute -left-3 bottom-5 hidden h-6 w-6 rounded-full border border-slate-200 bg-white lg:block" />

                            <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    <TicketIcon className="h-4 w-4 text-primary" />
                                    Akses masuk
                                </div>
                                <p className="truncate text-lg font-semibold text-slate-950">
                                    {categoryName}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    QR tersedia di panel kanan.
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="mt-auto h-10 w-full rounded-lg border-slate-200 bg-white text-slate-700 hover:border-primary/25 hover:bg-slate-50 hover:text-slate-950"
                                onClick={() => setReloadCount((n) => n + 1)}
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-4">
                        <SectionBlock title="Ringkasan Tiket">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                    icon={<TicketIcon className="h-4 w-4" />}
                                    label="Kategori"
                                    value={categoryName}
                                />
                                <DetailItem
                                    icon={<StatusIcon className="h-4 w-4" />}
                                    label="Status"
                                    value={
                                        <span
                                            className={`inline-flex items-center gap-2 ${status.tone}`}
                                        >
                                            <span
                                                className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                                            />
                                            {status.label}
                                        </span>
                                    }
                                />
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Jadwal Event">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                    icon={
                                        <CalendarDays className="h-4 w-4" />
                                    }
                                    label="Mulai"
                                    value={formatDateTime(
                                        ticket.event.start_time,
                                    )}
                                />
                                <DetailItem
                                    icon={<Clock3 className="h-4 w-4" />}
                                    label="Selesai"
                                    value={formatDateTime(
                                        ticket.event.end_time,
                                    )}
                                />
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Informasi Peserta">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <DetailItem
                                    icon={<UserRound className="h-4 w-4" />}
                                    label="Nama"
                                    value={participantName}
                                />
                                <DetailItem
                                    icon={<Mail className="h-4 w-4" />}
                                    label="Email"
                                    value={participantEmail}
                                />
                                <DetailItem
                                    icon={<Phone className="h-4 w-4" />}
                                    label="Telepon"
                                    value={participantPhone}
                                />
                                <DetailItem
                                    icon={<Hash className="h-4 w-4" />}
                                    label="ID Tiket"
                                    value={ticket.id}
                                />
                            </div>
                        </SectionBlock>

                        <SectionBlock title="Status Check-in">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                                <p className="font-medium text-slate-900">
                                    {isCheckedIn
                                        ? `Sudah check-in (${formatDateTime(ticket.checked_in_at)})`
                                        : "Belum check-in"}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Tiket diterbitkan pada{" "}
                                    {formatDateTime(ticket.issued_at)}.
                                </p>
                            </div>
                        </SectionBlock>
                    </div>

                    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 lg:sticky lg:top-24 lg:self-start">
                        <div className="relative overflow-hidden border-b border-dashed border-slate-200 p-5">
                            <div className="absolute -right-8 -top-10 h-28 w-28 rotate-12 rounded-2xl border border-primary/15 bg-primary/8" />
                            <div className="relative z-10">
                                <p className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                                    <QrCode className="h-4 w-4 text-primary" />
                                    QR Ticket
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Tunjukkan kode ini saat check-in.
                                </p>
                            </div>
                        </div>

                        <div className="relative p-5">
                            <div className="pointer-events-none absolute -top-3 left-8 h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />
                            <div className="pointer-events-none absolute -top-3 right-8 h-6 w-6 rounded-full border border-slate-200 bg-slate-50" />

                            {ticket.qr_code ? (
                                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                    <Image
                                        src={qrImageUrl}
                                        alt="QR Ticket"
                                        width={320}
                                        height={320}
                                        unoptimized
                                        className="h-auto w-full rounded-xl bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-400">
                                    QR belum tersedia.
                                </div>
                            )}

                            <div className="mt-4 space-y-3">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        Nomor tiket
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                                        {ticket.ticket_number || "-"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        QR value
                                    </p>
                                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                                        {ticket.qr_code || "QR belum tersedia."}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full gap-2 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                    onClick={() => downloadSingleTicket(ticket)}
                                >
                                    <Download className="h-4 w-4" />
                                    Unduh Tiket
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
