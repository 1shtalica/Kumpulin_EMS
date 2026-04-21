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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import type { CreateEventSchema } from "@/lib/validator/create-event.schema";
import Tiptap from "@/components/reusable/TipTap";
import { EventService } from "@/services/event-service";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function EventInfoStep({ hideHeader, eventId }: { hideHeader?: boolean; eventId?: string }) {
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [openCategory, setOpenCategory] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'banner' } | { type: 'gallery', index: number } | null>(null);

  const statusOptions = [
    { title: "Draft", value: "draft" },
    { title: "Diterbitkan", value: "published" },
    { title: "Pendaftaran Selesai", value: "registration closed" },
    { title: "Berlangsung", value: "ongoing" },
    { title: "Selesai", value: "finished" },
    { title: "Diarsipkan", value: "archived" },
    { title: "Dibatalkan", value: "cancelled" },
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetched = await EventService.getEventCategories();
        if (fetched && fetched.length > 0) {
          setDynamicCategories(fetched);
        }
      } catch (error) {
        console.error("Failed to load event categories:", error);
      }
    };
    loadCategories();
  }, []);

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
  const image_previews = watch("image_previews") || [];

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

  // Banner image state
  const banner_image = watch("banner_image") as File | null | undefined;
  const banner_image_preview = watch("banner_image_preview") as string | null | undefined;
  const [bannerDragActive, setBannerDragActive] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleBannerFile = (file: File) => {
    setBannerError("");
    const error = handleFileValidation(file);
    if (error) {
      setBannerError(error);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setValue("banner_image", file, { shouldValidate: true });
      setValue("banner_image_preview", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBannerDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleBannerFile(file);
  };

  const handleBannerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleBannerFile(file);
  };

  const handleRemoveBanner = () => {
    if (banner_image?.name === "existing-banner.jpg" && eventId) {
      setDeleteConfirm({ type: 'banner' });
      return;
    }
    executeRemoveBanner();
  };

  const executeRemoveBanner = () => {
    if (deleteConfirm?.type === 'banner') {
      toast.info("Banner akan dihapus saat Anda menekan tombol simpan.");
    }

    setValue("banner_image", null as any, { shouldValidate: true });
    setValue("banner_image_preview", null);
    setBannerError("");
    if (bannerInputRef.current) bannerInputRef.current.value = "";

    setDeleteConfirm(null);
  };


  const handleAddFiles = (newFiles: FileList) => {
    setFileError("");

    const currentImages = images as File[];
    const currentPreviews = image_previews as string[];
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
          setValue("image_previews", updatedPreviews);
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
    const fileToRemove = currentImages[index];

    // Check if it's an existing image from the backend
    const match = fileToRemove?.name.match(/^existing-gallery-(.+)\.jpg$/);
    if (match && eventId) {
      setDeleteConfirm({ type: 'gallery', index });
      return;
    }
    executeRemoveImage(index);
  };

  const executeRemoveImage = (index: number) => {
    if (deleteConfirm?.type === 'gallery') {
      toast.info("Gambar akan dihapus saat Anda menekan tombol simpan.");
    }

    const currentImages = images as File[];
    const currentPreviews = image_previews as string[];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    const updatedPreviews = currentPreviews.filter((_, i) => i !== index);
    setValue("images", updatedImages, { shouldValidate: true });
    setValue("image_previews", updatedPreviews);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setDeleteConfirm(null);
  };

  const confirmDelete = () => {
    if (deleteConfirm?.type === 'banner') {
      executeRemoveBanner();
    } else if (deleteConfirm?.type === 'gallery') {
      executeRemoveImage(deleteConfirm.index);
    }
  };

  const handleRemoveAll = () => {
    setValue("images", [], { shouldValidate: true });
    setValue("image_previews", []);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectCategory = (currentValue: string) => {
    setValue("category", currentValue, { shouldValidate: true });
    setSearchQuery("");
    setOpenCategory(false);
  };

  const handleAddCategory = async (currentValue: string) => {
    const newCat = currentValue.trim();
    if (!dynamicCategories.includes(newCat)) {
      try {
        await EventService.createEventCategory(newCat);
        setDynamicCategories(prev => [...prev, newCat]);
        handleSelectCategory(newCat);
      } catch (error) {
        console.error("Failed to create event category:", error);
      }
    } else {
      handleSelectCategory(newCat);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, categoryName: string) => {
    e.stopPropagation();
    try {
      await EventService.deleteEventCategory(categoryName);
      setDynamicCategories(prev => prev.filter(cat => cat !== categoryName));
      const currentCategory = control._formValues.category;
      if (currentCategory === categoryName) {
        setValue("category", "", { shouldValidate: true });
      }
    } catch (error) {
      console.error("Failed to delete event category:", error);
    }
  };

  const currentImages = images as File[];
  const currentPreviews = image_previews as string[];
  const hasImages = currentImages.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      {!hideHeader && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-accent">Informasi Event</h2>
          <p className="mt-2 text-muted">Lengkapi Informasi tentang event Anda</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="block text-sm font-medium">
          Judul Event<span className="text-danger">*</span>
        </Label>
        <div className="relative">
          <Input
            id="title"
            placeholder="Contoh: Festival Musik Jazz Jakarta 2026"
            {...register("title")}
            maxLength={50}
            className={cn(
              "pr-16",
              errors.title && "border-danger focus-visible:ring-danger",
            )}
          />
          <div className="absolute right-3 bottom-0 top-0 flex items-center pointer-events-none">
            <span className="text-muted text-[10px]">{title?.length || 0}/50</span>
          </div>
        </div>
        {errors.title && (
          <p className="text-danger text-xs">{errors.title.message}</p>
        )}
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
            <Popover open={openCategory} onOpenChange={setOpenCategory}>
              <PopoverTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between font-normal rounded-xl shadow-none",
                    !field.value && "text-muted-foreground",
                    errors.category && "border-danger text-danger",
                  )}
                >
                  {field.value
                    ? (dynamicCategories.find((cat) => cat === field.value) || field.value)
                    : "Pilih kategori event"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0 rounded-xl"
                align="start"
              >
                <Command className="rounded-xl">
                  <CommandInput
                    placeholder="Cari atau tambah kategori baru..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                      {dynamicCategories.map((cat) => (
                        <CommandItem
                          className="rounded-lg group flex items-center pr-2"
                          key={cat}
                          value={cat}
                          onSelect={(currentValue) => {
                            handleSelectCategory(currentValue);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              field.value === cat ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="flex-1 truncate">{cat}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-danger/10 hover:text-danger rounded-full transition-opacity ml-2 shrink-0"
                            onClick={(e) => handleDeleteCategory(e, cat)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {searchQuery.trim() !== "" && !dynamicCategories.some(c => c.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                      <CommandGroup>
                        <CommandItem
                          className="rounded-lg"
                          value={searchQuery}
                          onSelect={() => {
                            handleAddCategory(searchQuery);
                          }}
                        >
                          <Check className="mr-2 h-4 w-4 opacity-0" />
                          Tambah <b>&quot;{searchQuery}&quot;</b>
                        </CommandItem>
                      </CommandGroup>
                    )}
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

      {/* Status (Only when editing) */}
      {eventId && (
        <div className="space-y-2">
          <Label htmlFor="status">
            Status Event <span className="text-danger">*</span>
          </Label>

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Popover open={openStatus} onOpenChange={setOpenStatus}>
                <PopoverTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between font-normal rounded-xl shadow-none",
                      !field.value && "text-muted-foreground",
                      errors.status && "border-danger text-danger",
                    )}
                  >
                    {field.value
                      ? (statusOptions.find((opt) => opt.value === field.value)?.title || field.value)
                      : "Pilih status event"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 rounded-xl"
                  align="start"
                >
                  <Command className="rounded-xl">
                    <CommandList>
                      <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {statusOptions.map((opt) => (
                          <CommandItem
                            className="rounded-lg group flex items-center pr-2"
                            key={opt.value}
                            value={opt.value}
                            onSelect={(currentValue) => {
                              setValue("status", opt.value as CreateEventSchema["status"], { shouldValidate: true });
                              setOpenStatus(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                field.value === opt.value ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <span className="flex-1 truncate">{opt.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        </div>
      )}

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
                  "transition-colors",
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

      {/* Banner Image Upload */}
      <div className="space-y-2">
        <Label>
          Banner Event <span className="text-danger">*</span>
        </Label>
        <p className="text-xs text-muted">
          1 gambar utama yang tampil di card event. Format: PNG, JPEG • Maks 5MB • Ukuran ideal: 1920x1080 (16:9)
        </p>

        {!banner_image ? (
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
              bannerDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              (bannerError || errors.banner_image) && "border-danger",
            )}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setBannerDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setBannerDragActive(false); }}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleBannerDrop}
            onClick={() => bannerInputRef.current?.click()}
          >
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleBannerInputChange}
              className="hidden"
            />
            <div className="space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center">
                <Upload className="h-6 w-6 text-muted" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-accent">Drag & drop banner di sini, atau</p>
                <Button
                  className="my-2 px-5 rounded-3xl"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); bannerInputRef.current?.click(); }}
                >
                  Pilih File
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video w-full">
            <img
              src={banner_image_preview || ""}
              alt="Banner Preview"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 rounded-full"
              onClick={handleRemoveBanner}
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {banner_image?.name}
            </div>
          </div>
        )}

        {bannerError && <p className="text-sm text-danger">{bannerError}</p>}
        {errors.banner_image && (
          <p className="text-sm text-danger">
            {typeof errors.banner_image?.message === "string"
              ? errors.banner_image.message
              : "Banner wajib diupload"}
          </p>
        )}
      </div>

      {/* Poster / Gallery Upload */}
      <div className="space-y-2">
        <Label>
          Poster/Galeri Event <span className="text-danger">*</span>
        </Label>
        <p className="text-xs text-muted">
          Upload hingga {MAX_FILES} poster. Format: PNG, JPEG • Maks 5MB per file • Ukuran ideal: 1920x1080 (16:9)
        </p>

        {/* Drop Zone - always visible when under limit */}
        {currentImages.length < MAX_FILES && (
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
              dragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400",
              (fileError || errors.images) && "border-danger",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
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
                  className="my-2 px-5 rounded-3xl"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
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
                    className="absolute right-1 top-1 h-6 w-6 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="bg-gray-50 px-2 py-1.5 flex flex-col justify-center h-full">
                    <p className="truncate text-xs font-medium text-accent">
                      {currentImages[index]?.name || "Existing Image"}
                    </p>
                    {currentImages[index]?.size ? (
                      <p className="text-xs text-muted">
                        {(currentImages[index].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    ) : null}
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
              : "Poster wajib diupload"}
          </p>
        )}
      </div>

      <Dialog open={!!deleteConfirm} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 border-border">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl text-accent font-bold">Hapus Gambar</DialogTitle>
            <DialogDescription className="text-muted text-base leading-relaxed">
              Yakin ingin menghapus {deleteConfirm?.type === 'banner' ? 'banner' : 'poster'} ini? Gambar akan dihapus segera dan tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="rounded-xl px-5 m-0 font-medium hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              className="rounded-xl px-5 m-0 bg-danger hover:bg-danger-hover shadow-sm font-medium"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
