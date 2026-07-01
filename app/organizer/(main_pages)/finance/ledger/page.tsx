"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { FinanceNavigation } from "@/components/organizer/finance/FinanceNavigation";
import {
  formatFinanceCurrency,
  formatFinanceDate,
  ledgerTypeLabel,
} from "@/components/organizer/finance/finance-format";
import { Button } from "@/components/ui/button";
import { OrganizerFinanceService } from "@/services/organizer-finance-service";
import type {
  OrganizerFinancePagination,
  OrganizerLedgerEntry,
  OrganizerLedgerType,
} from "@/types/organizer-finance";

const ledgerTypes: Array<{ value: OrganizerLedgerType | ""; label: string }> = [
  { value: "", label: "Semua tipe" },
  { value: "earning_pending", label: "Pendapatan Pending" },
  { value: "earning_available", label: "Pendapatan Tersedia" },
  { value: "withdrawal_requested", label: "Withdrawal Diajukan" },
  { value: "withdrawal_cancelled", label: "Withdrawal Dibatalkan" },
];

const initialPagination: OrganizerFinancePagination = {
  page: 1,
  limit: 10,
  total_items: 0,
  total_pages: 1,
};

function amountClass(type: string) {
  if (type === "withdrawal_requested") return "text-red-600";
  if (type === "withdrawal_cancelled") return "text-amber-600";
  return "text-emerald-700";
}

export default function OrganizerLedgerPage() {
  const [items, setItems] = useState<OrganizerLedgerEntry[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [type, setType] = useState<OrganizerLedgerType | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLedger = async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      const data = await OrganizerFinanceService.getLedger({
        page,
        limit: pagination.limit,
        type,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Gagal memuat ledger organizer.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type]);

  return (
    <main className="relative -mx-6 min-h-[calc(100vh-136px)] bg-[#f9fafb] px-4 py-5 md:-mx-8 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Ledger Keuangan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Riwayat mutasi pendapatan dan withdrawal organizer.
          </p>
        </div>

        <FinanceNavigation />

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value as OrganizerLedgerType | "");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary"
            >
              {ledgerTypes.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => loadLedger(true)}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memuat ledger...
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center px-6 text-center text-sm text-slate-500">
              Belum ada transaksi untuk filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">Tipe</th>
                    <th className="px-5 py-3 font-semibold">Referensi</th>
                    <th className="px-5 py-3 text-right font-semibold">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="bg-white">
                      <td className="px-5 py-4 text-slate-600">
                        {formatFinanceDate(item.created_at)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {ledgerTypeLabel(item.type)}
                        </span>
                        {item.description && (
                          <p className="mt-2 max-w-md text-xs text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {item.withdrawal_id || item.order_id || "-"}
                      </td>
                      <td className={`px-5 py-4 text-right font-bold ${amountClass(item.type)}`}>
                        {formatFinanceCurrency(item.amount, item.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Halaman {pagination.page} dari {pagination.total_pages} - {pagination.total_items} transaksi
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                disabled={page >= pagination.total_pages || isLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}