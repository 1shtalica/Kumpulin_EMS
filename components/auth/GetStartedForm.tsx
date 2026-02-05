"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users, Briefcase, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";

// Validation Schemas
const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, { message: "Nomor HP minimal 10 digit" })
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, {
      message: "Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)",
    }),
});

const organizerSchema = z.object({
  organizerName: z
    .string()
    .min(3, { message: "Nama organizer minimal 3 karakter" }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OrganizerFormValues = z.infer<typeof organizerSchema>;

export default function GetStartedForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "attendee" | "organizer" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const organizerForm = useForm<OrganizerFormValues>({
    resolver: zodResolver(organizerSchema),
    defaultValues: { organizerName: "" },
  });

  // Step 1: Validate phone and move to step 2 (NO API CALL)
  const handleNextStep = async () => {
    const isValid = await phoneForm.trigger();
    if (isValid) {
      const phone = phoneForm.getValues("phoneNumber");
      setPhoneNumber(phone);
      setStep(2);
    }
  };

  // Step 2a: Submit as Attendee
  const handleCompleteAsAttendee = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Melengkapi profil...");

    try {
      await AuthService.updateProfile({
        phone_number: phoneNumber,
        role: "attendee",
      });

      await useAuthStore.getState().checkAuth();

      toast.success("Profil berhasil dilengkapi!", { id: toastId });
      router.push("/");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Gagal melengkapi profil",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2b: Submit as Organizer
  const handleCompleteAsOrganizer = async (data: OrganizerFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Membuat profil organizer...");

    try {
      await AuthService.updateProfile({
        phone_number: phoneNumber,
        role: "organizer",
      });

      const slug = generateSlug(data.organizerName);
      await AuthService.createOrganizer({
        name: data.organizerName,
        slug: slug,
      });

      await useAuthStore.getState().checkAuth();

      toast.success("Profil organizer berhasil dibuat!", { id: toastId });
      router.push("/dashboard/organizer");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Gagal membuat profil",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string): string => {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      Date.now()
    );
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold text-accent">
          Selamat Datang!
        </h1>
        <p className="text-sm text-muted">
          Lengkapi profil Anda untuk melanjutkan
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step === 1 ? "bg-primary" : "bg-primary-light"
          )}
        />
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step === 2 ? "bg-primary" : "bg-slate-200"
          )}
        />
      </div>

      {/* STEP 1: Phone Number */}
      {step === 1 && (
        <>
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-accent">
                Lengkapi Nomor Telepon
              </CardTitle>
              <CardDescription className="text-muted">
                Kami memerlukan nomor telepon Anda untuk verifikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  autoComplete="tel"
                  {...phoneForm.register("phoneNumber")}
                  className={
                    phoneForm.formState.errors.phoneNumber
                      ? "border-danger rounded-lg"
                      : "rounded-lg"
                  }
                />
                {phoneForm.formState.errors.phoneNumber && (
                  <p className="text-xs text-danger font-medium">
                    {phoneForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Buttons outside card */}
          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              className="bg-linear-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-lg font-bold"
            >
              Lanjutkan
            </Button>
          </div>
        </>
      )}

      {/* STEP 2: Role Selection */}
      {step === 2 && (
        <>
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-accent">
                Pilih Peran Anda
              </CardTitle>
              <CardDescription className="text-muted">
                Bagaimana Anda ingin menggunakan kumpul.in?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Attendee Card */}
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                  selectedRole === "attendee" && "border-primary shadow-sm"
                )}
                onClick={() => !isLoading && setSelectedRole("attendee")}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-accent">Saya Pengguna</h3>
                    <p className="text-sm text-muted">
                      Jelajahi dan ikuti berbagai event menarik
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Organizer Card */}
              <Card
                className={cn(
                  "transition-all",
                  selectedRole === "organizer"
                    ? "border-secondary shadow-sm"
                    : "cursor-pointer hover:border-secondary hover:shadow-sm"
                )}
                onClick={() =>
                  !isLoading &&
                  selectedRole !== "organizer" &&
                  setSelectedRole("organizer")
                }
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-secondary-light flex items-center justify-center shrink-0">
                      <Briefcase className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-accent">
                        Saya Organizer
                      </h3>
                      <p className="text-sm text-muted">
                        Buat dan kelola event Anda sendiri
                      </p>
                    </div>
                  </div>

                  {/* Conditional Organizer Form */}
                  {selectedRole === "organizer" && (
                    <div
                      className="space-y-4 pt-4 border-t border-border"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="organizerName">Nama Organizer</Label>
                        <Input
                          id="organizerName"
                          placeholder="Nama organisasi atau komunitas Anda"
                          autoComplete="organization"
                          {...organizerForm.register("organizerName")}
                          className={
                            organizerForm.formState.errors.organizerName
                              ? "border-danger rounded-lg"
                              : "rounded-lg"
                          }
                        />
                        {organizerForm.formState.errors.organizerName && (
                          <p className="text-xs text-danger font-medium">
                            {
                              organizerForm.formState.errors.organizerName
                                .message
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Buttons outside card */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                setStep(1);
                setSelectedRole(null);
              }}
              disabled={isLoading}
              className="text-muted hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>

            <Button
              onClick={() => {
                if (selectedRole === "attendee") {
                  handleCompleteAsAttendee();
                } else if (selectedRole === "organizer") {
                  organizerForm.handleSubmit(handleCompleteAsOrganizer)();
                } else {
                  toast.error("Pilih peran terlebih dahulu");
                }
              }}
              disabled={isLoading || !selectedRole}
              className="bg-linear-to-r from-primary to-secondary hover:opacity-90 transition-opacity rounded-lg font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Selesai"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}