import { useState, useRef, useEffect } from "react";
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
import { useFormContext, Controller } from "react-hook-form";
import type { CreateEventSchema } from "@/lib/validator/create-event.schema";
import Tiptap from "@/components/reusable/TipTap";

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

export default function EventInfoStep() {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<CreateEventSchema>();

  const title = watch("title");
  const description = watch("description");
  const bannerFile = watch("bannerFile");
  const bannerPreview = watch("bannerPreview");

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
      setValue("bannerFile", file, { shouldValidate: true });
      setValue("bannerPreview", reader.result as string);
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
    setValue("bannerFile", null, { shouldValidate: true });
    setValue("bannerPreview", "");
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
        <p className="mt-2 text-muted">Lengkapi Informasi tentang event Anda</p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Judul Event<span className="text-danger">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Contoh: Festival Musik Jazz Jakarta 2026"
          {...register("title")}
          maxLength={100}
          className={cn(
            "shadow-xs",
            errors.title && "border-danger focus-visible:ring-danger",
          )}
        />
        <div className="flex justify-between text-xs">
          <p className="text-danger">{errors.title?.message}</p>
          <p className="text-muted">{title?.length || 0}/100 karakter</p>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Kategori Event <span className="text-danger">*</span>
        </Label>

        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between font-normal",
                    !field.value && "text-muted-foreground",
                    errors.category && "border-danger text-danger",
                  )}
                >
                  {field.value
                    ? categories.find((cat) => cat === field.value)
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
                              (c) =>
                                c.toLowerCase() === currentValue.toLowerCase(),
                            );
                            field.onChange(original || currentValue);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === cat ? "opacity-100" : "opacity-0",
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
          )}
        />
        {errors.category && (
          <p className="text-xs text-danger">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Deskripsi Event <span className="text-danger">*</span>
        </Label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <>
              <div
                className={cn(
                  "rounded-lg border transition-colors",
                  errors.description && "border-danger",
                )}
              >
                <Tiptap content={field.value || ""} onChange={field.onChange} />
              </div>
              {errors.description && (
                <p className="text-xs text-danger mt-1">
                  {errors.description.message}
                </p>
              )}
            </>
          )}
        />
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
              (fileError || errors.bannerFile) && "border-danger",
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
                <Upload className="h-8 w-8 text-muted" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-accent">
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

              <div className="space-y-1 text-xs text-muted">
                <p>Format: JPEG • Maksimal 5MB</p>
                <p>Ukuran gambar ideal: 1920x1080 (16:9)</p>
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
              className="absolute right-2 top-2 rounded-lg"
              onClick={handleRemoveBanner}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="bg-gray-50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-muted" />
                <span className="font-medium text-accent">
                  {bannerFile?.name}
                </span>
                <span className="text-muted">
                  (
                  {bannerFile?.size
                    ? (bannerFile.size / 1024 / 1024).toFixed(2)
                    : 0}{" "}
                  MB)
                </span>
              </div>
            </div>
          </div>
        )}

        {fileError && <p className="text-sm text-danger">{fileError}</p>}
        {/* Validation Error from Store */}
        {errors.bannerFile && (
          <p className="text-sm text-danger">{errors.bannerFile.message}</p>
        )}
      </div>
    </div>
  );
}
