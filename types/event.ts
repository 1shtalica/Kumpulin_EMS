// ============================================================
// Event type yang dipakai komponen event detail (belum terintegrasikan dengan BE)
// Field ini masih menggunakan format lama / dummy data
// 🌟 Update bertahap saat komponen eventdetail mulai diintegrasikan ke BE
// ============================================================
export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  registration_start_date?: string;
  registration_end_date?: string;
  is_online: boolean;
  is_paid: boolean;
  category: string;
  capacity: number;
  max_purchases?: number;
  meeting_url?: string;
  address?: {
    province: string;
    city: string;
    raw_address: string;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
  };
  rundowns: {
    id: number;
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
  }[];
  ticket_categories: {
    id: number;
    name: string;
    description?: string;
    price: number;
    quota: number;
    sold: number;
  }[];
  sold_event: number;
  organizer_id: number;
  organizer: {
    id: number;
    name: string;
    avatar?: string;
    description?: string;
    email?: string;
    instagram?: string;
    linkedin?: string;
    verification_status?: string;
  };
  banner_url?: string;
  posters?: string[];
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// Response type yang sesuai actual BE response
// Digunakan saat mulai integrasi halaman event detail dengan BE
// ============================================================
export interface BEEventResponse {
  event_id: string;
  title: string;
  slug: string;
  description: Record<string, unknown>; // JSON object dari BE, misal: { content: "<p>...</p>" }
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
  address?: {
    address_id: string;
    title?: string;
    raw_address: string;
    city: string;
    province: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
  rundowns?: {
    id?: string;
    title?: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
  }[];
  ticket_categories?: {
    name: string;
    price: number;
    quota: number;
    booked: number;
    description: string;
  }[];
  images?: {
    image_url: string;
  }[];
}

export interface EventsResponse {
  message: string;
  data: Event[];
}

export interface EventResponse {
  message: string;
  data: Event;
}

export interface GetEventsParams {
  offset?: number;
  limit?: number;
  type?: string;
  // Future params when backend supports:
  // q?: string;
  // category?: string;
  // location?: string;
  // price_type?: 'gratis' | 'berbayar';
  // sort?: string;
}

// ============================================================
// Type untuk card event di landing page / explore
// Sesuai dengan HomeEventResponse di BE
// ============================================================
export interface HomeEventCard {
  id: string;
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
