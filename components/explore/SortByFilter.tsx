"use client";

import * as React from "react";
import { Check, ChevronsUpDown, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sortMethods = [
  { value: "newest", label: "Terbaru" },
  { value: "closest", label: "Terdekat" },
  { value: "lowest_price", label: "Harga Terendah" },
  { value: "highest_price", label: "Harga Tertinggi" },
];

const normalizeSortValue = (value: string) => {
  const legacySortMap: Record<string, string> = {
    Terbaru: "newest",
    terbaru: "newest",
    Terdekat: "closest",
    terdekat: "closest",
    Harga_Terendah: "lowest_price",
    harga_terendah: "lowest_price",
    Harga_Tertinggi: "highest_price",
    harga_tertinggi: "highest_price",
  };

  return legacySortMap[value] ?? value;
};

export default function SortByFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil sort dari URL. Jika kosong, anggap default "Terbaru"
  const currentSort = normalizeSortValue(searchParams.get("sort") || "newest");
  const currentLabel = sortMethods.find((s) => s.value === currentSort)?.label || "Terbaru";

  const onSelectSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // LOGIKA DEFAULT:
    // Jika user memilih "Terbaru", HAPUS parameter dari URL.
    if (value === "newest") {
      params.delete("sort");
    } else {
      // Jika selain terbaru, pasang di URL
      params.set("sort", value);
    }

    params.delete("page");
    params.delete("offset");
    router.push(`?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-2.5 lg:py-3 px-3 lg:px-5 bg-transparent hover:bg-slate-50 rounded-xl lg:rounded-full border-0 shadow-none transition-colors min-w-0"
        >
          <div className="flex items-center gap-3 w-full min-w-0">
            <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center shrink-0">
              <ArrowUpDown className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 text-left">
              <span className="text-xs text-slate-400 font-medium shrink-0">Urutkan</span>
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span className="text-sm font-semibold text-slate-900 truncate w-full mt-0.5 cursor-pointer">
                      {currentLabel}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start">
                    {currentLabel}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-300" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-50 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {sortMethods.map((method) => (
                <CommandItem
                  key={method.value}
                  value={method.value}
                  onSelect={() => onSelectSort(method.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      // Cek apakah item ini aktif (handle default value juga)
                      currentSort === method.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {method.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
