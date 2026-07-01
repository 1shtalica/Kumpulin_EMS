import type {
  OrganizerLedgerType,
  OrganizerWithdrawalStatus,
} from "@/types/organizer-finance";

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
    withdrawal_cancelled: "Withdrawal Dibatalkan",
  };

  return labels[type] ?? type;
}

export function withdrawalStatusLabel(status: OrganizerWithdrawalStatus | string) {
  const labels: Record<string, string> = {
    requested: "Diajukan",
    cancelled: "Dibatalkan",
  };

  return labels[status] ?? status;
}