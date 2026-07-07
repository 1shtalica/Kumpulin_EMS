"use client";

import Link from "next/link";
import { type FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Download,
    Hash,
    Sparkles,
    QrCode,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Ticket as TicketIcon,
    UserRound,
    WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { QRCodeDisplay } from "@/components/user/my-ticket/QRCodeDisplay";
import {
    TicketService,
    getTicketApiErrorCode,
    getTicketApiErrorMessage,
} from "@/services/ticket-service";
import type {
    MyTicketListItem,
    TicketPagination,
    TicketStatus,
} from "@/types/ticket";

type StatusOption = {
    label: string;
    shortLabel: string;
    value: "all" | TicketStatus;
};

type TicketEventGroup = {
    eventId: string;
    eventTitle: string;
    tickets: MyTicketListItem[];
};

const STATUS_OPTIONS: StatusOption[] = [
    { label: "Semua tiket", shortLabel: "Semua", value: "all" },
    { label: "Aktif", shortLabel: "Aktif", value: "issued" },
    { label: "Sudah check-in", shortLabel: "Hadir", value: "checked_in" },
];

const DEFAULT_PAGINATION: TicketPagination = {
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1,
};

const VALID_STATUSES = new Set<TicketStatus>(["issued", "checked_in"]);

const parsePositiveInt = (value: string | null, fallback: number) => {
    if (!value) return fallback;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeLimit = (value: number) => {
    if (value < 1) return 1;
    if (value > 100) return 100;
    return value;
};

const formatDateTime = (value: string) => {
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
                dotClassName: "bg-emerald-500",
                badgeClassName:
                    "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
            };
        case "checked_in":
            return {
                label: "Sudah check-in",
                Icon: CheckCircle2,
                dotClassName: "bg-blue-500",
                badgeClassName:
                    "border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-50",
            };
        default:
            return {
                label: "Tidak valid",
                Icon: AlertCircle,
                dotClassName: "bg-slate-400",
                badgeClassName:
                    "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100",
            };
    }
};

const updateQueryString = (
    searchParams: URLSearchParams,
    updates: Record<string, string | null>,
) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
            nextParams.delete(key);
            return;
        }
        nextParams.set(key, value);
    });

    const next = nextParams.toString();
    return next ? `?${next}` : "";
};
const groupTicketsByEvent = (tickets: MyTicketListItem[]) => {
    const groups = new Map<string, TicketEventGroup>();

    tickets.forEach((ticket) => {
        const eventId = ticket.event_id || ticket.id;
        const existingGroup = groups.get(eventId);

        if (existingGroup) {
            existingGroup.tickets.push(ticket);
            return;
        }

        groups.set(eventId, {
            eventId,
            eventTitle: ticket.event_title || "Event",
            tickets: [ticket],
        });
    });

    return Array.from(groups.values());
};

