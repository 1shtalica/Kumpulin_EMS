import type { MyTicketItemResponse } from "@/types/ticket";
import { TicketCard } from "./TicketCard";
import { Ticket as TicketIcon } from "lucide-react";

interface TicketListProps {
  tickets: MyTicketItemResponse[];
  isLoading: boolean;
}

export function TicketList({ tickets, isLoading }: TicketListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white rounded-3xl h-48 animate-pulse border border-slate-100 flex p-6">
             <div className="flex-grow space-y-4">
                <div className="h-6 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
          <TicketIcon size={40} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Belum Ada Tiket</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Kamu belum memiliki tiket untuk kategori ini. Yuk cari event menarik dan beli tiketnya sekarang!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
