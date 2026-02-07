"use client";

import { useState } from "react";
import { MapPin, Video, CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LocationType } from "@/types/create-event";

interface EventScheduleStepProps {
  // Schedule
  startDate?: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  onScheduleChange: (data: {
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
  }) => void;

  // Location
  locationType: LocationType;
  onLocationTypeChange: (type: LocationType) => void;
  
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

const locationTypes = [
  {
    type: "offline" as const,
    icon: MapPin,
    title: "Offline",
    description: "Event di lokasi fisik",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-600",
  },
  {
    type: "online" as const,
    icon: Video,
    title: "Online",
    description: "Event virtual (Zoom, Meet, dll)",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-600",
  },
];

export default function EventScheduleStep(props: EventScheduleStepProps) {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    onScheduleChange,
    locationType,
    onLocationTypeChange,
    address,
    onAddressChange,
    meetingUrl,
    onMeetingUrlChange,
  } = props;

  // Local state for date inputs (formatted as YYYY-MM-DD)
  const [startDateStr, setStartDateStr] = useState(
    startDate ? startDate.toISOString().split("T")[0] : ""
  );
  const [endDateStr, setEndDateStr] = useState(
    endDate ? endDate.toISOString().split("T")[0] : ""
  );

  const handleStartDateChange = (value: string) => {
    setStartDateStr(value);
    if (value) {
      onScheduleChange({ startDate: new Date(value) });
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDateStr(value);
    if (value) {
      onScheduleChange({ endDate: new Date(value) });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Jadwal & Lokasi</h2>
        <p className="mt-2 text-gray-600">
          Tentukan waktu dan tempat pelaksanaan event
        </p>
      </div>

      {/* Schedule Section */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Jadwal Event
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="start-date">Tanggal Mulai *</Label>
            <Input
              id="start-date"
              type="date"
              value={startDateStr}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-time">Jam Mulai *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => onScheduleChange({ startTime: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="space-y-2">
            <Label htmlFor="end-date">Tanggal Selesai *</Label>
            <Input
              id="end-date"
              type="date"
              value={endDateStr}
              onChange={(e) => handleEndDateChange(e.target.value)}
              min={startDateStr}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-time">Jam Selesai *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => onScheduleChange({ endTime: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Location Type Selection */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MapPin className="h-5 w-5 text-primary" />
          Tipe Lokasi
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          {locationTypes.map((locType) => {
            const Icon = locType.icon;
            const isSelected = locationType === locType.type;

            return (
              <button
                key={locType.type}
                onClick={() => onLocationTypeChange(locType.type)}
                className={cn(
                  "relative flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all",
                  "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isSelected
                    ? `${locType.borderColor} ${locType.bgColor} shadow-md`
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <div
                  className={cn(
                    "rounded-lg p-2",
                    isSelected ? locType.bgColor : "bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      isSelected ? locType.color : "text-gray-600"
                    )}
                  />
                </div>

                <div className="flex-1">
                  <h4
                    className={cn(
                      "font-semibold",
                      isSelected ? locType.color : "text-gray-900"
                    )}
                  >
                    {locType.title}
                  </h4>
                  <p className="text-sm text-gray-600">{locType.description}</p>
                </div>

                {isSelected && (
                  <div className="absolute right-4 top-4">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full",
                        locType.color,
                        locType.bgColor
                      )}
                    >
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Details */}
      <div className="space-y-4">
        {locationType === "offline" && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900">Detail Lokasi Offline</h4>
            
            <div className="space-y-2">
              <Label htmlFor="raw-address">Alamat Lengkap *</Label>
              <Input
                id="raw-address"
                placeholder="Contoh: Jl. Sudirman No. 123"
                value={address.rawAddress}
                onChange={(e) => onAddressChange("rawAddress", e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Kota *</Label>
                <Input
                  id="city"
                  placeholder="Contoh: Jakarta"
                  value={address.city}
                  onChange={(e) => onAddressChange("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provinsi *</Label>
                <Input
                  id="province"
                  placeholder="Contoh: DKI Jakarta"
                  value={address.province}
                  onChange={(e) => onAddressChange("province", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal-code">Kode Pos</Label>
              <Input
                id="postal-code"
                placeholder="Contoh: 12345"
                value={address.postalCode}
                onChange={(e) => onAddressChange("postalCode", e.target.value)}
              />
            </div>
          </div>
        )}

        {locationType === "online" && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900">Detail Lokasi Online</h4>
            
            <div className="space-y-2">
              <Label htmlFor="meeting-url">Link Meeting *</Label>
              <Input
                id="meeting-url"
                type="url"
                placeholder="https://zoom.us/j/... atau https://meet.google.com/..."
                value={meetingUrl}
                onChange={(e) => onMeetingUrlChange(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Masukkan link Zoom, Google Meet, atau platform meeting lainnya
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
