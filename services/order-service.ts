import axiosClient from "@/lib/axios-client";
import type {
  CreateOrderRequest,
  OrderDataResponse,
  PaginatedResponse,
  MyOrderItemResponse,
} from "@/types/order";

export const OrderService = {
  /**
   * Membuat order baru untuk event tertentu.
   * Backend mendukung Idempotency-Key header untuk mencegah double order.
   */
  async createOrder(
    eventId: string,
    body: CreateOrderRequest,
    idempotencyKey?: string
  ): Promise<OrderDataResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers["Idempotency-Key"] = idempotencyKey;
    }
    const response = await axiosClient.post(
      `/events/${eventId}/orders`,
      body,
      { headers }
    );
    return response.data.data as OrderDataResponse;
  },

  /**
   * Mengambil detail order berdasarkan order ID.
   * Endpoint ini juga auto-expire order jika sudah kadaluarsa.
   */
  async getOrderDetail(orderId: string): Promise<OrderDataResponse> {
    const response = await axiosClient.get(`/orders/${orderId}`);
    return response.data.data as OrderDataResponse;
  },

  /**
   * Mock payment — simulate pembayaran berhasil.
   * Setelah sukses, backend akan generate tiket dan update status order ke "paid".
   */
  async mockPayOrder(orderId: string): Promise<OrderDataResponse> {
    const response = await axiosClient.post(`/orders/${orderId}/mock-pay`);
    return response.data.data as OrderDataResponse;
  },

  /**
   * Mengambil daftar order milik user yang sedang login.
   */
  async getMyOrders(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<PaginatedResponse<MyOrderItemResponse>> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    const response = await axiosClient.get("/my-orders", { params });
    return response.data.data as PaginatedResponse<MyOrderItemResponse>;
  },
};
