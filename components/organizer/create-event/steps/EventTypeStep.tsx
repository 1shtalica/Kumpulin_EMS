"use client";

import { Building2, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types/create-event";

interface EventTypeStepProps {
  selectedType: EventType;
  onSelectType: (type: Exclude<EventType, null>) => void;
}

const eventTypes = [
  {
    type: "public" as const,
    icon: Globe2,
    title: "Event Publik",
    description: "Terbuka untuk umum dan dapat diakses oleh siapa saja",
    color: "text-primary",
    bgColor: "bg-primary-light",
    borderColor: "border-primary",
  },
  {
    type: "internal" as const,
    icon: Building2,
    title: "Event Internal",
    description: "Khusus untuk anggota organisasi atau komunitas tertentu",
    color: "text-secondary",
    bgColor: "bg-secondary-light",
    borderColor: "border-secondary",
  },
];

export default function EventTypeStep({
  selectedType,
  onSelectType,
}: EventTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent">Pilih Tipe Event</h2>
        <p className="mt-2 text-muted">
          Tentukan apakah event ini terbuka untuk umum atau internal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {eventTypes.map((eventType) => {
          const Icon = eventType.icon;
          const isSelected = selectedType === eventType.type;

          return (
            <button
              key={eventType.type}
              onClick={() => onSelectType(eventType.type)}
              className={cn(
                "relative flex flex-col items-start rounded-lg border-2 p-6 text-left transition-all",
                "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isSelected
                  ? `${eventType.borderColor} ${eventType.bgColor} shadow-md`
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "mb-4 rounded-lg p-3",
                  isSelected ? eventType.bgColor : "bg-gray-100",
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6",
                    isSelected ? eventType.color : "text-gray-600",
                  )}
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <h3
                  className={cn(
                    "text-lg font-semibold",
                    isSelected ? eventType.color : "text-gray-900",
                  )}
                >
                  {eventType.title}
                </h3>
                <p className="text-sm text-gray-600">{eventType.description}</p>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute right-4 top-4">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full",
                      eventType.color,
                      eventType.bgColor,
                    )}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