const formatDateTimeShort = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const downloadTicketsForEvent = (group: TicketEventGroup) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const ticketCards = group.tickets
        .map((ticket) => {
            const qrUrl = ticket.qr_code
                ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.qr_code)}`
                : "";
            const statusLabel =
                ticket.status === "issued"
                    ? "Aktif"
                    : ticket.status === "checked_in"
                      ? "Sudah Check-in"
                      : ticket.status;
            const statusColor =
                ticket.status === "issued"
                    ? "#10b981"
                    : ticket.status === "checked_in"
                      ? "#3b82f6"
                      : "#94a3b8";

            return `
            <div class="ticket-card">
                <div class="ticket-left">
                    <div class="ticket-accent" style="background: ${statusColor};"></div>
                    <div class="ticket-body">
                        <div class="ticket-label">E-TICKET · KUMPULIN EMS</div>
                        <div class="ticket-event">${group.eventTitle}</div>
                        <div class="ticket-category">${ticket.ticket_category_name || "Kategori tiket"}</div>

                        <div class="ticket-meta-grid">
                            <div class="ticket-meta-item">
                                <div class="ticket-meta-label">PESERTA</div>
                                <div class="ticket-meta-value">${ticket.participant_name || "-"}</div>
                            </div>
                            <div class="ticket-meta-item">
                                <div class="ticket-meta-label">DITERBITKAN</div>
                                <div class="ticket-meta-value">${formatDateTimeShort(ticket.issued_at)}</div>
                            </div>
                            <div class="ticket-meta-item">
                                <div class="ticket-meta-label">STATUS</div>
                                <div class="ticket-meta-value status-badge" style="color: ${statusColor}; border-color: ${statusColor}20; background: ${statusColor}10;">${statusLabel}</div>
                            </div>
                            <div class="ticket-meta-item">
                                <div class="ticket-meta-label">NOMOR TIKET</div>
                                <div class="ticket-meta-value ticket-code">${ticket.ticket_number || "-"}</div>
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
                    <div class="ticket-qr-label">Scan untuk check-in</div>
                    ${
                        qrUrl
                            ? `<img class="ticket-qr" src="${qrUrl}" alt="QR Code" />`
                            : `<div class="ticket-qr-placeholder">QR belum tersedia</div>`
                    }
                    <div class="ticket-qr-code">${ticket.ticket_number || "-"}</div>
                </div>
            </div>
        `;
        })
        .join("");

    const html = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>E-Ticket — ${group.eventTitle}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
            <style>
                @page {
                    size: 210mm 110mm;
                    margin: 8mm 10mm;
                }

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                body {
                    font-family: 'Poppins', sans-serif;
                    background: #f8fafc;
                    color: #0f172a;
                    padding: 24px 20px;
                    min-height: 100vh;
                }

                .page-header {
                    text-align: center;
                    margin-bottom: 36px;
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

                .tickets-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 720px;
                    margin: 0 auto;
                }

                .ticket-card {
                    display: flex;
                    background: #ffffff;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    overflow: hidden;
                    height: 100%;
                    page-break-inside: avoid;
                    page-break-after: always;
                    break-after: page;
                }

                .ticket-accent {
                    width: 5px;
                    flex-shrink: 0;
                    border-radius: 0;
                }

                .ticket-left {
                    display: flex;
                    flex: 1;
                    min-width: 0;
                }

                .ticket-body {
                    flex: 1;
                    min-width: 0;
                    padding: 20px 20px 20px 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .ticket-label {
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #94a3b8;
                }

                .ticket-event {
                    font-size: 17px;
                    font-weight: 700;
                    color: #0f172a;
                    line-height: 1.25;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .ticket-category {
                    font-size: 12px;
                    font-weight: 500;
                    color: #7c3aed;
                    background: #f5f3ff;
                    border: 1px solid #ede9fe;
                    border-radius: 6px;
                    padding: 2px 8px;
                    display: inline-block;
                    width: fit-content;
                }

                .ticket-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-top: auto;
                    padding-top: 4px;
                }

                .ticket-meta-item {
                    min-width: 0;
                }

                .ticket-meta-label {
                    font-size: 8.5px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 2px;
                }

                .ticket-meta-value {
                    font-size: 11.5px;
                    font-weight: 500;
                    color: #1e293b;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .ticket-code {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 10px;
                    color: #475569;
                }

                .status-badge {
                    display: inline-block;
                    border: 1px solid;
                    border-radius: 999px;
                    padding: 1px 7px;
                    font-size: 10px;
                    font-weight: 600;
                }

                .ticket-divider {
                    position: relative;
                    width: 24px;
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
                    width: 20px;
                    height: 20px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 50%;
                    z-index: 1;
                }

                .notch-top { top: -10px; }
                .notch-bottom { bottom: -10px; }

                .ticket-right {
                    width: 220px;
                    flex-shrink: 0;
                    background: #fafafa;
                    padding: 18px 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .ticket-qr-label {
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    text-align: center;
                }

                .ticket-qr {
                    width: 170px;
                    height: 170px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                    padding: 4px;
                    background: #ffffff;
                }

                .ticket-qr-placeholder {
                    width: 170px;
                    height: 170px;
                    border-radius: 10px;
                    border: 2px dashed #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #94a3b8;
                    text-align: center;
                    padding: 8px;
                }

                .ticket-qr-code {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 8.5px;
                    color: #64748b;
                    text-align: center;
                    word-break: break-all;
                    max-width: 128px;
                }

                .page-footer {
                    text-align: center;
                    margin-top: 36px;
                    font-size: 11px;
                    color: #94a3b8;
                }

                @media print {
                    body { background: #ffffff; padding: 0; }
                    .page-header { display: none; }
                    .page-footer { display: none; }
                    .tickets-container { gap: 0; max-width: 100%; }
                    .ticket-card { box-shadow: none; border-color: #e2e8f0; border-radius: 0; height: 100vh; }
                    .notch { background: #ffffff; }
                }
            </style>
        </head>
        <body>
            <div class="page-header">
                <div class="brand">Kumpulin EMS · E-Ticket</div>
                <h1>${group.eventTitle}</h1>
                <div class="subtitle">${group.tickets.length} tiket · Dicetak ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</div>
            </div>
            <div class="tickets-container">
                ${ticketCards}
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

function TicketWalletDoodle() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] overflow-hidden opacity-80 lg:block"
        >
            <div className="absolute -right-10 top-4 h-28 w-28 rotate-12 rounded-2xl border border-primary/15 bg-primary/5" />
            <div className="absolute right-32 top-8 h-24 w-40 -rotate-6 rounded-xl border border-slate-200/80 bg-slate-50/80">
                <div className="absolute inset-x-4 top-5 h-2 rounded-full bg-slate-200" />
                <div className="absolute left-4 top-11 h-2 w-14 rounded-full bg-slate-200" />
                <div className="absolute bottom-0 left-8 h-5 w-5 translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute bottom-0 right-8 h-5 w-5 translate-y-1/2 rounded-full border border-slate-200 bg-white" />
            </div>
            <div className="absolute bottom-6 right-16 grid h-18 w-18 rotate-3 grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white/90 p-2 shadow-sm">
                <span className="rounded-sm bg-slate-900" />
                <span className="rounded-sm bg-primary" />
                <span className="rounded-sm bg-slate-900" />
                <span className="rounded-sm bg-primary/70" />
                <span className="rounded-sm bg-slate-200" />
                <span className="rounded-sm bg-primary" />
                <span className="rounded-sm bg-slate-900" />
                <span className="rounded-sm bg-primary/70" />
                <span className="rounded-sm bg-slate-900" />
            </div>
            <Sparkles className="absolute right-16 top-8 h-4 w-4 text-primary/50" />
            <div className="absolute bottom-8 right-36 h-px w-40 rotate-[-8deg] border-t border-dashed border-slate-300" />
        </div>
    );
}

function TicketCardDoodle() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] overflow-hidden md:block"
        >
            <div className="absolute inset-y-0 right-0 w-72 bg-linear-to-l from-primary/8 via-primary/4 to-transparent" />
            <div className="absolute -right-14 -top-8 h-36 w-52 rotate-6 rounded-[1.75rem] border border-primary/15 bg-primary/8" />
            <div className="absolute right-7 top-5 h-30 w-50 -rotate-3 rounded-2xl border border-slate-200 bg-white/80 shadow-sm">
                <div className="absolute inset-y-4 left-14 border-l border-dashed border-slate-300" />
                <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-white" />
                <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <TicketIcon className="h-5 w-5" />
                </div>
                <div className="absolute left-20 top-6 h-2 w-20 rounded-full bg-slate-300" />
                <div className="absolute left-20 top-12 h-1.5 w-14 rounded-full bg-slate-200" />
                <div className="absolute left-20 top-17 h-1.5 w-18 rounded-full bg-primary/25" />
                <div className="absolute bottom-5 left-20 flex h-8 items-end gap-1">
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-7 w-1 rounded-full bg-slate-400" />
                    <span className="h-5 w-1 rounded-full bg-slate-300" />
                    <span className="h-8 w-1 rounded-full bg-primary/40" />
                    <span className="h-4 w-1 rounded-full bg-slate-300" />
                    <span className="h-6 w-1 rounded-full bg-slate-400" />
                    <span className="h-5 w-1 rounded-full bg-primary/30" />
                </div>
            </div>
            <Sparkles className="absolute right-10 top-10 h-4 w-4 text-primary/50" />
            <div className="absolute bottom-6 right-20 h-px w-52 rotate-[-5deg] border-t border-dashed border-slate-300" />
        </div>
    );
}

function TicketCardLeftGraphic() {
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

function TicketCard({ item }: { item: MyTicketListItem }) {
    const status = getStatusPresentation(item.status);
    const StatusIcon = status.Icon;

    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-slate-900/5">
            <div
                className={`absolute inset-y-0 left-0 w-1.5 ${status.dotClassName}`}
                aria-hidden="true"
            />
            <TicketCardDoodle />
            <div className="relative z-10 grid gap-0 lg:grid-cols-[1fr_280px]">
                <div className="relative overflow-hidden p-4 pl-8 sm:p-5 sm:pl-10">
                    <TicketCardLeftGraphic />
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    <span
                                        className={`h-2 w-2 rounded-full ${status.dotClassName}`}
                                    />
                                    E-ticket
                                </div>
                                <Link
                                    href={`/user/my-ticket/${item.id}`}
                                    className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                    <h2 className="line-clamp-2 text-xl font-semibold tracking-tight text-slate-950 transition-colors hover:text-primary">
                                        {item.event_title || "Event"}
                                    </h2>
                                </Link>
                            </div>
                            <Badge
                                variant="outline"
                                className={`w-fit shrink-0 gap-1.5 rounded-lg px-2.5 py-1 ${status.badgeClassName}`}
                            >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {status.label}
                            </Badge>
                        </div>

                        <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Peserta
                                </p>
                                <div className="flex min-w-0 items-center gap-2">
                                    <UserRound className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                        {item.participant_name || "-"}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Terbit
                                </p>
                                <div className="flex min-w-0 items-center gap-2">
                                    <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                        {formatDateTime(item.issued_at)}
                                    </span>
                                </div>
                            </div>
                            <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Kode
                                </p>
                                <div className="flex min-w-0 items-center gap-2">
                                    <Hash className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate font-mono text-xs">
                                        {item.ticket_number || "-"}
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
                            {item.ticket_category_name || "Kategori tiket"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Buka QR saat berada di gate check-in.
                        </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:mt-auto lg:grid-cols-1">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="brand"
                                    className="h-10 rounded-lg"
                                    disabled={!item.qr_code}
                                >
                                    <QrCode className="h-4 w-4" />
                                    Tampilkan QR
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-sm rounded-2xl border-slate-200 p-0">
                                <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left">
                                    <DialogTitle className="line-clamp-1 text-base">
                                        QR Ticket
                                    </DialogTitle>
                                    <DialogDescription className="line-clamp-2">
                                        {item.event_title || "Event"}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="px-5 pb-5 pt-4 text-center">
                                    <QRCodeDisplay
                                        value={item.qr_code}
                                        size={260}
                                        className="w-full"
                                    />
                                    <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-500">
                                        {item.ticket_number || "-"}
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Button
                            asChild
                            variant="outline"
                            className="h-10 rounded-lg border-slate-200 bg-white"
                        >
                            <Link href={`/user/my-ticket/${item.id}`}>
                                Detail tiket
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}
function TicketEventAccordion({
    group,
    isOpen,
    onToggle,
}: {
    group: TicketEventGroup;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const activeTickets = group.tickets.filter(
        (ticket) => ticket.status === "issued",
    ).length;
    const checkedInTickets = group.tickets.filter(
        (ticket) => ticket.status === "checked_in",
    ).length;
    const categoryNames = Array.from(
        new Set(
            group.tickets
                .map((ticket) => ticket.ticket_category_name)
                .filter(Boolean),
        ),
    );

    return (
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition-all duration-200 hover:border-primary/30">
            <div className="flex w-full flex-col gap-0">
                <button
                    type="button"
                    onClick={onToggle}
                    className="group flex w-full flex-col gap-4 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:p-5 lg:flex-row lg:items-center lg:justify-between"
                    aria-expanded={isOpen}
                >
                    <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <TicketIcon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-primary/15 bg-primary/5 text-primary"
                                >
                                    {group.tickets.length} tiket
                                </Badge>
                                {activeTickets > 0 ? (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-emerald-100 bg-emerald-50 text-emerald-700"
                                    >
                                        {activeTickets} aktif
                                    </Badge>
                                ) : null}
                                {checkedInTickets > 0 ? (
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-blue-100 bg-blue-50 text-blue-700"
                                    >
                                        {checkedInTickets} hadir
                                    </Badge>
                                ) : null}
                            </div>
                            <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-950 transition-colors group-hover:text-primary sm:text-xl">
                                {group.eventTitle}
                            </h2>
                            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                {categoryNames.length > 0
                                    ? categoryNames.join(", ")
                                    : "Kategori tiket"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                        <span className="text-sm font-semibold text-slate-500">
                            {isOpen ? "Tutup tiket" : "Lihat tiket"}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-primary/20 group-hover:text-primary">
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                    isOpen ? "rotate-180" : ""
                                }`}
                            />
                        </span>
                    </div>
                </button>

                <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 rounded-lg border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            downloadTicketsForEvent(group);
                        }}
                    >
                        <Download className="h-3.5 w-3.5" />
                        Unduh {group.tickets.length > 1 ? `${group.tickets.length} tiket` : "tiket"}
                    </Button>
                    <span className="text-xs text-slate-400">· PDF / cetak</span>
                </div>
            </div>

            {isOpen ? (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                    {group.tickets.map((ticket) => (
                        <TicketCard key={ticket.id} item={ticket} />
                    ))}
                </div>
            ) : null}
        </article>
    );
}
function TicketSkeletonList() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white lg:grid-cols-[1fr_280px]"
                >
                    <div className="space-y-4 p-4 sm:p-5">
                        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
                        <div className="h-5 w-3/4 animate-pulse rounded-md bg-slate-100" />
                        <div className="grid gap-2 md:grid-cols-3">
                            <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                            <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                            <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                        </div>
                    </div>
                    <div className="border-t border-dashed border-slate-200 bg-slate-50/70 p-4 lg:border-l lg:border-t-0 lg:p-5">
                        <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                        <div className="mt-3 h-5 w-28 animate-pulse rounded-md bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function TicketPageFallback() {
    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] -mx-6 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-4 h-8 w-52 animate-pulse rounded-lg bg-slate-100" />
                </div>
                <TicketSkeletonList />
            </div>
        </main>
    );
}

function MyTicketPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [items, setItems] = useState<MyTicketListItem[]>([]);
    const [pagination, setPagination] =
        useState<TicketPagination>(DEFAULT_PAGINATION);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string>("");
    const [reloadCount, setReloadCount] = useState(0);
    const [eventTitleInput, setEventTitleInput] = useState("");
    const [openEventIds, setOpenEventIds] = useState<Set<string>>(new Set());

    const page = parsePositiveInt(searchParams.get("page"), 1);
    const limit = normalizeLimit(
        parsePositiveInt(searchParams.get("limit"), 10),
    );
    const rawStatus = searchParams.get("status") ?? "";
    const status = VALID_STATUSES.has(rawStatus as TicketStatus)
        ? (rawStatus as TicketStatus)
        : undefined;
    const eventTitle = searchParams.get("event_title")?.trim() ?? "";

    const selectedStatus = status ?? "all";
    const selectedStatusOption =
        STATUS_OPTIONS.find((option) => option.value === selectedStatus) ??
        STATUS_OPTIONS[0];
    const hasFilters = selectedStatus !== "all" || Boolean(eventTitle);

    useEffect(() => {
        setEventTitleInput(eventTitle);
    }, [eventTitle]);

    useEffect(() => {
        let isMounted = true;

        const loadTickets = async () => {
            setIsLoading(true);
            setErrorCode("");
            setErrorMessage(null);

            try {
                const data = await TicketService.getMyTickets({
                    page,
                    limit,
                    ...(status ? { status } : {}),
                    ...(eventTitle ? { event_title: eventTitle } : {}),
                });

                if (!isMounted) return;
                setItems(data.items ?? []);
                setPagination(data.pagination ?? DEFAULT_PAGINATION);
            } catch (error) {
                const code = getTicketApiErrorCode(error);
                if (code === "UNAUTHORIZED") {
                    router.replace("/login");
                    return;
                }

                if (!isMounted) return;
                setItems([]);
                setPagination(DEFAULT_PAGINATION);
                setErrorCode(code);
                setErrorMessage(
                    getTicketApiErrorMessage(
                        error,
                        "Gagal mengambil data tiket.",
                    ),
                );
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadTickets();

        return () => {
            isMounted = false;
        };
    }, [page, limit, status, eventTitle, reloadCount, router]);

    const totalPages = Math.max(pagination.total_pages || 1, 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const summaryText = useMemo(() => {
        if (pagination.total_items <= 0) return "Tidak ada tiket ditampilkan.";

        const start = (safePage - 1) * limit + 1;
        const end = Math.min(safePage * limit, pagination.total_items);
        return `${start}-${end} dari ${pagination.total_items} tiket`;
    }, [limit, pagination.total_items, safePage]);
    const ticketEventGroups = useMemo(() => groupTicketsByEvent(items), [items]);

    const toggleEventGroup = (groupId: string) => {
        setOpenEventIds((current) => {
            const next = new Set(current);

            if (next.has(groupId)) {
                next.delete(groupId);
            } else {
                next.add(groupId);
            }

            return next;
        });
    };

    const applyQuery = (updates: Record<string, string | null>) => {
        const nextQuery = updateQueryString(
            new URLSearchParams(searchParams.toString()),
            { event_id: null, ...updates },
        );
        router.replace(`/user/my-ticket${nextQuery}`);
    };

    const handleStatusChange = (nextStatus: StatusOption["value"]) => {
        applyQuery({
            status: nextStatus === "all" ? null : nextStatus,
            page: "1",
        });
    };

    const handleLimitChange = (nextLimit: string) => {
        applyQuery({ limit: nextLimit, page: "1" });
    };

    const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyQuery({
            event_title: eventTitleInput.trim() || null,
            event_id: null,
            page: "1",
        });
    };

    const clearFilters = () => {
        setEventTitleInput("");
        router.replace("/user/my-ticket");
    };

    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] -mx-6 px-4 py-6 md:-mx-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl space-y-5">
                <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                    <TicketWalletDoodle />
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                Ticket wallet
                            </p>
                            <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                                Tiket Saya
                            </h1>
                            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 md:text-sm">
                                Buka e-ticket, cek status check-in, dan temukan
                                QR sebelum masuk ke lokasi event.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:border-primary/25 hover:bg-slate-50 hover:text-slate-950"
                                onClick={() =>
                                    setReloadCount((current) => current + 1)
                                }
                                disabled={isLoading}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                                />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </header>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {STATUS_OPTIONS.map((option) => {
                                const isActive =
                                    option.value === selectedStatus;
                                return (
                                    <Button
                                        key={option.value}
                                        type="button"
                                        variant={isActive ? "brand" : "ghost"}
                                        className={`h-9 shrink-0 rounded-lg px-4 ${
                                            isActive
                                                ? ""
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                        onClick={() =>
                                            handleStatusChange(option.value)
                                        }
                                    >
                                        <span className="hidden sm:inline">
                                            {option.label}
                                        </span>
                                        <span className="sm:hidden">
                                            {option.shortLabel}
                                        </span>
                                    </Button>
                                );
                            })}
                        </div>

                        <form
                            onSubmit={handleFilterSubmit}
                            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:w-[420px]"
                        >
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    value={eventTitleInput}
                                    onChange={(event) =>
                                        setEventTitleInput(event.target.value)
                                    }
                                    placeholder="Cari dengan nama event"
                                    className="h-10 rounded-full border-slate-200 bg-slate-50 pl-10"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="outline"
                                className="h-10 rounded-lg border-slate-200 bg-white"
                            >
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                            </Button>
                        </form>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <span>{summaryText}</span>
                            {hasFilters ? (
                                <>
                                    <span className="hidden text-slate-300 sm:inline">
                                        |
                                    </span>
                                    <Badge
                                        variant="outline"
                                        className="rounded-full border-primary/15 bg-primary/5 text-primary"
                                    >
                                        {selectedStatusOption.label}
                                    </Badge>
                                    {eventTitle ? (
                                        <Badge
                                            variant="outline"
                                            className="max-w-full rounded-full border-slate-200 bg-slate-50 text-slate-600"
                                        >
                                            <span className="truncate">
                                                Event: {eventTitle}
                                            </span>
                                        </Badge>
                                    ) : null}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 rounded-lg px-2 text-slate-500 hover:text-slate-900"
                                        onClick={clearFilters}
                                    >
                                        Reset
                                    </Button>
                                </>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                            <label
                                htmlFor="ticket-limit"
                                className="text-sm text-slate-500"
                            >
                                Per halaman
                            </label>
                            <select
                                id="ticket-limit"
                                value={String(limit)}
                                onChange={(event) =>
                                    handleLimitChange(event.target.value)
                                }
                                className="h-9 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    {isLoading ? <TicketSkeletonList /> : null}

                    {!isLoading && errorMessage ? (
                        <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm shadow-slate-900/5">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <p className="mt-4 text-base font-semibold text-slate-950">
                                {errorCode === "INVALID_INPUT"
                                    ? "Filter tidak valid"
                                    : "Tiket gagal dimuat"}
                            </p>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                {errorMessage}
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg"
                                    onClick={() =>
                                        setReloadCount((current) => current + 1)
                                    }
                                >
                                    Coba Lagi
                                </Button>
                                {errorCode === "INVALID_INPUT" ? (
                                    <Button
                                        type="button"
                                        className="rounded-lg"
                                        onClick={clearFilters}
                                    >
                                        Reset Filter
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && ticketEventGroups.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm shadow-slate-900/5">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <WalletCards className="h-7 w-7" />
                            </div>
                            <p className="mt-4 text-base font-semibold text-slate-950">
                                {hasFilters
                                    ? "Tidak ada tiket yang cocok"
                                    : "Belum ada tiket"}
                            </p>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                {hasFilters
                                    ? "Coba ubah status atau hapus nama event untuk melihat tiket lainnya."
                                    : "Tiket Anda akan muncul di sini setelah pembelian berhasil."}
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-2">
                                {hasFilters ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-lg"
                                        onClick={clearFilters}
                                    >
                                        Reset Filter
                                    </Button>
                                ) : null}
                                <Button asChild className="rounded-lg">
                                    <Link href="/">
                                        Cari Event
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {!isLoading && !errorMessage && ticketEventGroups.length > 0 ? (
                        <>
                            {ticketEventGroups.map((group) => (
                                <TicketEventAccordion
                                    key={group.eventId}
                                    group={group}
                                    isOpen={openEventIds.has(group.eventId)}
                                    onToggle={() => toggleEventGroup(group.eventId)}
                                />
                            ))}

                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg"
                                    disabled={safePage <= 1}
                                    onClick={() =>
                                        applyQuery({
                                            page: String(
                                                Math.max(safePage - 1, 1),
                                            ),
                                        })
                                    }
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Sebelumnya
                                </Button>
                                <p className="text-center text-sm text-slate-500">
                                    Halaman {safePage} dari {totalPages}
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-lg"
                                    disabled={safePage >= totalPages}
                                    onClick={() =>
                                        applyQuery({
                                            page: String(
                                                Math.min(
                                                    safePage + 1,
                                                    totalPages,
                                                ),
                                            ),
                                        })
                                    }
                                >
                                    Berikutnya
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : null}
                </section>
            </div>
        </main>
    );
}

export default function MyTicketPage() {
    return (
        <Suspense fallback={<TicketPageFallback />}>
            <MyTicketPageContent />
        </Suspense>
    );
}