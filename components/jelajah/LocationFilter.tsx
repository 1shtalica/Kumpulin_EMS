"use client";

import * as React from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react"; // 1. Tambah MapPin
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

const Locations = [
  { value: "semua_lokasi", label: "Semua Lokasi" },
  { value: "online", label: "Online" },
  { value: "aceh", label: "Aceh" },
  { value: "bali", label: "Bali" },
  { value: "banten", label: "Banten" },
  { value: "bengkulu", label: "Bengkulu" },
  { value: "di_yogyakarta", label: "DI Yogyakarta" },
  { value: "dki_jakarta", label: "DKI Jakarta" },
  { value: "gorontalo", label: "Gorontalo" },
  { value: "jambi", label: "Jambi" },
  { value: "jawa_barat", label: "Jawa Barat" },
  { value: "jawa_tengah", label: "Jawa Tengah" },
  { value: "jawa_timur", label: "Jawa Timur" },
  { value: "kalimantan_barat", label: "Kalimantan Barat" },
  { value: "kalimantan_selatan", label: "Kalimantan Selatan" },
  { value: "kalimantan_tengah", label: "Kalimantan Tengah" },
  { value: "kalimantan_timur", label: "Kalimantan Timur" },
  { value: "kalimantan_utara", label: "Kalimantan Utara" },
  { value: "kepulauan_bangka_belitung", label: "Kepulauan Bangka Belitung" },
  { value: "kepulauan_riau", label: "Kepulauan Riau" },
  { value: "lampung", label: "Lampung" },
  { value: "maluku", label: "Maluku" },
  { value: "maluku_utara", label: "Maluku Utara" },
  { value: "nusa_tenggara_barat", label: "Nusa Tenggara Barat" },
  { value: "nusa_tenggara_timur", label: "Nusa Tenggara Timur" },
  { value: "papua", label: "Papua" },
  { value: "papua_barat", label: "Papua Barat" },
  { value: "papua_barat_daya", label: "Papua Barat Daya" },
  { value: "papua_pegunungan", label: "Papua Pegunungan" },
  { value: "papua_selatan", label: "Papua Selatan" },
  { value: "papua_tengah", label: "Papua Tengah" },
  { value: "riau", label: "Riau" },
  { value: "sulawesi_barat", label: "Sulawesi Barat" },
  { value: "sulawesi_selatan", label: "Sulawesi Selatan" },
  { value: "sulawesi_tengah", label: "Sulawesi Tengah" },
  { value: "sulawesi_tenggara", label: "Sulawesi Tenggara" },
  { value: "sulawesi_utara", label: "Sulawesi Utara" },
  { value: "sumatera_barat", label: "Sumatera Barat" },
  { value: "sumatera_selatan", label: "Sumatera Selatan" },
  { value: "sumatera_utara", label: "Sumatera Utara" },
];

export default function LocationFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil lokasi dari URL. Jika tidak ada, anggap "semua_lokasi"
  const currentLocation = searchParams.get("location") || "semua_lokasi";

  const onSelectLocation = (currentValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Logic: Jika pilih "semua_lokasi" atau klik ulang lokasi yang sama -> Hapus Filter
    if (currentValue === "semua_lokasi" || currentValue === currentLocation) {
      params.delete("location");
    } else {
      params.set("location", currentValue);
    }

    params.delete("page");

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
          className="w-full justify-between"
        >
          {/* 2. Wrapper Flex untuk Icon + Teks */}
          <div className="flex items-center gap-2 overflow-hidden">
            <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">
              {/* Logic Label: Cari label berdasarkan value, fallback ke "Semua Lokasi" */}
              {Locations.find((loc) => loc.value === currentLocation)?.label ||
                "Semua Lokasi"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* 3. Lebar diperbesar agar nama provinsi panjang muat */}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
