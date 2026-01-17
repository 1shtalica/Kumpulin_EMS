"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation"; // Hook URL

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

// Dummy Data Kategori (Nanti ini bisa dari Props/API)
const categories = [
  { value: "semua_kategori", label: "Semua Kategori" },
  { value: "musik", label: "Musik" },
  { value: "teknologi", label: "Teknologi" },
  { value: "olahraga", label: "Olahraga" },
  { value: "desain", label: "Desain" },
  { value: "bisnis", label: "Bisnis" },
  { value: "kuliner", label: "Kuliner" },
  { value: "seni", label: "Seni" },
  { value: "bazar", label: "Bazar" },
  { value: "lomba", label: "Lomba" },
];

export default function CategoryFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Baca URL saat ini untuk menentukan nilai aktif
  const currentCategory = searchParams.get("category");

  // 2. Fungsi update URL saat user memilih item
  const onSelectCategory = (currentValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Logic Toggle: Kalau diklik lagi, hapus filternya
    if (currentValue === "semua_kategori" || currentValue === currentCategory) {
      params.delete("category");
    } else {
      params.set("category", currentValue);
    }

    // Reset page ke 1 setiap ganti filter
    params.delete("page");

    router.push(`?${params.toString()}`, { scroll: false });
    setOpen(false); // Tutup dropdown
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between" // Full width di sidebar
        >
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 shrink-0 text-slate-500" />
            <span>
              {currentCategory
                ? categories.find((cat) => cat.value === currentCategory)?.label
                : "Semua Kategori"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-70 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari kategori..." />
          <CommandList>
            <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.value}
                  value={category.value}
                  onSelect={() => onSelectCategory(category.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentCategory === category.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {category.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
