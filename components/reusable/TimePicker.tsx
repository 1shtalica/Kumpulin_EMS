"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string; // "HH:mm" format
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "Pilih waktu",
  disabled = false,
  className,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);

  // Parse current value
  const [hour, minute] = value ? value.split(":") : ["", ""];

  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const handleTimeSelect = (newHour: string, newMinute: string) => {
    const time = `${newHour}:${newMinute}`;
    onChange?.(time);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Hours Column */}
          <ScrollArea className="h-60 w-20">
            <div className="p-2 space-y-1">
              {hours.map((h) => (
                <div
                  key={h}
                  onClick={() => handleTimeSelect(h, minute || "00")}
                  className={cn(
                    "cursor-pointer rounded px-2 py-1 text-center text-sm hover:bg-slate-200 transition-colors",
                    h === hour &&
                      "bg-primary text-primary-foreground font-medium",
                  )}
                >
                  {h}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Separator */}
          <div className="flex items-center justify-center w-8 text-muted-foreground">
            :
          </div>

          {/* Minutes Column */}
          <ScrollArea className="h-60 w-20">
            <div className="p-2 space-y-1">
              {minutes.map((m) => (
                <div
                  key={m}
                  onClick={() => handleTimeSelect(hour || "00", m)}
                  className={cn(
                    "cursor-pointer rounded px-2 py-1 text-center text-sm hover:bg-slate-200 transition-colors",
                    m === minute &&
                      "bg-primary text-primary-foreground font-medium",
                  )}
                >
                  {m}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
