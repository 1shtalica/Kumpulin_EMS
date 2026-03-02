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
        const catList = await EventService.getEventCategories();
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
    params.delete("offset"); // Reset paginasi setiap filter ganti.
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
            <Tag className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="truncate">
               {currentCategory || "Kategori"}
            </span>
          </div>
          {loading ? (
             <Loader2 className="ml-1 h-3.5 w-3.5 shrink-0 animate-spin opacity-50" />
          ) : (
             <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
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
