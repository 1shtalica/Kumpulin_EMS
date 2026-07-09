import type {
  OrganizerLedgerType,
  OrganizerWithdrawal,
  OrganizerWithdrawalStatus,
} from "@/types/organizer-finance";
import { PAYOUT_CHANNELS } from "@/types/organizer-finance";

export const ORGANIZER_PAYOUT_FEE_BASIS_POINTS = 250;
export const ORGANIZER_PAYOUT_FEE_LABEL = "2.5%";

export function calculateOrganizerPayoutFee(amount: number) {
  const grossAmount = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  const feeAmount = Math.ceil(
    (grossAmount * ORGANIZER_PAYOUT_FEE_BASIS_POINTS) / 10_000,
  );

  return {
    grossAmount,
    feeAmount,
    netAmount: Math.max(0, grossAmount - feeAmount),
  };
}

export function getWithdrawalFeeBreakdown(withdrawal: OrganizerWithdrawal) {
  const grossAmount = withdrawal.requested_amount ?? withdrawal.amount;
  const fallback = calculateOrganizerPayoutFee(grossAmount);
  const feeAmount = withdrawal.fee_amount ?? fallback.feeAmount;
  const netAmount = withdrawal.net_amount ?? Math.max(0, grossAmount - feeAmount);

  return {
    grossAmount,
    feeAmount,
    netAmount,
  };
}

export function formatFinanceCurrency(value: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatFinanceDate(value?: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function ledgerTypeLabel(type: OrganizerLedgerType | string) {
  const labels: Record<string, string> = {
    earning_pending: "Pendapatan Pending",
    earning_available: "Pendapatan Tersedia",
    withdrawal_requested: "Withdrawal Diajukan",
    withdrawal_processing: "Payout Diproses",
    withdrawal_succeeded: "Payout Berhasil",
    withdrawal_failed: "Payout Gagal",
    withdrawal_cancelled: "Payout Dibatalkan",
  };

  return labels[type] ?? type;
}

export function payoutChannelLabel(channelCode?: string | null) {
  if (!channelCode) return "-";
  return (
    PAYOUT_CHANNELS.find((channel) => channel.value === channelCode)?.label ??
    channelCode
  );
}

export function withdrawalStatusLabel(status: OrganizerWithdrawalStatus | string) {
  const labels: Record<string, string> = {
    processing: "Diproses",
    succeeded: "Berhasil",
    failed: "Gagal",
    cancelled: "Dibatalkan",
  };

  return labels[status] ?? status;
}

export function withdrawalStatusDescription(status: OrganizerWithdrawalStatus | string) {
  const descriptions: Record<string, string> = {
    processing: "Payout sedang diproses oleh Xendit.",
    succeeded: "Payout berhasil diselesaikan.",
    failed: "Payout gagal dan saldo dikembalikan.",
    cancelled: "Payout dibatalkan.",
  };

  return descriptions[status] ?? "Status payout terbaru dari backend.";
}
