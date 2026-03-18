import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ViewPreferenceState {
  layout: "list" | "grid";
  setLayout: (layout: "list" | "grid") => void;
}

export const useViewPreferenceStore = create<ViewPreferenceState>()(
  persist(
    (set) => ({
      layout: "list",
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: "view-preference-storage", // name of the item in local storage
    }
  )
);
