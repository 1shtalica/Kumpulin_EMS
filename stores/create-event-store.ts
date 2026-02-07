import { create } from "zustand";
import type {
  CreateEventFormState,
  EventType,
  LocationType,
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
  updateSchedule: (data: {
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
  }) => void;
  updateLocationType: (type: LocationType) => void;
  updateAddress: (address: Partial<CreateEventFormState["address"]>) => void;
  updateMeetingUrl: (url: string) => void;

  // Field updates - Step 4
  updateIsPaid: (isPaid: boolean) => void;
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
  startDate: undefined,
  endDate: undefined,
  startTime: "",
  endTime: "",
  locationType: "offline",
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

  // goToStep: (step: number) => {
  //   if (step >= 1 && step <= 5) {
  //     set({ currentStep: step });
  //     set((state) => ({
  //       formData: { ...state.formData, step },
  //     }));
  //   }
  // },

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
  updateSchedule: (data) => {
    set((state) => ({
      formData: { ...state.formData, ...data },
    }));
  },

  updateLocationType: (type) => {
    set((state) => ({
      formData: { ...state.formData, locationType: type },
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
      // If switching to free, create a default free ticket
      const tickets = isPaid
        ? state.formData.tickets
        : [{ name: "Tiket Gratis", price: 0, quota: 100, description: "" }];

      return {
        formData: { ...state.formData, isPaid, tickets },
      };
    });
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
        const hasValidDates =
          formData.startDate &&
          formData.endDate &&
          formData.startTime &&
          formData.endTime;

        if (!hasValidDates) return false;

        // Validate location based on type
        if (formData.locationType === "offline") {
          return (
            formData.address.rawAddress.trim() !== "" &&
            formData.address.city.trim() !== "" &&
            formData.address.province.trim() !== ""
          );
        } else {
          // online
          return formData.meetingUrl.trim() !== "";
        }
      }

      case 4:
        return (
          formData.tickets.length > 0 &&
          formData.tickets.every(
            (ticket) =>
              ticket.name.trim() !== "" &&
              ticket.quota > 0 &&
              (formData.isPaid ? ticket.price > 0 : true),
          )
        );

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
