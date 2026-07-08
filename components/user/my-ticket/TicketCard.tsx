import { CalendarDays, Ticket as TicketIcon } from "lucide-react";
import type { MyTicketItemResponse } from "@/types/ticket";
import Link from "next/link";

interface TicketCardProps {
    ticket: MyTicketItemResponse;
}

export function TicketCard({ ticket }: TicketCardProps) {
    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Asia/Jakarta",
            }).format(new Date(dateString));
        } catch {
            return dateString;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "issued":
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                        Aktif
                    </span>
                );
            case "checked_in":
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                        Sudah Hadir
                    </span>
                );

            case "refunded":
                return (
                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                        Direfund
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <Link href={`/user/my-ticket/${ticket.id}`} className="block">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all hover:border-primary/30 group">
                <div className="flex flex-col sm:flex-row">
                    {/* Bagian Kiri: Info Event */}
                    <div className="p-5 sm:p-6 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                                {ticket.event_title}
                            </h3>
                            <div className="ml-4 shrink-0 hidden sm:block">
                                {getStatusBadge(ticket.status)}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <CalendarDays
                                    size={16}
                                    className="text-slate-400"
                                />
                                <span>{formatDate(ticket.issued_at)}</span>
                            </div>
                        </div>

                        <div className="sm:hidden mb-2">
                            {getStatusBadge(ticket.status)}
                        </div>
                    </div>

                    {/* Pemisah bergaris putus-putus ala tiket fisik */}
                    <div className="hidden sm:flex flex-col items-center justify-center relative w-8 border-l-2 border-dashed border-slate-200 bg-slate-50 shrink-0">
                        <div className="absolute top-0 -mt-3 w-6 h-6 bg-white rounded-full border-b border-slate-200" />
                        <div className="absolute bottom-0 -mb-3 w-6 h-6 bg-white rounded-full border-t border-slate-200" />
                    </div>

                    {/* Bagian Kanan: Kategori Tiket */}
                    <div className="bg-slate-50 p-5 sm:p-6 sm:w-64 shrink-0 flex flex-col justify-center border-t border-dashed border-slate-200 sm:border-none">
                        <div className="flex items-center gap-2 text-primary mb-1">
                            <TicketIcon size={18} />
                            <span className="font-semibold text-sm tracking-wide uppercase">
                                Kategori Tiket
                            </span>
                        </div>
                        <p className="font-bold text-slate-800 text-lg mb-1">
                            {ticket.ticket_category_name}
                        </p>
                        <p className="text-xs text-slate-400">
                            Peserta: {ticket.participant_name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                            {ticket.ticket_number}
                        </p>

                        <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center group-hover:text-primary transition-colors">
                            <span className="text-sm font-medium">
                                Lihat E-Ticket
                            </span>
                            <span className="text-lg">-&gt;</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
