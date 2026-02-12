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
  updateBanner: (file: File | null, preview: string) => void;

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
  updateIsPaid: (isPaid: boolean) => void;
  updateMaxCapacity: (capacity: number) => void;

  updateTickets: (tickets: TicketRequest[]) => void;
  addTicket: () => void;
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
  eventType: undefined,
  title: "",
  category: "",
  description: "",
  bannerFile: null,
  bannerPreview: "",
  
  startEventDateTime: undefined,
  endEventDateTime: undefined,
  
  startRegistrationDateTime: undefined,
  endRegistrationDateTime: undefined,

  rundown: [],
  
  isOnline: false,
  address: {
    rawAddress: "",
    city: "",
    province: "",
    postalCode: "",
    latitude: 0,
    longitude: 0,
  },
  meetingUrl: "",
  
  isPaid: false,
  maxCapacity: 0,
  maxPurchasePerUser: undefined,
  
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
      formData: { ...state.formData, eventType: type },
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

  updateBanner: (file, preview) => {
    set((state) => ({
      formData: { ...state.formData, bannerFile: file, bannerPreview: preview },
    }));
  },

  // Step 3 updates - DateTime
  updateEventDateTime: (data: {startEventDateTime?: Date; endEventDateTime?: Date}) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateRegistrationDateTime: (data: {startRegistrationDateTime?: Date; endRegistrationDateTime?: Date}) => {
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
  updateIsPaid: (isPaid) => {
    set((state) => {
      // 🌟 FIX: Reset tickets when switching modes
      // If switching to FREE, we DO NOT create a placeholder ticket anymore (User request)
      // If switching to PAID, we start with empty tickets
      return {
        formData: { ...state.formData, isPaid, tickets: [] },
      };
    });
  },

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

  addTicket: () => {
    set((state) => ({
      formData: {
        ...state.formData,
        tickets: [
          ...state.formData.tickets,
          { name: "", price: 0, quota: 0, description: "" },
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

