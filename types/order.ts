/**
 * Types untuk Order, sesuai dengan response backend API
 */

export interface OrderItemResponse {
  ticket_category_id: string;
  ticket_category_name: string;
  quantity: number;
  unit_price: number;
  subtotal_amount: number;
}

export interface PaymentSummaryResponse {
  id: string;
  status: string;
  provider: string;
  external_id?: string;
  method?: string;
  amount: number;
  paid_at?: string;
}

export interface TicketSummaryInOrder {
  id: string;
  ticket_number: string;
  status: string;
  event_id: string;
  ticket_category_id: string;
  participant_name: string;
  qr_code: string;
}

export interface ParticipantResponse {
  ticket_category_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  identity_number?: string;
}

export interface OrderSummaryResponse {
  id: string;
  order_number: string;
  event_id: string;
  user_id: number;
  status: string;
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  expires_at: string;
  paid_at?: string;
  created_at: string;
}

/** Response lengkap dari GET /orders/:order_id */
export interface OrderDataResponse {
  order: OrderSummaryResponse;
  items: OrderItemResponse[];
  payment: PaymentSummaryResponse;
  tickets: TicketSummaryInOrder[];
  participants?: ParticipantResponse[];
}

/** Item di list GET /my-orders */
export interface MyOrderItemResponse {
  id: string;
  order_number: string;
  event_id: string;
  event_title: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  paid_at?: string;
}

/** Request body untuk POST /events/:id/orders */
export interface CreateOrderItemRequest {
  ticket_category_id: string;
  quantity: number;
}

export interface CreateOrderParticipantRequest {
  ticket_category_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  identity_number?: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  participants?: CreateOrderParticipantRequest[];
}

/** Paginated response wrapper */
export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Status constants */
export const ORDER_STATUS = {
  PENDING: "pending",
  AWAITING_PAYMENT: "awaiting_payment",
  PAID: "paid",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
