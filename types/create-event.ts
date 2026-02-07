export type EventType = 'public' | 'internal' | null;
export type LocationType = 'offline' | 'online';

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
