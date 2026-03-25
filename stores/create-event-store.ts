import { create } from "zustand";
import type {
  CreateEventFormState,
  EventType,
  RundownRequest,
  TicketRequest,
} from "@/types/create-event";
import type { BEEventResponse } from "@/types/event";

interface CreateEventStore {
  // Form data
  formData: CreateEventFormState;

  // Step navigation
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;

  // Field updates - Step 1
  updateEventType: (type: EventType) => void;

  // Field updates - Step 2
  updateTitle: (title: string) => void;
  updateCategory: (category: string) => void;
  updateDescription: (description: string) => void;
  updateBannerImage: (file: File | null, preview: string | null) => void;
  updatePosters: (files: File[], previews: string[]) => void;

  // Field updates - Step 3 - DateTime versions
  updateEventDateTime: (data: {
    event_start_date?: Date;
    event_end_date?: Date;
  }) => void;

  updateRegistrationDateTime: (data: {
    start_registration_date?: Date;
    end_registration_date?: Date;
  }) => void;

  // Rundown Actions
  addRundown: () => void;
  removeRundown: (index: number) => void;
  updateRundown: (
    index: number,
    field: keyof RundownRequest,
    value: string
  ) => void;

  // Location Actions
  updateIsOnline: (isOnline: boolean) => void;
  updateAddress: (address: Partial<CreateEventFormState["address"]>) => void;
  updateMeetingUrl: (meeting_url: string) => void;
  updateHideMeetingUrl: (hide_meeting_url: boolean) => void;

  // Field updates - Step 4
  updateMaxCapacity: (capacity: number) => void;

  updateTickets: (tickets: TicketRequest[]) => void;
  addFreeTicket: () => void;
  addPaidTicket: () => void;
  removeTicket: (index: number) => void;
  updateTicket: (
    index: number,
    field: keyof TicketRequest,
    value: string | number,
  ) => void;

  // Form actions
  reset: () => void;

  // Sync form data from RHF to Store
  syncFormData: (data: Partial<CreateEventFormState>) => void;

  // Load duplicated data
  loadFromExistingEvent: (event: BEEventResponse) => void;
}

// Initial state
const initialFormData: CreateEventFormState = {
  type: undefined,
  title: "",
  category: "",
  description: "",
  banner_image: null,
  banner_image_preview: "",
  images: [],
  image_previews: [],

  event_start_date: undefined,
  event_end_date: undefined,

  start_registration_date: undefined,
  end_registration_date: undefined,

  rundowns: [],

  is_online: false,
  address: {
    title: "",
    raw_address: "",
    city: "",
    province: "",
    postal_code: "",
    location_url: "",
  },
  meeting_url: "",
  hide_meeting_url: false,

  max_capacity: 1,
  max_ticket_per_user: 0,

  tickets: [],
  step: 1,
};

