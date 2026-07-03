"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Landmark,
  Loader2,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { FinanceNavigation } from "@/components/organizer/finance/FinanceNavigation";
import {
  formatFinanceCurrency,
  formatFinanceDate,
  withdrawalStatusLabel,
} from "@/components/organizer/finance/finance-format";
import { Button } from "@/components/ui/button";
import { OrganizerFinanceService } from "@/services/organizer-finance-service";
import type { OrganizerWithdrawal } from "@/types/organizer-finance";

function StatusPill({ status }: { status: string }) {
  const requested = status === "requested";
  return (
    <span
      className={
        requested
          ? "inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning-light px-2.5 py-1 text-[11px] font-semibold text-warning-hover"
          : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
      }
    >
      <span className={requested ? "size-1.5 rounded-full bg-warning-hover" : "size-1.5 rounded-full bg-slate-400"} />
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

export default function WithdrawalDetailPage({
  params,
}: {
  params: Promise<{ withdrawal_id: string }>;
}) {
  const { withdrawal_id } = use(params);
  const [withdrawal, setWithdrawal] = useState<OrganizerWithdrawal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadWithdrawal = async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      const data = await OrganizerFinanceService.getWithdrawalDetail(withdrawal_id);
      setWithdrawal(data);
    } catch {
      toast.error("Gagal memuat detail pencairan.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWithdrawal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawal_id]);

  const cancelWithdrawal = async () => {
    if (!withdrawal || withdrawal.status !== "requested") return;

    setIsCancelling(true);
    try {
      const data = await OrganizerFinanceService.cancelWithdrawal(withdrawal.id);
      setWithdrawal(data);
      toast.success("Pencairan dibatalkan.");
    } catch {
      toast.error("Gagal membatalkan pencairan.");
    } finally {
      setIsCancelling(false);
    }
  };

  const copyReport = async () => {
    if (!withdrawal?.whatsapp_message) return;
    await navigator.clipboard.writeText(withdrawal.whatsapp_message);
    toast.success("Laporan WhatsApp disalin.");
  };

  const whatsappHref = withdrawal?.whatsapp_message
    ? `https://wa.me/?text=${encodeURIComponent(withdrawal.whatsapp_message)}`
    : "#";

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
          <DetailHeaderGraphic />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Button
                asChild
                variant="ghost"
                className="mb-3 -ml-3 h-9 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-primary"
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
                Detail Pencairan
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Lihat informasi rekening, status pengajuan, dan laporan WhatsApp pencairan.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => loadWithdrawal(true)}
              disabled={isRefreshing}
              className="h-10 w-fit rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Muat Ulang
            </Button>
          </div>
        </section>

        <FinanceNavigation />

        {isLoading ? (
          <section className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm font-medium text-slate-500 shadow-sm shadow-slate-900/5">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            Memuat detail pencairan...
          </section>
        ) : !withdrawal ? (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 shadow-sm shadow-slate-900/5">
            Pencairan tidak ditemukan.
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-400">{withdrawal.id}</p>
                  <h2 className="mt-2 text-xl font-semibold leading-none text-slate-950 tabular-nums md:text-2xl">
                    {formatFinanceCurrency(withdrawal.amount, withdrawal.currency)}
                  </h2>
                </div>
                <StatusPill status={withdrawal.status} />
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Bank</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{withdrawal.bank_name}</dd>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Nomor Rekening</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-slate-950">
                    {withdrawal.bank_account_number}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Pemilik Rekening</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {withdrawal.bank_account_holder_name}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Tanggal Pengajuan</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatFinanceDate(withdrawal.requested_at || withdrawal.created_at)}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Tanggal Batal</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatFinanceDate(withdrawal.cancelled_at)}
                  </dd>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 sm:col-span-2">
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Catatan Organizer</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {withdrawal.organizer_note || "-"}
                  </dd>
                </div>
              </dl>

              {withdrawal.status === "requested" && (
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl border-danger/20 bg-white text-sm font-semibold text-danger hover:bg-danger-light hover:text-danger"
                    onClick={cancelWithdrawal}
                    disabled={isCancelling}
                  >
                    {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Batalkan Pencairan
                  </Button>
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-light text-success-hover">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Laporan WhatsApp</h2>
                  <p className="text-sm text-slate-500">Format laporan dari sistem.</p>
                </div>
              </div>
              <div className="mt-5 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm leading-6 text-slate-700">
                {withdrawal.whatsapp_message || "Laporan WhatsApp tidak tersedia."}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={copyReport}
                  type="button"
                  className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                >
                  <Copy className="h-4 w-4" />
                  Salin Laporan
                </Button>
                <Button asChild disabled={!withdrawal.whatsapp_message} className="h-10 rounded-xl text-sm font-semibold">
                  <a href={whatsappHref} target="_blank" rel="noreferrer">
                    <Send className="h-4 w-4" />
                    Kirim WhatsApp
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
