"use client";

import { useState, useEffect } from "react";
import { TicketService, TicketItem } from "@/services/ticket-service";
import { TicketFilter, TicketFilterType } from "@/components/user/my-ticket/TicketFilter";
import { TicketList } from "@/components/user/my-ticket/TicketList";

export default function MyTicketPage() {
  const [filter, setFilter] = useState<TicketFilterType>("mendatang");
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        // Simulasi fetching, nanti ganti dengan: const res = await TicketService.getMyTickets();
        // Menggunakan dummy data sementara agar UI bisa di-testing
        const dummyData: TicketItem[] = [
          {
            id: "TCK-1001",
            order_id: "ORD-123",
            event_title: "Tech Conference 2026: Future of AI",
            event_date: "2026-05-24T09:00:00Z",
            location: "Jakarta Convention Center",
            ticket_category_name: "VIP Pass",
            status: "active"
          },
          {
            id: "TCK-1002",
            order_id: "ORD-124",
            event_title: "Music Fest Jakarta",
            event_date: "2026-06-10T18:00:00Z",
            location: "GBK Senayan",
            ticket_category_name: "Festival",
            status: "active"
          },
          {
            id: "TCK-0999",
            order_id: "ORD-099",
            event_title: "Web3 Developer Meetup",
            event_date: "2026-01-15T10:00:00Z",
            location: "Co-working Space Kuningan",
            ticket_category_name: "General Admission",
            status: "used"
          }
        ];
        
        // Simulasikan delay network
        setTimeout(() => {
          setTickets(dummyData);
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error("Gagal mengambil data tiket:", error);
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Filter logika: 
  // "mendatang" -> status active DAN tanggal event di masa depan (atau disederhanakan: status active)
  // "riwayat" -> status used/expired/cancelled ATAU tanggal event di masa lalu
  const filteredTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.event_date);
    const now = new Date();
    
    if (filter === "mendatang") {
      return ticket.status === "active" && eventDate >= now;
    } else {
      return ticket.status !== "active" || eventDate < now;
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 pt-8 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tiket Saya</h1>
        <p className="text-slate-500 mb-8">Kelola semua e-ticket dari event yang Anda ikuti.</p>

        <TicketFilter 
          currentFilter={filter} 
          onFilterChange={setFilter} 
        />

        <TicketList 
          tickets={filteredTickets} 
          isLoading={isLoading} 
        />
      </div>
    </main>
  );
}