import axiosClient from "@/lib/axios-client";

export interface TicketItem {
  id: string;
  order_id: string;
  event_title: string;
  event_date: string; // ISO String
  location: string;
  ticket_category_name: string;
  status: "active" | "used" | "expired" | "cancelled";
}

export const TicketService = {
  async getMyTickets() {
    try {
      const response = await axiosClient.get("/my-tickets");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  async getMyTicketDetail(ticketId: string) {
    try {
      const response = await axiosClient.get(`/my-tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
