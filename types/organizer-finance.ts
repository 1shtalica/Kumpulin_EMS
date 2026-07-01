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

export type OrganizerWithdrawalStatus = "requested" | "cancelled";

export interface OrganizerWithdrawal {
  id: string;
  organizer_id: string;
  amount: number;
  currency: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_holder_name: string;
  organizer_note?: string;
  whatsapp_message: string;
  status: OrganizerWithdrawalStatus;
  requested_at: string;
  cancelled_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWithdrawalRequest {
  amount: number;
  bank_name: string;
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