"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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
import { Check, ChevronsUpDown } from "lucide-react";

interface EventInfoStepProps {
  title: string;
  category: string;
  description: string;
  bannerFile: File | null;
  bannerPreview: string;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onBannerChange: (file: File | null, preview: string) => void;
}

const categories = [
  "Music",
  "Sports",
  "Education",
  "Technology",
  "Business",
  "Health",
  "Art & Culture",
  "Food & Drink",
  "Community",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function EventInfoStep(props: EventInfoStepProps) {
  const {
    title,
    category,
    description,
    bannerFile,
    bannerPreview,
    onTitleChange,
    onCategoryChange,
    onDescriptionChange,
    onBannerChange,
  } = props;

  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format file harus PNG atau JPG";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 5MB";
    }
    return null;
  };

  const handleFileChange = (file: File) => {
    setFileError("");

    const error = handleFileValidation(file);
    if (error) {
      setFileError(error);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      onBannerChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleRemoveBanner = () => {
    onBannerChange(null, "");
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-accent">Informasi Event</h2>
        <p className="mt-2 text-muted">
          isikan detail lengkap tentang event Anda
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Judul Event<span className="text-danger">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Contoh: Festival Musik Jazz Jakarta 2026"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={50}
        />
        <p className="text-xs text-muted">{title.length}/50 karakter</p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Kategori Event <span className="text-danger">*</span>
        </Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between font-normal",
                !category && "text-muted-foreground",
              )}
            >
              {category
                ? categories.find((cat) => cat === category)
                : "Pilih kategori event"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <Command>
              <CommandInput placeholder="Cari kategori..." />
              <CommandList>
                <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                <CommandGroup>
                  {categories.map((cat) => (
                    <CommandItem
                      key={cat}
                      value={cat}
                      onSelect={(currentValue) => {
                        const original = categories.find(
                          (c) => c.toLowerCase() === currentValue.toLowerCase(),
                        );
                        onCategoryChange(original || currentValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          category === cat ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {cat}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Deskripsi Event <span className="text-danger">*</span>
        </Label>
        <textarea
          id="description"
          className="flex min-h-50 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Jelaskan detail event Anda, termasuk rundown, pembicara, fasilitas, dll."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        <p className="text-xs text-gray-500">
          Minimal 10 karakter ({description.length} karakter)
        </p>
      </div>

      {/* Banner Upload */}
      <div className="space-y-2">
        <Label>
          Banner/Poster Event <span className="text-danger">*</span>
        </Label>

        {!bannerPreview ? (
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              fileError && "border-red-500",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  Drag & drop banner di sini, atau
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pilih File
                </Button>
              </div>

              <div className="space-y-1 text-xs text-gray-500">
                <p>Format: PNG, JPG • Maksimal 5MB</p>
                <p>Rekomendasi ukuran: 1920 x 1080 px</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg border border-gray-200">
            <img
              src={bannerPreview}
              alt="Banner preview"
              className="h-64 w-full object-cover"
            />

            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemoveBanner}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700">
                  {bannerFile?.name}
                </span>
                <span className="text-gray-500">
                  ({(bannerFile!.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            </div>
          </div>
        )}

        {fileError && <p className="text-sm text-red-600">{fileError}</p>}
      </div>
    </div>
  );
}
