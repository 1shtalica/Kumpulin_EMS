import { create } from "zustand";
import type {
  CreateEventFormState,
  EventType,
  RundownRequest,
  TicketRequest,
} from "@/types/create-event";

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
    startEventDateTime?: Date;
    endEventDateTime?: Date;
  }) => void;

  updateRegistrationDateTime: (data: {
    startRegistrationDateTime?: Date;
    endRegistrationDateTime?: Date;
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
  updateMeetingUrl: (url: string) => void;

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
}

// Initial state
const initialFormData: CreateEventFormState = {
  type: undefined,
  title: "",
  category: "",
  description: "",
  bannerImage: null,
  bannerImagePreview: "",
  images: [],
  imagePreviews: [],

  startEventDateTime: undefined,
  endEventDateTime: undefined,

  startRegistrationDateTime: undefined,
  endRegistrationDateTime: undefined,

  rundown: [],

  isOnline: false,
  address: {
    title: "",
    rawAddress: "",
    city: "",
    province: "",
    postalCode: "",
  },
  meetingUrl: "",

  maxCapacity: 1,
  maxPurchasePerUser: 0,

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
      formData: { ...state.formData, bannerImage: file, bannerImagePreview: preview },
    }));
  },

  updatePosters: (files, previews) => {
    set((state) => ({
      formData: { ...state.formData, images: files, imagePreviews: previews },
    }));
  },

  // Step 3 updates - DateTime
  updateEventDateTime: (data: { startEventDateTime?: Date; endEventDateTime?: Date }) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateRegistrationDateTime: (data: { startRegistrationDateTime?: Date; endRegistrationDateTime?: Date }) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  addRundown: () => {
    set((state) => ({
      formData: {
        ...state.formData,
        rundown: [
          ...state.formData.rundown,
          {
            title: "",
            description: "",
            startTime: "",
            endTime: "",
          },
        ],
      },
    }));
  },

  removeRundown: (index) => {
    set((state) => ({
      formData: {
        ...state.formData,
        rundown: state.formData.rundown.filter((_, i) => i !== index),
      },
    }));
  },

  updateRundown: (index, field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        rundown: state.formData.rundown.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  },

  updateIsOnline: (isOnline) => {
    set((state) => ({
      formData: { ...state.formData, isOnline },
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

  updateMeetingUrl: (url) => {
    set((state) => ({
      formData: { ...state.formData, meetingUrl: url },
    }));
  },

  // Step 4 updates

  updateMaxCapacity: (maxCapacity) => {
    set((state) => ({
      formData: { ...state.formData, maxCapacity },
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
  }
}));

