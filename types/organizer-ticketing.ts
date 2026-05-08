import type { Event, OrganizerEventCard } from "@/types/event";

export type OrganizerApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN_EVENT_ACCESS"
  | "VALIDATION_METHOD_INVALID"
  | "VALIDATION_PAYLOAD_INVALID"
  | "INVALID_QR_TOKEN"
  | "TICKET_NOT_FOUND"
  | "TICKET_EVENT_MISMATCH"
  | "TICKET_NOT_CHECKIN_ELIGIBLE"
  | "ALREADY_CHECKED_IN"
  | "INVALID_INPUT";

export interface OrganizerApiErrorResponse {
  success?: boolean;
  message?: string;
  error_code?: OrganizerApiErrorCode;
}

export interface OrganizerEventListResponse {
  success: boolean;
  message: string;
  total: number;
  data: OrganizerEventCard[];
}

export interface OrganizerEventDetailResponse {
  success: boolean;
  message: string;
  data: Event;
}

export type OrganizerTicketType = "free" | "paid";

export interface OrganizerTicketCategoryMutationItem {
  id?: string;
  name: string;
  price: number;
  quota: number;
  description?: string;
  start_date_time: string;
  end_date_time: string;
  type: OrganizerTicketType;
}

export interface OrganizerUpdateTicketCategoriesPayload {
  actions: {
    added: OrganizerTicketCategoryMutationItem[];
    updated: OrganizerTicketCategoryMutationItem[];
    deleted_ids: string[];
  };
}

export interface OrganizerMutationResponse {
  success: boolean;
  message: string;
}

export type OrganizerValidationMethod = "qr" | "manual";

export interface OrganizerValidateTicketByQrPayload {
  validation_method: "qr";
  qr_token: string;
  checkpoint_name?: string;
  device_label?: string;
}

export interface OrganizerValidateTicketByManualPayload {
  validation_method: "manual";
  manual_code: string;
  checkpoint_name?: string;
  device_label?: string;
}

export type OrganizerValidateTicketPayload =
  | OrganizerValidateTicketByQrPayload
  | OrganizerValidateTicketByManualPayload;

export interface OrganizerValidatedTicket {
  ticket_id: string;
  ticket_number: string;
  manual_code: string;
  event_id: string;
  participant_name: string;
  ticket_status: string;
  checked_in_at: string;
  validation_method: OrganizerValidationMethod;
}

export interface OrganizerValidateTicketResponse {
  success: boolean;
  message: string;
  data: OrganizerValidatedTicket;
}

export interface OrganizerPagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface OrganizerCheckInHistoryItem {
  id: string;
  ticket_id: string;
  ticket_number: string;
  participant_name: string;
  validation_method: OrganizerValidationMethod;
  result: "success" | "failed";
  error_code: OrganizerApiErrorCode | null;
  scanner_user_id: number;
  checkpoint_name: string;
  device_label: string;
  created_at: string;
}

export interface OrganizerCheckInHistoryData {
  items: OrganizerCheckInHistoryItem[];
  pagination: OrganizerPagination;
}

export interface OrganizerCheckInHistoryResponse {
  success: boolean;
  message: string;
  data: OrganizerCheckInHistoryData;
}

export interface OrganizerParticipantItem {
  ticket_id: string;
  ticket_number: string;
  manual_code: string;
  ticket_status: string;
  attendance_state: "not_checked_in" | "checked_in";
  checked_in_at: string | null;
  participant_name: string;
  participant_email: string;
  participant_phone: string;
  ticket_category_id: string;
  ticket_category_name: string;
  order_id: string;
  ticket_owner_user_id: number;
}

export interface OrganizerParticipantsData {
  items: OrganizerParticipantItem[];
  pagination: OrganizerPagination;
}

export interface OrganizerParticipantsResponse {
  success: boolean;
  message: string;
  data: OrganizerParticipantsData;
}

export interface OrganizerPagingParams {
  page?: number;
  limit?: number;
}
