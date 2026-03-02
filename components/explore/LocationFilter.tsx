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
import { INDONESIA_REGIONS } from "@/constants/regions";

// Membentuk opsi dropdown, ditambah opsi default di atas
const Locations = [
  { value: "semua_lokasi", label: "Semua Lokasi" },
  { value: "online", label: "Online" },
  ...INDONESIA_REGIONS.map((prov) => ({
    value: prov.id,
    label: prov.name,
  }))
];

export default function LocationFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLocation = searchParams.get("location") || "semua_lokasi";

  const onSelectLocation = (currentValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentValue === "semua_lokasi" || currentValue === currentLocation) {
      params.delete("location");
    } else {
      params.set("location", currentValue);
    }

    params.delete("offset"); // Reset pagination

    router.push(`?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-sm hover:bg-primary-light"
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate">
              {Locations.find((loc) => loc.value === currentLocation)?.label ||
                "Lokasi"}
            </span>
          </div>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
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
