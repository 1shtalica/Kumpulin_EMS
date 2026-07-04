"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, BookOpen, Loader2, RefreshCw } from "lucide-react";
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
  { value: "earning_pending", label: "Pendapatan Menunggu" },
  { value: "earning_available", label: "Pendapatan Tersedia" },
  { value: "withdrawal_requested", label: "Pencairan Diajukan" },
  { value: "withdrawal_processing", label: "Payout Diproses" },
  { value: "withdrawal_succeeded", label: "Payout Berhasil" },
  { value: "withdrawal_failed", label: "Payout Gagal" },
  { value: "withdrawal_cancelled", label: "Payout Dibatalkan" },
];

const initialPagination: OrganizerFinancePagination = {
  page: 1,
  limit: 10,
  total_items: 0,
  total_pages: 1,
};

function amountClass(type: string) {
  if (type === "withdrawal_requested" || type === "withdrawal_processing") return "text-danger";
  if (type === "withdrawal_failed" || type === "withdrawal_cancelled") return "text-warning-hover";
  return "text-success-hover";
}

function typeBadgeClass(type: string) {
  if (type === "withdrawal_requested" || type === "withdrawal_processing") {
    return "border-danger/15 bg-danger-light text-danger";
  }
  if (type === "withdrawal_failed" || type === "withdrawal_cancelled") {
    return "border-warning/20 bg-warning-light text-warning-hover";
  }
  if (type === "withdrawal_succeeded" || type === "earning_available") {
    return "border-success/15 bg-success-light text-success-hover";
  }
  return "border-primary/15 bg-primary-light text-primary";
}

function LedgerHeaderGraphic() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 hidden h-40 w-72 translate-x-10 translate-y-8 text-primary md:block"
      viewBox="0 0 288 160"
      fill="none"
      aria-hidden="true"
    >
      <path d="M34 120C78 76 112 66 152 78C190 90 214 108 260 76" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <rect x="166" y="28" width="72" height="58" rx="16" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <path d="M184 49H220M184 64H206" stroke="currentColor" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 60L96 86L132 48" stroke="#10b981" strokeOpacity="0.16" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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
      toast.error("Gagal memuat buku kas organizer.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, type]);

  const selectedTypeLabel = useMemo(
    () => ledgerTypes.find((option) => option.value === type)?.label ?? "Semua tipe",
    [type],
  );

  return (
    <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
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
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
          <LedgerHeaderGraphic />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Ruang kerja organizer
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                Buku Kas
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Lihat mutasi pendapatan dan pencairan dana organizer dalam satu riwayat.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadLedger(true)}
              disabled={isRefreshing}
              className="h-10 w-fit rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Muat Ulang
            </Button>
          </div>
        </section>

        <FinanceNavigation />

        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Riwayat Mutasi</h2>
              <p className="mt-1 text-sm text-slate-500">Filter aktif: {selectedTypeLabel}</p>
            </div>
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value as OrganizerLedgerType | "");
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
            >
              {ledgerTypes.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-sm font-medium text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              Memuat buku kas...
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-950">Belum ada mutasi</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Mutasi pendapatan dan pencairan akan muncul setelah ada transaksi.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">Tipe</th>
                    <th className="px-5 py-3 font-semibold">Referensi</th>
                    <th className="px-5 py-3 text-right font-semibold">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => {
                    const AmountIcon = item.type.startsWith("withdrawal") ? ArrowUpRight : ArrowDownLeft;

                    return (
                      <tr key={item.id} className="bg-white transition-colors hover:bg-slate-50/70">
                        <td className="px-5 py-4 text-slate-600">
                          {formatFinanceDate(item.created_at)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${typeBadgeClass(item.type)}`}>
                            <span className="size-1.5 rounded-full bg-current" />
                            {ledgerTypeLabel(item.type)}
                          </span>
                          {item.description && (
                            <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-500">
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          {item.withdrawal_id || item.order_id || "-"}
                        </td>
                        <td className={`px-5 py-4 text-right font-semibold tabular-nums ${amountClass(item.type)}`}>
                          <span className="inline-flex items-center justify-end gap-1.5">
                            <AmountIcon className="h-4 w-4" />
                            {formatFinanceCurrency(item.amount, item.currency)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-100 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <span>
              Halaman {pagination.page} dari {pagination.total_pages} - {pagination.total_items} mutasi
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
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