export const useCreateEventStore = create<CreateEventStore>((set, get) => ({
  formData: initialFormData,
  currentStep: 1,

  // Navigation
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 5) {
      set({ currentStep: currentStep + 1 });
      set((state) => ({
        formData: { ...state.formData, step: currentStep + 1 },
      }));
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
      set((state) => ({
        formData: { ...state.formData, step: currentStep - 1 },
      }));
    }
  },

  setStep: (step) => {
    set({ currentStep: step });
    set((state) => ({
      formData: { ...state.formData, step },
    }));
  },

  // Step 1 updates
  updateEventType: (type) => {
    set((state) => ({
      formData: { ...state.formData, type: type },
    }));
  },

  // Step 2 updates
  updateTitle: (title) => {
    set((state) => ({
      formData: { ...state.formData, title },
    }));
  },

  updateCategory: (category) => {
    set((state) => ({
      formData: { ...state.formData, category },
    }));
  },

  updateDescription: (description) => {
    set((state) => ({
      formData: { ...state.formData, description },
    }));
  },

  updateBannerImage: (file, preview) => {
    set((state) => ({
      formData: { ...state.formData, banner_image: file, banner_image_preview: preview },
    }));
  },

  updatePosters: (files, previews) => {
    set((state) => ({
      formData: { ...state.formData, images: files, image_previews: previews },
    }));
  },

  // Step 3 updates - DateTime
  updateEventDateTime: (data: { event_start_date?: Date; event_end_date?: Date }) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateRegistrationDateTime: (data: { start_registration_date?: Date; end_registration_date?: Date }) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  addRundown: () => {
    set((state) => ({
      formData: {
        ...state.formData,
        rundowns: [
          ...state.formData.rundowns,
          {
            title: "",
            description: "",
            start_time: "",
            end_time: "",
          },
        ],
      },
    }));
  },

  removeRundown: (index) => {
    set((state) => ({
      formData: {
        ...state.formData,
        rundowns: state.formData.rundowns.filter((_, i) => i !== index),
      },
    }));
  },

  updateRundown: (index, field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        rundowns: state.formData.rundowns.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  },

  updateIsOnline: (is_online) => {
    set((state) => ({
      formData: { ...state.formData, is_online },
    }));
  },

  updateAddress: (address) => {
    set((state) => ({
      formData: {
        ...state.formData,
        address: { ...state.formData.address, ...address },
      },
    }));
  },

  updateMeetingUrl: (meeting_url) => {
    set((state) => ({
      formData: { ...state.formData, meeting_url },
    }));
  },

  updateHideMeetingUrl: (hide_meeting_url) => {
    set((state) => ({
      formData: { ...state.formData, hide_meeting_url },
    }));
  },

  // Step 4 updates

  updateMaxCapacity: (max_capacity) => {
    set((state) => ({
      formData: { ...state.formData, max_capacity },
    }));
  },

  updateTickets: (tickets) => {
    set((state) => ({
      formData: { ...state.formData, tickets },
    }));
  },

  addFreeTicket: () => {
    set((state) => ({
      formData: {
        ...state.formData,
        tickets: [
          ...state.formData.tickets,
          { name: "Tiket Gratis", price: 0, quota: 0, description: "", type: "free", start_date_time: undefined, end_date_time: undefined },
        ],
      },
    }));
  },

  addPaidTicket: () => {
    set((state) => ({
      formData: {
        ...state.formData,
        tickets: [
          ...state.formData.tickets,
          { name: "Tiket Berbayar", price: 1000, quota: 0, description: "", type: "paid", start_date_time: undefined, end_date_time: undefined },
        ],
      },
    }));
  },

  removeTicket: (index) => {
    set((state) => ({
      formData: {
        ...state.formData,
        tickets: state.formData.tickets.filter((_, i) => i !== index),
      },
    }));
  },

  updateTicket: (index, field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        tickets: state.formData.tickets.map((ticket, i) =>
          i === index ? { ...ticket, [field]: value } : ticket,
        ),
      },
    }));
  },

  // Reset
  reset: () => {
    set({
      formData: initialFormData,
      currentStep: 1,
    });
  },

  syncFormData: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data }
    }));
  },

  loadFromExistingEvent: (event) => {
    set({
      currentStep: 1,
      formData: {
        ...initialFormData,
        title: `${event.title} (Copy)`,
        type: (event.type as EventType) || "public",
        category: "Umum",
        description: typeof event.description?.content === 'string' ? event.description.content : "",
        
        // Explicitly clear all dates
        event_start_date: undefined,
        event_end_date: undefined,
        start_registration_date: undefined,
        end_registration_date: undefined,
        
        // Images are intentionally left empty for the user to re-upload.
        banner_image: null,
        banner_image_preview: "",
        images: [],
        image_previews: [],

        rundowns: event.rundowns?.map(r => ({
          title: r.title || "",
          description: r.description || "",
          start_time: r.start_time || "",
          end_time: r.end_time || "",
          location: r.location || "",
        })) || [],

        is_online: event.is_online,
        meeting_url: event.meeting_url || "",
        hide_meeting_url: false,
        address: event.address ? {
          title: event.address.title || "",
          raw_address: event.address.raw_address || "",
          city: event.address.city || "",
          province: event.address.province || "",
          postal_code: event.address.postal_code || "",
          location_url: "",
        } : initialFormData.address,

        max_capacity: event.max_capacity || 1,
        max_ticket_per_user: event.max_ticket_per_user || 0,

        tickets: event.ticket_categories?.map(t => ({
          name: t.name,
          price: t.price,
          quota: t.quota,
          description: t.description || "",
          type: (t.price > 0 ? "paid" : "free") as "paid" | "free",
          start_date_time: undefined,
          end_date_time: undefined,
        })) || [],
      }
    });
  }
}));

