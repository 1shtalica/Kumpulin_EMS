import axiosClient from "@/lib/axios-client";
import type {
  MyTicketItemResponse,
  MyTicketDetailResponse,
} from "@/types/ticket";
import type { PaginatedResponse } from "@/types/order";

// Re-export type agar komponen lama yang import dari sini tidak broken
export type { MyTicketItemResponse, MyTicketDetailResponse };

// Alias untuk backward compatibility dengan komponen yang masih import TicketItem
export type TicketItem = MyTicketItemResponse;

export const TicketService = {
  /**
   * Mengambil daftar tiket milik user yang sedang login.
   */
  async getMyTickets(
    page = 1,
    limit = 20,
    status?: string,
    eventId?: string
  ): Promise<PaginatedResponse<MyTicketItemResponse>> {
    const params: Record<string, string | number> = { page, limit };
    if (status) params.status = status;
    if (eventId) params.event_id = eventId;
    const response = await axiosClient.get("/my-tickets", { params });
    return response.data.data as PaginatedResponse<MyTicketItemResponse>;
  },

  /**
   * Mengambil detail tiket berdasarkan ticket ID.
   */
  async getMyTicketDetail(ticketId: string): Promise<MyTicketDetailResponse> {
    const response = await axiosClient.get(`/my-tickets/${ticketId}`);
    return response.data.data as MyTicketDetailResponse;
  },
};
