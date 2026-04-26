"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Ticket as TicketIcon, Users, ShoppingCart, CalendarCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import DateTimePicker from "@/components/reusable/DateTimePicker";
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
    trigger,
    formState: { errors },
  } = useFormContext<CreateEventSchema>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const max_capacity = watch("max_capacity");
  const tickets = watch("tickets");

  const [capacityInput, setCapacityInput] = useState<string>(
    max_capacity > 0 ? max_capacity.toString() : "50"
  );

  useEffect(() => {
    if (max_capacity > 0 && max_capacity.toString() !== capacityInput) {
      setCapacityInput(max_capacity.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max_capacity]);

  const start_registration_date = watch("start_registration_date");
  const end_registration_date = watch("end_registration_date");

  // --- STATE: followRegistration[index] = apakah tiket mengikuti jadwal pendaftaran ---
  const [followRegistration, setFollowRegistration] = useState<boolean[]>([]);

  // Sinkronisasi panjang array followRegistration dengan jumlah tiket
  useEffect(() => {
    setFollowRegistration((prev) => {
      const next = [...prev];
      while (next.length < fields.length) next.push(false);
      return next.slice(0, fields.length);
    });
  }, [fields.length]);

  // Auto-set nilai start/end tiket jika checkbox aktif (termasuk saat pendaftaran berubah)
  useEffect(() => {
    fields.forEach((_, index) => {
      if (followRegistration[index]) {
        if (start_registration_date) {
          setValue(`tickets.${index}.start_date_time`, start_registration_date, {
            shouldValidate: true,
          });
        }
        if (end_registration_date) {
          setValue(`tickets.${index}.end_date_time`, end_registration_date, {
            shouldValidate: true,
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followRegistration, start_registration_date, end_registration_date]);

  const totalTicketQuota = (tickets || []).reduce(
    (sum, ticket) => sum + (Number(ticket.quota) || 0),
    0,
  );

  useEffect(() => {
    if (tickets && tickets.length > 0) {
      trigger("tickets");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalTicketQuota, max_capacity]);

  // Helper format tanggal ringkas
  const formatDateShort = (date: Date) =>
    date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      {!hideHeader && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Pengaturan Tiket</h2>
          <p className="mt-2 text-muted-foreground">
            Atur kapasitas event, batas pembelian, dan jenis tiket
          </p>
        </div>
      )}

      {/* Max Purchase Per User */}
      {(!sectionOnly || sectionOnly === 'tickets') && (
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Batas Pembelian
          </h3>
          <div className="space-y-3 rounded-xl border border-primary/20 bg-primary-light/30 p-4">
            <Label htmlFor="max_ticket_per_user" className="text-foreground">
              Batas Pembelian Per User <span className="text-danger">*</span>
            </Label>
            <Input
              id="max_ticket_per_user"
              type="number"
              min={0}
              placeholder="0"
              defaultValue={0}
              {...register("max_ticket_per_user")}
              onChange={(e) => {
                const value = e.target.value;
                setValue(
                  "max_ticket_per_user",
                  value === "" ? 0 : parseInt(value),
                  { shouldValidate: true },
                );
              }}
              className={cn(
                "shadow-none bg-white",
                errors.max_ticket_per_user &&
                "border-danger focus-visible:ring-danger",
              )}
            />
            <p className="text-xs text-muted-foreground">
              Batas total tiket yang dapat dibeli oleh 1 user. <br />• Contoh: Jika batas 3, user hanya bisa membeli
              maksimal 3 tiket. <br />• Isi <strong>0</strong> untuk{" "}
              <strong>tanpa batas pembelian</strong>.
            </p>
            {errors.max_ticket_per_user && (
              <p className="text-xs text-danger">
                {errors.max_ticket_per_user.message}
              </p>
            )}
          </div>
        </div>
      )}

      {!sectionOnly && <hr className="border-gray-200" />}

      {/* Capacity Settings */}
      {(!sectionOnly || sectionOnly === 'capacity') && (
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            Kapasitas Event
          </h3>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Jumlah Kapasitas Maksimal Event</Label>
                <Input
                  type="text"
                  placeholder="Contoh: 100"
                  value={capacityInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCapacityInput(value);
                    if (value !== "" && value !== "0") {
                      setValue("max_capacity", parseInt(value), { shouldValidate: true });
                    }
                  }}
                  onBlur={() => {
                    if (capacityInput === "" || capacityInput === "0") {
                      const lastValid = max_capacity > 0 ? max_capacity.toString() : "50";
                      setCapacityInput(lastValid);
                      setValue("max_capacity", parseInt(lastValid), { shouldValidate: true });
                    }
                  }}
                  className={cn(
                    errors.max_capacity &&
                    "border-danger focus-visible:ring-danger",
                  )}
                />
                {errors.max_capacity && (
                  <p className="text-xs text-danger">
                    {errors.max_capacity.message}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <Label className="text-muted-foreground">Total Kuota Tiket yang Telah Dibuat:</Label>
              <span className={cn("text-lg font-bold", max_capacity > 0 && totalTicketQuota > max_capacity ? "text-danger" : "text-primary")}>
                {totalTicketQuota} Tiket
              </span>
            </div>
            {max_capacity > 0 && totalTicketQuota > max_capacity && (
              <p className="text-xs text-danger">Total kuota tiket ({totalTicketQuota}) melebihi Kapasitas Event ({max_capacity}).</p>
            )}
          </div>
        </div>
      )}

      {/* Tickets List */}
      {(!sectionOnly || sectionOnly === 'tickets') && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <TicketIcon className="h-5 w-5 text-primary" />
              Daftar Tiket
            </h3>
            {fields.length < 5 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  className="flex-1 sm:flex-none sm:min-w-40 border-dashed rounded-full"
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({ name: "", price: 0, quota: 0, description: "", start_date_time: undefined as any, end_date_time: undefined as any, type: "free" })
                  }
                >
                  <Plus className="h-4 w-4 shrink-0 mr-1" />
                  <span className="whitespace-nowrap">Tiket Gratis</span>
                </Button>
                <Button
                  className="flex-1 sm:flex-none sm:min-w-40 rounded-full shadow-sm"
                  type="button"
                  variant="default"
                  onClick={() =>
                    append({ name: "", price: 0, quota: 0, description: "", start_date_time: undefined as any, end_date_time: undefined as any, type: "paid" })
                  }
                >
                  <Plus className="h-4 w-4 shrink-0 mr-1" />
                  <span className="whitespace-nowrap">Tiket Berbayar</span>
                </Button>
              </div>
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

          {typeof errors.tickets?.message === 'string' && (
            <p className="text-xs text-danger text-center">
              {errors.tickets.message}
            </p>
          )}

          <div className="space-y-6">
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
                    Tiket #{index + 1} ({(tickets?.[index]?.type || ticket.type) === "free" ? "Gratis" : "Berbayar"})
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Hapus
                  </Button>
                </div>

                {/* Hidden input to preserve database ID across field array mutations */}
                <input type="hidden" {...register(`tickets.${index}._dbId`)} />

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Ticket Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`ticket-name-${index}`}>
                      Nama Tiket <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id={`ticket-name-${index}`}
                      placeholder="Contoh: VIP, Regular, atau Gratis"
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
                  {(tickets?.[index]?.type || ticket.type) === "paid" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`ticket-price-${index}`}>
                        Harga (Rp) <span className="text-danger">*</span>
                      </Label>
                      <Input
                        id={`ticket-price-${index}`}
                        type="text"
                        placeholder="10000"
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
                  ) : (
                    <div className="space-y-2">
                      <Label>
                        Harga (Rp) <span className="text-danger">*</span>
                      </Label>
                      <div className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm text-muted-foreground ring-offset-background disabled:cursor-not-allowed disabled:opacity-50">
                        Gratis (Rp 0)
                      </div>
                    </div>
                  )}

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

                  {/* Toggle: Sesuai Jadwal Pendaftaran */}
                  <div className="col-span-full">
                    <label
                      htmlFor={`follow-reg-${index}`}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all duration-200",
                        followRegistration[index]
                          ? "bg-primary-light border-primary/30 text-primary"
                          : "bg-muted/20 border-border text-muted-foreground hover:border-primary/40 hover:bg-primary-light/30"
                      )}
                    >
                      <input
                        type="checkbox"
                        id={`follow-reg-${index}`}
                        className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                        checked={followRegistration[index] ?? false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFollowRegistration((prev) => {
                            const next = [...prev];
                            next[index] = checked;
                            return next;
                          });
                        }}
                      />
                      <CalendarCheck className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">
                        Sesuai jadwal pendaftaran
                      </span>
                      {followRegistration[index] && start_registration_date && end_registration_date && (
                        <span className="ml-auto text-xs font-normal text-primary/80 hidden sm:block">
                          {formatDateShort(start_registration_date)} – {formatDateShort(end_registration_date)}
                        </span>
                      )}
                      {followRegistration[index] && (!start_registration_date || !end_registration_date) && (
                        <span className="ml-auto text-xs font-normal text-amber-600">
                          ⚠ Isi jadwal pendaftaran di step sebelumnya
                        </span>
                      )}
                    </label>
                  </div>

                  {/* Ticket Start Date */}
                  <div className="space-y-2">
                    <Label className={cn(followRegistration[index] && "text-muted-foreground")}>
                      Waktu Mulai Penjualan <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={`tickets.${index}.start_date_time`}
                      render={({ field }) => (
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pilih waktu mulai"
                          minDate={start_registration_date || new Date()}
                          maxDate={end_registration_date || undefined}
                          disabled={followRegistration[index] ?? false}
                          className={cn(
                            "shadow-none",
                            followRegistration[index]
                              ? "bg-muted/30 opacity-70 cursor-not-allowed"
                              : "bg-white",
                            errors.tickets?.[index]?.start_date_time && "border-danger"
                          )}
                        />
                      )}
                    />
                    {followRegistration[index] && (
                      <p className="text-xs text-muted-foreground">
                        Diisi otomatis sesuai waktu buka pendaftaran
                      </p>
                    )}
                    {errors.tickets?.[index]?.start_date_time && (
                      <p className="text-xs text-danger">
                        {errors.tickets[index].start_date_time.message}
                      </p>
                    )}
                  </div>

                  {/* Ticket End Date */}
                  <div className="space-y-2">
                    <Label className={cn(followRegistration[index] && "text-muted-foreground")}>
                      Waktu Selesai Penjualan <span className="text-danger">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name={`tickets.${index}.end_date_time`}
                      render={({ field }) => (
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Pilih waktu selesai"
                          minDate={tickets[index]?.start_date_time || start_registration_date || new Date()}
                          maxDate={end_registration_date || undefined}
                          disabled={(followRegistration[index] ?? false) || !tickets[index]?.start_date_time}
                          className={cn(
                            "shadow-none",
                            followRegistration[index]
                              ? "bg-muted/30 opacity-70 cursor-not-allowed"
                              : "bg-white",
                            errors.tickets?.[index]?.end_date_time && "border-danger"
                          )}
                        />
                      )}
                    />
                    {followRegistration[index] && (
                      <p className="text-xs text-muted-foreground">
                        Diisi otomatis sesuai waktu tutup pendaftaran
                      </p>
                    )}
                    {errors.tickets?.[index]?.end_date_time && (
                      <p className="text-xs text-danger">
                        {errors.tickets[index].end_date_time.message}
                      </p>
                    )}
                    {!followRegistration[index] && !tickets[index]?.start_date_time && (
                      <p className="text-xs text-muted">
                        Pilih waktu mulai penjualan terlebih dahulu
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {fields.length >= 5 && (
            <p className="text-sm text-muted-foreground flex justify-end">
              Maksimal 5 jenis tiket per event
            </p>
          )}
        </div>
      )}
    </div>
  );
}
