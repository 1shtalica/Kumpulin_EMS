/**
 * Types untuk Checkout flow (local UI types)
 */

/** Item tiket untuk ditampilkan di OrderSummarySection */
export interface CheckoutOrderItem {
  ticket_category_name: string;
  quantity: number;
  unit_price: number;
  subtotal_amount: number;
}
