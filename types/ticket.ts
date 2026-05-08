export type TicketStatus =
  | "issued"
  | "checked_in"
  | "cancelled"
  | "refunded"
  | "invalidated";

export interface TicketApiError {
  success?: boolean;
  message?: string;
  error_code?: string;
}

export interface TicketPagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface MyTicketListItem {
  id: string;
  ticket_number: string;
  status: TicketStatus;
  event_id: string;
  event_title: string;
  ticket_category_id: string;
  ticket_category_name: string;
  participant_name: string;
  qr_code: string;
  issued_at: string;
}

export interface MyTicketsListData {
  items: MyTicketListItem[];
  pagination: TicketPagination;
}

export interface MyTicketsListResponse {
  success: boolean;
  message: string;
  data: unknown;
  pagination?: Partial<TicketPagination>;
  error_code?: string;
}

export interface MyTicketDetail {
  id: string;
  ticket_number: string;
  status: TicketStatus;
  event: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
  };
  category: {
    id: string;
    name: string;
  };
  participant: {
    full_name: string;
    email: string;
    phone: string;
  };
  qr_code: string;
  checked_in_at: string | null;
  issued_at: string;
}

export interface MyTicketDetailResponse {
  success: boolean;
  message: string;
  data: unknown;
  error_code?: string;
}

export interface GetMyTicketsParams {
  page?: number;
  limit?: number;
  status?: TicketStatus | string;
  event_id?: string;
}
