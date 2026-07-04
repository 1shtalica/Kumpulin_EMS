export interface OrganizerFinancePagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface OrganizerFinancePaginatedData<T> {
  items: T[];
  pagination: OrganizerFinancePagination;
}

export interface OrganizerFinanceApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OrganizerBalance {
  organizer_id: string;
  currency: string;
  pending_amount: number;
  available_amount: number;
  requested_withdrawal_amount: number;
  updated_at: string;
}

export type OrganizerLedgerType =
  | "earning_pending"
  | "earning_available"
  | "withdrawal_requested"
  | "withdrawal_processing"
  | "withdrawal_succeeded"
  | "withdrawal_failed"
  | "withdrawal_cancelled";

export interface OrganizerLedgerEntry {
  id: string;
  organizer_id: string;
  type: OrganizerLedgerType;
  currency: string;
  amount: number;
  balance_before?: number;
  balance_after?: number;
  order_id?: string | null;
  withdrawal_id?: string | null;
  description?: string;
  created_at: string;
}

export type OrganizerWithdrawalStatus =
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled";

export type PayoutChannelCode = "ID_BCA" | "ID_BNI" | "ID_BRI" | "ID_MANDIRI";

export interface PayoutChannelOption {
  label: string;
  value: PayoutChannelCode;
}

export const PAYOUT_CHANNELS: PayoutChannelOption[] = [
  { label: "BCA", value: "ID_BCA" },
  { label: "BNI", value: "ID_BNI" },
  { label: "BRI", value: "ID_BRI" },
  { label: "Mandiri", value: "ID_MANDIRI" },
];

export interface OrganizerWithdrawal {
  id: string;
  organizer_id: string;
  requested_by_user_id: number;
  amount: number;
  currency: string;
  channel_code: string;
  bank_account_number: string;
  bank_account_holder_name: string;
  organizer_note?: string | null;
  status: OrganizerWithdrawalStatus;
  xendit_payout_id?: string | null;
  xendit_reference_id: string;
  xendit_status: string;
  failure_code?: string | null;
  failure_message?: string | null;
  requested_at: string;
  processed_at?: string | null;
  succeeded_at?: string | null;
  failed_at?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  channel_code: string;
  bank_account_number: string;
  bank_account_holder_name: string;
  organizer_note?: string;
}

export interface OrganizerLedgerParams {
  page?: number;
  limit?: number;
  type?: OrganizerLedgerType | "";
}

export interface OrganizerWithdrawalListParams {
  page?: number;
  limit?: number;
  status?: OrganizerWithdrawalStatus | "";
}
