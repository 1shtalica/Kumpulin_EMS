"use client";

import { Plus, Trash2, Ticket as TicketIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TicketRequest } from "@/types/create-event";

interface EventTicketStepProps {
  isPaid: boolean;
  tickets: TicketRequest[];
  onIsPaidChange: (isPaid: boolean) => void;
  onAddTicket: () => void;
  onRemoveTicket: (index: number) => void;
  onUpdateTicket: (index: number, field: keyof TicketRequest, value: string | number) => void;
}

export default function EventTicketStep(props: EventTicketStepProps) {
  const {
    isPaid,
    tickets,
    onIsPaidChange,
    onAddTicket,
    onRemoveTicket,
    onUpdateTicket,
  } = props;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Pengaturan Tiket</h2>
        <p className="mt-2 text-gray-600">
          Atur jenis dan harga tiket untuk event Anda
        </p>
      </div>

      {/* Free/Paid Toggle */}
      <div className="space-y-3">
        <Label>Tipe Tiket</Label>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            onClick={() => onIsPaidChange(false)}
            className={cn(
              "rounded-lg border-2 p-4 text-left transition-all",
              "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              !isPaid
                ? "border-green-600 bg-green-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="font-semibold text-gray-900">Gratis</div>
            <div className="text-sm text-gray-600">Event dapat diakses tanpa biaya</div>
          </button>

          <button
            onClick={() => onIsPaidChange(true)}
            className={cn(
              "rounded-lg border-2 p-4 text-left transition-all",
              "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isPaid
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className="font-semibold text-gray-900">Berbayar</div>
            <div className="text-sm text-gray-600">Event memerlukan pembelian tiket</div>
          </button>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Tickets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <TicketIcon className="h-5 w-5 text-primary" />
            Daftar Tiket
          </h3>
          {isPaid && tickets.length < 5 && (
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
            <p className="text-gray-500">
              {isPaid
                ? "Klik tombol 'Tambah Tiket' untuk membuat tiket pertama"
                : "Tiket gratis otomatis tersedia"}
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
                <span className="text-sm font-medium text-gray-700">
                  Tiket #{index + 1}
                </span>
                {tickets.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTicket(index)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Ticket Name */}
                <div className="space-y-2">
                  <Label htmlFor={`ticket-name-${index}`}>Nama Tiket *</Label>
                  <Input
                    id={`ticket-name-${index}`}
                    placeholder="Contoh: VIP, Regular, Student"
                    value={ticket.name}
                    onChange={(e) => onUpdateTicket(index, "name", e.target.value)}
                    disabled={!isPaid && index === 0}
                  />
                </div>

                {/* Ticket Price */}
                <div className="space-y-2">
                  <Label htmlFor={`ticket-price-${index}`}>Harga (Rp) *</Label>
                  <Input
                    id={`ticket-price-${index}`}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={ticket.price}
                    onChange={(e) =>
                      onUpdateTicket(index, "price", parseInt(e.target.value) || 0)
                    }
                    disabled={!isPaid}
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
                      onUpdateTicket(index, "quota", parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                {/* Ticket Description */}
                <div className="space-y-2">
                  <Label htmlFor={`ticket-desc-${index}`}>Deskripsi (Optional)</Label>
                  <Input
                    id={`ticket-desc-${index}`}
                    placeholder="Benefit atau keterangan tiket"
                    value={ticket.description}
                    onChange={(e) => onUpdateTicket(index, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {isPaid && tickets.length >= 5 && (
          <p className="text-sm text-gray-500">
            Maksimal 5 jenis tiket per event
          </p>
        )}
      </div>
    </div>
  );
}
