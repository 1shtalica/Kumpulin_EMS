"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
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
          ? "rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700"
          : "rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600"
      }
    >
      {withdrawalStatusLabel(status)}
    </span>
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
      toast.error("Gagal memuat detail withdrawal.");
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
      toast.success("Withdrawal dibatalkan.");
    } catch {
      toast.error("Gagal membatalkan withdrawal.");
    } finally {
      setIsCancelling(false);
    }
  };

  const copyReport = async () => {
    if (!withdrawal?.whatsapp_message) return;
    await navigator.clipboard.writeText(withdrawal.whatsapp_message);
    toast.success("Report WhatsApp disalin.");
  };

  const whatsappHref = withdrawal?.whatsapp_message
    ? `https://wa.me/?text=${encodeURIComponent(withdrawal.whatsapp_message)}`
    : "#";

  return (
    <main className="relative -mx-6 min-h-[calc(100vh-136px)] bg-[#f9fafb] px-4 py-5 md:-mx-8 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button asChild variant="ghost" className="mb-3 -ml-3">
              <Link href="/organizer/finance/withdrawals">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Detail Withdrawal
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Informasi pencairan dan report WhatsApp yang dibuat backend.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => loadWithdrawal(true)}
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

        <FinanceNavigation />

        {isLoading ? (
          <section className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memuat detail withdrawal...
          </section>
        ) : !withdrawal ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Withdrawal tidak ditemukan.
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-400">{withdrawal.id}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    {formatFinanceCurrency(withdrawal.amount, withdrawal.currency)}
                  </h2>
                </div>
                <StatusPill status={withdrawal.status} />
              </div>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Bank</dt>
                  <dd className="mt-1 font-semibold text-slate-950">{withdrawal.bank_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Nomor Rekening</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-slate-950">
                    {withdrawal.bank_account_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Pemilik Rekening</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {withdrawal.bank_account_holder_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Tanggal Pengajuan</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatFinanceDate(withdrawal.requested_at || withdrawal.created_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Tanggal Batal</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatFinanceDate(withdrawal.cancelled_at)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-slate-500">Catatan Organizer</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {withdrawal.organizer_note || "-"}
                  </dd>
                </div>
              </dl>

              {withdrawal.status === "requested" && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={cancelWithdrawal}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Batalkan Withdrawal
                  </Button>
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">Report WhatsApp</h2>
              <div className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
                {withdrawal.whatsapp_message || "Report WhatsApp tidak tersedia."}
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={copyReport} type="button">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Report
                </Button>
                <Button asChild disabled={!withdrawal.whatsapp_message}>
                  <a href={whatsappHref} target="_blank" rel="noreferrer">
                    <Send className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                    <ExternalLink className="ml-2 h-3 w-3" />
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