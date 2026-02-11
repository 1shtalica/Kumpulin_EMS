import axiosClient from "@/lib/axios-client";
import type { Event, EventsResponse, EventResponse, GetEventsParams } from "@/types/event";

export const EventService = {
  /**
   * Get all events with pagination
   */
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

  /**
   * Get single event by ID
   */
  async getEventById(id: string): Promise<Event> {
    try {
      const response = await axiosClient.get<EventResponse>(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch event ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get event by slug (client-side search for now)
   * TODO: Replace with backend endpoint when available
   */
  async getEventBySlug(slug: string): Promise<Event | null> {
    try {
      const events = await this.getEvents({ limit: 1000 });
      return events.find((e) => e.slug === slug) || null;
    } catch (error) {
      console.error(`Failed to fetch event by slug ${slug}:`, error);
      throw error;
    }
  },
};
