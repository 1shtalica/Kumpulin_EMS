// ============================================================
// Event type - disesuaikan dengan actual BE response (EventResponse DTO)
// Endpoint: GET /api/v1/events/:slug  &  GET /api/v1/organizer/events/:id
// ============================================================
export interface Event {
  event_id: string;
  title: string;
  slug: string;
  description: {
    content: string
  };
  category: string;
  type: string;
  status: string;
  max_capacity: number;
  max_ticket_per_user: number;
  total_sold: number;
  is_online: boolean;
  meeting_url?: string;
  event_start_date: string;  
  event_end_date: string;    
  start_registration_date: string; 
  end_registration_date: string;   
  is_wishlisted?: boolean;
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
    start_time?: string;
    end_time?: string;
    location?: string;
  }[];
  ticket_categories?: {
    id?: string;
    name: string;
    price: number;
    quota: number;
    booked: number;
    sold: number;
    description: string;
    start_date_time?: string | null; 
    end_date_time?: string | null;  
  }[];
  images?: {
    id: number;
    image_url: string;
    is_primary: boolean;
    event_id?: string;
    created_at?: string;
    updated_at?: string;
  }[];
  organizer: {
    id: string | number;
    name: string;
    slug?: string;
    profile_image_url?: string;
    banner_image_url?: string;
    description?: string;
    verification_status?: string;
  };
}

export interface InfiniteEventListProps {
  initialEvents: HomeEventCard[];
  initialHasMore: boolean;
  initialNextCursor: string | null;
  searchQuery: string;
  typeFilter: string;
  categoryFilter: string;
  provinceFilter: string;
  priceFilter: string;
  sortOption: string;
  followingFilter: string;
  limit: number;
}

export interface EventPagination {
  limit: number;
  has_more: boolean;
  next_cursor: string | null;
}

export interface EventListResult {
  data: HomeEventCard[];
  pagination: EventPagination;
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
  limit?: number;
  cursor?: string | null;
  type?: string;
  q?: string;
  search?: string;
  category?: string;
  province?: string;
  price?: string;
  sort?: string;
  following?: string;
  // TODO: tunggu api siap
}

// ============================================================
// Card types untuk explore / home page
// ============================================================
export interface HomeEventCard {
  id?: string;
  event_id?: string;
  is_wishlisted?: boolean;
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
  id?: string;
  name: string;
  price: number;
  quota: number;
  description?: string;
  start_date_time: string;
  end_date_time: string;
}

export interface PatchTicketsPayload {
  added: TicketPayloadItem[];
  updated: TicketPayloadItem[];
  deleted_ids: string[];
}

export interface RundownPayloadItem {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
}

export interface PatchRundownsPayload {
  added: RundownPayloadItem[];
  updated: RundownPayloadItem[];
  deleted_ids: string[];
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
