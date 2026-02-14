"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, title: "Tipe Event" },
  { number: 2, title: "Informasi" },
  { number: 3, title: "Jadwal & Lokasi" },
  { number: 4, title: "Tiket" },
  { number: 5, title: "Preview" },
];

interface CreateEventStepperProps {
  currentStep: number;
}

export default function CreateEventStepper({ currentStep }: CreateEventStepperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.number} className={cn("flex items-center", !isLastStep && "flex-1")}>

              {/* 1. STEP CIRCLE & LABEL WRAPPER */}
              <div className="relative flex flex-col items-center z-10">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    // Kondisi Completed: Biru Penuh
                    isCompleted
                      ? "border-primary bg-primary text-white"
                      : // Kondisi Active: Lingkaran Putih, Border Biru
                      isActive
                        ? "border-primary bg-white text-primary ring-2 ring-primary/20"
                        : // Kondisi Inactive: Abu-abu
                        "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">{step.number}</span>
                  )}
                </div>

                {/* Label Judul (Absolute biar ga ganggu layout flex) */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 text-center hidden md:block">
                  <span
                    className={cn(
                      "text-xs font-semibold transition-colors duration-300",
                      isActive ? "text-primary" : "text-slate-500"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
              </div>

              {/* 2. CONNECTOR LINE (Garis Penghubung) */}
              {/* Hanya render garis jika BUKAN step terakhir */}
              {!isLastStep && (
                <div className="flex-1 h-0.5 mx-2 bg-slate-200 relative">
                  {/* Garis Biru (Progress) yang mengisi di atas garis abu-abu */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-in-out",
                      isCompleted ? "w-full" : "w-0" // Kuncinya di sini: Kalo step ini selesai, garis kanannya biru full
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Spacer bawah untuk menampung teks label yang absolute tadi */}
      <div className="h-8" />
    </div>
  );
}