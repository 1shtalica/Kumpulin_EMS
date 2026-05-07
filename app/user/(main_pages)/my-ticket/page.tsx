"use client";

import { useState, useEffect, useCallback } from "react";
import { TicketService } from "@/services/ticket-service";
import type { MyTicketItemResponse } from "@/types/ticket";
import { TicketFilter } from "@/components/user/my-ticket/TicketFilter";
import type { TicketFilterType } from "@/types/ticket";
import { TicketList } from "@/components/user/my-ticket/TicketList";
import { TICKET_STATUS } from "@/types/ticket";

export default function MyTicketPage() {
  const [filter, setFilter] = useState<TicketFilterType>("mendatang");
  const [tickets, setTickets] = useState<MyTicketItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      // Mapping filter tab ke status backend
      // "mendatang" -> issued (belum check in)
      // "riwayat" -> checked_in | cancelled
      const statusFilter =
        filter === "mendatang" ? TICKET_STATUS.ISSUED : undefined;

      const res = await TicketService.getMyTickets(1, 50, statusFilter);
      let items = res.items;

      // Filter tambahan di sisi client untuk riwayat
      if (filter === "riwayat") {
        items = items.filter(
          (t: MyTicketItemResponse) =>
            t.status === TICKET_STATUS.CHECKED_IN ||
            t.status === TICKET_STATUS.CANCELLED ||
            t.status === TICKET_STATUS.REFUNDED
        );
      }

      setTickets(items);
    } catch (error) {
      console.error("Gagal mengambil data tiket:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <main className="p-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Tiket Saya</h1>
        <p className="text-slate-500">Kelola semua e-ticket dari event yang Anda ikuti.</p>
      </div>

      <TicketFilter currentFilter={filter} onFilterChange={setFilter} />

      <TicketList tickets={tickets} isLoading={isLoading} />
    </main>
  );
}