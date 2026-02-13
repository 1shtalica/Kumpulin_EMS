import axiosClient from "@/lib/axios-client";
import { CreateEventFormState } from "@/types/create-event";
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

  async CreateEvent(data: CreateEventFormState): Promise<EventResponse> {
    try {
      const formData = new FormData();

      // Add scalar fields
      formData.append("type", data.type || "");
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("description", data.description);
      formData.append("isPaid", String(data.isPaid));
      formData.append("maxCapacity", String(data.maxCapacity));
      formData.append("isOnline", String(data.isOnline));


      if (data.maxPurchasePerUser !== undefined) {
        formData.append("maxPurchasePerUser", String(data.maxPurchasePerUser));
      }
      if (data.meetingUrl) {
        formData.append("meetingUrl", data.meetingUrl);
      }

      if (data.bannerFile) {
        formData.append("bannerFile", data.bannerFile);
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
      formData.append("rundown", JSON.stringify(data.rundown));
      formData.append("address", JSON.stringify(data.address));

      console.log("formData", formData);

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
};
