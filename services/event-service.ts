import axiosClient from "@/lib/axios-client";
import type {
  Event,
  EventsResponse,
  EventResponse,
  GetEventsParams,
} from "@/types/event";

export const EventService = {

  async getEvents(params: GetEventsParams = {}): Promise<Event[]> {
    const { offset = 0, limit = 100 } = params;

    try {
      const response = await axiosClient.get<EventsResponse>("/events", {
        params: { offset, limit },
      });
      return response.data.data;
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

  async getEventBySlug(slug: string): Promise<Event | null> {
    try {
      const events = await this.getEvents({ limit: 1000 });
      return events.find((e) => e.slug === slug) || null;
    } catch (error) {
      console.error(`Failed to fetch event by slug ${slug}:`, error);
      throw error;
    }
  },

  // Buat event
  async createEvent(payload: FormData): Promise<EventResponse> {
    try {
      const response = await axiosClient.post<EventResponse>("/events", payload, {
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
};
