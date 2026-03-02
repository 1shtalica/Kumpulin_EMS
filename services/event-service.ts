import axiosClient from "@/lib/axios-client";
import { CreateEventFormState } from "@/types/create-event";
import type { Event, EventsResponse, EventResponse, GetEventsParams, GetOrganizerEventsParams, HomeEventCard, OrganizerEventCard } from "@/types/event";

export const EventService = {

  async getEvents(params: GetEventsParams = {}): Promise<{ data: HomeEventCard[]; total: number }> {
    const { offset = 0, limit = 12, type = "", q = "" } = params;

    try {
      const urlParams = new URLSearchParams({
        offset: String(offset),
        limit: String(limit),
      });

      if (type) urlParams.append("type", type);
      if (q) urlParams.append("search", q); // BE nerima label "search", bukan "q"

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?${urlParams.toString()}`,
        { cache: 'no-store' } 
      );

      const json = await response.json();
      
      const data = json.data || [];
      const estimatedTotal = data.length === limit ? offset + limit + 1 : offset + data.length;

      return {
        data: data,
        total: estimatedTotal,
      };
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
      const { data } = await this.getEvents({ limit: 1000 });
      return data.find((e) => e.slug === slug) || null;
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
      formData.append("max_capacity", String(data.max_capacity));
      formData.append("is_online", String(data.is_online));
      formData.append("status", "draft");

      if (data.max_ticket_per_user !== undefined) {
        formData.append("max_ticket_per_user", String(data.max_ticket_per_user));
      }
      if (data.meeting_url) {
        formData.append("meeting_url", data.meeting_url);
        formData.append("hide_meeting_url", String(data.hide_meeting_url));
      }

      if (data.banner_image) {
        formData.append("images", data.banner_image);
      }
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append("images", file);
        });
      }

      if (data.event_start_date) {
        formData.append("event_start_date", data.event_start_date.toISOString());
      }
      if (data.event_end_date) {
        formData.append("event_end_date", data.event_end_date.toISOString());
      }
      if (data.start_registration_date) {
        formData.append("start_registration_date", data.start_registration_date.toISOString());
      }
      if (data.end_registration_date) {
        formData.append("end_registration_date", data.end_registration_date.toISOString());
      }

      formData.append("tickets", JSON.stringify(data.tickets));
      formData.append("rundowns", JSON.stringify(data.rundowns));
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
