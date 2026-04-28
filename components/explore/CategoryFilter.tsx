"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Tag, Loader2 } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventService } from "@/services/event-service";

export default function CategoryFilter() {
  const [open, setOpen] = React.useState(false);
  const [dynamicCategories, setDynamicCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const catList = ['Rapat', 'Konser', 'Workshop', 'Lomba', 'Pameran', 'Seminar', 'Networking', 'Kompetisi', 'Festival', 'Olahraga', 'Lainnya'];
        if (catList && catList.length > 0) {
          setDynamicCategories(catList);
        }
      } catch (error) {
        console.error("Gagal load kategori untuk filter explore:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const onSelectCategory = (currentValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentValue === currentCategory) {
      params.delete("category");
    } else {
      params.set("category", currentValue);
    }
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
          className="w-full justify-between h-auto py-2.5 lg:py-3 px-3 lg:px-5 bg-transparent hover:bg-slate-50 rounded-xl lg:rounded-full border-0 shadow-none transition-colors"
        >
          <div className="flex items-center gap-3 w-full min-w-0">
            <div className="hidden sm:flex h-10 w-10 rounded-full bg-primary/10 items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 text-left">
              <span className="text-xs text-slate-400 font-medium">Kategori</span>
              <span className="text-sm font-semibold text-slate-900 truncate w-full mt-0.5">
                {currentCategory || "Semua"}
              </span>
            </div>
          </div>
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin text-slate-300" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-300" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-70 p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari kategori..." />
          <CommandList>
            <CommandEmpty>
              {loading ? "Memuat..." : "Kategori tidak ditemukan."}
            </CommandEmpty>
            <CommandGroup>
              {!loading &&
                dynamicCategories.map((catString) => (
                  <CommandItem
                    key={catString}
                    value={catString}
                    onSelect={() => onSelectCategory(catString)}
                    className="capitalize"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentCategory?.toLowerCase() === catString.toLowerCase()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {catString}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
