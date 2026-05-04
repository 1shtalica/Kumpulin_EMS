"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
import { INDONESIA_REGIONS } from "@/constants/regions";

// Membentuk opsi dropdown, ditambah opsi default di atas
const Locations = [
  { value: "semua_lokasi", label: "Semua Lokasi" },
  { value: "online", label: "Online" },
  ...INDONESIA_REGIONS.map((prov) => ({
    value: prov.name,
    label: prov.name,
  }))
];

export default function LocationFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCurrentLocation =
    searchParams.get("province") ||
    searchParams.get("location") ||
    "semua_lokasi";
  const matchedProvince = INDONESIA_REGIONS.find(
    (province) =>
      province.id === rawCurrentLocation || province.name === rawCurrentLocation,
  );
  const currentLocation = matchedProvince?.name ?? rawCurrentLocation;
  const currentLabel =
    Locations.find((loc) => loc.value === currentLocation)?.label || "Semua";

  const onSelectLocation = (currentValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("location");

    if (currentValue === "semua_lokasi" || currentValue === currentLocation) {
      params.delete("province");
    } else if (currentValue === "online") {
      params.delete("province");
      params.set("location", currentValue);
    } else {
      params.set("province", currentValue);
    }

    params.delete("offset"); // Reset pagination
    params.delete("page");

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
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 text-left">
              <span className="text-xs text-slate-400 font-medium shrink-0">Lokasi</span>
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

      <PopoverContent className="w-70 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari Lokasi..." />
          <CommandList>
            <CommandEmpty>Lokasi tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {Locations.map((location) => (
                <CommandItem
                  key={location.value}
                  value={location.value}
                  onSelect={() => onSelectLocation(location.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentLocation === location.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {location.label}
                </CommandItem>
              ))}
            </CommandGroup>
            {/* TODO: Kalau dari BE udah support kabupaten/kota, nanti dilooping disini atau dibikin 2 tingkat filter */}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
