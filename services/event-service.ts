import axiosClient from "@/lib/axios-client";
import { CreateEventFormState } from "@/types/create-event";
import type { Event, EventsResponse, EventResponse, GetEventsParams, GetOrganizerEventsParams, HomeEventCard, OrganizerEventCard } from "@/types/event";

export const EventService = {

  async getEvents(params: GetEventsParams = {}): Promise<HomeEventCard[]> {
    const { offset = 0, limit = 100, type = "" } = params;

    try {
      const json = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events?offset=${offset}&limit=${limit}&type=${type}`);
      const data = await json.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw error;
    }
  },

  async getEventById(id: string): Promise<Event> {
    try {
      const response = await axiosClient.get<EventResponse>(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      throw error;
    }
  },

  async getEventBySlug(slug: string): Promise<HomeEventCard | null> {
    try {
      const events = await this.getEvents({ limit: 1000 });
      return events.find((e) => e.slug === slug) || null;
    } catch (error) {
      console.error(`Failed to fetch event by slug ${slug}:`, error);
      throw error;
    }
  },

  async getEventByIdFull(id: string): Promise<import('@/types/event').BEEventResponse | null> {
    try {
      const response = await axiosClient.get<{ data: import('@/types/event').BEEventResponse }>(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch full event details for ${id}:`, error);
      return null;
    }
  },

  async CreateEvent(data: CreateEventFormState): Promise<EventResponse> {
    try {
      console.log("data -> ", data)
      const formData = new FormData();

      // Add scalar fields
      formData.append("type", data.type || "");
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("description", JSON.stringify({ content: data.description }));
      // formData.append("isPaid", String(data.isPaid)); 🌟
      formData.append("maxCapacity", String(data.maxCapacity));
      formData.append("isOnline", String(data.isOnline));
      formData.append("status", "draft");

      if (data.maxPurchasePerUser !== undefined) {
        formData.append("maxTicketPerUser", String(data.maxPurchasePerUser));
      }
      if (data.meetingUrl) {
        formData.append("meetingUrl", data.meetingUrl);
      }

      if (data.bannerImage) {
        formData.append("images", data.bannerImage);
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (data.startEventDateTime) {
        formData.append("startEventDateTime", data.startEventDateTime.toISOString());
      }
      if (data.endEventDateTime) {
        formData.append("endEventDateTime", data.endEventDateTime.toISOString());
      }
      if (data.startRegistrationDateTime) {
        formData.append("startRegistrationDateTime", data.startRegistrationDateTime.toISOString());
      }
      if (data.endRegistrationDateTime) {
        formData.append("endRegistrationDateTime", data.endRegistrationDateTime.toISOString());
      }

      formData.append("tickets", JSON.stringify(data.tickets));
      formData.append("rundowns", JSON.stringify(data.rundown));
      formData.append("address", JSON.stringify(data.address));

      const response = await axiosClient.post<EventResponse>("/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  },

  async getRandomEvents(): Promise<HomeEventCard[]> {
    try {
      const json = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/random`);
      const data = await json.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch random events:", error);
      throw error;
    }
  },

  async getEventCategories(): Promise<string[]> {
    try {
      const response = await axiosClient.get<{ data: string[] }>("/categories");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch event categories:", error);
      throw error;
    }
  },

  async createEventCategory(name: string): Promise<void> {
    try {
      await axiosClient.post("/categories", { name });
    } catch (error) {
      console.error("Failed to create event category:", error);
      throw error;
    }
  },

  async deleteEventCategory(name: string): Promise<void> {
    try {
      await axiosClient.delete(`/categories?name=${name}`);
    } catch (error) {
      console.error("Failed to delete event category:", error);
      throw error;
    }
  },
  async getOrganizerEvents(params: GetOrganizerEventsParams = {}): Promise<{ data: OrganizerEventCard[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.status && params.status !== "all") searchParams.set("status", params.status);
      if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
      if (params.offset !== undefined) searchParams.set("offset", String(params.offset));

      const queryString = searchParams.toString();
      const url = queryString ? `/organizer/events?${queryString}` : "/organizer/events";

      const response = await axiosClient.get<{ data: OrganizerEventCard[]; total: number }>(url);
      return {
        data: response.data.data ?? [],
        total: response.data.total ?? 0,
      };
    } catch (error) {
      console.error("Failed to fetch organizer events:", error);
      throw error;
    }
  }
};
