/**
 * Types untuk Payment & Checkout flow
 */

/** Status UI pembayaran (untuk tampilan halaman payment) */
export type PaymentStatus = "success" | "failed" | "sold_out";

/** Metode pembayaran yang tersedia */
export type PaymentMethodId =
  | "bca_va"
  | "mandiri_va"
  | "bni_va"
  | "bri_va"
  | "gopay"
  | "qris";

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  iconPath: string;
  category: "virtual_account" | "e_wallet";
}

/** Daftar metode pembayaran yang tersedia */
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "bca_va", name: "BCA Virtual Account", iconPath: "/Icon/bca.svg", category: "virtual_account" },
  { id: "mandiri_va", name: "Mandiri Virtual Account", iconPath: "/Icon/mandiri.svg", category: "virtual_account" },
  { id: "bni_va", name: "BNI Virtual Account", iconPath: "/Icon/bni.svg", category: "virtual_account" },
  { id: "bri_va", name: "BRI Virtual Account", iconPath: "/Icon/bri.svg", category: "virtual_account" },
  { id: "gopay", name: "GoPay", iconPath: "/Icon/gopay.svg", category: "e_wallet" },
  { id: "qris", name: "QRIS", iconPath: "/Icon/qris.svg", category: "e_wallet" },
];
