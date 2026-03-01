export type EventType = "external" | "internal" | undefined;
export type TicketType = "free" | "paid";

export interface TicketRequest {
  name: string;
  price: number;
  quota: number;
  description: string;
  start_date_time: Date | undefined;
  end_date_time: Date | undefined;
  type: TicketType;
}

export interface RundownRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface CreateEventFormState {
  // 📌 Step 1: Type (pilih publik atau eksternal)
  type: EventType;

  // 📌 Step 2: Basic Info
  title: string;
  category: string;
  description: string;
  bannerImage: File | null;
  bannerImagePreview: string | null;
  images: File[];
  imagePreviews: string[];

  // 📌 Step 3: Combined DateTime fields (instead of separate date + time)
  startEventDateTime: Date | undefined;
  endEventDateTime: Date | undefined;
  startRegistrationDateTime: Date | undefined;
  endRegistrationDateTime: Date | undefined;
  rundown: RundownRequest[];
  isOnline: boolean;
  address: {
    title: string;
    rawAddress: string;
    city: string;
    province: string;
    postalCode?: string;
  };
  meetingUrl: string;

  // 📌 Step 4: Tickets
  maxCapacity?: number;
  maxPurchasePerUser?: number;
  tickets: TicketRequest[];

  step: number;
}
