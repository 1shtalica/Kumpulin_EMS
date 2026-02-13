export type EventType = "external" | "internal" | undefined;

export interface TicketRequest {
  name: string;
  price: number;
  quota: number;
  description: string;
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
  bannerFile: File | null;
  bannerPreview: string;

  // 📌 Step 3: Combined DateTime fields (instead of separate date + time)
  startEventDateTime: Date | undefined;
  endEventDateTime: Date | undefined;
  startRegistrationDateTime: Date | undefined;
  endRegistrationDateTime: Date | undefined;
  rundown: RundownRequest[];
  isOnline: boolean;
  address: {
    rawAddress: string;
    city: string;
    province: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  meetingUrl: string;

  // 📌 Step 4: Tickets
  isPaid: boolean;
  maxCapacity: number;
  maxPurchasePerUser?: number;
  tickets: TicketRequest[];

  step: number;
}
