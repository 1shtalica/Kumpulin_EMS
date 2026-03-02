export type EventType = "external" | "internal";
export type TicketType = "free" | "paid";

export interface TicketRequest {
  name: string;
  price: number;
  quota: number;
  description?: string;
  start_date_time: Date | undefined;
  end_date_time: Date | undefined;
  type: TicketType;
}

export interface RundownRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
}

export interface CreateEventFormState {
  // 📌 Step 1: Type (pilih publik atau eksternal)
  type: EventType | undefined;

  // 📌 Step 2: Basic Info
  title: string;
  category: string;
  description: string;
  banner_image: File | null;
  banner_image_preview: string | null;
  images: File[];
  image_previews: string[];

  // 📌 Step 3: Combined DateTime fields (instead of separate date + time)
  event_start_date: Date | undefined;
  event_end_date: Date | undefined;
  start_registration_date: Date | undefined;
  end_registration_date: Date | undefined;
  rundowns: RundownRequest[];
  is_online: boolean;
  address: {
    title: string;
    raw_address: string;
    city: string;
    province: string;
    postal_code?: string;
    location_url: string;
  };
  meeting_url: string;
  hide_meeting_url: boolean;

  // 📌 Step 4: Tickets
  max_capacity?: number;
  max_ticket_per_user?: number;
  tickets: TicketRequest[];

  step: number;
}
