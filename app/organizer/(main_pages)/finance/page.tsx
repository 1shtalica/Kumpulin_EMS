"use client";

import { FormEvent, useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, RefreshCw, Send, Wallet } from "lucide-react";
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
      toast.success("Withdrawal berhasil diajukan.");
      await loadBalance(true);
    } catch {
      toast.error("Gagal mengajukan withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReport = async () => {
    if (!createdWithdrawal?.whatsapp_message) return;
    await navigator.clipboard.writeText(createdWithdrawal.whatsapp_message);
    toast.success("Report WhatsApp disalin.");
  };

  const whatsappHref = createdWithdrawal?.whatsapp_message
    ? `https://wa.me/?text=${encodeURIComponent(createdWithdrawal.whatsapp_message)}`
    : "#";

  return (
    <main className="relative -mx-6 min-h-[calc(100vh-136px)] bg-[#f9fafb] px-4 py-5 md:-mx-8 md:px-8 md:py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Keuangan Organizer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau saldo event dan ajukan pencairan dana manual.
          </p>
        </div>

        <FinanceNavigation />

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Pending</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">
              {isLoading ? "..." : formatFinanceCurrency(balance?.pending_amount ?? 0, balance?.currency)}
            </p>
            <p className="mt-2 text-xs text-slate-400">Belum dapat ditarik</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-emerald-700">Tersedia</p>
            <p className="mt-3 text-2xl font-bold text-emerald-950">
              {isLoading ? "..." : formatFinanceCurrency(balance?.available_amount ?? 0, balance?.currency)}
            </p>
            <p className="mt-2 text-xs text-emerald-700/70">Dapat diajukan withdrawal</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Sudah Diajukan</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">
              {isLoading ? "..." : formatFinanceCurrency(balance?.requested_withdrawal_amount ?? 0, balance?.currency)}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Update terakhir {formatFinanceDate(balance?.updated_at)}
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => loadBalance(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Saldo
          </Button>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Ajukan Withdrawal
                </h2>
                <p className="text-sm text-slate-500">
                  Nominal akan divalidasi terhadap saldo tersedia.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amount">Nominal</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={form.amount || ""}
                  onChange={(event) => updateForm("amount", event.target.value)}
                  placeholder="500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank</Label>
                <Input
                  id="bank_name"
                  value={form.bank_name}
                  onChange={(event) => updateForm("bank_name", event.target.value)}
                  placeholder="BCA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Nomor Rekening</Label>
                <Input
                  id="bank_account_number"
                  value={form.bank_account_number}
                  onChange={(event) => updateForm("bank_account_number", event.target.value)}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bank_account_holder_name">Nama Pemilik Rekening</Label>
                <Input
                  id="bank_account_holder_name"
                  value={form.bank_account_holder_name}
                  onChange={(event) => updateForm("bank_account_holder_name", event.target.value)}
                  placeholder="Nama Organizer"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="organizer_note">Catatan</Label>
                <Textarea
                  id="organizer_note"
                  value={form.organizer_note}
                  onChange={(event) => updateForm("organizer_note", event.target.value)}
                  placeholder="Withdraw event revenue"
                  rows={4}
                />
              </div>
            </div>

            <Button className="mt-6 w-full sm:w-auto" disabled={isSubmitting || isLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajukan Withdrawal
            </Button>
          </form>

          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Report WhatsApp</h2>
            {createdWithdrawal ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-950">
                    Status: {withdrawalStatusLabel(createdWithdrawal.status)}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {formatFinanceCurrency(createdWithdrawal.amount, createdWithdrawal.currency)}
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
                  {createdWithdrawal.whatsapp_message}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={copyReport} type="button">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Report
                  </Button>
                  <Button asChild>
                    <a href={whatsappHref} target="_blank" rel="noreferrer">
                      <Send className="mr-2 h-4 w-4" />
                      Send via WhatsApp
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Setelah withdrawal berhasil diajukan, report dari backend akan tampil di sini untuk disalin atau dikirim melalui WhatsApp.
              </p>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}