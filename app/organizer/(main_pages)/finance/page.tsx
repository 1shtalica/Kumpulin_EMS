"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Landmark,
  Loader2,
  RefreshCw,
  Send,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { FinanceNavigation } from "@/components/organizer/finance/FinanceNavigation";
import {
  formatFinanceCurrency,
  formatFinanceDate,
  withdrawalStatusLabel,
} from "@/components/organizer/finance/finance-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrganizerFinanceService } from "@/services/organizer-finance-service";
import type {
  CreateWithdrawalRequest,
  OrganizerBalance,
  OrganizerWithdrawal,
} from "@/types/organizer-finance";

const initialForm: CreateWithdrawalRequest = {
  amount: 0,
  bank_name: "",
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
      <path
        d="M24 132C64 86 98 70 132 78C172 88 190 118 242 82"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <path
        d="M50 150C94 114 130 104 164 114C202 126 214 142 266 108"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="2"
      />
      <rect
        x="164"
        y="28"
        width="76"
        height="54"
        rx="16"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="2"
      />
      <rect x="184" y="48" width="36" height="5" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <rect x="184" y="61" width="22" height="5" rx="2.5" fill="currentColor" fillOpacity="0.1" />
      <path
        d="M70 74H118M70 92H140M70 110H106"
        stroke="#10b981"
        strokeOpacity="0.16"
        strokeWidth="8"
        strokeLinecap="round"
      />
    </svg>
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
    <article className={`rounded-2xl border bg-white p-4 shadow-sm shadow-slate-900/5 ${toneClass.border}`}>
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
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export default function OrganizerFinancePage() {
  const [balance, setBalance] = useState<OrganizerBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateWithdrawalRequest>(initialForm);
  const [createdWithdrawal, setCreatedWithdrawal] =
    useState<OrganizerWithdrawal | null>(null);

  const loadBalance = async (refreshing = false) => {
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
  };

  useEffect(() => {
    loadBalance();
  }, []);

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
    if (!form.bank_name.trim()) return "Nama bank wajib diisi.";
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
        ...form,
        bank_name: form.bank_name.trim(),
        bank_account_number: form.bank_account_number.trim(),
        bank_account_holder_name: form.bank_account_holder_name.trim(),
        organizer_note: form.organizer_note?.trim(),
      });
      setCreatedWithdrawal(withdrawal);
      setForm(initialForm);
      toast.success("Pencairan berhasil diajukan.");
      await loadBalance(true);
    } catch {
      toast.error("Gagal mengajukan pencairan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReport = async () => {
    if (!createdWithdrawal?.whatsapp_message) return;
    await navigator.clipboard.writeText(createdWithdrawal.whatsapp_message);
    toast.success("Laporan WhatsApp disalin.");
  };

  const whatsappHref = createdWithdrawal?.whatsapp_message
    ? `https://wa.me/?text=${encodeURIComponent(createdWithdrawal.whatsapp_message)}`
    : "#";

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
        <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
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
                Pantau saldo acara, cek dana yang siap dicairkan, dan ajukan pencairan manual.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadBalance(true)}
              disabled={isRefreshing}
              className="h-10 w-fit rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Muat Ulang Saldo
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
            title="Sudah Diajukan"
            description={`Diperbarui ${formatFinanceDate(balance?.updated_at)}`}
            value={formatFinanceCurrency(balance?.requested_withdrawal_amount ?? 0, balance?.currency)}
            isLoading={isLoading}
            tone="primary"
            Icon={Banknote}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/5 sm:p-5"
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">
                    Ajukan Pencairan
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-500">
                    Nominal divalidasi terhadap saldo tersedia.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm">
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                  Nominal
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={form.amount || ""}
                  onChange={(event) => updateForm("amount", event.target.value)}
                  placeholder="500000"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name" className="text-sm font-medium text-slate-700">
                  Bank
                </Label>
                <Input
                  id="bank_name"
                  value={form.bank_name}
                  onChange={(event) => updateForm("bank_name", event.target.value)}
                  placeholder="BCA"
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                />
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
                  Catatan
                </Label>
                <Textarea
                  id="organizer_note"
                  value={form.organizer_note}
                  onChange={(event) => updateForm("organizer_note", event.target.value)}
                  placeholder="Catatan internal untuk pencairan ini"
                  rows={4}
                  className="min-h-28 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <Button
              className="mt-6 h-10 w-full rounded-xl text-sm font-semibold sm:w-auto"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              Ajukan Pencairan
            </Button>
          </form>

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

            {createdWithdrawal ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-950">
                      {withdrawalStatusLabel(createdWithdrawal.status)}
                    </p>
                    <span className="rounded-full border border-primary/15 bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                      Pencairan
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-950 tabular-nums">
                    {formatFinanceCurrency(createdWithdrawal.amount, createdWithdrawal.currency)}
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-700">
                  {createdWithdrawal.whatsapp_message}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={copyReport}
                    type="button"
                    className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                  >
                    <Copy className="h-4 w-4" />
                    Salin Laporan
                  </Button>
                  <Button asChild className="h-10 rounded-xl text-sm font-semibold">
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <Send className="h-4 w-4" />
                      Kirim WhatsApp
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600">
                Setelah pencairan berhasil diajukan, laporan dari sistem akan tampil di sini untuk disalin atau dikirim melalui WhatsApp.
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
