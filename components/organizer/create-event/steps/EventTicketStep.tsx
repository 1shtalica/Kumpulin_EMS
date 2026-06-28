"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Ticket as TicketIcon,
    Users,
    ShoppingCart,
    CalendarCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import DateTimePicker from "@/components/reusable/DateTimePicker";
import type { CreateEventSchema } from "@/lib/validator/create-event.schema";

export default function EventTicketStep({
    hideHeader,
    sectionOnly,
}: {
    hideHeader?: boolean;
    sectionOnly?: "capacity" | "tickets";
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
        max_capacity > 0 ? max_capacity.toString() : "50",
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
                    setValue(
                        `tickets.${index}.start_date_time`,
                        start_registration_date,
                        {
                            shouldValidate: true,
                        },
                    );
                }
                if (end_registration_date) {
                    setValue(
                        `tickets.${index}.end_date_time`,
                        end_registration_date,
                        {
                            shouldValidate: true,
                        },
                    );
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
        <div className="space-y-10">
            {!hideHeader && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                            <TicketIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-slate-950">
                                Pengaturan Tiket
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                Atur kapasitas, batas pembelian, dan kategori
                                tiket yang akan dijual.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Capacity Settings */}
            {(!sectionOnly || sectionOnly === "capacity") && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <Users className="h-4.5 w-4.5" />
                            </span>
                            Kapasitas Event
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Tentukan kapasitas maksimal dan pantau total kuota
                            tiket yang dibuat.
                        </p>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-slate-500">
                                Jumlah Kapasitas Maksimal Event
                            </Label>
                            <Input
                                type="text"
                                placeholder="Contoh: 100"
                                value={capacityInput}
                                onChange={(e) => {
                                    const value = e.target.value.replace(
                                        /\D/g,
                                        "",
                                    );
                                    setCapacityInput(value);
                                    if (value !== "" && value !== "0") {
                                        setValue(
                                            "max_capacity",
                                            parseInt(value),
                                            { shouldValidate: true },
                                        );
                                    }
                                }}
                                onBlur={() => {
                                    if (
                                        capacityInput === "" ||
                                        capacityInput === "0"
                                    ) {
                                        const lastValid =
                                            max_capacity > 0
                                                ? max_capacity.toString()
                                                : "50";
                                        setCapacityInput(lastValid);
                                        setValue(
                                            "max_capacity",
                                            parseInt(lastValid),
                                            { shouldValidate: true },
                                        );
                                    }
                                }}
                                className={cn(
                                    "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                    errors.max_capacity &&
                                        "border-danger focus-visible:ring-danger/20",
                                )}
                            />
                            {errors.max_capacity && (
                                <p className="text-xs text-danger">
                                    {errors.max_capacity.message}
                                </p>
                            )}
                        </div>

                        {max_capacity > 0 &&
                            totalTicketQuota > max_capacity && (
                                <p className="rounded-xl border border-danger/30 bg-danger-light/20 px-3 py-2 text-xs leading-relaxed text-danger">
                                    Total kuota tiket ({totalTicketQuota})
                                    melebihi kapasitas event ({max_capacity}).
                                </p>
                            )}
                    </div>
                </div>
            )}

            {/* Max Purchase Per User */}
            {(!sectionOnly || sectionOnly === "tickets") && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <ShoppingCart className="h-4.5 w-4.5" />
                            </span>
                            Batas Pembelian
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Tentukan batas maksimal tiket yang bisa dibeli satu
                            user.
                        </p>
                    </div>
                    <div className="space-y-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm shadow-slate-900/5">
                        <Label
                            htmlFor="max_ticket_per_user"
                            className="text-xs font-medium text-slate-500"
                        >
                            Batas Pembelian Per User{" "}
                            <span className="text-danger">*</span>
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
                                "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                errors.max_ticket_per_user &&
                                    "border-danger focus-visible:ring-danger/20",
                            )}
                        />
                        <p className="text-xs leading-relaxed text-slate-500">
                            Isi <strong>0</strong> untuk tanpa batas pembelian.
                            Contoh: jika batas 3, user hanya bisa membeli
                            maksimal 3 tiket.
                        </p>
                        {errors.max_ticket_per_user && (
                            <p className="text-xs text-danger">
                                {errors.max_ticket_per_user.message}
                            </p>
                        )}
                    </div>
                </div>
            )}
            {/* Tickets List */}
            {(!sectionOnly || sectionOnly === "tickets") && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <TicketIcon className="h-4.5 w-4.5" />
                            </span>
                            Daftar Tiket
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Kelola nama, harga, kuota, dan periode penjualan
                            tiap tiket.
                        </p>
                    </div>

                    {fields.length === 0 && (
                        <div
                            className={cn(
                                "rounded-2xl border border-dashed px-5 py-8 text-center transition-colors",
                                errors.tickets
                                    ? "border-danger/50 bg-danger-light/30"
                                    : "border-slate-200 bg-slate-50/80",
                            )}
                        >
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80">
                                <TicketIcon className="h-5 w-5" />
                            </div>
                            <p
                                className={cn(
                                    "text-sm font-semibold",
                                    errors.tickets
                                        ? "text-danger"
                                        : "text-slate-950",
                                )}
                            >
                                {errors.tickets
                                    ? "Anda wajib menambahkan minimal 1 tiket"
                                    : "Belum ada tiket"}
                            </p>
                            {!errors.tickets && (
                                <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
                                    Tambahkan tiket gratis atau berbayar untuk
                                    mulai menerima peserta.
                                </p>
                            )}
                        </div>
                    )}

                    {typeof errors.tickets?.message === "string" && (
                        <p className="text-center text-xs text-danger">
                            {errors.tickets.message}
                        </p>
                    )}

                    <div className="space-y-4">
                        {fields.map((ticket, index) => (
                            <div
                                key={ticket.id}
                                className={cn(
                                    "rounded-2xl border bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5 transition-colors",
                                    errors.tickets?.[index]?.name ||
                                        errors.tickets?.[index]?.price ||
                                        errors.tickets?.[index]?.quota ||
                                        errors.tickets?.[index]?.description
                                        ? "border-danger/50 ring-1 ring-danger/20"
                                        : "border-slate-200/80",
                                )}
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                            Tiket {index + 1}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-950">
                                            {(tickets?.[index]?.type ||
                                                ticket.type) === "free"
                                                ? "Tiket Gratis"
                                                : "Tiket Berbayar"}
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Hapus tiket ${index + 1}`}
                                        title={`Hapus tiket ${index + 1}`}
                                        onClick={() => remove(index)}
                                        className="h-8 w-8 rounded-xl text-slate-400 hover:bg-danger-light hover:text-danger"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <input
                                    type="hidden"
                                    {...register(`tickets.${index}._dbId`)}
                                />

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor={`ticket-name-${index}`}
                                            className="text-xs font-medium text-slate-500"
                                        >
                                            Nama Tiket{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id={`ticket-name-${index}`}
                                            placeholder="Contoh: VIP, Regular, atau Gratis"
                                            {...register(
                                                `tickets.${index}.name`,
                                            )}
                                            className={cn(
                                                "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                errors.tickets?.[index]?.name &&
                                                    "border-danger focus-visible:ring-danger/20",
                                            )}
                                        />
                                        {errors.tickets?.[index]?.name && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.tickets[index].name
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    {(tickets?.[index]?.type || ticket.type) ===
                                    "paid" ? (
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor={`ticket-price-${index}`}
                                                className="text-xs font-medium text-slate-500"
                                            >
                                                Harga (Rp){" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id={`ticket-price-${index}`}
                                                type="text"
                                                placeholder="10000"
                                                {...register(
                                                    `tickets.${index}.price`,
                                                )}
                                                onChange={(e) => {
                                                    const value =
                                                        parseInt(
                                                            e.target.value.replace(
                                                                /\D/g,
                                                                "",
                                                            ),
                                                        ) || 0;
                                                    setValue(
                                                        `tickets.${index}.price`,
                                                        value,
                                                        {
                                                            shouldValidate: true,
                                                        },
                                                    );
                                                }}
                                                className={cn(
                                                    "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                    errors.tickets?.[index]
                                                        ?.price &&
                                                        "border-danger focus-visible:ring-danger/20",
                                                )}
                                            />
                                            {errors.tickets?.[index]?.price && (
                                                <p className="text-xs text-danger">
                                                    {
                                                        errors.tickets[index]
                                                            .price.message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-500">
                                                Harga (Rp){" "}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </Label>
                                            <div className="flex h-10 w-full items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 shadow-none">
                                                Gratis (Rp 0)
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor={`ticket-quota-${index}`}
                                            className="text-xs font-medium text-slate-500"
                                        >
                                            Kuota{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id={`ticket-quota-${index}`}
                                            type="text"
                                            placeholder="100"
                                            {...register(
                                                `tickets.${index}.quota`,
                                            )}
                                            onChange={(e) => {
                                                const value =
                                                    parseInt(
                                                        e.target.value.replace(
                                                            /\D/g,
                                                            "",
                                                        ),
                                                    ) || 0;
                                                setValue(
                                                    `tickets.${index}.quota`,
                                                    value,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                );
                                            }}
                                            className={cn(
                                                "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                errors.tickets?.[index]
                                                    ?.quota &&
                                                    "border-danger focus-visible:ring-danger/20",
                                            )}
                                        />
                                        {errors.tickets?.[index]?.quota && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.tickets[index].quota
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor={`ticket-desc-${index}`}
                                            className="text-xs font-medium text-slate-500"
                                        >
                                            Deskripsi opsional
                                        </Label>
                                        <Input
                                            id={`ticket-desc-${index}`}
                                            placeholder="Benefit atau keterangan tiket"
                                            {...register(
                                                `tickets.${index}.description`,
                                            )}
                                            className={cn(
                                                "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                errors.tickets?.[index]
                                                    ?.description &&
                                                    "border-danger focus-visible:ring-danger/20",
                                            )}
                                        />
                                        {errors.tickets?.[index]
                                            ?.description && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.tickets[index]
                                                        .description.message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="col-span-full">
                                        <label
                                            htmlFor={`follow-reg-${index}`}
                                            className={cn(
                                                "flex cursor-pointer select-none items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                                                followRegistration[index]
                                                    ? "border-primary/30 bg-primary-light text-primary"
                                                    : "border-slate-200 bg-white text-slate-500 hover:border-primary/30 hover:bg-primary-light/30",
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`follow-reg-${index}`}
                                                className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary"
                                                checked={
                                                    followRegistration[index] ??
                                                    false
                                                }
                                                onChange={(e) => {
                                                    const checked =
                                                        e.target.checked;
                                                    setFollowRegistration(
                                                        (prev) => {
                                                            const next = [
                                                                ...prev,
                                                            ];
                                                            next[index] =
                                                                checked;
                                                            return next;
                                                        },
                                                    );
                                                }}
                                            />
                                            <CalendarCheck className="h-4 w-4 shrink-0" />
                                            <span className="text-sm font-medium">
                                                Sesuai jadwal pendaftaran
                                            </span>
                                            {followRegistration[index] &&
                                                start_registration_date &&
                                                end_registration_date && (
                                                    <span className="ml-auto hidden text-xs font-normal text-primary/80 sm:block">
                                                        {formatDateShort(
                                                            start_registration_date,
                                                        )}{" "}
                                                        -{" "}
                                                        {formatDateShort(
                                                            end_registration_date,
                                                        )}
                                                    </span>
                                                )}
                                            {followRegistration[index] &&
                                                (!start_registration_date ||
                                                    !end_registration_date) && (
                                                    <span className="ml-auto text-xs font-normal text-amber-600">
                                                        Isi jadwal pendaftaran
                                                        di step sebelumnya
                                                    </span>
                                                )}
                                        </label>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            className={cn(
                                                "text-xs font-medium text-slate-500",
                                                followRegistration[index] &&
                                                    "text-slate-400",
                                            )}
                                        >
                                            Waktu Mulai Penjualan{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name={`tickets.${index}.start_date_time`}
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Pilih waktu mulai"
                                                    minDate={
                                                        start_registration_date ||
                                                        new Date()
                                                    }
                                                    maxDate={
                                                        end_registration_date ||
                                                        undefined
                                                    }
                                                    disabled={
                                                        followRegistration[
                                                            index
                                                        ] ?? false
                                                    }
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                        followRegistration[
                                                            index
                                                        ] &&
                                                            "cursor-not-allowed bg-slate-50 text-slate-400 opacity-70",
                                                        errors.tickets?.[index]
                                                            ?.start_date_time &&
                                                            "border-danger",
                                                    )}
                                                />
                                            )}
                                        />
                                        {followRegistration[index] && (
                                            <p className="text-xs text-slate-500">
                                                Diisi otomatis sesuai waktu buka
                                                pendaftaran
                                            </p>
                                        )}
                                        {errors.tickets?.[index]
                                            ?.start_date_time && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.tickets[index]
                                                        .start_date_time.message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label
                                            className={cn(
                                                "text-xs font-medium text-slate-500",
                                                followRegistration[index] &&
                                                    "text-slate-400",
                                            )}
                                        >
                                            Waktu Selesai Penjualan{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name={`tickets.${index}.end_date_time`}
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Pilih waktu selesai"
                                                    minDate={
                                                        tickets[index]
                                                            ?.start_date_time ||
                                                        start_registration_date ||
                                                        new Date()
                                                    }
                                                    maxDate={
                                                        end_registration_date ||
                                                        undefined
                                                    }
                                                    disabled={
                                                        (followRegistration[
                                                            index
                                                        ] ??
                                                            false) ||
                                                        !tickets[index]
                                                            ?.start_date_time
                                                    }
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                        (followRegistration[
                                                            index
                                                        ] ||
                                                            !tickets[index]
                                                                ?.start_date_time) &&
                                                            "cursor-not-allowed bg-slate-50 text-slate-400 opacity-70",
                                                        errors.tickets?.[index]
                                                            ?.end_date_time &&
                                                            "border-danger",
                                                    )}
                                                />
                                            )}
                                        />
                                        {followRegistration[index] && (
                                            <p className="text-xs text-slate-500">
                                                Diisi otomatis sesuai waktu
                                                tutup pendaftaran
                                            </p>
                                        )}
                                        {errors.tickets?.[index]
                                            ?.end_date_time && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.tickets[index]
                                                        .end_date_time.message
                                                }
                                            </p>
                                        )}
                                        {!followRegistration[index] &&
                                            !tickets[index]
                                                ?.start_date_time && (
                                                <p className="text-xs text-slate-500">
                                                    Pilih waktu mulai penjualan
                                                    terlebih dahulu
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {fields.length < 5 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                className="h-10 rounded-xl border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:bg-primary-light/40 hover:text-primary"
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    append({
                                        name: "",
                                        price: 0,
                                        quota: 0,
                                        description: "",
                                        start_date_time:
                                            undefined as unknown as CreateEventSchema["tickets"][number]["start_date_time"],
                                        end_date_time:
                                            undefined as unknown as CreateEventSchema["tickets"][number]["end_date_time"],
                                        type: "free",
                                    })
                                }
                            >
                                <Plus className="mr-1.5 h-4 w-4 shrink-0" />
                                Tiket Gratis
                            </Button>
                            <Button
                                className="h-10 rounded-xl bg-primary text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary-hover"
                                type="button"
                                variant="default"
                                onClick={() =>
                                    append({
                                        name: "",
                                        price: 0,
                                        quota: 0,
                                        description: "",
                                        start_date_time:
                                            undefined as unknown as CreateEventSchema["tickets"][number]["start_date_time"],
                                        end_date_time:
                                            undefined as unknown as CreateEventSchema["tickets"][number]["end_date_time"],
                                        type: "paid",
                                    })
                                }
                            >
                                <Plus className="mr-1.5 h-4 w-4 shrink-0" />
                                Tiket Berbayar
                            </Button>
                        </div>
                    ) : (
                        <p className="flex justify-end text-sm text-slate-500">
                            Maksimal 5 jenis tiket per event
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
