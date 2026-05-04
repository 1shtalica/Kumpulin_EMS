import axiosClient from "@/lib/axios-client";
import { CreateEventFormState } from "@/types/create-event";
import type { AxiosError } from "axios";
import type {
  Event,
  EventListResult,
  EventPagination,
  EventResponse,
  GetEventsParams,
  GetOrganizerEventsParams,
  HomeEventCard,
  OrganizerEventCard,
  PatchTicketsPayload,
  PatchRundownsPayload,
  PatchEventLocationPayload,
} from "@/types/event";

type ApiErrorBody = {
  message?: string;
};

export class EventListRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "EventListRequestError";
    Object.setPrototypeOf(this, EventListRequestError.prototype);
  }
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorBody>;

  return (
    axiosError.response?.data?.message ||
    (error instanceof Error ? error.message : fallback)
  );
};

const normalizeEventPriceFilter = (price = "") => {
  const priceMap: Record<string, string> = {
    gratis: "free",
    berbayar: "paid",
    free: "free",
    paid: "paid",
  };

  return priceMap[price] ?? "";
};

const normalizeEventSort = (sort = "") => {
  const sortMap: Record<string, string> = {
    Terbaru: "newest",
    terbaru: "newest",
    newest: "newest",
    Terdekat: "closest",
    terdekat: "closest",
    closest: "closest",
    Harga_Terendah: "lowest_price",
    harga_terendah: "lowest_price",
    lowest_price: "lowest_price",
    Harga_Tertinggi: "highest_price",
    harga_tertinggi: "highest_price",
    highest_price: "highest_price",
  };

  return sortMap[sort] ?? "";
};

const buildEventListSearchParams = (params: GetEventsParams = {}) => {
  const {
    limit = 10,
    cursor,
    type = "",
    q = "",
    search,
    category = "",
    province = "",
    price = "",
    sort = "",
  } = params;
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const titleSearch = search ?? q;
  const normalizedPrice = normalizeEventPriceFilter(price);
  const normalizedSort = normalizeEventSort(sort);
  const urlParams = new URLSearchParams({
    limit: String(safeLimit),
  });

  if (cursor) urlParams.set("cursor", cursor);
  if (type) urlParams.set("type", type);
  if (titleSearch) urlParams.set("search", titleSearch);
  if (category) urlParams.set("category", category);
  if (province) urlParams.set("province", province);
  if (normalizedPrice) urlParams.set("price", normalizedPrice);
  if (normalizedSort) urlParams.set("sort", normalizedSort);

  return urlParams;
};

const normalizeEventPagination = (
  pagination: Partial<EventPagination> | undefined,
  limit: number,
): EventPagination => ({
  limit: pagination?.limit ?? limit,
  has_more: pagination?.has_more ?? false,
  next_cursor: pagination?.next_cursor ?? null,
});

export const EventService = {
  async getEvents(
    params: GetEventsParams = {},
  ): Promise<EventListResult> {
    try {
      const urlParams = buildEventListSearchParams(params);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?${urlParams.toString()}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new EventListRequestError(
          `Fetch events failed with status: ${response.status}`,
          response.status,
        );
      }

      const json = await response.json();
      const limit = Number(urlParams.get("limit")) || 10;

      return {
        data: json.data ?? [],
        pagination: normalizeEventPagination(json.pagination, limit),
      };
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw error;
    }
  },

  async getEventsClient(
    params: GetEventsParams = {},
  ): Promise<EventListResult> {
    try {
      const urlParams = buildEventListSearchParams(params);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?${urlParams.toString()}`,
      );

      if (!response.ok) {
        throw new EventListRequestError(
          `Fetch events failed with status: ${response.status}`,
          response.status,
        );
      }

      const json = await response.json();
      const limit = Number(urlParams.get("limit")) || 10;

      return {
        data: json.data ?? [],
        pagination: normalizeEventPagination(json.pagination, limit),
      };
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
    } catch (error) {
      console.error("Failed to update tickets:", error);
      const msg = getApiErrorMessage(
        error,
        "Gagal menyimpan perubahan tiket",
      );
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
    } catch (error) {
      console.error("Failed to update rundowns:", error);
      const msg = getApiErrorMessage(
        error,
        "Gagal menyimpan perubahan rundown",
      );
      throw new Error(msg);
    }
  },

  async updateEventLocation(
    eventId: string,
    payload: PatchEventLocationPayload,
  ): Promise<void> {
    try {
      await axiosClient.patch(`/organizer/events/${eventId}/address`, payload);
    } catch (error) {
      console.error("Failed to update location:", error);
      const msg = getApiErrorMessage(
        error,
        "Gagal menyimpan perubahan lokasi",
      );
      throw new Error(msg);
    }
  },

  async updateEventCore(
    eventId: string,
    payload: {
      title: string;
      category: string;
      description: unknown;
      status?: string;
    },
  ): Promise<void> {
    try {
      await axiosClient.patch(`/organizer/events/${eventId}/core`, payload);
    } catch (error) {
      console.error("Failed to update core info:", error);
      const msg = getApiErrorMessage(
        error,
        "Gagal menyimpan info utama event",
      );
      throw new Error(msg);
    }
  },
};
