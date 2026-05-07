import type { TicketFilterType } from "@/types/ticket";

// Re-export for backward compat
export type { TicketFilterType };

interface TicketFilterProps {
  currentFilter: TicketFilterType;
  onFilterChange: (filter: TicketFilterType) => void;
}

export function TicketFilter({ currentFilter, onFilterChange }: TicketFilterProps) {
  return (
    <div className="flex gap-2 mb-6 border-b border-slate-200 pb-px">
      <button
        onClick={() => onFilterChange("mendatang")}
        className={` cursor-pointer px-6 py-3 font-medium text-sm transition-all relative ${
          currentFilter === "mendatang" 
            ? "text-primary" 
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Mendatang
        {currentFilter === "mendatang" && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
        )}
      </button>
      <button
        onClick={() => onFilterChange("riwayat")}
        className={` cursor-pointer px-6 py-3 font-medium text-sm transition-all relative ${
          currentFilter === "riwayat" 
            ? "text-primary" 
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Riwayat
        {currentFilter === "riwayat" && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
        )}
      </button>
    </div>
  );
}
