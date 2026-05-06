import { CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";
import { TicketItem } from "@/services/ticket-service";
import Link from "next/link";

interface TicketCardProps {
  ticket: TicketItem;
}

export function TicketCard({ ticket }: TicketCardProps) {
  // Format tanggal ke Indonesia
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">Aktif</span>;
      case "used":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">Terpakai</span>;
      case "expired":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full">Kedaluwarsa</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">Dibatalkan</span>;
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
                <CalendarDays size={16} className="text-slate-400" />
                <span>{formatDate(ticket.event_date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin size={16} className="text-slate-400" />
                <span className="line-clamp-1">{ticket.location}</span>
              </div>
            </div>

            <div className="sm:hidden mb-2">
               {getStatusBadge(ticket.status)}
            </div>
          </div>

          {/* Pemisah bergaris putus-putus ala tiket fisik */}
          <div className="hidden sm:flex flex-col items-center justify-center relative w-8 border-l-2 border-dashed border-slate-200 bg-slate-50">
            <div className="absolute top-0 -mt-3 w-6 h-6 bg-slate-50 (mengikuti warna background luar, tapi ini bg putih) rounded-full"></div>
            <div className="absolute bottom-0 -mb-3 w-6 h-6 bg-slate-50 rounded-full"></div>
          </div>

          {/* Bagian Kanan: Info Tipe Tiket */}
          <div className="bg-slate-50 p-5 sm:p-6 sm:w-64 flex flex-col justify-center border-t border-dashed border-slate-200 sm:border-none">
            <div className="flex items-center gap-2 text-primary mb-1">
              <TicketIcon size={18} />
              <span className="font-semibold text-sm tracking-wide uppercase">Kategori Tiket</span>
            </div>
            <p className="font-bold text-slate-800 text-lg mb-1">{ticket.ticket_category_name}</p>
            <p className="text-xs text-slate-400 font-mono">ID: {ticket.id}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between items-center group-hover:text-primary transition-colors">
              <span className="text-sm font-medium">Lihat Detail E-Ticket</span>
              <span className="text-lg">→</span>
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
}
