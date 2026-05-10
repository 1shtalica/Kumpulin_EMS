"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrganizerService } from "@/services/organizer-service";
import type { OrganizerProfileInfo } from "@/types/organizer";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama organizer minimal 3 karakter").max(50, "Nama organizer maksimal 50 karakter"),
  description: z.string().max(500, "Deskripsi maksimal 500 karakter").optional(),
});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

interface EditProfileModalProps {
  organizer: OrganizerProfileInfo;
  trigger?: React.ReactNode;
  onUpdated?: (organizer: Pick<OrganizerProfileInfo, "name" | "description">) => void;
}

export function EditProfileModal({ organizer, trigger, onUpdated }: EditProfileModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: organizer.name,
      description: organizer.description,
    },
  });

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
      toast.success("Profil berhasil diperbarui");
      setOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <button className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <Settings className="w-4 h-4" />
            Edit Profil
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-background border border-border/50 shadow-2xl sm:rounded-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <DialogHeader className="px-6 py-5 border-b border-border/40 bg-background/60 backdrop-blur-lg shrink-0 text-left">
            <DialogTitle className="text-xl tracking-tight font-bold">Edit Profil Organizer</DialogTitle>
            <DialogDescription className="text-sm">
              Perbarui informasi publik tentang organizer Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Nama Organizer</Label>
              <Input
                id="name"
                placeholder="Masukkan nama organizer"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && <p className="text-sm text-destructive font-medium mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Ceritakan tentang organizer Anda..."
                className="min-h-[150px] resize-y"
                {...register("description")}
                disabled={isLoading}
              />
              {errors.description && <p className="text-sm text-destructive font-medium mt-1">{errors.description.message}</p>}
            </div>
          </div>

          <DialogFooter className="px-6 py-5 border-t border-border/40 bg-slate-50/50 shrink-0 flex flex-row items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading} className="rounded-full">
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="rounded-full bg-primary hover:bg-primary/90 shadow-md text-white">
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
