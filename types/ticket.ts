/**
 * Types untuk Ticket, sesuai dengan response backend API
 */

/** Filter tab di halaman My Ticket */
export type TicketFilterType = "mendatang" | "riwayat";

/** Item di list GET /my-tickets */
export interface MyTicketItemResponse {
  id: string;
  ticket_number: string;
  status: string;
  event_id: string;
  event_title: string;
  ticket_category_id: string;
  ticket_category_name: string;
  participant_name: string;
  qr_code: string;
  issued_at: string;
}

/** Response dari GET /my-tickets/:ticket_id */
export interface MyTicketDetailResponse {
  id: string;
  ticket_number: string;
  status: string;
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
    email?: string;
    phone?: string;
  };
  qr_code: string;
  checked_in_at?: string;
  issued_at: string;
}

/** Status tiket dari backend */
export const TICKET_STATUS = {
  ISSUED: "issued",
  CHECKED_IN: "checked_in",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  INVALIDATED: "invalidated",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
