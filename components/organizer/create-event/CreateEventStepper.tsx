"use client";

import {
  CalendarClock,
  Check,
  Eye,
  Info,
  Shapes,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const createEventSteps: {
  number: number;
  title: string;
  description: string;
  Icon: LucideIcon;
}[] = [
  {
    number: 1,
    title: "Tipe Event",
    description: "Tentukan akses dan jangkauan event.",
    Icon: Shapes,
  },
  {
    number: 2,
    title: "Informasi",
    description: "Isi identitas, kategori, dan materi visual.",
    Icon: Info,
  },
  {
    number: 3,
    title: "Jadwal & Lokasi",
    description: "Atur periode, rundown, dan tempat.",
    Icon: CalendarClock,
  },
  {
    number: 4,
    title: "Tiket",
    description: "Kelola kapasitas dan jenis tiket.",
    Icon: Ticket,
  },
  {
    number: 5,
    title: "Preview",
    description: "Periksa detail sebelum publikasi.",
    Icon: Eye,
  },
];

interface CreateEventStepperProps {
  currentStep: number;
}

export default function CreateEventStepper({
  currentStep,
}: CreateEventStepperProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/5">
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {createEventSteps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const Icon = step.Icon;

          return (
            <div
              key={step.number}
              className={cn(
                "group flex min-w-[210px] items-start gap-3 rounded-xl border p-3 transition-all duration-200 lg:min-w-0",
                isActive
                  ? "border-primary/30 bg-primary-light/60 shadow-sm shadow-primary/10"
                  : isCompleted
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  isCompleted
                    ? "border-emerald-200 bg-emerald-500 text-white"
                    : isActive
                    ? "border-primary/30 bg-white text-primary"
                    : "border-slate-200 bg-white text-slate-400",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-emerald-700"
                        : "text-slate-700",
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-slate-200">
                    {step.number}/5
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
