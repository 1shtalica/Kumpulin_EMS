"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Building2,
    FileText,
    Loader2,
    Save,
    Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrganizerService } from "@/services/organizer-service";
import type { OrganizerProfileInfo } from "@/types/organizer";

const updateProfileSchema = z.object({
    name: z
        .string()
        .min(3, "Nama organizer minimal 3 karakter")
        .max(50, "Nama organizer maksimal 50 karakter"),
    description: z
        .string()
        .max(500, "Deskripsi maksimal 500 karakter")
        .optional(),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

interface EditProfileModalProps {
    organizer: OrganizerProfileInfo;
    trigger?: React.ReactNode;
    onUpdated?: (
        organizer: Pick<OrganizerProfileInfo, "name" | "description">,
    ) => void;
}

export function EditProfileModal({
    organizer,
    trigger,
    onUpdated,
}: EditProfileModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<UpdateProfileForm>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            name: organizer.name,
            description: organizer.description,
        },
    });

    const descriptionValue = watch("description") || "";
    const descriptionCount = descriptionValue.length;

    useEffect(() => {
        if (!open) {
            reset({
                name: organizer.name,
                description: organizer.description,
            });
        }
    }, [open, organizer.name, organizer.description, reset]);

    const onSubmit = async (data: UpdateProfileForm) => {
        setIsLoading(true);
        try {
            const description = data.description || "";
            await OrganizerService.updateProfile({
                name: data.name,
                description,
            });
            onUpdated?.({
                name: data.name,
                description,
            });
            toast.success("Profil berhasil diperbarui", {
                id: "update-organizer-profile",
            });
            setOpen(false);
            router.refresh();
        } catch (error: unknown) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gagal memperbarui profil",
                {
                    id: "update-organizer-profile",
                },
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!isLoading) setOpen(nextOpen);
            }}
        >
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <button className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg">
                        <Settings className="h-4 w-4" />
                        Edit Profil
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100vh-2rem)] max-w-xl gap-0 overflow-hidden border-slate-200 bg-white p-0 shadow-2xl shadow-slate-950/15 sm:rounded-2xl">
                <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
                    <DialogHeader className="relative overflow-hidden border-b border-slate-200/80 bg-slate-50/80 px-6 py-5 text-left">
                        <div
                            className="pointer-events-none absolute inset-0 opacity-60"
                            aria-hidden="true"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                            }}
                        />
                        <div className="relative flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                                <Settings className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-xl font-semibold tracking-normal text-slate-950">
                                    Edit profil organizer
                                </DialogTitle>
                                <DialogDescription className="mt-1 text-sm leading-relaxed text-slate-500">
                                    Perbarui nama dan deskripsi yang tampil di halaman publik organizer.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 space-y-5 overflow-y-auto p-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label
                                    htmlFor="name"
                                    className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                                >
                                    <Building2 className="h-4 w-4 text-primary" />
                                    Nama organizer
                                </Label>
                                <span className="text-[11px] font-medium text-slate-400">
                                    Maks. 50
                                </span>
                            </div>
                            <Input
                                id="name"
                                placeholder="Masukkan nama organizer"
                                className="h-11 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium shadow-sm shadow-slate-900/5 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                {...register("name")}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-xs font-medium text-danger">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-3">
                                <Label
                                    htmlFor="description"
                                    className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                                >
                                    <FileText className="h-4 w-4 text-primary" />
                                    Deskripsi
                                </Label>
                                <span className="text-[11px] font-medium text-slate-400">
                                    {descriptionCount}/500
                                </span>
                            </div>
                            <Textarea
                                id="description"
                                placeholder="Ceritakan fokus event, komunitas, atau pengalaman yang organizer Anda kelola."
                                className="min-h-40 resize-none rounded-xl border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed shadow-sm shadow-slate-900/5 focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                {...register("description")}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-xs font-medium text-danger">
                                    {errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex-row items-center justify-end gap-2 border-t border-slate-200/80 bg-white px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="h-10 rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-600"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="h-10 rounded-xl px-5 text-sm font-semibold shadow-md shadow-primary/15"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Menyimpan
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Simpan perubahan
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
