import axiosClient from "@/lib/axios-client";
import { CreateEventFormState } from "@/types/create-event";
import type {
  Event,
  EventResponse,
  GetEventsParams,
  GetOrganizerEventsParams,
  HomeEventCard,
  OrganizerEventCard,
  PatchTicketsPayload,
  PatchRundownsPayload,
  PatchEventLocationPayload,
} from "@/types/event";

export const EventService = {
  async getEvents(
    params: GetEventsParams = {},
  ): Promise<{ data: HomeEventCard[]; total: number }> {
    const { offset = 0, limit = 12, type = "", q = "" } = params;

    try {
      const urlParams = new URLSearchParams({
        offset: String(offset),
        limit: String(limit),
      });

      if (type) urlParams.append("type", type);
      if (q) urlParams.append("search", q);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?${urlParams.toString()}`,
        { cache: "no-store" },
      );

      const json = await response.json();

      const data = json.data || [];
      const estimatedTotal =
        data.length === limit ? offset + limit + 1 : offset + data.length;

      return {
        data: data,
        total: estimatedTotal,
      };
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw error;
    }
  },

  async getEventsClient(
    params: GetEventsParams = {},
  ): Promise<{ data: HomeEventCard[]; hasMore: boolean }> {
    const { offset = 0, limit = 12, type = "", q = "" } = params;

    try {
      const fetchLimit = limit + 1;

      const urlParams = new URLSearchParams({
        offset: String(offset),
        limit: String(fetchLimit),
      });

      if (type) urlParams.append("type", type);
      if (q) urlParams.append("search", q);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?${urlParams.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Fetch events failed with status: ${response.status}`);
      }

      const json = await response.json();
      const rawData: HomeEventCard[] = json.data || [];

      const hasMore = rawData.length > limit;
      const data = hasMore ? rawData.slice(0, limit) : rawData;

      return { data, hasMore };
    } catch (error) {
      console.error("Failed to fetch events (client):", error);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${slug}`,
        { cache: "no-store" },
      );
      if (!response.ok) return null;
      const json = await response.json();
      return json.data ?? null;
    } catch (error) {
      console.error(`Failed to fetch event by slug ${slug}:`, error);
      return null;
    }
  },

  // Endpoint organizer — butuh auth token (pakai axiosClient)
  async getEventByIdFull(id: string): Promise<Event | null> {
    try {
      const response = await axiosClient.get<{
        data: Event;
        message: string;
        success: boolean;
      }>(`organizer/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch full event details for ${id}:`, error);
      return null;
    }
  },

  async CreateEvent(data: CreateEventFormState): Promise<EventResponse> {
    try {
      console.log("data -> ", data);
      const formData = new FormData();

      // Add scalar fields
      formData.append("type", data.type || "");
      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append(
        "description",
        JSON.stringify({ content: data.description }),
      );
      formData.append("max_capacity", String(data.max_capacity));
      formData.append("is_online", String(data.is_online));
      formData.append("status", "draft");

      if (data.max_ticket_per_user !== undefined) {
        formData.append(
          "max_ticket_per_user",
          String(data.max_ticket_per_user),
        );
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
        formData.append(
          "event_start_date",
          data.event_start_date.toISOString(),
        );
      }
      if (data.event_end_date) {
        formData.append("event_end_date", data.event_end_date.toISOString());
      }
      if (data.start_registration_date) {
        formData.append(
          "start_registration_date",
          data.start_registration_date.toISOString(),
        );
      }
      if (data.end_registration_date) {
        formData.append(
          "end_registration_date",
          data.end_registration_date.toISOString(),
        );
      }

      formData.append("tickets", JSON.stringify(data.tickets));
      formData.append("rundowns", JSON.stringify(data.rundowns));
      formData.append("address", JSON.stringify(data.address));

      const response = await axiosClient.post<EventResponse>(
        "/events",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create event:", error);
      throw error;
    }
  },

  async getRandomEvents(): Promise<HomeEventCard[]> {
    try {
      const json = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/random`,
      );
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

  async updateEventTickets(
    id: string,
    data: Partial<CreateEventFormState>,
  ): Promise<void> {
    try {
      await axiosClient.patch(`/events/${id}/tickets`, {
        tickets: data.tickets,
      });
    } catch (error) {
      console.error("Failed to update event tickets:", error);
      throw error;
    }
  },

  async deleteEventImage(imageId: number): Promise<void> {
    try {
      await axiosClient.delete(`/events/images/${imageId}`);
    } catch (error) {
      console.error("Failed to delete event image:", error);
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
  async getOrganizerEvents(
    params: GetOrganizerEventsParams = {},
  ): Promise<{ data: OrganizerEventCard[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.set("q", params.q);
      if (params.status && params.status !== "all")
        searchParams.set("status", params.status);
      if (params.limit !== undefined)
        searchParams.set("limit", String(params.limit));
      if (params.offset !== undefined)
        searchParams.set("offset", String(params.offset));

      const queryString = searchParams.toString();
      const url = queryString
        ? `/organizer/events?${queryString}`
        : "/organizer/events";

      const response = await axiosClient.get<{
        data: OrganizerEventCard[];
        total: number;
      }>(url);
      return {
        data: response.data.data ?? [],
        total: response.data.total ?? 0,
      };
    } catch (error) {
      console.error("Failed to fetch organizer events:", error);
      throw error;
    }
  },

  /**
   * PATCH /api/v1/organizer/events/:id/tickets
   * Sends a diff payload: added / updated / deleted_ids buckets.
   * All IDs are UUIDs. Full transaction — all-or-nothing on the backend.
   */
  async updateOrganizerTickets(
    eventId: string,
    payload: PatchTicketsPayload,
  ): Promise<void> {
    try {
      await axiosClient.patch(`/organizer/events/${eventId}/tickets`, {
        actions: payload,
      });
    } catch (error: any) {
      console.error("Failed to update tickets:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menyimpan perubahan tiket";
      throw new Error(msg);
    }
  },

  /**
   * PATCH /api/v1/organizer/events/:id/rundowns
   * Sends a diff payload: added / updated / deleted_ids buckets.
   * Times are plain "HH:mm" strings (NOT ISO datetime). All IDs are UUIDs.
   * Deleting a non-existent ID is silently skipped by the backend.
   */
  async updateOrganizerRundowns(
    eventId: string,
    payload: PatchRundownsPayload,
  ): Promise<void> {
    try {
      await axiosClient.patch(`/organizer/events/${eventId}/rundowns`, {
        actions: payload,
      });
    } catch (error: any) {
      console.error("Failed to update rundowns:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menyimpan perubahan rundown";
      throw new Error(msg);
    }
  },

  async updateEventLocation(
    eventId: string,
    payload: PatchEventLocationPayload,
  ): Promise<void> {
    try {
      await axiosClient.patch(`/organizer/events/${eventId}/address`, payload);
    } catch (error: any) {
      console.error("Failed to update location:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menyimpan perubahan lokasi";
      throw new Error(msg);
    }
  },

  async updateEventCore(
    eventId: string,
    payload: {
      title: string;
      category: string;
      description: any;
      status?: string;
    },
  ): Promise<void> {
    try {
      await axiosClient.patch(`/organizer/events/${eventId}/core`, payload);
    } catch (error: any) {
      console.error("Failed to update core info:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menyimpan info utama event";
      throw new Error(msg);
    }
  },
};
