"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Ticket } from "lucide-react";
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

// Data Opsi Harga
const priceOptions = [
  { value: "semua_harga", label: "Semua Harga" },
  { value: "gratis", label: "Gratis" },
  { value: "berbayar", label: "Berbayar" },
  {value: "gratis_berbayar", label: "Gratis & Berbayar"}
];

export default function PriceFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Baca URL parameter 'price'
  // Jika kosong, anggap user sedang memilih "semua_harga"
  const currentPrice = searchParams.get("price") || "semua_harga";
  const currentLabel = priceOptions.find((p) => p.value === currentPrice)?.label || "Semua Harga";

  const onSelectPrice = (selectedValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // 2. Logika Update URL
    if (selectedValue === "semua_harga") {
      // Jika pilih "Semua Harga", HAPUS parameter biar URL bersih
      params.delete("price");
    } else {
      // Selain itu, pasang value ke URL (gratis/berbayar)
      params.set("price", selectedValue);
    }

    params.delete("page"); // Reset pagination ke halaman 1

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
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 text-left">
              <span className="text-xs text-slate-400 font-medium shrink-0">Harga</span>
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
              {priceOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => onSelectPrice(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      // Cek aktif: Bandingkan value item dengan URL (atau default 'semua_harga')
                      currentPrice === option.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
