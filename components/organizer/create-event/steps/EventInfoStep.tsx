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
const MAX_FILES = 5;
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
  const images = watch("images") || [];
  const imagePreviews = watch("imagePreviews") || [];

  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Format file harus PNG atau JPG";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Ukuran file maksimal 5MB per file";
    }
    return null;
  };

  const handleAddFiles = (newFiles: FileList) => {
    setFileError("");

    const currentImages = images as File[];
    const currentPreviews = imagePreviews as string[];
    const remaining = MAX_FILES - currentImages.length;

    if (remaining <= 0) {
      setFileError(`Maksimal ${MAX_FILES} gambar`);
      return;
    }

    const filesToAdd = Array.from(newFiles).slice(0, remaining);
    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    let errorMsg = "";

    // Validate all files first
    for (const file of filesToAdd) {
      const error = handleFileValidation(file);
      if (error) {
        errorMsg = error;
        continue;
      }
      validFiles.push(file);
    }

    if (errorMsg && validFiles.length === 0) {
      setFileError(errorMsg);
      return;
    }
    if (errorMsg) {
      setFileError(`${errorMsg} — beberapa file dilewati`);
    }

    // Generate previews for all valid files
    let loaded = 0;
    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        validPreviews.push(reader.result as string);
        loaded++;
        if (loaded === validFiles.length) {
          const updatedImages = [...currentImages, ...validFiles];
          const updatedPreviews = [...currentPreviews, ...validPreviews];
          setValue("images", updatedImages, { shouldValidate: true });
          setValue("imagePreviews", updatedPreviews);
        }
      };
      reader.readAsDataURL(file);
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentImages = images as File[];
    const currentPreviews = imagePreviews as string[];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    const updatedPreviews = currentPreviews.filter((_, i) => i !== index);
    setValue("images", updatedImages, { shouldValidate: true });
    setValue("imagePreviews", updatedPreviews);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAll = () => {
    setValue("images", [], { shouldValidate: true });
    setValue("imagePreviews", []);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentImages = images as File[];
  const currentPreviews = imagePreviews as string[];
  const hasImages = currentImages.length > 0;

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
          <p className="text-danger text-xs">{errors.title?.message}</p>
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

      {/* Image Upload - Multiple */}
      <div className="space-y-2">
        <Label>
          Gambar Event <span className="text-danger">*</span>
        </Label>
        <p className="text-xs text-muted">
          Upload hingga {MAX_FILES} gambar. Format: PNG, JPEG • Maks 5MB per
          file • Ukuran ideal: 1920x1080 (16:9)
        </p>

        {/* Drop Zone - always visible when under limit */}
        {currentImages.length < MAX_FILES && (
          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              (fileError || errors.images) && "border-danger",
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
              multiple
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <Upload className="h-6 w-6 text-muted" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-accent">
                  Drag & drop gambar di sini, atau
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

              <p className="text-xs text-muted">
                {currentImages.length}/{MAX_FILES} gambar terupload
              </p>
            </div>
          </div>
        )}

        {/* Image Previews Grid */}
        {hasImages && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-accent">
                {currentImages.length} gambar terupload
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-danger hover:text-danger hover:bg-danger/10"
                onClick={handleRemoveAll}
              >
                Hapus Semua
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {currentPreviews.map((preview, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="bg-gray-50 px-2 py-1.5">
                    <p className="truncate text-xs font-medium text-accent">
                      {currentImages[index]?.name}
                    </p>
                    <p className="text-xs text-muted">
                      {currentImages[index]?.size
                        ? (currentImages[index].size / 1024 / 1024).toFixed(2)
                        : 0}{" "}
                      MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fileError && <p className="text-sm text-danger">{fileError}</p>}
        {/* Validation Error */}
        {errors.images && (
          <p className="text-sm text-danger">
            {typeof errors.images.message === "string"
              ? errors.images.message
              : "Gambar wajib diupload"}
          </p>
        )}
      </div>
    </div>
  );
}
