// slug dikerjakan di be untuk menambahkna idnya
// type di be ganti antara internal/eksternal, lalu untuk tags diganti jadi category (dan mungkin hanya 1)
// max capacity diambil dari total ticket quota jika berbayar, atau isi field jika gratis
// total sold tidak masuk ke form
//

// export type EventType = "public" | "internal" | null;

// // 🌟 Ini skema yang support event berlangsung 1 hari

// export interface TicketRequest {
//   name: string;
//   price: number;
//   quota: number;
//   description: string;
// }

// // 🌟 location sengaja dibikin opsional sebab belum pasti kalau setiap rundown ada tempat
// export interface RundownRequest {
//   title: string;
//   description: string;
//   startTime: string;
//   endTime: string;
//   location?: string;
// }

// export interface CreateEventFormState {
//   // 📌 Step 1: Type (pilih publik atau eksternal)
//   eventType: EventType;

//   // 📌 Step 2: Basic Info
//   title: string;
//   category: string;
//   description: string;
//   bannerFile: File | null;
//   bannerPreview: string;

//   // 📌 Step 3: Time, Rundown, Location
//   startDate: Date | undefined;
//   endDate: Date | undefined;
//   startTime: string;
//   endTime: string;

//   //mengatur tanggal buka dan tutup pendaftaran
//   startRegistration: Date | undefined;
//   startRegistrationTime: string;
//   endRegistration: Date | undefined;
//   endRegistrationTime: string;

//   rundown: RundownRequest[];

//   // Offline / Hybrid Location
//   is_online: boolean;

//   // offline form
//   address: {
//     rawAddress: string;
//     city: string;
//     province: string;
//     postalCode: string;
//     latitude: number;
//   longitude: number;
//   };

//   //online form
//   meetingUrl: string;

//   // 📌 Step 4: Tickets
//   isPaid: boolean;
//   max_capacity: number;
//   closeRegistration: Date | undefined;
//   closeRegistrationTime: string;

//   tickets: TicketRequest[];

//   // Metadata
//   step: number; // 1-5
// }

export type EventType = "public" | "internal" | null;
export type LocationType = "offline" | "online";

export interface TicketRequest {
  name: string;
  price: number;
  quota: number;
  description: string;
}

export interface CreateEventFormState {
  // Step 1: Type
  eventType: EventType;

  // Step 2: Basic Info
  title: string;
  category: string;
  description: string;
  bannerFile: File | null;
  bannerPreview: string;

  // Step 3: Time & Location
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string;
  endTime: string;

  locationType: LocationType;

  // Offline / Hybrid Location
  address: {
    rawAddress: string;
    city: string;
    province: string;
    postalCode: string;
    latitude: number;
    longitude: number;
  };

  // Online / Hybrid Location
  meetingUrl: string;

  // Step 4: Tickets
  isPaid: boolean;
  tickets: TicketRequest[];

  // Metadata
  step: number; // 1-5
}
