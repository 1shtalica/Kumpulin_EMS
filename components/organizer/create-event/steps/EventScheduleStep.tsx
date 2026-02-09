"use client";

import { useState } from "react";
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
import type { RundownRequest } from "@/types/create-event";

interface EventScheduleStepProps {
  // Event Schedule
  startEventDate?: Date;
  endEventDate?: Date;
  startEventTime: string;
  endEventTime: string;
  onEventScheduleChange: (data: {
    startEventDate?: Date;
    endEventDate?: Date;
    startEventTime?: string;
    endEventTime?: string;
  }) => void;

  // Registration Schedule
  startRegistration?: Date;
  endRegistration?: Date;
  startRegistrationTime: string;
  endRegistrationTime: string;
  onRegistrationScheduleChange: (data: {
    startRegistration?: Date;
    endRegistration?: Date;
    startRegistrationTime?: string;
    endRegistrationTime?: string;
  }) => void;

  // Rundown
  rundown: RundownRequest[];
  onAddRundown: () => void;
  onRemoveRundown: (index: number) => void;
  onUpdateRundown: (
    index: number,
    field: keyof RundownRequest,
    value: string,
  ) => void;

  // Location
  isOnline: boolean;
  onIsOnlineChange: (isOnline: boolean) => void;

  address: {
    rawAddress: string;
    city: string;
    province: string;
    postalCode: string;
  };
  onAddressChange: (field: string, value: string) => void;

  meetingUrl: string;
  onMeetingUrlChange: (url: string) => void;
}

