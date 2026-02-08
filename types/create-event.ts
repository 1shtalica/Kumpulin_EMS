// slug dikerjakan di be untuk menambahkna idnya
// type di be ganti antara internal/eksternal, lalu untuk tags diganti jadi category (dan mungkin hanya 1)
// max capacity diambil dari total ticket quota jika berbayar, atau isi field jika gratis
// total sold tidak masuk ke form
//

// 🌟 Ini skema yang support event berlangsung 1 hari

export type EventType = "public" | "internal" | null;
export type isOnline = true | false | null;

export interface TicketRequest {
  name: string;
  price: number;
  quota: number;
  description: string;
}

// 🌟 location sengaja dibikin opsional sebab belum pasti kalau setiap rundown ada tempat
export interface RundownRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface CreateEventFormState {
  // 📌 Step 1: Type (pilih publik atau eksternal)
  eventType: EventType;

  // 📌 Step 2: Basic Info
  title: string;
  category: string;
  description: string;
  bannerFile: File | null;
  bannerPreview: string;

  // 📌 Step 3: Tanggal Event Berlangsung, Tanggal Pendaftaran, Rundown, Location
  startEventDate: Date | undefined;
  endEventDate: Date | undefined;
  startEventTime: string;
  endEventTime: string;

  //mengatur tanggal buka dan tutup pendaftaran
  startRegistration: Date | undefined;
  startRegistrationTime: string;
  endRegistration: Date | undefined;
  endRegistrationTime: string;

  rundown: RundownRequest[];

  // Offline / Hybrid Location
  isOnline: boolean;

  // offline form
  address: {
    rawAddress: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };

  //online form
  meetingUrl: string;

  // 📌 Step 4: Tickets
  isPaid: boolean;
  maxCapacity: number;

  tickets: TicketRequest[];

  // Metadata
  step: number; // 1-5
}
