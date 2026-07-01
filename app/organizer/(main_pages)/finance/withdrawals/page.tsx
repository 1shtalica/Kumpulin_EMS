"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { FinanceNavigation } from "@/components/organizer/finance/FinanceNavigation";
import {
  formatFinanceCurrency,
  formatFinanceDate,
  withdrawalStatusLabel,
} from "@/components/organizer/finance/finance-format";
import { Button } from "@/components/ui/button";
import { OrganizerFinanceService } from "@/services/organizer-finance-service";
import type {
  OrganizerFinancePagination,
  OrganizerWithdrawal,
  OrganizerWithdrawalStatus,
} from "@/types/organizer-finance";

const statuses: Array<{ value: OrganizerWithdrawalStatus | ""; label: string }> = [
  { value: "", label: "Semua status" },
  { value: "requested", label: "Diajukan" },
  { value: "cancelled", label: "Dibatalkan" },
];

const initialPagination: OrganizerFinancePagination = {
  page: 1,
  limit: 10,
  total_items: 0,
  total_pages: 1,
};

function StatusPill({ status }: { status: OrganizerWithdrawalStatus }) {
  const isRequested = status === "requested";
  return (
    <span
      className={
        isRequested
          ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
          : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
      }
    >
      {withdrawalStatusLabel(status)}
    </span>
  );
}

export default function OrganizerWithdrawalsPage() {
  const [items, setItems] = useState<OrganizerWithdrawal[]>([]);
  const [pagination, setPagination] = useState(initialPagination);
  const [status, setStatus] = useState<OrganizerWithdrawalStatus | "">("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWithdrawals = async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      const data = await OrganizerFinanceService.getWithdrawals({
        page,
        limit: pagination.limit,
        status,
      });
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      toast.error("Gagal memuat withdrawal.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  return (
    <main className="relative -mx-6 min-h-[calc(100vh-136px)] bg-[#f9fafb] px-4 py-5 md:-mx-8 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Withdrawal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Riwayat pencairan dana dan status pengajuan manual.
          </p>
        </div>

        <FinanceNavigation />

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as OrganizerWithdrawalStatus | "");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary"
            >
              {statuses.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => loadWithdrawals(true)}
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
              Memuat withdrawal...
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center px-6 text-center text-sm text-slate-500">
              Belum ada withdrawal untuk filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">Rekening</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Nominal</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="bg-white">
                      <td className="px-5 py-4 text-slate-600">
                        <p>{formatFinanceDate(item.requested_at || item.created_at)}</p>
                        {item.cancelled_at && (
                          <p className="mt-1 text-xs text-slate-400">
                            Batal {formatFinanceDate(item.cancelled_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{item.bank_name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.bank_account_holder_name} - {item.bank_account_number}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={item.status} />
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-slate-950">
                        {formatFinanceCurrency(item.amount, item.currency)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/organizer/finance/withdrawals/${item.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Detail
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Halaman {pagination.page} dari {pagination.total_pages} - {pagination.total_items} withdrawal
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