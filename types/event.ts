// ============================================================
// Event type — disesuaikan dengan actual BE response (EventResponse DTO)
// Endpoint: GET /api/v1/events/:slug  &  GET /api/v1/organizer/events/:id
// ============================================================
export interface Event {
  event_id: string;
  title: string;
  slug: string;
  description: {
    content: string
  }; // JSON-encoded TipTap doc string dari BE, e.g. '{"type":"doc","content":[...]}'
  category: string;
  type: string;
  status: string;
  max_capacity: number;
  max_ticket_per_user: number;
  total_sold: number;
  is_online: boolean;
  meeting_url?: string;
  event_start_date: string;  // ISO 8601
  event_end_date: string;    // ISO 8601
  start_registration_date: string; // ISO 8601
  end_registration_date: string;   // ISO 8601
  address: {
    address_id?: string;
    title?: string;
    raw_address: string;
    city: string;
    province: string;
    postal_code: string;
    latitude?: number;
    longitude?: number;
    maps_url?: string;
  };
  rundowns?: {
    id?: string;
    title?: string;
    description?: string;
    start_time?: string; // "HH:mm"
    end_time?: string;   // "HH:mm"
    location?: string;
  }[];
  ticket_categories?: {
    id?: string;
    name: string;
    price: number;
    quota: number;
    booked: number;           // jumlah yang sudah dipesan
    description: string;
    start_date_time?: string | null; // ISO 8601 — *time.Time pointer di Go, bisa null
    end_date_time?: string | null;   // ISO 8601 — *time.Time pointer di Go, bisa null
  }[];
  images?: {
    id: number;
    image_url: string;
    is_primary: boolean;     // dari domain.EventImage — tersedia di response BE
    event_id?: string;
    created_at?: string;
    updated_at?: string;
  }[];
  organizer: {
    id: string | number;
    name: string;
    slug?: string;
    avatar?: string;
    description?: string;
    verification_status?: string;
  };
}

// ============================================================
// Wrapper response dari BE
// ============================================================
export interface EventsResponse {
  message: string;
  data: Event[];
}

export interface EventResponse {
  message: string;
  data: Event;
}

// ============================================================
// Params untuk list events
// ============================================================
export interface GetEventsParams {
  offset?: number;
  limit?: number;
  type?: string;
  q?: string;
  // 🌟 tunggu api siap
  // category?: string;
  // location?: string;
  // price_type?: 'gratis' | 'berbayar';
  // sort?: string;
}

// ============================================================
// Card types untuk explore / home page
// ============================================================
export interface HomeEventCard {
  id?: string;
  event_id?: string;
  title: string;
  slug: string;
  type: string;
  max_capacity: number;
  total_sold: number;
  is_online: boolean;
  organizer_name: string;
  address_title: string;
  image_url: string;
  ticket_price: number;
  start_date: string;
}

export interface GetOrganizerEventsParams {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface OrganizerEventCard {
  id?: string;
  event_id?: string;
  title: string;
  slug: string;
  type: string;
  max_capacity: number;
  total_sold: number;
  is_online: boolean;
  organizer_name: string;
  address_title: string;
  image_url: string;
  start_date: string;
  status: string;
}

// ============================================================
// Payload types untuk PATCH endpoints (organizer)
// ============================================================
export interface TicketPayloadItem {
  id?: string;            // UUID — present for update; omit for add
  name: string;
  price: number;
  quota: number;
  description?: string;
  start_date_time: string; // ISO 8601 full datetime
  end_date_time: string;   // ISO 8601 full datetime
}

export interface PatchTicketsPayload {
  added: TicketPayloadItem[];
  updated: TicketPayloadItem[];
  deleted_ids: string[];  // UUIDs to delete
}

export interface RundownPayloadItem {
  id?: string;        // UUID — present for update; omit for add
  title: string;
  description?: string;
  start_time: string; // plain "HH:mm"
  end_time: string;   // plain "HH:mm"
  location?: string;
}

export interface PatchRundownsPayload {
  added: RundownPayloadItem[];
  updated: RundownPayloadItem[];
  deleted_ids: string[]; // UUIDs to delete
}

export interface PatchEventLocationPayload {
  address_id: string;
  title: string;
  raw_address: string;
  city: string;
  province: string;
  postal_code: string;
  location_url: string;
}
