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
    sold: number; // Added sold count per ticket
  }[];
  sold_event: number; // Total tickets sold for event
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
  image_url: string
  ticket_price: number;
  start_date: string;
}
