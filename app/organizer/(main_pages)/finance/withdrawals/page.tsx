"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Landmark, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { FinanceNavigation } from "@/components/organizer/finance/FinanceNavigation";
import {
  formatFinanceCurrency,
  formatFinanceDate,
  payoutChannelLabel,
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
  { value: "processing", label: "Diproses" },
  { value: "succeeded", label: "Berhasil" },
  { value: "failed", label: "Gagal" },
  { value: "cancelled", label: "Dibatalkan" },
];

const initialPagination: OrganizerFinancePagination = {
  page: 1,
  limit: 10,
  total_items: 0,
  total_pages: 1,
};

function statusClass(status: OrganizerWithdrawalStatus) {
  const classes: Record<OrganizerWithdrawalStatus, string> = {
    processing: "border-warning/20 bg-warning-light text-warning-hover",
    succeeded: "border-success/20 bg-success-light text-success-hover",
    failed: "border-red-200 bg-red-50 text-red-600",
    cancelled: "border-slate-200 bg-slate-100 text-slate-500",
  };

  return classes[status];
}

function StatusPill({ status }: { status: OrganizerWithdrawalStatus }) {
  const dotClass: Record<OrganizerWithdrawalStatus, string> = {
    processing: "bg-warning-hover",
    succeeded: "bg-success-hover",
    failed: "bg-red-500",
    cancelled: "bg-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(status)}`}>
      <span className={`size-1.5 rounded-full ${dotClass[status]}`} />
      {withdrawalStatusLabel(status)}
    </span>
  );
}

function WithdrawalHeaderGraphic() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 hidden h-40 w-72 translate-x-10 translate-y-8 text-primary md:block"
      viewBox="0 0 288 160"
      fill="none"
      aria-hidden="true"
    >
      <path d="M32 118C72 82 112 72 146 80C190 90 210 112 256 74" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <rect x="162" y="28" width="80" height="58" rx="16" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <path d="M184 56H220M184 70H206" stroke="currentColor" strokeOpacity="0.13" strokeWidth="6" strokeLinecap="round" />
      <path d="M82 42V108M82 108L58 84M82 108L106 84" stroke="#10b981" strokeOpacity="0.18" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
      toast.error("Gagal memuat payout.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const selectedStatusLabel = useMemo(
    () => statuses.find((option) => option.value === status)?.label ?? "Semua status",
    [status],
  );

  return (
    <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-3 py-6 sm:px-4 md:-mx-8 md:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.16,
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
          <WithdrawalHeaderGraphic />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Ruang kerja organizer
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                Riwayat Payout
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Pantau status payout otomatis dari Xendit dan referensi transaksi backend.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadWithdrawals(true)}
              disabled={isRefreshing}
              className="h-10 w-fit rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Muat Ulang
            </Button>
          </div>
        </section>

        <FinanceNavigation />

        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Daftar Payout</h2>
              <p className="mt-1 text-sm text-slate-500">Filter aktif: {selectedStatusLabel}</p>
            </div>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as OrganizerWithdrawalStatus | "");
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            >
              {statuses.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-sm font-medium text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              Memuat payout...
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-light text-primary">
                <Landmark className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">Belum ada payout</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Pengajuan payout akan muncul di sini setelah organizer membuat request.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">Rekening</th>
                    <th className="px-5 py-3 font-semibold">Xendit</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Nominal</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-slate-600">
                        <p>{formatFinanceDate(item.requested_at || item.created_at)}</p>
                        {item.succeeded_at && (
                          <p className="mt-1 text-xs text-success-hover">
                            Berhasil {formatFinanceDate(item.succeeded_at)}
                          </p>
                        )}
                        {item.failed_at && (
                          <p className="mt-1 text-xs text-red-600">
                            Gagal {formatFinanceDate(item.failed_at)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-950">{payoutChannelLabel(item.channel_code)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.bank_account_holder_name} - {item.bank_account_number}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-slate-700">{item.xendit_reference_id || "-"}</p>
                        <p className="mt-1 text-xs font-medium uppercase text-slate-400">
                          {item.xendit_status || "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={item.status} />
                        {item.status === "failed" && item.failure_message && (
                          <p className="mt-2 max-w-56 text-xs leading-5 text-red-600">
                            {item.failure_message}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-950 tabular-nums">
                        {formatFinanceCurrency(item.amount, item.currency)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="rounded-lg border-slate-200 bg-white font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                          <Link href={`/organizer/finance/withdrawals/${item.id}`}>
                            <Eye className="h-4 w-4" />
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

          <div className="flex flex-col gap-3 border-t border-slate-100 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <span>
              Halaman {pagination.page} dari {pagination.total_pages} - {pagination.total_items} payout
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
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

