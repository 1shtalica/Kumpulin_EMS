export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  price: number;
  capacity: number;
  banner_url: string;
  organizer_id: number;
  organizer?: {
    id: number;
    name: string;
    logo_url?: string;
  };
  created_at: string;
  updated_at: string;
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
  // Future params when backend supports:
  // q?: string;
  // category?: string;
  // location?: string;
  // price_type?: 'gratis' | 'berbayar';
  // sort?: string;
}
