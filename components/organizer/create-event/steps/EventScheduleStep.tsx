import {
    MapPin,
    Video,
    CalendarIcon,
    Clock,
    Plus,
    Trash2,
    Check,
    ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { INDONESIA_REGIONS } from "@/constants/regions";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import type { CreateEventSchema } from "@/lib/validator/create-event.schema";
import DateTimePicker from "@/components/reusable/DateTimePicker";
import TimePicker from "@/components/reusable/TimePicker";
import { useEffect, useState } from "react";

export default function EventScheduleStep({
    hideHeader,
    sectionOnly,
    disableOnlineOption,
}: {
    hideHeader?: boolean;
    sectionOnly?: "datetime" | "location" | "rundown";
    disableOnlineOption?: boolean;
}) {
    const {
        control,
        watch,
        setValue,
        register,
        formState: { errors },
    } = useFormContext<CreateEventSchema>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: "rundowns",
    });

    const is_online = watch("is_online");
    const watchProvince = watch("address.province");
    const [openProvince, setOpenProvince] = useState(false);
    const [openCity, setOpenCity] = useState(false);

    // Watch for progressive date selection
    const start_registration_date = watch("start_registration_date");
    const end_registration_date = watch("end_registration_date");
    const event_start_date = watch("event_start_date");
    const event_end_date = watch("event_end_date");

    // Auto-clear dependent fields when prerequisite is cleared (cascade)
    useEffect(() => {
        // If Start Registration is cleared, clear everything below.
        if (!start_registration_date) {
            if (end_registration_date)
                setValue(
                    "end_registration_date",
                    undefined as unknown as CreateEventSchema["end_registration_date"],
                );
            if (event_start_date)
                setValue(
                    "event_start_date",
                    undefined as unknown as CreateEventSchema["event_start_date"],
                );
            if (event_end_date)
                setValue(
                    "event_end_date",
                    undefined as unknown as CreateEventSchema["event_end_date"],
                );
            return;
        }
        // If End Registration is cleared, clear event fields.
        if (!end_registration_date) {
            if (event_start_date)
                setValue(
                    "event_start_date",
                    undefined as unknown as CreateEventSchema["event_start_date"],
                );
            if (event_end_date)
                setValue(
                    "event_end_date",
                    undefined as unknown as CreateEventSchema["event_end_date"],
                );
            return;
        }
        // If Start Event is cleared, clear End Event.
        if (!event_start_date) {
            if (event_end_date)
                setValue(
                    "event_end_date",
                    undefined as unknown as CreateEventSchema["event_end_date"],
                );
        }
    }, [
        start_registration_date,
        end_registration_date,
        event_start_date,
        event_end_date,
        setValue,
    ]);

    // Helper: Add 1 day to a date
    const addDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };

    // Helper: awal hari ini (jam 00:00:00) agar organizer boleh pilih tanggal hari ini
    const startOfToday = (): Date => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };

    return (
        <div className="space-y-10">
            {!hideHeader && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <h2 className="text-xl font-semibold text-slate-950">
                        Jadwal & Lokasi
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        Atur waktu pendaftaran, waktu pelaksanaan, rundown, dan
                        lokasi.
                    </p>
                </div>
            )}

            {(!sectionOnly || sectionOnly === "datetime") && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <CalendarIcon className="h-4.5 w-4.5" />
                            </span>
                            Jadwal Event
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Atur urutan waktu dari periode pendaftaran sampai
                            event selesai.
                        </p>
                    </div>

                    <div className="relative space-y-4">
                        <div className="relative grid grid-cols-[44px_1fr] gap-3">
                            <div className="relative flex flex-col items-center">
                                <span
                                    className="absolute top-11 bottom-0 w-px bg-slate-200"
                                    aria-hidden="true"
                                />
                                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary shadow-sm shadow-slate-900/5">
                                    <Clock className="h-4.5 w-4.5" />
                                </span>
                            </div>
                            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm shadow-slate-900/5">
                                <div className="mb-4">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                        Periode Pendaftaran
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-950">
                                        Kapan peserta bisa mulai daftar
                                    </p>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-500">
                                            Buka Pendaftaran{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="start_registration_date"
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Pilih waktu buka pendaftaran"
                                                    minDate={startOfToday()}
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                        errors.start_registration_date &&
                                                            "border-danger focus-visible:ring-danger/20",
                                                    )}
                                                />
                                            )}
                                        />
                                        {errors.start_registration_date && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors
                                                        .start_registration_date
                                                        .message
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-500">
                                            Tutup Pendaftaran{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="end_registration_date"
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Pilih waktu tutup pendaftaran"
                                                    minDate={
                                                        start_registration_date ||
                                                        startOfToday()
                                                    }
                                                    disabled={
                                                        !start_registration_date
                                                    }
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                        !start_registration_date &&
                                                            "cursor-not-allowed bg-slate-50 text-slate-400",
                                                        errors.end_registration_date &&
                                                            "border-danger focus-visible:ring-danger/20",
                                                    )}
                                                />
                                            )}
                                        />
                                        {errors.end_registration_date && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.end_registration_date
                                                        .message
                                                }
                                            </p>
                                        )}
                                        {!start_registration_date && (
                                            <p className="text-xs text-slate-500">
                                                Pilih waktu buka pendaftaran
                                                terlebih dahulu.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative grid grid-cols-[44px_1fr] gap-3">
                            <div className="relative flex flex-col items-center">
                                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary shadow-sm shadow-slate-900/5">
                                    <CalendarIcon className="h-4.5 w-4.5" />
                                </span>
                            </div>
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                                <div className="mb-4">
                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                        Periode Event
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-slate-950">
                                        Waktu pelaksanaan acara
                                    </p>
                                </div>
                                <div className="grid gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-500">
                                            Mulai Event{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="event_start_date"
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Pilih waktu mulai event"
                                                    minDate={
                                                        end_registration_date
                                                            ? addDays(
                                                                  end_registration_date,
                                                                  1,
                                                              )
                                                            : startOfToday()
                                                    }
                                                    disabled={
                                                        !end_registration_date
                                                    }
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                        !end_registration_date &&
                                                            "cursor-not-allowed bg-slate-50 text-slate-400",
                                                        errors.event_start_date &&
                                                            "border-danger focus-visible:ring-danger/20",
                                                    )}
                                                />
                                            )}
                                        />
                                        {errors.event_start_date && (
                                            <p className="text-xs text-danger">
                                                {
                                                    errors.event_start_date
                                                        .message
                                                }
                                            </p>
                                        )}
                                        {!end_registration_date && (
                                            <p className="text-xs text-slate-500">
                                                Pilih waktu tutup pendaftaran
                                                terlebih dahulu.
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-500">
                                            Selesai Event{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </Label>
                                        <Controller
                                            control={control}
                                            name="event_end_date"
                                            render={({ field }) => (
                                                <DateTimePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Pilih waktu selesai event"
                                                    minDate={
                                                        event_start_date ||
                                                        new Date()
                                                    }
                                                    maxDate={
                                                        event_start_date
                                                            ? addDays(
                                                                  event_start_date,
                                                                  1,
                                                              )
                                                            : undefined
                                                    }
                                                    disabled={!event_start_date}
                                                    className={cn(
                                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                        !event_start_date &&
                                                            "cursor-not-allowed bg-slate-50 text-slate-400",
                                                        errors.event_end_date &&
                                                            "border-danger focus-visible:ring-danger/20",
                                                    )}
                                                />
                                            )}
                                        />
                                        {errors.event_end_date && (
                                            <p className="text-xs text-danger">
                                                {errors.event_end_date.message}
                                            </p>
                                        )}
                                        {!event_start_date && (
                                            <p className="text-xs font-medium text-slate-500">
                                                Pilih waktu mulai event terlebih
                                                dahulu.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* --- Section 3: Rundown --- */}
            {(!sectionOnly || sectionOnly === "rundown") && (
                <div className="space-y-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                    <CalendarIcon className="h-4.5 w-4.5" />
                                </span>
                                Rundown Acara
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-500">
                                Susun sesi sesuai urutan pelaksanaan event.
                            </p>
                        </div>
                    </div>

                    {fields.length === 0 && (
                        <div
                            className={cn(
                                "rounded-2xl border border-dashed bg-slate-50/80 px-5 py-8 text-center",
                                errors.rundowns
                                    ? "border-danger/50 bg-danger-light/30"
                                    : "border-slate-200",
                            )}
                        >
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-slate-200/80">
                                <CalendarIcon className="h-5 w-5" />
                            </div>
                            <p
                                className={cn(
                                    "text-sm font-semibold",
                                    errors.rundowns
                                        ? "text-danger"
                                        : "text-slate-950",
                                )}
                            >
                                {errors.rundowns &&
                                !Array.isArray(errors.rundowns) &&
                                "message" in errors.rundowns
                                    ? errors.rundowns.message
                                    : "Belum ada sesi rundown"}
                            </p>
                            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
                                Tambah sesi pertama untuk mulai menyusun alur acara.
                            </p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="mt-4 h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                onClick={() =>
                                    append({
                                        title: "",
                                        start_time: "",
                                        end_time: "",
                                        description: "",
                                        location: "",
                                    })
                                }
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Tambah Sesi
                            </Button>
                        </div>
                    )}

                    {fields.length > 0 && (
                        <div className="relative space-y-4">
                            {fields.map((item, index) => {
                                const hasItemError =
                                    errors.rundowns?.[index]?.title ||
                                    errors.rundowns?.[index]?.start_time ||
                                    errors.rundowns?.[index]?.end_time;

                                return (
                                    <div
                                        key={item.id}
                                        className="relative grid grid-cols-[44px_1fr] gap-3"
                                    >
                                        <div className="relative flex flex-col items-center">
                                            {index < fields.length - 1 && (
                                                <span
                                                    className="absolute top-11 bottom-0 w-px bg-slate-200"
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span
                                                className={cn(
                                                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border bg-white text-sm font-semibold tabular-nums shadow-sm shadow-slate-900/5",
                                                    hasItemError
                                                        ? "border-danger/40 text-danger"
                                                        : "border-primary/15 text-primary",
                                                )}
                                            >
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </span>
                                        </div>

                                        <div
                                            className={cn(
                                                "rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5 transition-colors",
                                                hasItemError &&
                                                    "border-danger/50 bg-danger-light/20 ring-1 ring-danger/20",
                                            )}
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                                        Sesi {index + 1}
                                                    </p>
                                                    <p className="mt-1 text-sm font-semibold text-slate-950">
                                                        Detail agenda
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Hapus sesi ${index + 1}`}
                                                    title={`Hapus sesi ${index + 1}`}
                                                    className="h-8 w-8 rounded-xl text-slate-400 hover:bg-danger-light hover:text-danger"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <input
                                                type="hidden"
                                                {...register(
                                                    `rundowns.${index}._dbId`,
                                                )}
                                            />

                                            <div className="grid gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-medium text-slate-500">
                                                        Nama sesi{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        placeholder="Contoh: Opening Ceremony"
                                                        className={cn(
                                                            "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                            errors.rundowns?.[
                                                                index
                                                            ]?.title &&
                                                                "border-danger focus-visible:ring-danger/20",
                                                        )}
                                                        {...register(
                                                            `rundowns.${index}.title`,
                                                        )}
                                                    />
                                                    {errors.rundowns?.[index]
                                                        ?.title && (
                                                        <p className="text-xs text-danger">
                                                            {
                                                                errors
                                                                    .rundowns?.[
                                                                    index
                                                                ]?.title
                                                                    ?.message
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-medium text-slate-500">
                                                            Mulai{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Controller
                                                            control={control}
                                                            name={`rundowns.${index}.start_time`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <TimePicker
                                                                    value={
                                                                        field.value
                                                                    }
                                                                    onChange={
                                                                        field.onChange
                                                                    }
                                                                    placeholder="09:00"
                                                                    className={cn(
                                                                        "h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                                        errors
                                                                            .rundowns?.[
                                                                            index
                                                                        ]
                                                                            ?.start_time &&
                                                                            "border-danger focus-visible:ring-danger/20",
                                                                    )}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                    <span className="hidden pb-2 text-sm font-medium text-slate-400 sm:block">
                                                        to
                                                    </span>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-medium text-slate-500">
                                                            Selesai{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </Label>
                                                        <Controller
                                                            control={control}
                                                            name={`rundowns.${index}.end_time`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <TimePicker
                                                                    value={
                                                                        field.value
                                                                    }
                                                                    onChange={
                                                                        field.onChange
                                                                    }
                                                                    placeholder="09:30"
                                                                    className={cn(
                                                                        "h-10 w-full rounded-xl border-slate-200 bg-white px-3 text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                                                        errors
                                                                            .rundowns?.[
                                                                            index
                                                                        ]
                                                                            ?.end_time &&
                                                                            "border-danger focus-visible:ring-danger/20",
                                                                    )}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                {(errors.rundowns?.[index]
                                                    ?.start_time ||
                                                    errors.rundowns?.[index]
                                                        ?.end_time) && (
                                                    <p className="text-xs text-danger">
                                                        {errors.rundowns?.[
                                                            index
                                                        ]?.start_time
                                                            ?.message ||
                                                            errors.rundowns?.[
                                                                index
                                                            ]?.end_time
                                                                ?.message}
                                                    </p>
                                                )}

                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-medium text-slate-500">
                                                            Lokasi opsional
                                                        </Label>
                                                        <Input
                                                            placeholder="Contoh: Aula Utama"
                                                            className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                                            {...register(
                                                                `rundowns.${index}.location`,
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-xs font-medium text-slate-500">
                                                            Catatan opsional
                                                        </Label>
                                                        <Input
                                                            placeholder="Deskripsi singkat sesi"
                                                            className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                                            {...register(
                                                                `rundowns.${index}.description`,
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="grid grid-cols-[44px_1fr] gap-3">
                                <div className="flex justify-center">
                                    <span
                                        className="h-10 w-px bg-slate-200"
                                        aria-hidden="true"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-10 w-full justify-center rounded-xl border-dashed border-slate-300 bg-white text-sm font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:bg-primary-light/40 hover:text-primary"
                                    onClick={() =>
                                        append({
                                            title: "",
                                            start_time: "",
                                            end_time: "",
                                            description: "",
                                            location: "",
                                        })
                                    }
                                >
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Tambah Sesi Berikutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- Section 4: Location --- */}
            {(!sectionOnly || sectionOnly === "location") && (
                <div className="space-y-5">
                    <div className="space-y-1">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                                <MapPin className="h-4.5 w-4.5" />
                            </span>
                            Lokasi Event
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500">
                            Pilih format event dan lengkapi akses lokasi untuk
                            peserta.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            disabled={disableOnlineOption}
                            aria-disabled={disableOnlineOption}
                            title={
                                disableOnlineOption
                                    ? "Event offline tidak bisa diubah menjadi online."
                                    : "Pilih event online"
                            }
                            onClick={() => {
                                if (disableOnlineOption) return;
                                setValue("is_online", true);
                            }}
                            className={cn(
                                "group rounded-2xl border p-4 text-left shadow-sm shadow-slate-900/5 transition-colors",
                                is_online
                                    ? "border-primary/20 bg-primary/5 text-primary"
                                    : "border-slate-200/80 bg-white text-slate-500 hover:border-primary/30 hover:bg-primary-light/30",
                                disableOnlineOption &&
                                    "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 opacity-60 hover:border-slate-200 hover:bg-slate-50",
                            )}
                        >
                            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-primary/10">
                                <Video className="h-5 w-5" />
                            </span>
                            <span className="block text-sm font-semibold text-slate-950">
                                Online
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                {disableOnlineOption
                                    ? "Event offline tetap memakai detail venue dan alamat."
                                    : "Gunakan link meeting seperti Zoom atau Google Meet."}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue("is_online", false)}
                            className={cn(
                                "group rounded-2xl border p-4 text-left shadow-sm shadow-slate-900/5 transition-colors",
                                !is_online
                                    ? "border-primary/20 bg-primary/5 text-primary"
                                    : "border-slate-200/80 bg-white text-slate-500 hover:border-primary/30 hover:bg-primary-light/30",
                            )}
                        >
                            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-slate-900/5 ring-1 ring-primary/10">
                                <MapPin className="h-5 w-5" />
                            </span>
                            <span className="block text-sm font-semibold text-slate-950">
                                Offline
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                                Isi venue, alamat, kota, dan link maps.
                            </span>
                        </button>
                    </div>

                    {is_online && (
                        <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 shadow-sm shadow-slate-900/5">
                            <div className="mb-4">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                    Online event
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-950">
                                    Virtual meeting room
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-500">
                                    Link Meeting{" "}
                                    <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                    className={cn(
                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                        errors.meeting_url &&
                                            "border-danger focus-visible:ring-danger/20",
                                    )}
                                    {...register("meeting_url")}
                                />
                                {errors.meeting_url && (
                                    <p className="text-xs text-danger">
                                        {errors.meeting_url.message}
                                    </p>
                                )}
                                <p className="text-xs leading-relaxed text-slate-500">
                                    Masukkan link Zoom, Google Meet, atau
                                    platform video conference lainnya.
                                </p>
                            </div>

                            <label
                                htmlFor="hide_meeting_url"
                                className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-slate-500 transition-colors hover:border-primary/30 hover:bg-primary-light/30"
                            >
                                <input
                                    type="checkbox"
                                    id="hide_meeting_url"
                                    className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary"
                                    {...register("hide_meeting_url")}
                                />
                                <span>
                                    <span className="block text-sm font-medium text-slate-700">
                                        Sembunyikan link sampai event mulai
                                    </span>
                                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                                        Peserta tidak langsung melihat link
                                        meeting sebelum waktunya.
                                    </span>
                                </span>
                            </label>
                        </div>
                    )}

                    {!is_online && (
                        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                                    Offline event
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-950">
                                    Detail venue dan alamat
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">
                                        Provinsi{" "}
                                        <span className="text-danger">*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="address.province"
                                        render={({ field }) => (
                                            <Popover
                                                open={openProvince}
                                                onOpenChange={setOpenProvince}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "h-10 w-full justify-between rounded-xl border-slate-200 bg-white text-sm font-normal shadow-none hover:border-primary/30 hover:bg-white focus-visible:ring-primary/20",
                                                            !field.value &&
                                                                "text-slate-400",
                                                            errors.address
                                                                ?.province &&
                                                                "border-danger",
                                                        )}
                                                    >
                                                        {field.value ||
                                                            "Pilih provinsi"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full rounded-xl p-0">
                                                    <Command className="rounded-xl">
                                                        <CommandInput placeholder="Cari provinsi..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                Provinsi tidak
                                                                ditemukan.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {INDONESIA_REGIONS.map(
                                                                    (
                                                                        region,
                                                                    ) => (
                                                                        <CommandItem
                                                                            className="rounded-lg"
                                                                            key={
                                                                                region.name
                                                                            }
                                                                            value={
                                                                                region.name
                                                                            }
                                                                            onSelect={() => {
                                                                                field.onChange(
                                                                                    region.name,
                                                                                );
                                                                                setValue(
                                                                                    "address.city",
                                                                                    "",
                                                                                );
                                                                                setOpenProvince(
                                                                                    false,
                                                                                );
                                                                                setOpenCity(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "h-4 w-4",
                                                                                    field.value ===
                                                                                        region.name
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0",
                                                                                )}
                                                                            />
                                                                            {
                                                                                region.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.address?.province && (
                                        <p className="text-xs text-danger">
                                            {errors.address.province.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">
                                        Kota/Kabupaten{" "}
                                        <span className="text-danger">*</span>
                                    </Label>
                                    <Controller
                                        control={control}
                                        name="address.city"
                                        render={({ field }) => (
                                            <Popover
                                                open={openCity}
                                                onOpenChange={setOpenCity}
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        disabled={
                                                            !watchProvince
                                                        }
                                                        className={cn(
                                                            "h-10 w-full justify-between rounded-xl border-slate-200 bg-white text-sm font-normal shadow-none hover:border-primary/30 hover:bg-white focus-visible:ring-primary/20",
                                                            !field.value &&
                                                                "text-slate-400",
                                                            !watchProvince &&
                                                                "cursor-not-allowed bg-slate-50 text-slate-400",
                                                            errors.address
                                                                ?.city &&
                                                                "border-danger",
                                                        )}
                                                    >
                                                        {field.value ||
                                                            "Pilih kota"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full rounded-xl p-0">
                                                    <Command className="rounded-xl">
                                                        <CommandInput placeholder="Cari kota..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                Kota tidak
                                                                ditemukan.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {INDONESIA_REGIONS.find(
                                                                    (r) =>
                                                                        r.name ===
                                                                        watchProvince,
                                                                )?.cities.map(
                                                                    (city) => (
                                                                        <CommandItem
                                                                            key={
                                                                                city.name
                                                                            }
                                                                            value={
                                                                                city.name
                                                                            }
                                                                            onSelect={() => {
                                                                                field.onChange(
                                                                                    city.name,
                                                                                );
                                                                                setOpenCity(
                                                                                    false,
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "h-4 w-4",
                                                                                    field.value ===
                                                                                        city.name
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0",
                                                                                )}
                                                                            />
                                                                            {
                                                                                city.name
                                                                            }
                                                                        </CommandItem>
                                                                    ),
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                    />
                                    {errors.address?.city && (
                                        <p className="text-xs text-danger">
                                            {errors.address.city.message}
                                        </p>
                                    )}
                                    {!watchProvince && (
                                        <p className="text-xs text-slate-500">
                                            Pilih provinsi terlebih dahulu.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-500">
                                    Alamat Lengkap{" "}
                                    <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    placeholder="Jalan, nomor, gedung, dll."
                                    className={cn(
                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                        errors.address?.raw_address &&
                                            "border-danger focus-visible:ring-danger/20",
                                    )}
                                    {...register("address.raw_address")}
                                />
                                {errors.address?.raw_address && (
                                    <p className="text-xs text-danger">
                                        {errors.address.raw_address.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-500">
                                    Link Google Maps{" "}
                                    <span className="text-danger">*</span>
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="https://maps.app.goo.gl/..."
                                    className={cn(
                                        "h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                        errors.address?.location_url &&
                                            "border-danger focus-visible:ring-danger/20",
                                    )}
                                    {...register("address.location_url")}
                                />
                                {errors.address?.location_url && (
                                    <p className="text-xs text-danger">
                                        {errors.address.location_url.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">
                                        Nama Lokasi
                                    </Label>
                                    <Input
                                        placeholder="Contoh: Gedung A"
                                        type="text"
                                        className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                        {...register("address.title")}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-500">
                                        Kode Pos opsional
                                    </Label>
                                    <Input
                                        placeholder="12345"
                                        type="text"
                                        className="h-10 rounded-xl border-slate-200 bg-white text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                        {...register("address.postal_code")}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
