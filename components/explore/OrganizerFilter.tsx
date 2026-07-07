"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";
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

const organizerFilterOptions = [
  { value: "all", label: "Semua Organizer" },
  { value: "true", label: "Yang Diikuti" },
];

export default function OrganizerFilter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil following dari URL. Jika kosong, anggap default "all"
  const currentFollowing = searchParams.get("following") || "all";
  const currentLabel =
    organizerFilterOptions.find((o) => o.value === currentFollowing)?.label ||
    "Semua Organizer";

  const onSelectOption = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("following");
    } else {
      params.set("following", value);
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
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start min-w-0 flex-1 text-left">
              <span className="text-xs text-slate-400 font-medium shrink-0">
                Organizer
              </span>
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
              {organizerFilterOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => onSelectOption(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentFollowing === option.value
                        ? "opacity-100"
                        : "opacity-0"
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
