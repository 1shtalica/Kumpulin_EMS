"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  className?: string;
}

/**
 * Format date to Indonesian locale without date-fns
 * Example: "11 Februari 2026, 14:30"
 */
function formatDateTime(date: Date): string {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

export default function DateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal & waktu",
  disabled = false,
  minDate,
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve existing time if date already set
      if (value) {
        const newDate = new Date(selectedDate);
        newDate.setHours(value.getHours());
        newDate.setMinutes(value.getMinutes());
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        onChange?.(newDate);
      } else {
        // Set to current time if no time set yet
        const newDate = new Date(selectedDate);
        const now = new Date();
        newDate.setHours(now.getHours());
        newDate.setMinutes(now.getMinutes());
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        onChange?.(newDate);
      }
    } else {
      onChange?.(undefined);
    }
  };

  const handleTimeChange = (type: "hour" | "minute", timeValue: number) => {
    if (!value) return; // Must select a date first

    const newDate = new Date(value);
    if (type === "hour") {
      newDate.setHours(timeValue);
    } else if (type === "minute") {
      newDate.setMinutes(timeValue);
    }
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    onChange?.(newDate);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal shadow-xs bg-white",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDateTime(value) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date: Date) => {
              if (minDate) {
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0);
                const minCompare = new Date(minDate);
                minCompare.setHours(0, 0, 0, 0);
                return compareDate < minCompare;
              }
              return false;
            }}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            {/* Hours */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      value && value.getHours() === hour ? "default" : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("hour", hour)}
                  >
                    {hour.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            {/* Minutes */}
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange("minute", minute)}
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}