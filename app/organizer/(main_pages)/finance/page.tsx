"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Landmark,
  Loader2,
  RefreshCw,
  Wallet,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrganizerFinanceService } from "@/services/organizer-finance-service";
import {
  PAYOUT_CHANNELS,
  type CreateWithdrawalRequest,
  type OrganizerBalance,
  type OrganizerWithdrawal,
  type OrganizerWithdrawalStatus,
} from "@/types/organizer-finance";

const initialForm: CreateWithdrawalRequest = {
  amount: 0,
  channel_code: "",
  bank_account_number: "",
  bank_account_holder_name: "",
  organizer_note: "",
};

type BalanceCardTone = "neutral" | "success" | "primary";

type BalanceCardProps = {
  title: string;
  description: string;
  value: string;
  isLoading: boolean;
  tone: BalanceCardTone;
  Icon: typeof Wallet;
};

function FinanceHeaderGraphic() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 right-0 hidden h-44 w-72 translate-x-10 translate-y-8 text-primary md:block"
      viewBox="0 0 288 176"
      fill="none"
      aria-hidden="true"
    >
      <path d="M24 132C64 86 98 70 132 78C172 88 190 118 242 82" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <path d="M50 150C94 114 130 104 164 114C202 126 214 142 266 108" stroke="currentColor" strokeOpacity="0.08" strokeWidth="2" />
      <rect x="164" y="28" width="76" height="54" rx="16" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
      <rect x="184" y="48" width="36" height="5" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <rect x="184" y="61" width="22" height="5" rx="2.5" fill="currentColor" fillOpacity="0.1" />
      <path d="M70 74H118M70 92H140M70 110H106" stroke="#10b981" strokeOpacity="0.16" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function statusPillClass(status: OrganizerWithdrawalStatus) {
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
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusPillClass(status)}`}>
      <span className={`size-1.5 rounded-full ${dotClass[status]}`} />
      {withdrawalStatusLabel(status)}
    </span>
  );
}

function BalanceCard({ title, description, value, isLoading, tone, Icon }: BalanceCardProps) {
  const toneClass = {
    neutral: {
      icon: "bg-slate-100 text-slate-500",
      dot: "bg-slate-400",
      border: "border-slate-200/80",
      text: "text-slate-950",
    },
    success: {
      icon: "bg-success-light text-success-hover",
      dot: "bg-success",
      border: "border-success/20",
      text: "text-success-hover",
    },
    primary: {
      icon: "bg-primary-light text-primary",
      dot: "bg-primary",
      border: "border-primary/15",
      text: "text-slate-950",
    },
  }[tone];

  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm shadow-slate-900/5 ${toneClass.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
            <span className={`size-1.5 rounded-full ${toneClass.dot}`} />
            {title}
          </div>
          <p className={`mt-3 text-xl font-semibold leading-none tabular-nums md:text-2xl ${toneClass.text}`}>
            {isLoading ? "..." : value}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClass.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export default function OrganizerFinancePage() {
  const [balance, setBalance] = useState<OrganizerBalance | null>(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState<OrganizerWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateWithdrawalRequest>(initialForm);
  const [createdWithdrawal, setCreatedWithdrawal] = useState<OrganizerWithdrawal | null>(null);

  const loadBalance = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      const data = await OrganizerFinanceService.getBalance();
      setBalance(data);
    } catch {
      toast.error("Gagal memuat saldo organizer.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadRecentWithdrawals = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) setIsRefreshing(true);
      const data = await OrganizerFinanceService.getWithdrawals({ page: 1, limit: 5 });
      setRecentWithdrawals(data.items);
    } catch {
      toast.error("Gagal memuat riwayat payout.");
    } finally {
      setIsRecentLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshFinanceData = useCallback(async (refreshing = false) => {
    await Promise.all([loadBalance(refreshing), loadRecentWithdrawals(refreshing)]);
  }, [loadBalance, loadRecentWithdrawals]);

  useEffect(() => {
    refreshFinanceData();
  }, [refreshFinanceData]);

  const updateForm = (key: keyof CreateWithdrawalRequest, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: key === "amount" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (!balance) return "Saldo belum tersedia.";
    if (!form.amount || form.amount <= 0) return "Nominal harus lebih dari 0.";
    if (form.amount > balance.available_amount) {
      return "Nominal tidak boleh melebihi saldo tersedia.";
    }
    if (!form.channel_code.trim()) return "Channel payout wajib dipilih.";
    if (!form.bank_account_number.trim()) return "Nomor rekening wajib diisi.";
    if (!form.bank_account_holder_name.trim()) {
      return "Nama pemilik rekening wajib diisi.";
    }
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validateForm();
    if (message) {
      toast.error(message);
      return;
    }

    setIsSubmitting(true);
    try {
      const withdrawal = await OrganizerFinanceService.createWithdrawal({
        amount: form.amount,
        channel_code: form.channel_code.trim(),
        bank_account_number: form.bank_account_number.trim(),
        bank_account_holder_name: form.bank_account_holder_name.trim(),
        organizer_note: form.organizer_note?.trim(),
      });
      setCreatedWithdrawal(withdrawal);
      setForm(initialForm);
      toast.success("Payout berhasil diajukan ke Xendit.");
      await refreshFinanceData(true);
    } catch {
      toast.error("Gagal mengajukan payout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availablePercent = useMemo(() => {
    if (!balance) return 0;
    const total =
      balance.pending_amount +
      balance.available_amount +
      balance.requested_withdrawal_amount;
    if (total <= 0) return 0;
    return Math.round((balance.available_amount / total) * 100);
  }, [balance]);

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
        <section className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
          <FinanceHeaderGraphic />
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                Ruang kerja organizer
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                Keuangan Organizer
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Pantau saldo acara, ajukan payout otomatis melalui Xendit, dan cek status pencairan terbaru.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => refreshFinanceData(true)}
              disabled={isRefreshing}
              className="h-10 w-fit rounded-lg border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Muat Ulang
            </Button>
          </div>
        </section>

        <FinanceNavigation />

        <section className="grid gap-4 md:grid-cols-3">
          <BalanceCard
            title="Menunggu"
            description="Pendapatan masih menunggu periode penyelesaian."
            value={formatFinanceCurrency(balance?.pending_amount ?? 0, balance?.currency)}
            isLoading={isLoading}
            tone="neutral"
            Icon={Clock3}
          />
          <BalanceCard
            title="Tersedia"
            description={`${availablePercent}% dari saldo tercatat siap diajukan.`}
            value={formatFinanceCurrency(balance?.available_amount ?? 0, balance?.currency)}
            isLoading={isLoading}
            tone="success"
            Icon={CheckCircle2}
          />
          <BalanceCard
            title="Dalam Payout"
            description={`Diperbarui ${formatFinanceDate(balance?.updated_at)}`}
            value={formatFinanceCurrency(balance?.requested_withdrawal_amount ?? 0, balance?.currency)}
            isLoading={isLoading}
            tone="primary"
            Icon={Banknote}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-primary/10" />
            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-950">Ajukan Payout</h2>
                      <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                        Xendit
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Kirim dana ke rekening organizer sesuai saldo tersedia.
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm sm:text-right">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Saldo tersedia
                  </p>
                  <p className="mt-1 font-semibold text-slate-950 tabular-nums">
                    {isLoading
                      ? "..."
                      : formatFinanceCurrency(balance?.available_amount ?? 0, balance?.currency)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4">
                  <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                    Nominal Payout
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    value={form.amount || ""}
                    onChange={(event) => updateForm("amount", event.target.value)}
                    placeholder="500000"
                    className="mt-2 h-11 rounded-xl border-slate-200 bg-white text-base font-semibold tabular-nums focus-visible:border-primary/40 focus-visible:ring-primary/20"
                  />
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Maksimal {formatFinanceCurrency(balance?.available_amount ?? 0, balance?.currency)}.
                  </p>
                </div>

                <div className="rounded-xl border border-primary/15 bg-primary-light/50 p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                    Status saldo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {balance && balance.available_amount > 0 ? "Siap dicairkan" : "Belum tersedia"}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    Saldo akan berpindah ke dalam payout setelah request berhasil dibuat.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="channel_code" className="text-sm font-medium text-slate-700">
                    Channel Bank
                  </Label>
                  <select
                    id="channel_code"
                    value={form.channel_code}
                    onChange={(event) => updateForm("channel_code", event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Pilih bank</option>
                    {PAYOUT_CHANNELS.map((channel) => (
                      <option key={channel.value} value={channel.value}>
                        {channel.label} - {channel.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number" className="text-sm font-medium text-slate-700">
                    Nomor Rekening
                  </Label>
                  <Input
                    id="bank_account_number"
                    value={form.bank_account_number}
                    onChange={(event) => updateForm("bank_account_number", event.target.value)}
                    placeholder="1234567890"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bank_account_holder_name" className="text-sm font-medium text-slate-700">
                    Nama Pemilik Rekening
                  </Label>
                  <Input
                    id="bank_account_holder_name"
                    value={form.bank_account_holder_name}
                    onChange={(event) => updateForm("bank_account_holder_name", event.target.value)}
                    placeholder="Nama organizer"
                    className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="organizer_note" className="text-sm font-medium text-slate-700">
                    Catatan Opsional
                  </Label>
                  <Textarea
                    id="organizer_note"
                    value={form.organizer_note}
                    onChange={(event) => updateForm("organizer_note", event.target.value)}
                    placeholder="Withdraw event revenue"
                    rows={3}
                    className="min-h-24 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-slate-500">
                  Status payout diperbarui dari webhook backend Xendit.
                </p>
                <Button
                  className="h-10 w-full rounded-xl text-sm font-semibold sm:w-auto"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                  Ajukan Payout
                </Button>
              </div>
            </div>
          </form>

          <aside className="space-y-4">
            <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light text-success-hover">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Payout Terbaru</h2>
                  <p className="text-sm text-slate-500">Status dari backend Xendit.</p>
                </div>
              </div>

              {createdWithdrawal ? (
                <div className="mt-5 space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/80 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <StatusPill status={createdWithdrawal.status} />
                    <span className="font-semibold text-slate-950 tabular-nums">
                      {formatFinanceCurrency(createdWithdrawal.amount, createdWithdrawal.currency)}
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-600">
                    {withdrawalStatusDescription(createdWithdrawal.status)}
                  </p>
                  {createdWithdrawal.status === "failed" && createdWithdrawal.failure_message && (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-red-600">
                      {createdWithdrawal.failure_message}
                    </p>
                  )}
                  <dl className="grid gap-2 text-xs text-slate-500">
                    <div className="flex justify-between gap-3">
                      <dt>Channel</dt>
                      <dd className="font-medium text-slate-700">{payoutChannelLabel(createdWithdrawal.channel_code)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Reference</dt>
                      <dd className="font-mono text-slate-700">{createdWithdrawal.xendit_reference_id || "-"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Xendit</dt>
                      <dd className="font-medium text-slate-700">{createdWithdrawal.xendit_status || "-"}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600">
                  Setelah payout dibuat, status pemrosesan Xendit akan tampil di sini.
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-950">Riwayat Singkat</h2>
                <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg px-2 text-xs font-semibold text-primary">
                  <Link href="/organizer/finance/withdrawals">Lihat semua</Link>
                </Button>
              </div>

              {isRecentLoading ? (
                <div className="mt-4 flex items-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                  Memuat riwayat...
                </div>
              ) : recentWithdrawals.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                  Belum ada payout.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {recentWithdrawals.map((withdrawal) => (
                    <Link
                      key={withdrawal.id}
                      href={`/organizer/finance/withdrawals/${withdrawal.id}`}
                      className="block rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-primary/25 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {payoutChannelLabel(withdrawal.channel_code)} - {withdrawal.bank_account_holder_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatFinanceDate(withdrawal.requested_at)}
                          </p>
                        </div>
                        <StatusPill status={withdrawal.status} />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-950 tabular-nums">
                        {formatFinanceCurrency(withdrawal.amount, withdrawal.currency)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}




