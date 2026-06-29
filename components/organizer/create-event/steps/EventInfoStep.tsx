import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";
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
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export default function EventInfoStep({
    hideHeader,
    eventId,
}: {
    hideHeader?: boolean;
    eventId?: string;
}) {
    const [eventCategories, setEventCategories] = useState<string[]>([]);
    const [openCategory, setOpenCategory] = useState(false);
    const [openStatus, setOpenStatus] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<
        { type: "banner" } | { type: "gallery"; index: number } | null
    >(null);

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
                    setEventCategories(fetched);
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
    const banner_image_preview = watch("banner_image_preview") as
        | string
        | null
        | undefined;
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

    const handleBannerInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) handleBannerFile(file);
    };

    const handleRemoveBanner = () => {
        if (banner_image?.name === "existing-banner.jpg" && eventId) {
            setDeleteConfirm({ type: "banner" });
            return;
        }
        executeRemoveBanner();
    };

    const executeRemoveBanner = () => {
        if (deleteConfirm?.type === "banner") {
            toast.info("Banner akan dihapus saat Anda menekan tombol simpan.");
        }

        setValue(
            "banner_image",
            null as unknown as CreateEventSchema["banner_image"],
            { shouldValidate: true },
        );
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
            setFileError(`${errorMsg} â€” beberapa file dilewati`);
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
                    const updatedPreviews = [
                        ...currentPreviews,
                        ...validPreviews,
                    ];
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
            setDeleteConfirm({ type: "gallery", index });
            return;
        }
        executeRemoveImage(index);
    };

    const executeRemoveImage = (index: number) => {
        if (deleteConfirm?.type === "gallery") {
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
        if (deleteConfirm?.type === "banner") {
            executeRemoveBanner();
        } else if (deleteConfirm?.type === "gallery") {
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

    const currentImages = images as File[];
    const currentPreviews = image_previews as string[];
    const hasImages = currentImages.length > 0;

    return (
        <div className="space-y-10">
            {!hideHeader && (
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                            <Upload className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-slate-950">
                                Informasi Event
                            </h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                Lengkapi identitas event, kategori, deskripsi, dan aset visual utama.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-5">
                <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                            <Check className="h-4.5 w-4.5" />
                        </span>
                        Detail Event
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                        Informasi ini menjadi dasar tampilan event di halaman peserta.
                    </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs font-medium text-slate-500">
                            Judul Event <span className="text-danger">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="title"
                                placeholder="Contoh: Festival Musik Jazz Jakarta 2026"
                                {...register("title")}
                                maxLength={50}
                                className={cn(
                                    "h-10 rounded-xl border-slate-200 bg-white pr-16 text-sm shadow-none focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                    errors.title && "border-danger focus-visible:ring-danger/20",
                                )}
                            />
                            <div className="pointer-events-none absolute bottom-0 right-3 top-0 flex items-center">
                                <span className="text-[10px] text-slate-400">
                                    {title?.length || 0}/50
                                </span>
                            </div>
                        </div>
                        {errors.title && (
                            <p className="text-xs text-danger">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="category" className="text-xs font-medium text-slate-500">
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
                                                    "h-10 w-full justify-between rounded-xl border-slate-200 bg-white text-sm font-normal shadow-none hover:border-primary/30 hover:bg-white focus-visible:ring-primary/20",
                                                    !field.value && "text-slate-400",
                                                    errors.category && "border-danger text-danger",
                                                )}
                                            >
                                                {field.value ? eventCategories.find((cat) => cat === field.value) || field.value : "Pilih kategori event"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] rounded-xl p-0" align="start">
                                            <Command className="rounded-xl">
                                                <CommandInput placeholder="Cari kategori..." value={searchQuery} onValueChange={setSearchQuery} />
                                                <CommandList>
                                                    <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
                                                    <CommandGroup>
                                                        {eventCategories.map((cat) => (
                                                            <CommandItem
                                                                className="flex items-center rounded-lg pr-2"
                                                                key={cat}
                                                                value={cat}
                                                                onSelect={() => handleSelectCategory(cat)}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4 shrink-0", field.value === cat ? "opacity-100" : "opacity-0")} />
                                                                <span className="flex-1 truncate">{cat}</span>
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

                        {eventId && (
                            <div className="space-y-1.5">
                                <Label htmlFor="status" className="text-xs font-medium text-slate-500">
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
                                                        "h-10 w-full justify-between rounded-xl border-slate-200 bg-white text-sm font-normal shadow-none hover:border-primary/30 hover:bg-white focus-visible:ring-primary/20",
                                                        !field.value && "text-slate-400",
                                                        errors.status && "border-danger text-danger",
                                                    )}
                                                >
                                                    {field.value ? statusOptions.find((opt) => opt.value === field.value)?.title || field.value : "Pilih status event"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] rounded-xl p-0" align="start">
                                                <Command className="rounded-xl">
                                                    <CommandList>
                                                        <CommandEmpty>Status tidak ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {statusOptions.map((opt) => (
                                                                <CommandItem
                                                                    className="group flex items-center rounded-lg pr-2"
                                                                    key={opt.value}
                                                                    value={opt.value}
                                                                    onSelect={() => {
                                                                        setValue("status", opt.value as CreateEventSchema["status"], { shouldValidate: true });
                                                                        setOpenStatus(false);
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4 shrink-0", field.value === opt.value ? "opacity-100" : "opacity-0")} />
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
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-medium text-slate-500">
                            Deskripsi Event <span className="text-danger">*</span>
                        </Label>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field }) => (
                                <>
                                    <div className={cn("overflow-hidden rounded-xl border border-slate-200 bg-white", errors.description && "border-danger")}>
                                        <Tiptap content={field.value || ""} onChange={field.onChange} />
                                    </div>
                                    {errors.description && (
                                        <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                            <Upload className="h-4.5 w-4.5" />
                        </span>
                        Banner Event
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                        Satu gambar utama untuk card dan halaman detail event. Format PNG/JPG, maksimal 5MB.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                    {!banner_image ? (
                        <div
                            className={cn(
                                "relative cursor-pointer rounded-2xl border border-dashed bg-white px-5 py-8 text-center transition-colors",
                                bannerDragActive ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/30 hover:bg-primary-light/30",
                                (bannerError || errors.banner_image) && "border-danger bg-danger-light/20",
                            )}
                            onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setBannerDragActive(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setBannerDragActive(false);
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={handleBannerDrop}
                            onClick={() => bannerInputRef.current?.click()}
                        >
                            <input ref={bannerInputRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleBannerInputChange} className="hidden" />
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                                <Upload className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-slate-950">Drag & drop banner di sini</p>
                            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">Ukuran ideal 1920x1080 atau rasio 16:9.</p>
                            <Button
                                className="mt-4 h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    bannerInputRef.current?.click();
                                }}
                            >
                                Pilih File
                            </Button>
                        </div>
                    ) : (
                        <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                            <Image src={banner_image_preview || ""} alt="Banner Preview" fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
                            <Button type="button" variant="destructive" size="icon" className="absolute right-3 top-3 h-8 w-8 rounded-xl" onClick={handleRemoveBanner}>
                                <X className="h-4 w-4" />
                            </Button>
                            <div className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-xl bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                                <span className="line-clamp-1">{banner_image?.name}</span>
                            </div>
                        </div>
                    )}
                    {bannerError && <p className="mt-3 text-sm text-danger">{bannerError}</p>}
                    {errors.banner_image && (
                        <p className="mt-3 text-sm text-danger">
                            {typeof errors.banner_image?.message === "string" ? errors.banner_image.message : "Banner wajib diupload"}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-5">
                <div className="space-y-1">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light text-primary">
                            <Upload className="h-4.5 w-4.5" />
                        </span>
                        Poster/Galeri Event
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                        Tambahkan hingga {MAX_FILES} poster pendukung. Format PNG/JPG, maksimal 5MB per file.
                    </p>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-sm shadow-slate-900/5">
                    {currentImages.length < MAX_FILES && (
                        <div
                            className={cn(
                                "relative cursor-pointer rounded-2xl border border-dashed bg-white px-5 py-8 text-center transition-colors",
                                dragActive ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/30 hover:bg-primary-light/30",
                                (fileError || errors.images) && "border-danger bg-danger-light/20",
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg" multiple onChange={handleInputChange} className="hidden" />
                            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary ring-1 ring-primary/10">
                                <Upload className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-slate-950">Drag & drop poster di sini</p>
                            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-slate-500">{currentImages.length}/{MAX_FILES} gambar terupload.</p>
                            <Button
                                className="mt-4 h-9 rounded-xl border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fileInputRef.current?.click();
                                }}
                            >
                                Pilih File
                            </Button>
                        </div>
                    )}

                    {hasImages && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-950">{currentImages.length} gambar terupload</p>
                                <Button type="button" variant="ghost" size="sm" className="h-8 rounded-xl px-3 text-xs font-semibold text-danger hover:bg-danger-light hover:text-danger" onClick={handleRemoveAll}>
                                    Hapus Semua
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {currentPreviews.map((preview, index) => (
                                    <div key={index} className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5">
                                        <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                                            <Image src={preview} alt={`Preview ${index + 1}`} fill unoptimized sizes="160px" className="object-cover" />
                                            <Button type="button" variant="destructive" size="icon" className="absolute right-1.5 top-1.5 h-7 w-7 rounded-xl" onClick={() => handleRemoveImage(index)}>
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="px-2 py-2">
                                            <p className="truncate text-xs font-medium text-slate-900">{currentImages[index]?.name || "Existing Image"}</p>
                                            {currentImages[index]?.size ? (
                                                <p className="text-xs text-slate-500">{(currentImages[index].size / 1024 / 1024).toFixed(2)} MB</p>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {fileError && <p className="text-sm text-danger">{fileError}</p>}
                    {errors.images && (
                        <p className="text-sm text-danger">
                            {typeof errors.images.message === "string" ? errors.images.message : "Poster wajib diupload"}
                        </p>
                    )}
                </div>
            </div>

            <Dialog
                open={!!deleteConfirm}
                onOpenChange={(open) => {
                    if (!open) setDeleteConfirm(null);
                }}
            >
                <DialogContent className="sm:max-w-md rounded-2xl p-6 border-slate-200/80 shadow-md">
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-xl font-semibold text-slate-950">
                            Hapus Gambar
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed text-slate-600">
                            Yakin ingin menghapus{" "}
                            {deleteConfirm?.type === "banner"
                                ? "banner"
                                : "poster"}{" "}
                            ini? Gambar akan dihapus segera dan tidak dapat
                            dikembalikan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-xl px-5 m-0 font-semibold border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            className="rounded-xl px-5 m-0 bg-danger hover:bg-danger-hover shadow-sm font-semibold"
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}