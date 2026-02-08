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

  // Field updates - Step 1
  updateEventType: (type: EventType) => void;

  // Field updates - Step 2
  updateTitle: (title: string) => void;
  updateCategory: (category: string) => void;
  updateDescription: (description: string) => void;
  updateBanner: (file: File | null, preview: string) => void;

  // Field updates - Step 3
  updateEventSchedule: (data: {
    startEventDate?: Date;
    endEventDate?: Date;
    startEventTime?: string;
    endEventTime?: string;
  }) => void;
  
  updateRegistrationSchedule: (data: {
    startRegistration?: Date;
    endRegistration?: Date;
    startRegistrationTime?: string;
    endRegistrationTime?: string;
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

  // Validation
  validateStep: (step: number) => boolean;

  // Form actions
  reset: () => void;
}

// Initial state
const initialFormData: CreateEventFormState = {
  eventType: null,
  title: "",
  category: "",
  description: "",
  bannerFile: null,
  bannerPreview: "",
  
  startEventDate: undefined,
  endEventDate: undefined,
  startEventTime: "",
  endEventTime: "",
  
  startRegistration: undefined,
  endRegistration: undefined,
  startRegistrationTime: "",
  endRegistrationTime: "",

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
  
  tickets: [],
  step: 1,
};

export const useCreateEventStore = create<CreateEventStore>((set, get) => ({
  formData: initialFormData,
  currentStep: 1,

  // Navigation
  nextStep: () => {
    const { currentStep, validateStep } = get();
    if (validateStep(currentStep) && currentStep < 5) {
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

  // Step 3 updates
  updateEventSchedule: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateRegistrationSchedule: (data) => {
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
            location: "",
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
      // If switching to free, ensure tickets reflect that logic if needed
      // But typically we just update the flag.
      // If we want auto-ticket for free:
      const tickets = !isPaid && state.formData.tickets.length === 0
          ? [{ name: "Tiket Gratis", price: 0, quota: 100, description: "" }]
          : state.formData.tickets;

      return {
        formData: { ...state.formData, isPaid, tickets },
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

  // Validation
  validateStep: (step) => {
    const { formData } = get();

    switch (step) {
      case 1:
        return formData.eventType !== null;

      case 2:
        return (
          formData.title.trim() !== "" &&
          formData.category.trim() !== "" &&
          formData.description.trim().length >= 10 &&
          formData.bannerFile !== null
        );

      case 3: {
        const hasEventSchedule =
          formData.startEventDate &&
          formData.endEventDate &&
          formData.startEventTime &&
          formData.endEventTime;

        if (!hasEventSchedule) return false;
        
        // Location validation
        if (!formData.isOnline) {
             const hasAddress = 
                formData.address.rawAddress.trim() !== "" &&
                formData.address.city.trim() !== "" &&
                formData.address.province.trim() !== "";
             if (!hasAddress) return false;
        } else {
             if (formData.meetingUrl.trim() === "") return false;
        }

        // Rundown validation (at least one rundown item is recommended, but maybe not strictly required? Let's assume required to be safe)
        if (formData.rundown.length === 0) return false;
        const isRundownValid = formData.rundown.every(
            r => r.title.trim() !== "" && r.startTime !== "" && r.endTime !== ""
        );
        if (!isRundownValid) return false;

        return true;
      }

      case 4:
        const hasTickets = formData.tickets.length > 0 &&
          formData.tickets.every(
            (ticket) =>
              ticket.name.trim() !== "" &&
              ticket.quota > 0 &&
              (formData.isPaid ? ticket.price > 0 : true),
          );
          
         // maxCapacity 0 means unlimited
         if (formData.maxCapacity < 0) return false;
         
         return hasTickets;

      case 5:
        // Preview step - always valid
        return true;

      default:
        return false;
    }
  },

  // Reset
  reset: () => {
    set({
      formData: initialFormData,
      currentStep: 1,
    });
  },
}));

