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
import { useEffect } from "react";

export default function EventScheduleStep({
  hideHeader,
  sectionOnly
}: {
  hideHeader?: boolean;
  sectionOnly?: 'datetime' | 'location' | 'rundown';
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

  // Watch for progressive date selection
  const start_registration_date = watch("start_registration_date");
  const end_registration_date = watch("end_registration_date");
  const event_start_date = watch("event_start_date");
  const event_end_date = watch("event_end_date");

  // Auto-clear dependent fields when prerequisite is cleared (cascade)
  useEffect(() => {
    // If Start Registration is cleared → clear everything below
    if (!start_registration_date) {
      if (end_registration_date)
        setValue("end_registration_date", undefined as any);
      if (event_start_date) setValue("event_start_date", undefined as any);
      if (event_end_date) setValue("event_end_date", undefined as any);
      return;
    }
    // If End Registration is cleared → clear event fields
    if (!end_registration_date) {
      if (event_start_date) setValue("event_start_date", undefined as any);
      if (event_end_date) setValue("event_end_date", undefined as any);
      return;
    }
    // If Start Event is cleared → clear End Event
    if (!event_start_date) {
      if (event_end_date) setValue("event_end_date", undefined as any);
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

  return (
    <div className="space-y-10">
      {/* Header */}
      {!hideHeader && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Jadwal & Lokasi</h2>
          <p className="mt-2 text-muted-foreground">
            Atur waktu acara, pendaftaran, dan lokasi event
          </p>
        </div>
      )}

      {/* --- Section 1: Periode Pendaftaran (FIRST) --- */}
      {(!sectionOnly || sectionOnly === "datetime") && (
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Periode Pendaftaran
          </h3>

          <div className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm grid-cols-1">
            {/* Start Registration DateTime */}
            <div className="space-y-2">
              <Label>
                Buka Pendaftaran <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="start_registration_date"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu buka pendaftaran"
                    minDate={new Date()}
                    className={cn(
                      errors.start_registration_date && "border-danger",
                      "shadow-none"
                    )}

                  />
                )}
              />
              {errors.start_registration_date && (
                <p className="text-xs text-danger">
                  {errors.start_registration_date.message}
                </p>
              )}
            </div>

            {/* End Registration DateTime */}
            <div className="space-y-2">
              <Label>
                Tutup Pendaftaran <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="end_registration_date"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu tutup pendaftaran"
                    minDate={start_registration_date || new Date()}
                    disabled={!start_registration_date}
                    className={cn(
                      errors.end_registration_date && "border-danger",
                      "shadow-none"
                    )}
                  />
                )}
              />
              {errors.end_registration_date && (
                <p className="text-xs text-danger">
                  {errors.end_registration_date.message}
                </p>
              )}
              {!start_registration_date && (
                <p className="text-xs text-muted">
                  Pilih waktu buka pendaftaran terlebih dahulu
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Section 2: Waktu Pelaksanaan Event (AFTER Registration) --- */}
      {(!sectionOnly || sectionOnly === "datetime") && (
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Waktu Pelaksanaan Event
          </h3>

          <div className="grid gap-4 rounded-2xl border bg-card p-6 shadow-sm grid-cols-1">
            {/* Start Event DateTime */}
            <div className="space-y-2">
              <Label>
                Mulai Event <span className="text-danger">*</span>
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
                        ? addDays(end_registration_date, 1)
                        : new Date()
                    }
                    disabled={!end_registration_date}
                    className={cn(errors.event_start_date && "border-danger", "shadow-none")}
                  />
                )}
              />
              {errors.event_start_date && (
                <p className="text-xs text-danger">
                  {errors.event_start_date.message}
                </p>
              )}
              {!end_registration_date && (
                <p className="text-xs text-muted">
                  Pilih waktu tutup pendaftaran terlebih dahulu
                </p>
              )}
            </div>

            {/* End Event DateTime */}
            <div className="space-y-2">
              <Label>
                Selesai Event <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="event_end_date"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu selesai event"
                    minDate={event_start_date || new Date()}
                    maxDate={event_start_date ? addDays(event_start_date, 1) : undefined}
                    disabled={!event_start_date}
                    className={cn(errors.event_end_date && "border-danger", "shadow-none")}
                  />
                )}
              />
              {errors.event_end_date && (
                <p className="text-xs text-danger">
                  {errors.event_end_date.message}
                </p>
              )}
              {!event_start_date && (
                <p className="text-xs text-muted font-medium">
                  Pilih waktu mulai event terlebih dahulu
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Section 3: Rundown --- */}
      {(!sectionOnly || sectionOnly === "rundown") && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Rundown Acara
            </h3>
            <Button
              type="button"
              size="lg"
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
              <Plus className="h-4 w-4" />
              Tambah Sesi
            </Button>
          </div>

          {fields.length === 0 && (
            <div
              className={cn(
                "rounded-xl border border-dashed p-12 text-center",
                errors.rundowns
                  ? "border-danger bg-red-50"
                  : "border-gray-300 bg-gray-50",
              )}
            >
              <p
                className={cn(
                  "text-sm",
                  errors.rundowns
                    ? "text-danger font-medium"
                    : "text-muted-foreground",
                )}
              >
                {errors.rundowns &&
                  !Array.isArray(errors.rundowns) &&
                  "message" in errors.rundowns
                  ? errors.rundowns.message
                  : 'Belum ada sesi rundown. Klik tombol "Tambah Sesi" untuk memulai.'}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border bg-card p-6 shadow-sm",
                  (errors.rundowns?.[index]?.title ||
                    errors.rundowns?.[index]?.start_time ||
                    errors.rundowns?.[index]?.end_time) &&
                  "border-danger ring-1 ring-danger",
                )}
              >
                {/* Header Row */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-accent">
                    Sesi #{index + 1}
                  </span>
                  {fields.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="py-4 px-6 text-danger hover:bg-danger-light hover:text-danger"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 p-4 grid-cols-1 md:grid-cols-12">
                  {/* Title */}
                  <div className="space-y-1 md:col-span-12">
                    <Label className="text-xs text-muted-foreground">
                      Sesi <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="Nama sesi (contoh: Opening Ceremony)"
                      className={cn(
                        "h-9",
                        errors.rundowns?.[index]?.title && "border-danger",
                      )}
                      {...register(`rundowns.${index}.title`)}
                    />
                    {errors.rundowns?.[index]?.title && (
                      <p className="text-xs text-danger">
                        {errors.rundowns?.[index]?.title?.message}
                      </p>
                    )}
                  </div>

                  {/* Time Inputs */}
                  <div className="space-y-2 md:col-span-12">
                    <Label className="text-xs text-muted-foreground">
                      Waktu <span className="text-danger">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Controller
                          control={control}
                          name={`rundowns.${index}.start_time`}
                          render={({ field }) => (
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Mulai"
                              className={cn(
                                "h-9 text-sm w-full shadow-none px-2.5",
                                errors.rundowns?.[index]?.start_time &&
                                "border-danger"
                              )}
                            />
                          )}
                        />
                      </div>
                      <span className="text-muted-foreground shrink-0">-</span>
                      <div className="flex-1 min-w-0">
                        <Controller
                          control={control}
                          name={`rundowns.${index}.end_time`}
                          render={({ field }) => (
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Selesai"
                              className={cn(
                                "h-9 text-sm w-full shadow-none px-2.5",
                                errors.rundowns?.[index]?.end_time &&
                                "border-danger"
                              )}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {(errors.rundowns?.[index]?.start_time ||
                      errors.rundowns?.[index]?.end_time) && (
                        <p className="text-xs text-danger">
                          {errors.rundowns?.[index]?.start_time?.message ||
                            errors.rundowns?.[index]?.end_time?.message}
                        </p>
                      )}
                  </div>

                  {/* Location */}
                  <div className="space-y-1 md:col-span-6">
                    <Label className="text-xs text-muted-foreground">
                      Lokasi (Opsional)
                    </Label>
                    <Input
                      placeholder="Tempat (contoh: Aula Utama)"
                      className="h-9"
                      {...register(`rundowns.${index}.location`)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1 md:col-span-6">
                    <Label className="text-xs text-muted-foreground">
                      Deskripsi (Opsional)
                    </Label>
                    <Input
                      placeholder="Deskripsi singkat..."
                      className="h-9"
                      {...register(`rundowns.${index}.description`)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Section 4: Location --- */}
      {(!sectionOnly || sectionOnly === "location") && (
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Lokasi Event
          </h3>

          {/* Toggle Online/Offline (Slider) */}
          <div className="relative flex w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-full items-center shadow-inner">
            <div
              className={cn(
                "absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 shadow-md rounded-full transition-transform duration-300 ease-in-out",
                !is_online && "translate-x-full"
              )}
            />
            <button
              type="button"
              onClick={() => setValue("is_online", true)}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center py-2.5 text-sm font-semibold transition-colors duration-200",
                is_online ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="mr-2 h-4 w-4" />
              Online
            </button>
            <button
              type="button"
              onClick={() => setValue("is_online", false)}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center py-2.5 text-sm font-semibold transition-colors duration-200",
                !is_online ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Offline
            </button>
          </div>

          {/* Online: Meeting URL */}
          {is_online && (
            <div className="space-y-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Label>Link Meeting <span className="text-danger">*</span></Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className={cn(
                  errors.meeting_url &&
                  "border-danger focus-visible:ring-danger",
                )}
                {...register("meeting_url")}
              />
              {errors.meeting_url && (
                <p className="text-xs text-danger">
                  {errors.meeting_url.message}
                </p>
              )}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="hide_meeting_url"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("hide_meeting_url")}
                />
                <Label
                  htmlFor="hide_meeting_url"
                  className="font-normal text-muted-foreground"
                >
                  Sembunyikan link sampai waktu event mulai
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Masukkan link Zoom, Google Meet, atau platform video conference
                lainnya
              </p>
            </div>
          )}

          {/* Offline: Address */}
          {!is_online && (
            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Province */}
                <div className="space-y-2">
                  <Label>
                    Provinsi <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="address.province"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between shadow-none font-normal",
                              !field.value && "text-muted-foreground",
                              errors.address?.province && "border-danger",
                            )}
                          >
                            {field.value || "Pilih provinsi"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 rounded-xl">
                          <Command className="rounded-xl">
                            <CommandInput placeholder="Cari provinsi..." />
                            <CommandList>
                              <CommandEmpty>
                                Provinsi tidak ditemukan.
                              </CommandEmpty>
                              <CommandGroup>
                                {INDONESIA_REGIONS.map((region) => (
                                  <CommandItem
                                    className="rounded-lg"
                                    key={region.name}
                                    value={region.name}
                                    onSelect={() => {
                                      field.onChange(region.name);
                                      setValue("address.city", "");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        field.value === region.name
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {region.name}
                                  </CommandItem>
                                ))}
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

                {/* City */}
                <div className="space-y-2">
                  <Label>
                    Kota/Kabupaten <span className="text-danger">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="address.city"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={!watchProvince}
                            className={cn(
                              "w-full justify-between shadow-none font-normal",
                              !field.value && "text-muted-foreground",
                              errors.address?.city && "border-danger",
                            )}
                          >
                            {field.value || "Pilih kota"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 rounded-xl">
                          <Command className="rounded-xl">
                            <CommandInput placeholder="Cari kota..." />
                            <CommandList>
                              <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                              <CommandGroup>
                                {INDONESIA_REGIONS.find(
                                  (r) => r.name === watchProvince,
                                )?.cities.map((city) => (
                                  <CommandItem
                                    key={city.name}
                                    value={city.name}
                                    onSelect={() => field.onChange(city.name)}
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        field.value === city.name
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {city.name}
                                  </CommandItem>
                                ))}
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
                </div>
              </div>

              {/* Full Address */}
              <div className="space-y-2">
                <Label>
                  Alamat Lengkap <span className="text-danger">*</span>
                </Label>
                <Input
                  placeholder="Jalan, nomor, gedung, dll."
                  className={cn(errors.address?.raw_address && "border-danger")}
                  {...register("address.raw_address")}
                />
                {errors.address?.raw_address && (
                  <p className="text-xs text-danger">
                    {errors.address.raw_address.message}
                  </p>
                )}
              </div>

              {/* Location URL (Google Maps) */}
              <div className="space-y-2">
                <Label>
                  Link Google Maps <span className="text-danger">*</span>
                </Label>
                <Input
                  type="url"
                  placeholder="https://maps.app.goo.gl/..."
                  className={cn(errors.address?.location_url && "border-danger")}
                  {...register("address.location_url")}
                />
                {errors.address?.location_url && (
                  <p className="text-xs text-danger">
                    {errors.address.location_url.message}
                  </p>
                )}
              </div>

              {/* Postal Code (Optional) */}
              <div className="flex justify-evenly gap-3">
                <div className="space-y-2 w-full">
                  <Label>Nama Lokasi</Label>
                  <Input
                    placeholder="Contoh. Gedung A"
                    type="text"
                    {...register("address.title")}
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label>Kode Pos (Opsional)</Label>
                  <Input
                    placeholder="12345"
                    type="text"
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
