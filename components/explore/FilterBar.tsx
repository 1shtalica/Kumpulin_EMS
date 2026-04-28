"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

import CategoryFilter from "./CategoryFilter";
import LocationFilter from "./LocationFilter";
import PriceFilter from "./PriceFilter";
import SortByFilter from "./SortByFilter";

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Cek filter aktif
  const hasCategory = searchParams.has("category");
  const hasLocation = searchParams.has("location");
  const hasPrice = searchParams.has("price");
  const hasSort = searchParams.has("sort");
  const isFiltering = hasCategory || hasLocation || hasPrice || hasSort;

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("location");
    params.delete("price");
    params.delete("sort");
    params.delete("page");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="sticky top-20 z-40 py-4 pointer-events-none">
      <div className="w-full max-w-4xl mx-auto pointer-events-auto">
        <div className="relative w-full bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-3xl lg:rounded-full p-2 lg:p-1.5 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center">

            {/* Filter Items inside pill */}
            <div className="grid grid-cols-2 lg:flex w-full flex-1 gap-1 lg:gap-0 lg:divide-x divide-slate-100">
              <div className="flex-1 w-full"><CategoryFilter /></div>
              <div className="flex-1 w-full"><LocationFilter /></div>
              <div className="flex-1 w-full"><PriceFilter /></div>
              <div className="flex-1 w-full"><SortByFilter /></div>
            </div>

            {/* Reset Button (End of pill) */}
            <div className="flex items-center justify-end mt-2 lg:mt-0 lg:ml-2 shrink-0">
              {isFiltering ? (
                <Button
                  onClick={handleReset}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-0 rounded-xl lg:rounded-full h-12 lg:h-14 px-6 gap-2 w-full lg:w-auto shadow-none transition-colors font-semibold"
                >
                  <X size={18} />
                  <span>Reset</span>
                </Button>
              ) : (
                <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 text-slate-400 border border-slate-100 shrink-0">
                  <Filter size={20} />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
