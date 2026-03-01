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
    name: "rundown",
  });

  const isOnline = watch("isOnline");
  const watchProvince = watch("address.province");

  // Watch for progressive date selection
  const startRegistrationDateTime = watch("startRegistrationDateTime");
  const endRegistrationDateTime = watch("endRegistrationDateTime");
  const startEventDateTime = watch("startEventDateTime");
  const endEventDateTime = watch("endEventDateTime");

  // Auto-clear dependent fields when prerequisite is cleared (cascade)
  useEffect(() => {
    // If Start Registration is cleared → clear everything below
    if (!startRegistrationDateTime) {
      if (endRegistrationDateTime)
        setValue("endRegistrationDateTime", undefined as any);
      if (startEventDateTime) setValue("startEventDateTime", undefined as any);
      if (endEventDateTime) setValue("endEventDateTime", undefined as any);
      return;
    }
    // If End Registration is cleared → clear event fields
    if (!endRegistrationDateTime) {
      if (startEventDateTime) setValue("startEventDateTime", undefined as any);
      if (endEventDateTime) setValue("endEventDateTime", undefined as any);
      return;
    }
    // If Start Event is cleared → clear End Event
    if (!startEventDateTime) {
      if (endEventDateTime) setValue("endEventDateTime", undefined as any);
    }
  }, [
    startRegistrationDateTime,
    endRegistrationDateTime,
    startEventDateTime,
    endEventDateTime,
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
        <div className="space-y-4">
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
                name="startRegistrationDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu buka pendaftaran"
                    minDate={new Date()}
                    className={cn(
                      errors.startRegistrationDateTime && "border-danger",
                      "shadow-none"
                    )}

                  />
                )}
              />
              {errors.startRegistrationDateTime && (
                <p className="text-xs text-danger">
                  {errors.startRegistrationDateTime.message}
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
                name="endRegistrationDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu tutup pendaftaran"
                    minDate={startRegistrationDateTime || new Date()}
                    disabled={!startRegistrationDateTime}
                    className={cn(
                      errors.endRegistrationDateTime && "border-danger",
                      "shadow-none"
                    )}
                  />
                )}
              />
              {errors.endRegistrationDateTime && (
                <p className="text-xs text-danger">
                  {errors.endRegistrationDateTime.message}
                </p>
              )}
              {!startRegistrationDateTime && (
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
        <div className="space-y-4">
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
                name="startEventDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu mulai event"
                    minDate={
                      endRegistrationDateTime
                        ? addDays(endRegistrationDateTime, 1)
                        : new Date()
                    }
                    disabled={!endRegistrationDateTime}
                    className={cn(errors.startEventDateTime && "border-danger", "shadow-none")}
                  />
                )}
              />
              {errors.startEventDateTime && (
                <p className="text-xs text-danger">
                  {errors.startEventDateTime.message}
                </p>
              )}
              {!endRegistrationDateTime && (
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
                name="endEventDateTime"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Pilih waktu selesai event"
                    minDate={startEventDateTime || new Date()}
                    disabled={!startEventDateTime}
                    className={cn(errors.endEventDateTime && "border-danger", "shadow-none")}
                  />
                )}
              />
              {errors.endEventDateTime && (
                <p className="text-xs text-danger">
                  {errors.endEventDateTime.message}
                </p>
              )}
              {!startEventDateTime && (
                <p className="text-xs text-muted">
                  Pilih waktu mulai event terlebih dahulu
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Section 3: Rundown --- */}
      {(!sectionOnly || sectionOnly === "rundown") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Rundown Acara
            </h3>
            <Button
              type="button"
              variant="outline"
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
                errors.rundown
                  ? "border-danger bg-red-50"
                  : "border-gray-300 bg-gray-50",
              )}
            >
              <p
                className={cn(
                  "text-sm",
                  errors.rundown
                    ? "text-danger font-medium"
                    : "text-muted-foreground",
                )}
              >
                {errors.rundown &&
                  !Array.isArray(errors.rundown) &&
                  "message" in errors.rundown
                  ? errors.rundown.message
                  : 'Belum ada sesi rundown. Klik tombol "Tambah Sesi" untuk memulai.'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border bg-card p-6 shadow-sm",
                  (errors.rundown?.[index]?.title ||
                    errors.rundown?.[index]?.start_time ||
                    errors.rundown?.[index]?.end_time) &&
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
                      className="text-danger hover:bg-danger-light hover:text-danger"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>

                {/* Content Grid */}
                <div className="grid gap-4 p-4 grid-cols-1 md:grid-cols-12">
                  {/* Time Inputs */}
                  <div className="space-y-2 md:col-span-12 lg:col-span-4">
                    <Label className="text-xs text-muted-foreground">
                      Waktu <span className="text-danger">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Controller
                          control={control}
                          name={`rundown.${index}.start_time`}
                          render={({ field }) => (
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Mulai"
                              className={cn(
                                "h-9 text-sm w-full shadow-none",
                                errors.rundown?.[index]?.start_time &&
                                "border-danger",
                              )}
                            />
                          )}
                        />
                      </div>
                      <span className="text-muted-foreground shrink-0">-</span>
                      <div className="flex-1 min-w-0">
                        <Controller
                          control={control}
                          name={`rundown.${index}.end_time`}
                          render={({ field }) => (
                            <TimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Selesai"
                              className={cn(
                                "h-9 text-sm w-full shadow-none",
                                errors.rundown?.[index]?.end_time &&
                                "border-danger",
                              )}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {(errors.rundown?.[index]?.start_time ||
                      errors.rundown?.[index]?.end_time) && (
                        <p className="text-xs text-danger">
                          {errors.rundown?.[index]?.start_time?.message ||
                            errors.rundown?.[index]?.end_time?.message}
                        </p>
                      )}
                  </div>

                  {/* Title */}
                  <div className="space-y-1 md:col-span-12 lg:col-span-8">
                    <Label className="text-xs text-muted-foreground">
                      Sesi <span className="text-danger">*</span>
                    </Label>
                    <Input
                      placeholder="Nama sesi (contoh: Opening Ceremony)"
                      className={cn(
                        "h-9",
                        errors.rundown?.[index]?.title && "border-danger",
                      )}
                      {...register(`rundown.${index}.title`)}
                    />
                    {errors.rundown?.[index]?.title && (
                      <p className="text-xs text-danger">
                        {errors.rundown?.[index]?.title?.message}
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
                      {...register(`rundown.${index}.location`)}
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
                      {...register(`rundown.${index}.description`)}
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
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Lokasi Event
          </h3>

          {/* Toggle Online/Offline */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant={isOnline ? "default" : "outline"}
              onClick={() => setValue("isOnline", true)}
              className="flex-1 shadow-glow"
            >
              <Video className="mr-2 h-4 w-4" />
              Online
            </Button>
            <Button
              type="button"
              variant={!isOnline ? "default" : "outline"}
              onClick={() => setValue("isOnline", false)}
              className="flex-1 shadow-glow"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Offline
            </Button>
          </div>

          {/* Online: Meeting URL */}
          {isOnline && (
            <div className="space-y-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Label>Link Meeting <span className="text-danger">*</span></Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className={cn(
                  errors.meetingUrl &&
                  "border-danger focus-visible:ring-danger",
                )}
                {...register("meetingUrl")}
              />
              {errors.meetingUrl && (
                <p className="text-xs text-danger">
                  {errors.meetingUrl.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Masukkan link Zoom, Google Meet, atau platform video conference
                lainnya
              </p>
            </div>
          )}

          {/* Offline: Address */}
          {!isOnline && (
            <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
                  className={cn(errors.address?.rawAddress && "border-danger")}
                  {...register("address.rawAddress")}
                />
                {errors.address?.rawAddress && (
                  <p className="text-xs text-danger">
                    {errors.address.rawAddress.message}
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
                    {...register("address.postalCode")}
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
