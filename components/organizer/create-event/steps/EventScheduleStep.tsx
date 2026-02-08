"use client";

import { useState } from "react";
import { MapPin, Video, CalendarIcon, Clock, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  onUpdateRundown: (index: number, field: keyof RundownRequest, value: string) => void;

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
    startEventDate ? startEventDate.toISOString().split("T")[0] : ""
  );
  const [endDateStr, setEndDateStr] = useState(
    endEventDate ? endEventDate.toISOString().split("T")[0] : ""
  );
  
  const [startRegStr, setStartRegStr] = useState(
    startRegistration ? startRegistration.toISOString().split("T")[0] : ""
  );
  const [endRegStr, setEndRegStr] = useState(
    endRegistration ? endRegistration.toISOString().split("T")[0] : ""
  );

  const handleDateChange = (
    field: "startEvent" | "endEvent" | "startReg" | "endReg",
    value: string
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
        if (value) onRegistrationScheduleChange({ startRegistration: new Date(value) });
        break;
      case "endReg":
        setEndRegStr(value);
        if (value) onRegistrationScheduleChange({ endRegistration: new Date(value) });
        break;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Jadwal & Lokasi</h2>
        <p className="mt-2 text-gray-600">
          Atur waktu acara, pendaftaran, dan lokasi event
        </p>
      </div>

      {/* --- Section 1: Jadwal Acara --- */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Waktu Pelaksanaan Event
        </h3>

        <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <Label>Mulai Event</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDateStr}
                onChange={(e) => handleDateChange("startEvent", e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={startEventTime}
                onChange={(e) => onEventScheduleChange({ startEventTime: e.target.value })}
                className="w-28"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="space-y-2">
            <Label>Selesai Event</Label>
            <div className="flex gap-2">
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
                onChange={(e) => onEventScheduleChange({ endEventTime: e.target.value })}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 2: Jadwal Pendaftaran --- */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Clock className="h-5 w-5 text-primary" />
          Periode Pendaftaran
        </h3>

        <div className="grid gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2">
           {/* Start Reg */}
           <div className="space-y-2">
            <Label>Buka Pendaftaran</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startRegStr}
                onChange={(e) => handleDateChange("startReg", e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={startRegistrationTime}
                onChange={(e) => onRegistrationScheduleChange({ startRegistrationTime: e.target.value })}
                className="w-28"
              />
            </div>
          </div>

          {/* End Reg */}
          <div className="space-y-2">
            <Label>Tutup Pendaftaran</Label>
            <div className="flex gap-2">
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
                onChange={(e) => onRegistrationScheduleChange({ endRegistrationTime: e.target.value })}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Section 3: Detail Lokasi --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            {isOnline ? <Video className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
            Lokasi Event
            </h3>
            
            <div className="flex items-center rounded-lg border bg-white p-1 shadow-sm">
                <button
                    onClick={() => onIsOnlineChange(false)}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        !isOnline ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
                    )}
                >
                    Offline
                </button>
                 <button
                    onClick={() => onIsOnlineChange(true)}
                    className={cn(
                        "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        isOnline ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
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
                  onChange={(e) => onAddressChange("rawAddress", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kota/Kabupaten</Label>
                  <Input
                    placeholder="Jakarta Pusat"
                    value={address.city}
                    onChange={(e) => onAddressChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provinsi</Label>
                  <Input
                    placeholder="DKI Jakarta"
                    value={address.province}
                    onChange={(e) => onAddressChange("province", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <Label>Kode Pos (Opsional)</Label>
                  <Input
                    placeholder="12345"
                    className="w-32"
                    value={address.postalCode}
                    onChange={(e) => onAddressChange("postalCode", e.target.value)}
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
              <p className="text-xs text-muted-foreground">URL platform meeting (Zoom, GMeet, Youtube, dll)</p>
            </div>
          )}
        </div>
      </div>
      
      {/* --- Section 4: Rundown --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
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
                    <p className="text-sm text-muted-foreground">Belum ada rundown acara</p>
                    <Button variant="link" onClick={onAddRundown}>Tambah sesi pertama</Button>
                </div>
            )}
            
            {rundown.map((item, index) => (
                <div key={index} className="relative grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-12">
                   {/* Delete Button */}
                   <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 shadow-sm"
                        onClick={() => onRemoveRundown(index)}
                    >
                        <Trash2 className="h-4 w-4" />
                   </Button>
                   
                   {/* Time */}
                   <div className="space-y-2 md:col-span-3">
                        <Label className="text-xs text-muted-foreground">Waktu</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="time" 
                                value={item.startTime}
                                onChange={(e) => onUpdateRundown(index, "startTime", e.target.value)}
                                className="h-9 text-sm"
                            />
                            <span className="text-gray-400">-</span>
                             <Input 
                                type="time" 
                                value={item.endTime}
                                onChange={(e) => onUpdateRundown(index, "endTime", e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                   </div>
                   
                   {/* Details */}
                   <div className="space-y-2 md:col-span-9">
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Sesi</Label>
                                <Input 
                                    placeholder="Judul sesi..." 
                                    value={item.title}
                                    onChange={(e) => onUpdateRundown(index, "title", e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Lokasi (Opsional)</Label>
                                <Input 
                                    placeholder="Panggung utama..."
                                    value={item.location || ""}
                                    onChange={(e) => onUpdateRundown(index, "location", e.target.value)}
                                    className="h-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                             <Input 
                                placeholder="Deskripsi singkat..." 
                                value={item.description}
                                onChange={(e) => onUpdateRundown(index, "description", e.target.value)}
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

