"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import { FinanceNavigation } from "@/components/organizer/finance/FinanceNavigation";
import {
  formatFinanceCurrency,
  formatFinanceDate,
  payoutChannelLabel,
  withdrawalStatusDescription,
  withdrawalStatusLabel,
} from "@/components/organizer/finance/finance-format";
import { Button } from "@/components/ui/button";
import { OrganizerFinanceService } from "@/services/organizer-finance-service";
import type {
  OrganizerWithdrawal,
  OrganizerWithdrawalStatus,
} from "@/types/organizer-finance";

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

function DetailHeaderGraphic() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 hidden h-40 w-72 translate-x-10 translate-y-8 text-primary md:block"
      viewBox="0 0 288 160"
      fill="none"
      aria-hidden="true"
    >
      <path d="M34 118C70 82 112 72 150 82C190 92 212 112 258 76" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <rect x="164" y="28" width="78" height="58" rx="16" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <path d="M184 50H222M184 66H210" stroke="currentColor" strokeOpacity="0.14" strokeWidth="6" strokeLinecap="round" />
      <path d="M76 48V108M76 108L54 86M76 108L98 86" stroke="#10b981" strokeOpacity="0.18" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-950">{value || "-"}</dd>
    </div>
  );
}

export default function WithdrawalDetailPage({
  params,
}: {
  params: Promise<{ withdrawal_id: string }>;
}) {
  const { withdrawal_id } = use(params);
  const [withdrawal, setWithdrawal] = useState<OrganizerWithdrawal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWithdrawal = async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      const data = await OrganizerFinanceService.getWithdrawalDetail(withdrawal_id);
      setWithdrawal(data);
    } catch {
      toast.error("Gagal memuat detail payout.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWithdrawal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawal_id]);

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

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
          <DetailHeaderGraphic />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Button
                asChild
                variant="ghost"
                className="mb-3 -ml-3 h-9 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
              >
                <Link href="/organizer/finance/withdrawals">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </Button>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Ruang kerja organizer
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                Detail Payout
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Lihat rekening tujuan, referensi Xendit, dan status payout terbaru dari backend.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => loadWithdrawal(true)}
              disabled={isRefreshing}
              className="h-10 w-fit rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Muat Ulang
            </Button>
          </div>
        </section>

        <FinanceNavigation />

        {isLoading ? (
          <section className="flex min-h-72 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-sm font-medium text-slate-500 shadow-sm shadow-slate-900/5">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            Memuat detail payout...
          </section>
        ) : !withdrawal ? (
          <section className="rounded-xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
            Payout tidak ditemukan.
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-400">{withdrawal.id}</p>
                  <h2 className="mt-2 text-xl font-semibold leading-none text-slate-950 tabular-nums md:text-2xl">
                    {formatFinanceCurrency(withdrawal.amount, withdrawal.currency)}
                  </h2>
                </div>
                <StatusPill status={withdrawal.status} />
              </div>

              {withdrawal.status === "failed" && withdrawal.failure_message && (
                <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-3 text-sm leading-6 text-red-600">
                  {withdrawal.failure_message}
                </div>
              )}

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem label="Channel" value={`${payoutChannelLabel(withdrawal.channel_code)} (${withdrawal.channel_code})`} />
                <DetailItem label="Nomor Rekening" value={withdrawal.bank_account_number} />
                <DetailItem label="Pemilik Rekening" value={withdrawal.bank_account_holder_name} />
                <DetailItem label="Xendit Status" value={withdrawal.xendit_status || "-"} />
                <DetailItem label="Xendit Reference" value={withdrawal.xendit_reference_id || "-"} />
                <DetailItem label="Xendit Payout ID" value={withdrawal.xendit_payout_id || "-"} />
                <DetailItem label="Failure Code" value={withdrawal.failure_code || "-"} />
                <DetailItem label="Requested By" value={String(withdrawal.requested_by_user_id ?? "-")} />
                <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 sm:col-span-2">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Catatan Organizer</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {withdrawal.organizer_note || "-"}
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light text-success-hover">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Status Timeline</h2>
                  <p className="text-sm text-slate-500">Waktu dari backend payout.</p>
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 text-sm leading-6 text-slate-600">
                {withdrawalStatusDescription(withdrawal.status)}
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Diajukan</dt>
                  <dd className="text-right font-semibold text-slate-950">{formatFinanceDate(withdrawal.requested_at)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Diproses</dt>
                  <dd className="text-right font-semibold text-slate-950">{formatFinanceDate(withdrawal.processed_at)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Berhasil</dt>
                  <dd className="text-right font-semibold text-slate-950">{formatFinanceDate(withdrawal.succeeded_at)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <dt className="text-slate-500">Gagal</dt>
                  <dd className="text-right font-semibold text-slate-950">{formatFinanceDate(withdrawal.failed_at)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-500">Dibatalkan</dt>
                  <dd className="text-right font-semibold text-slate-950">{formatFinanceDate(withdrawal.cancelled_at)}</dd>
                </div>
              </dl>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
