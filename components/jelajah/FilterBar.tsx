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
    <section className="sticky top-22 z-20 px-4 py-2 pointer-events-none">
      <div className="container mx-auto pointer-events-auto">
        <div className="w-full bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm rounded-xl p-3 md:p-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full flex-1">
              {/* Hapus div pembungkus width manual, biarkan grid yang mengatur */}
              <CategoryFilter />
              <LocationFilter />
              <PriceFilter />
              <SortByFilter />
            </div>

            {/* Tombol Reset (Kanan) */}
            {isFiltering && (
              <div className="flex justify-end lg:justify-start mt-2 lg:mt-0 lg:pl-4 lg:border-l lg:border-slate-200 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="text-danger border-danger hover:bg-danger/50 hover:text-danger hover:border-danger gap-2 px-3 h-10 w-full sm:w-auto rounded-xl"
                >
                  <X size={16} />
                  <span>Reset Filter</span>
                </Button>
              </div>
            )}

            {/* Label Filter (Jika tidak ada reset) */}
            {!isFiltering && (
              <div className="hidden lg:flex items-center gap-2 text-slate-400 px-4 border-l border-slate-200 text-sm font-medium shrink-0">
                <Filter size={16} />
                <span>Filter</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
