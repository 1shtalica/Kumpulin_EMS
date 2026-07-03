export const LAST_ORDER_ID_STORAGE_KEY = "kumpulin:last_order_id";

export function saveLastOrderId(orderId?: string) {
  if (typeof window === "undefined" || !orderId) return;

  try {
    window.sessionStorage.setItem(LAST_ORDER_ID_STORAGE_KEY, orderId);
  } catch {
    // Session storage can be unavailable in private or restricted contexts.
  }
}

export function getLastOrderId() {
  if (typeof window === "undefined") return null;

  try {
    return window.sessionStorage.getItem(LAST_ORDER_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}