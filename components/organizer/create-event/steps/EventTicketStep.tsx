"use client";

import { useState } from "react";
import { Plus, Trash2, Ticket as TicketIcon, Users, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TicketRequest } from "@/types/create-event";

interface EventTicketStepProps {
  isPaid: boolean;
  maxCapacity: number;
  tickets: TicketRequest[];
  
  onIsPaidChange: (isPaid: boolean) => void;
  onMaxCapacityChange: (capacity: number) => void;
  
  onAddTicket: () => void;
  onRemoveTicket: (index: number) => void;
  onUpdateTicket: (index: number, field: keyof TicketRequest, value: string | number) => void;
}

export default function EventTicketStep(props: EventTicketStepProps) {
  const {
    isPaid,
    maxCapacity,
    tickets,
    onIsPaidChange,
    onMaxCapacityChange,
    onAddTicket,
    onRemoveTicket,
    onUpdateTicket,
  } = props;

  // Calculate total quota for Paid events
  const totalTicketQuota = tickets.reduce(
    (sum, ticket) => sum + (ticket.quota || 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent">Pengaturan Tiket</h2>
        <p className="mt-2 text-muted-foreground">
          Atur kapasitas, batas waktu pendaftaran, dan jenis tiket
        </p>
      </div>

      {/* Free/Paid Toggle */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent">
          <TicketIcon className="h-5 w-5 text-primary" />
          Jenis Tiket
        </h3>

        <div className="space-y-3">
          <Label>Apakah event ini berbayar?</Label>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => onIsPaidChange(false)}
              className={cn(
                "rounded-lg border-2 p-4 text-left transition-all",
                "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                !isPaid
                  ? "border-primary bg-primary-light shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <div className="font-semibold text-accent">Gratis</div>
              <div className="text-sm text-muted-foreground">
                Event dapat diakses tanpa biaya
              </div>
            </button>

            <button
              onClick={() => onIsPaidChange(true)}
              className={cn(
                "rounded-lg border-2 p-4 text-left transition-all",
                "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isPaid
                  ? "border-primary bg-primary-light shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <div className="font-semibold text-accent">Berbayar</div>
              <div className="text-sm text-muted-foreground">
                Event memerlukan pembelian tiket
              </div>
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Capacity Settings - ONLY FOR FREE EVENTS OR DISPLAY FOR PAID */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent">
          <Users className="h-5 w-5 text-primary" />
          Kapasitas Peserta
        </h3>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          {/* Custom Capacity for Free Events */}
          {!isPaid ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Batasi Jumlah Peserta?</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="unlimitedCapacity"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={maxCapacity === 0}
                    onChange={(e) =>
                      onMaxCapacityChange(e.target.checked ? 0 : 50)
                    }
                  />
                  <Label
                    htmlFor="unlimitedCapacity"
                    className="font-normal text-muted-foreground"
                  >
                    Tanpa Batas
                  </Label>
                </div>
              </div>

              {maxCapacity > 0 && (
                <div className="space-y-2">
                  <Label>Jumlah Kapasitas Maksimal</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Contoh: 100"
                    value={maxCapacity}
                    onChange={(e) =>
                      onMaxCapacityChange(parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              )}
              {maxCapacity === 0 && (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                  Event gratis ini terbuka untuk umum tanpa batasan kuota.
                </div>
              )}
            </div>
          ) : (
            // Display Capacity for Paid Events
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Total Kapasitas Tiket</Label>
                <span className="text-lg font-bold text-primary">
                  {totalTicketQuota} Peserta
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Kapasitas dihitung otomatis dari total kuota semua tiket yang
                dibuat.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tickets List - Only Show for Paid Events */}
      {isPaid && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-accent">
              Daftar Tiket
            </Label>
            {tickets.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddTicket}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tiket
              </Button>
            )}
          </div>

          {tickets.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-muted-foreground">
                Klik tombol 'Tambah Tiket' untuk membuat tiket pertama
              </p>
            </div>
          )}

          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">
                    Tiket #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTicket(index)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Hapus
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Ticket Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-name-${index}`}>Nama Tiket *</Label>
                    <Input
                      id={`ticket-name-${index}`}
                      placeholder="Contoh: VIP, Regular"
                      value={ticket.name}
                      onChange={(e) =>
                        onUpdateTicket(index, "name", e.target.value)
                      }
                    />
                  </div>

                  {/* Ticket Price */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-price-${index}`}>
                      Harga (Rp) *
                    </Label>
                    <Input
                      id={`ticket-price-${index}`}
                      type="number"
                      min="0"
                      placeholder="0"
                      value={ticket.price}
                      onChange={(e) =>
                        onUpdateTicket(
                          index,
                          "price",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  {/* Ticket Quota */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-quota-${index}`}>Kuota *</Label>
                    <Input
                      id={`ticket-quota-${index}`}
                      type="number"
                      min="1"
                      placeholder="100"
                      value={ticket.quota}
                      onChange={(e) =>
                        onUpdateTicket(
                          index,
                          "quota",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                  </div>

                  {/* Ticket Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-desc-${index}`}>
                      Deskripsi (Optional)
                    </Label>
                    <Input
                      id={`ticket-desc-${index}`}
                      placeholder="Benefit atau keterangan tiket"
                      value={ticket.description}
                      onChange={(e) =>
                        onUpdateTicket(index, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tickets.length >= 5 && (
            <p className="text-sm text-muted-foreground">
              Maksimal 5 jenis tiket per event
            </p>
          )}
        </div>
      )}
    </div>
  );
}