export default function EventScheduleStep(props: EventScheduleStepProps) {
  const {
    // Event
    startEventDate,
    endEventDate,
    startEventTime,
    endEventTime,
    onEventScheduleChange,

    // Registration
    startRegistration,
    endRegistration,
    startRegistrationTime,
    endRegistrationTime,
    onRegistrationScheduleChange,

    // Rundown
    rundown,
    onAddRundown,
    onRemoveRundown,
    onUpdateRundown,

    // Location
    isOnline,
    onIsOnlineChange,
    address,
    onAddressChange,
    meetingUrl,
    onMeetingUrlChange,
  } = props;

  // Local state for date inputs (formatted as YYYY-MM-DD)
  const [startDateStr, setStartDateStr] = useState(
    startEventDate ? startEventDate.toISOString().split("T")[0] : "",
  );
  const [endDateStr, setEndDateStr] = useState(
    endEventDate ? endEventDate.toISOString().split("T")[0] : "",
  );

  const [startRegStr, setStartRegStr] = useState(
    startRegistration ? startRegistration.toISOString().split("T")[0] : "",
  );
  const [endRegStr, setEndRegStr] = useState(
    endRegistration ? endRegistration.toISOString().split("T")[0] : "",
  );

  const handleDateChange = (
    field: "startEvent" | "endEvent" | "startReg" | "endReg",
    value: string,
  ) => {
    switch (field) {
      case "startEvent":
        setStartDateStr(value);
        if (value) onEventScheduleChange({ startEventDate: new Date(value) });
        break;
      case "endEvent":
        setEndDateStr(value);
        if (value) onEventScheduleChange({ endEventDate: new Date(value) });
        break;
      case "startReg":
        setStartRegStr(value);
        if (value)
          onRegistrationScheduleChange({ startRegistration: new Date(value) });
        break;
      case "endReg":
        setEndRegStr(value);
        if (value)
          onRegistrationScheduleChange({ endRegistration: new Date(value) });
        break;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent">Jadwal & Lokasi</h2>
        <p className="mt-2 text-muted-foreground">
          Atur waktu acara, pendaftaran, dan lokasi event
        </p>
      </div>

      {/* --- Section 1: Jadwal Acara --- */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Waktu Pelaksanaan Event
        </h3>

        <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 grid-cols-1">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <Label>Mulai Event</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={startDateStr}
                onChange={(e) => handleDateChange("startEvent", e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={startEventTime}
                onChange={(e) =>
                  onEventScheduleChange({ startEventTime: e.target.value })
                }
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="space-y-2">
            <Label>Selesai Event</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={endDateStr}
                onChange={(e) => handleDateChange("endEvent", e.target.value)}
                min={startDateStr}
                className="flex-1"
              />
              <Input
                type="time"
                value={endEventTime}
                onChange={(e) =>
                  onEventScheduleChange({ endEventTime: e.target.value })
                }
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Jadwal Pendaftaran --- */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-accent">
          <Clock className="h-5 w-5 text-primary" />
          Periode Pendaftaran
        </h3>

        <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 grid-cols-1">
          {/* Start Reg */}
          <div className="space-y-2">
            <Label>Buka Pendaftaran</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={startRegStr}
                onChange={(e) => handleDateChange("startReg", e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={startRegistrationTime}
                onChange={(e) =>
                  onRegistrationScheduleChange({
                    startRegistrationTime: e.target.value,
                  })
                }
                className="w-full sm:w-auto"
              />
            </div>
          </div>

          {/* End Reg */}
          <div className="space-y-2">
            <Label>Tutup Pendaftaran</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="date"
                value={endRegStr}
                onChange={(e) => handleDateChange("endReg", e.target.value)}
                min={startRegStr}
                className="flex-1"
              />
              <Input
                type="time"
                value={endRegistrationTime}
                onChange={(e) =>
                  onRegistrationScheduleChange({
                    endRegistrationTime: e.target.value,
                  })
                }
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 3: Detail Lokasi --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-accent">
            {isOnline ? (
              <Video className="h-5 w-5 text-primary" />
            ) : (
              <MapPin className="h-5 w-5 text-primary" />
            )}
            Lokasi Event
          </h3>

          <div className="flex items-center rounded-lg border bg-white p-1 shadow-xs">
            <button
              onClick={() => onIsOnlineChange(false)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                !isOnline
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              Offline
            </button>
            <button
              onClick={() => onIsOnlineChange(true)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                isOnline
                  ? "bg-primary text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-50",
              )}
            >
              Online
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          {!isOnline ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Alamat Lengkap</Label>
                <Input
                  placeholder="Nama Gedung, Jalan, No..."
                  value={address.rawAddress}
                  onChange={(e) =>
                    onAddressChange("rawAddress", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {/* --- Province Selector --- */}
                <div className="space-y-2">
                  <Label>Provinsi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !address.province && "text-muted-foreground",
                        )}
                      >
                        {address.province || "Pilih Provinsi"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari provinsi..." />
                        <CommandList>
                          <CommandEmpty>Provinsi tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {INDONESIA_REGIONS.map((province) => (
                              <CommandItem
                                key={province.id}
                                value={province.name}
                                onSelect={(currentValue) => {
                                  // Find the matched province
                                  const matched = INDONESIA_REGIONS.find(
                                    (p) =>
                                      p.name.toLowerCase() ===
                                      currentValue.toLowerCase(),
                                  );

                                  if (matched) {
                                    // Update state: Set province, reset city
                                    onAddressChange("province", matched.name);
                                    onAddressChange("city", ""); // RESET CITY
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    address.province === province.name
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {province.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* --- City Selector --- */}
                <div className="space-y-2">
                  <Label>Kota/Kabupaten</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={!address.province} // DISABLE if no province
                        className={cn(
                          "w-full justify-between font-normal",
                          !address.city && "text-muted-foreground",
                        )}
                      >
                        {address.city || "Pilih Kota/Kabupaten"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Cari kota..." />
                        <CommandList>
                          <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {(() => {
                              // Filter cities based on selected province
                              const selectedProv = INDONESIA_REGIONS.find(
                                (p) => p.name === address.province,
                              );
                              const cities = selectedProv
                                ? selectedProv.cities
                                : [];

                              return cities.map((city) => (
                                <CommandItem
                                  key={city.id}
                                  value={city.name}
                                  onSelect={(currentValue) => {
                                    const matched = cities.find(
                                      (c) =>
                                        c.name.toLowerCase() ===
                                        currentValue.toLowerCase(),
                                    );
                                    onAddressChange(
                                      "city",
                                      matched ? matched.name : currentValue,
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      address.city === city.name
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {city.name}
                                </CommandItem>
                              ));
                            })()}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Kode Pos (Opsional)</Label>
                <Input
                  placeholder="12345"
                  className="w-32"
                  value={address.postalCode}
                  onChange={(e) =>
                    onAddressChange("postalCode", e.target.value)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Link Meeting / Streaming</Label>
              <Input
                type="url"
                placeholder="https://zoom.us/..."
                value={meetingUrl}
                onChange={(e) => onMeetingUrlChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                URL platform meeting (Zoom, GMeet, Youtube, dll)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- Section 4: Rundown --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-accent">
            <Clock className="h-5 w-5 text-primary" />
            Susunan Acara (Rundown)
          </h3>
          <Button size="sm" variant="outline" onClick={onAddRundown}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sesi
          </Button>
        </div>

        <div className="space-y-4">
          {rundown.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
              <p className="text-sm text-muted-foreground">
                Belum ada rundown acara
              </p>
              <Button variant="link" onClick={onAddRundown}>
                Tambah sesi pertama
              </Button>
            </div>
          )}

          {rundown.map((item, index) => (
            <div
              key={index}
              className="relative grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm grid-cols-1 md:grid-cols-12"
            >
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-sm z-10"
                onClick={() => onRemoveRundown(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              {/* Time */}
              <div className="space-y-2 md:col-span-12 lg:col-span-4">
                <Label className="text-xs text-muted-foreground">Waktu</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={item.startTime}
                    onChange={(e) =>
                      onUpdateRundown(index, "startTime", e.target.value)
                    }
                    className="h-9 text-sm"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="time"
                    value={item.endTime}
                    onChange={(e) =>
                      onUpdateRundown(index, "endTime", e.target.value)
                    }
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 md:col-span-12 lg:col-span-8">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Sesi
                    </Label>
                    <Input
                      placeholder="Judul sesi..."
                      value={item.title}
                      onChange={(e) =>
                        onUpdateRundown(index, "title", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Lokasi (Opsional)
                    </Label>
                    <Input
                      placeholder="Panggung utama..."
                      value={item.location || ""}
                      onChange={(e) =>
                        onUpdateRundown(index, "location", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Deskripsi singkat..."
                    value={item.description}
                    onChange={(e) =>
                      onUpdateRundown(index, "description", e.target.value)
                    }
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
