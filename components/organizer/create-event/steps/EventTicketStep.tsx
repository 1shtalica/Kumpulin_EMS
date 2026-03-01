"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Ticket as TicketIcon, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext, useFieldArray } from "react-hook-form";
import type { CreateEventSchema } from "@/lib/validator/create-event.schema";

export default function EventTicketStep({
  hideHeader,
  sectionOnly
}: {
  hideHeader?: boolean;
  sectionOnly?: 'capacity' | 'tickets';
}) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateEventSchema>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const isPaid = watch("isPaid");
  const maxCapacity = watch("maxCapacity");
  const tickets = watch("tickets"); // Watch tickets to calculate total quota

  const [capacityInput, setCapacityInput] = useState<string>(
    maxCapacity > 0 ? maxCapacity.toString() : "50"
  );

  useEffect(() => {
    if (maxCapacity > 0 && maxCapacity.toString() !== capacityInput) {
      setCapacityInput(maxCapacity.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxCapacity]);

  // Calculate total quota for Paid events
  const totalTicketQuota = (tickets || []).reduce(
    (sum, ticket) => sum + (Number(ticket.quota) || 0),
    0,
  );

  const handlePaidChange = (paid: boolean) => {
    setValue("isPaid", paid, { shouldValidate: true });
    if (!paid) {
      setValue("tickets", [{
        name: "Gratis",
        price: 0,
        quota: 999,
        description: "tiket gratis"
      }]);
    } else {
      if (fields.length === 0) {
        append({ name: "", price: 0, quota: 0, description: "" });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      {!hideHeader && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Pengaturan Tiket</h2>
          <p className="mt-2 text-muted-foreground">
            Atur kapasitas, batas waktu pendaftaran, dan jenis tiket
          </p>
        </div>
      )}

      {/* Free/Paid Toggle */}
      {(!sectionOnly || sectionOnly === 'tickets') && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <TicketIcon className="h-5 w-5 text-primary" />
            Jenis Tiket
          </h3>

          <div className="space-y-3">
            <Label>Apakah event ini berbayar?</Label>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => handlePaidChange(false)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  "hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  !isPaid
                    ? "border-primary bg-primary-light shadow-xs"
                    : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div className="font-semibold text-foreground">Gratis</div>
                <div className="text-sm text-muted-foreground">
                  Event dapat diakses tanpa biaya
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePaidChange(true)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  "hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isPaid
                    ? "border-primary bg-primary-light shadow-xs"
                    : "border-gray-200 bg-white hover:border-gray-300",
                )}
              >
                <div className="font-semibold text-foreground">Berbayar</div>
                <div className="text-sm text-muted-foreground">
                  Event memerlukan pembelian tiket
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Max Purchase Per User - ONLY FOR PAID EVENTS */}
      {(!sectionOnly || sectionOnly === 'tickets') && isPaid && (
        <div className="space-y-3 rounded-xl border border-primary/20 bg-primary-light/30 p-4">
          <Label htmlFor="maxPurchasePerUser" className="text-foreground">
            Batas Pembelian Per User <span className="text-danger">*</span>
          </Label>
          <Input
            id="maxPurchasePerUser"
            type="number"
            min={0}
            placeholder="0"
            defaultValue={0}
            {...register("maxPurchasePerUser")}
            onChange={(e) => {
              const value = e.target.value;
              setValue(
                "maxPurchasePerUser",
                value === "" ? 0 : parseInt(value),
                { shouldValidate: true },
              );
            }}
            className={cn(
              "shadow-none bg-white",
              errors.maxPurchasePerUser &&
              "border-danger focus-visible:ring-danger",
            )}
          />
          <p className="text-xs text-muted-foreground">
            💡 Batas total tiket yang dapat dibeli oleh 1 user (mencegah
            scalping). <br />• Contoh: Jika batas 3, user hanya bisa membeli
            maksimal 3 tiket. <br />• Isi <strong>0</strong> untuk{" "}
            <strong>tanpa batas pembelian</strong>.
          </p>
          {errors.maxPurchasePerUser && (
            <p className="text-xs text-danger">
              {errors.maxPurchasePerUser.message}
            </p>
          )}
        </div>
      )}

      {!sectionOnly && <hr className="border-gray-200" />}

      {/* Capacity Settings - ONLY FOR FREE EVENTS OR DISPLAY FOR PAID */}
      {(!sectionOnly || sectionOnly === 'capacity') && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Kapasitas Peserta
          </h3>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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
                      onChange={(e) => {
                        const isUnlimited = e.target.checked;
                        if (isUnlimited) {
                          setValue("maxCapacity", 0, {
                            shouldValidate: true,
                          });
                        } else {
                          setCapacityInput("50");
                          setValue("maxCapacity", 50, {
                            shouldValidate: true,
                          });
                        }
                      }}
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
                      type="text"
                      placeholder="Contoh: 100"
                      value={capacityInput}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setCapacityInput(value);
                        if (value !== "" && value !== "0") {
                          setValue("maxCapacity", parseInt(value), { shouldValidate: true });
                        }
                      }}
                      onBlur={() => {
                        if (capacityInput === "" || capacityInput === "0") {
                          const lastValid = maxCapacity > 0 ? maxCapacity.toString() : "50";
                          setCapacityInput(lastValid);
                          setValue("maxCapacity", parseInt(lastValid), { shouldValidate: true });
                        }
                      }}
                      className={cn(
                        errors.maxCapacity &&
                        "border-danger focus-visible:ring-danger",
                      )}
                    />
                    {errors.maxCapacity && (
                      <p className="text-xs text-danger">
                        {errors.maxCapacity.message}
                      </p>
                    )}
                  </div>
                )}
                {maxCapacity === 0 && (
                  <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700 border border-green-200">
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
      )}

      {/* Tickets List - Only Show for Paid Events */}
      {(!sectionOnly || sectionOnly === 'tickets') && isPaid && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-bold text-foreground">
              Daftar Tiket
            </Label>
            {fields.length < 5 && (
              <Button
                className="shadow-glow"
                type="button"
                variant="outline"
                size="lg"
                onClick={() =>
                  append({ name: "", price: 0, quota: 0, description: "" })
                }
              >
                <Plus className="h-4 w-4" />
                Tambah Tiket
              </Button>
            )}
          </div>



          {fields.length === 0 && (
            <div
              className={cn(
                "rounded-xl border border-dashed p-8 text-center transition-colors",
                errors.tickets
                  ? "border-danger bg-red-50"
                  : "border-gray-300 bg-white",
              )}
            >
              <p
                className={cn(
                  "text-muted-foreground",
                  errors.tickets && "text-danger font-medium",
                )}
              >
                {errors.tickets
                  ? "Anda wajib menambahkan minimal 1 tiket"
                  : "Klik tombol 'Tambah Tiket' untuk membuat tiket pertama"}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((ticket, index) => (
              <div
                key={ticket.id}
                className={cn(
                  "rounded-xl border bg-card p-6 shadow",
                  errors.tickets?.[index]?.name ||
                    errors.tickets?.[index]?.price ||
                    errors.tickets?.[index]?.quota ||
                    errors.tickets?.[index]?.description
                    ? "border-danger ring-1 ring-danger"
                    : "border-gray-200",
                )}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">
                    Tiket #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-danger hover:bg-danger-light hover:text-danger"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Hapus
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Ticket Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-name-${index}`}>
                      Nama Tiket <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id={`ticket-name-${index}`}
                      placeholder="Contoh: VIP, Regular"
                      {...register(`tickets.${index}.name`)}
                      className={cn(
                        "bg-white",
                        errors.tickets?.[index]?.name &&
                        "border-danger focus-visible:ring-danger",
                      )}
                    />
                    {errors.tickets?.[index]?.name && (
                      <p className="text-xs text-danger">
                        {errors.tickets[index].name.message}
                      </p>
                    )}
                  </div>

                  {/* Ticket Price */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-price-${index}`}>
                      Harga (Rp) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id={`ticket-price-${index}`}
                      type="text"
                      placeholder="0"
                      {...register(`tickets.${index}.price`)}
                      onChange={(e) => {
                        const value =
                          parseInt(e.target.value.replace(/\D/g, "")) || 0;
                        setValue(`tickets.${index}.price`, value, {
                          shouldValidate: true,
                        });
                      }}
                      className={cn(
                        "bg-white",
                        errors.tickets?.[index]?.price &&
                        "border-danger focus-visible:ring-danger",
                      )}
                    />
                    {errors.tickets?.[index]?.price && (
                      <p className="text-xs text-danger">
                        {errors.tickets[index].price.message}
                      </p>
                    )}
                  </div>

                  {/* Ticket Quota */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-quota-${index}`}>
                      Kuota <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id={`ticket-quota-${index}`}
                      type="text"
                      placeholder="100"
                      {...register(`tickets.${index}.quota`)}
                      onChange={(e) => {
                        const value =
                          parseInt(e.target.value.replace(/\D/g, "")) || 0;
                        setValue(`tickets.${index}.quota`, value, {
                          shouldValidate: true,
                        });
                      }}
                      className={cn(
                        "bg-white",
                        errors.tickets?.[index]?.quota &&
                        "border-danger focus-visible:ring-danger",
                      )}
                    />
                    {errors.tickets?.[index]?.quota && (
                      <p className="text-xs text-danger">
                        {errors.tickets[index].quota.message}
                      </p>
                    )}
                  </div>

                  {/* Ticket Description */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-desc-${index}`}>
                      Deskripsi (Optional)
                    </Label>
                    <Input
                      id={`ticket-desc-${index}`}
                      placeholder="Benefit atau keterangan tiket"
                      {...register(`tickets.${index}.description`)}
                      className={cn(
                        "bg-white",
                        errors.tickets?.[index]?.description &&
                        "border-danger focus-visible:ring-danger",
                      )}
                    />
                    {errors.tickets?.[index]?.description && (
                      <p className="text-xs text-danger">
                        {errors.tickets[index].description.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {fields.length >= 5 && (
            <p className="text-sm text-muted-foreground">
              Maksimal 5 jenis tiket per event
            </p>
          )}
        </div>
      )}
    </div>
  );
}
