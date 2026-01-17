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

// Data Opsi Harga
const priceOptions = [
  { value: "semua_harga", label: "Semua Harga" },
  { value: "gratis", label: "Gratis" },
  { value: "berbayar", label: "Berbayar" },
];

export default function PriceFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Baca URL parameter 'price'
  // Jika kosong, anggap user sedang memilih "semua_harga"
  const currentPrice = searchParams.get("price") || "semua_harga";

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
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 shrink-0 text-slate-500" />
            <span>
              {/* Cari label berdasarkan value URL, fallback ke "Semua Harga" */}
              {priceOptions.find((p) => p.value === currentPrice)?.label ||
                "Semua Harga"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
