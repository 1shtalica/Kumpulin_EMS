"use client";

import { cn } from "@/lib/utils";
import type { EventType } from "@/types/create-event";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface EventTypeStepProps {
  selectedType: EventType;
  onSelectType: (type: Exclude<EventType, null>) => void;
}

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

      <div className="grid gap-6 md:grid-cols-2">
        <Button
          variant="ghost"
          onClick={() => onSelectType("public")}
          className={cn(
            "relative flex h-auto flex-col items-start gap-4 rounded-xl border-2 p-6 text-left transition-all shadow-xs hover:shadow-sm hover:bg-transparent whitespace-normal wrap-break-word w-full",
            selectedType === "public"
              ? "border-primary bg-primary-light hover:bg-primary-light"
              : "border-slate-100 bg-white hover:bg-white hover:border-slate-200",
          )}
        >
          {selectedType === "public" && (
            <div className="absolute top-4 right-4 rounded-full bg-primary p-1 text-white shadow-xs">
              <Check className="h-4 w-4" />
            </div>
          )}

          <div className="flex w-full items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm border border-slate-100">
              🌍
            </div>
            <div>
              <h3 className="text-lg font-bold text-accent">Event Publik</h3>
              <p className="text-sm font-medium text-muted">
                Terbuka untuk umum
              </p>
            </div>
          </div>

          <div className="w-full space-y-2 rounded-lg p-3 text-sm text-muted">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Tampil di halaman utama pencarian</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Dapat berbayar atau gratis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Jangkauan audiens lebih luas</span>
              </li>
            </ul>
          </div>
        </Button>

        <Button
          variant="ghost"
          onClick={() => onSelectType("internal")}
          className={cn(
            "relative flex h-auto flex-col items-start gap-4 rounded-xl border-2 p-6 text-left transition-all shadow-xs hover:shadow-sm hover:bg-transparent whitespace-normal wrap-break-word w-full",
            selectedType === "internal"
              ? "border-secondary bg-secondary-light hover:bg-secondary-light"
              : "border-slate-100 bg-white hover:bg-white hover:border-slate-200",
          )}
        >
          {selectedType === "internal" && (
            <div className="absolute top-4 right-4 rounded-full bg-secondary p-1 text-white shadow-xs">
              <Check className="h-4 w-4" />
            </div>
          )}

          <div className="flex w-full items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm border border-slate-100">
              🔒
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Event Internal
              </h3>
              <p className="text-sm font-medium text-slate-500">
                Khusus anggota komunitas
              </p>
            </div>
          </div>

          <div className="w-full space-y-2 rounded-lg p-3 text-sm text-muted">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>Khusus komunitas RTPintar</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>Privasi acara lebih terjaga</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                <span>Undangan & akses terbatas</span>
              </li>
            </ul>
          </div>
        </Button>
      </div>
    </div>
  );
}
