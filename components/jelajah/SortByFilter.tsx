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

const sortMethods = [
  { value: "Terbaru", label: "Terbaru" },
  { value: "Terdekat", label: "Terdekat" },
  { value: "Populer", label: "Populer" },
  { value: "Harga_Terendah", label: "Harga Terendah" },
  { value: "Harga_Tertinggi", label: "Harga Tertinggi" },
];

export default function SortByFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil sort dari URL. Jika kosong, anggap default "Terbaru"
  const currentSort = searchParams.get("sort") || "Terbaru";

  const onSelectSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // LOGIKA DEFAULT:
    // Jika user memilih "Terbaru", HAPUS parameter dari URL.
    if (value === "Terbaru") {
      params.delete("sort");
    } else {
      // Jika selain terbaru, pasang di URL
      params.set("sort", value);
    }

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
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate">
              {/* Cari label berdasarkan value, kalau gak ketemu (default) pake "Terbaru" */}
              {sortMethods.find((s) => s.value === currentSort)?.label ||
                "Urutkan"}
            </span>
          </div>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
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
