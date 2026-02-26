"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Users,
  Briefcase,
  Loader2,
  ArrowLeft,
  Phone,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";
import { generateSlug } from "@/lib/utils";
import { phoneSchema, organizerSchema } from "@/lib/validator/auth";

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OrganizerFormValues = z.infer<typeof organizerSchema>;

interface GetStartedFormProps {
  initialUser?: User | null;
}

export default function GetStartedForm({ initialUser }: GetStartedFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedRole, setSelectedRole] = useState<"user" | "organizer" | null>(
    null,
  );
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
      const formattedPhone = `+62${phone}`;
      setPhoneNumber(formattedPhone);
      setStep(2);
    }
  };

  // Unified Submit Handler
  const handleFinalSubmit = async (organizerData?: OrganizerFormValues) => {
    if (!selectedRole) {
      toast.error("Pilih peran terlebih dahulu");
      return;
    }

    setIsLoading(true);
    const isOrganizer = selectedRole === "organizer";
    const toastId = toast.loading(
      isOrganizer ? "Membuat profil organizer..." : "Melengkapi profil...",
    );

    try {
      // 1. Update User Profile (Phone & Role)
      await AuthService.updateProfile({
        phone_number: phoneNumber,
        role: selectedRole,
      });

      // 2. If Organizer, create organizer entity
      if (isOrganizer && organizerData) {
        const slug = generateSlug(organizerData.organizerName);
        await AuthService.createOrganizer({
          name: organizerData.organizerName,
          slug: slug,
        });
      }

      // 3. Refresh Auth State to get new role/claims
      await useAuthStore.getState().checkAuth();

      // 4. Success & Redirect
      toast.success(
        isOrganizer
          ? "Profil organizer berhasil dibuat!"
          : "Profil berhasil dilengkapi!",
        { id: toastId },
      );
      router.push(isOrganizer ? "/organizer/dashboard" : "/");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan data";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto rounded-3xl py-10 px-4 shadow-lg border-border/50">
      <CardHeader className="space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="font-bold text-3xl">
            🎉
            <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text ml-2">
              Selamat Datang!
            </span>
          </h1>
          <CardDescription className="text-base text-gray-600">
            Lengkapi profil Anda untuk melanjutkan
          </CardDescription>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div
            className={cn(
              "h-2 w-16 rounded-full transition-colors duration-300",
              step === 1 ? "bg-primary" : "bg-primary/20",
            )}
          />
          <div
            className={cn(
              "h-2 w-16 rounded-full transition-colors duration-300",
              step === 2 ? "bg-primary" : "bg-slate-200 dark:bg-slate-800",
            )}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* STEP 1: Phone Number */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Lengkapi Nomor Telepon
              </h2>
              <p className="text-sm text-gray-600">
                Kami memerlukan nomor telepon Anda untuk verifikasi
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      +62
                    </span>
                    <span className="text-gray-300">|</span>
                  </div>

                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="8xxxxxxxx"
                    autoComplete="tel"
                    {...phoneForm.register("phoneNumber")}
                    className={cn(
                      "pl-20",
                      phoneForm.formState.errors.phoneNumber && "border-danger",
                    )}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ""); // Hapus non-digit

                      // Jika user ketik 0 di awal, hapus semua 0 di depan
                      if (value.startsWith("0")) {
                        value = value.replace(/^0+/, "");
                      }

                      // Maksimal 13 digit
                      if (value.length > 13) {
                        value = value.slice(0, 13);
                      }

                      phoneForm.setValue("phoneNumber", value, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
                {phoneForm.formState.errors.phoneNumber && (
                  <p className="text-xs text-danger font-medium">
                    {phoneForm.formState.errors.phoneNumber.message}
                  </p>
                )}
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-2xl font-semibold text-md shadow-glow transition-all"
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Role Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Pilih Peran Anda
              </h2>
              <p className="text-sm text-gray-600">
                Bagaimana Anda ingin menggunakan kumpul.in?
              </p>
            </div>

            <div className="grid gap-4">
              {/* user Option */}
              <div
                className={cn(
                  "relative flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:bg-muted-foreground/10",
                  selectedRole === "user"
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border",
                )}
                onClick={() => !isLoading && setSelectedRole("user")}
              >
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    selectedRole === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-600",
                  )}
                >
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground">
                    Saya Pengguna
                  </h3>
                  <p className="text-sm text-gray-600">
                    Jelajahi dan ikuti berbagai event menarik
                  </p>
                </div>
                {selectedRole === "user" && (
                  <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-primary animate-pulse" />
                )}
              </div>

              {/* Organizer Option */}
              <div
                className={cn(
                  "relative flex flex-col gap-4 p-4 rounded-2xl border-2 transition-all duration-200",
                  selectedRole === "organizer"
                    ? "border-secondary bg-secondary/5 shadow-sm"
                    : "border-border cursor-pointer hover:bg-muted-foreground/10",
                )}
                onClick={() =>
                  !isLoading &&
                  selectedRole !== "organizer" &&
                  setSelectedRole("organizer")
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
                      selectedRole === "organizer"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    <Briefcase
                      className="h-6 w-6"
                      color={selectedRole === "organizer" ? "white" : "black"}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground">
                      Saya Organizer
                    </h3>
                    <p className="text-sm text-gray-600">
                      Buat dan kelola event Anda sendiri
                    </p>
                  </div>
                  {selectedRole === "organizer" && (
                    <div className="absolute right-4 top-4 h-3 w-3 rounded-full bg-secondary animate-pulse" />
                  )}
                </div>

                {/* Conditional Organizer Input */}
                {selectedRole === "organizer" && (
                  <div
                    className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="organizerName">Nama Organizer</Label>
                      <Input
                        startIcon={
                          <Building2 className="h-4 w-4 text-gray-500" />
                        }
                        id="organizerName"
                        placeholder="Nama organisasi atau komunitas"
                        autoComplete="organization"
                        {...organizerForm.register("organizerName")}
                        className={
                          organizerForm.formState.errors.organizerName
                            ? "border-danger"
                            : ""
                        }
                      />
                      {organizerForm.formState.errors.organizerName && (
                        <p className="text-xs text-danger font-medium">
                          {organizerForm.formState.errors.organizerName.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                  setSelectedRole(null);
                }}
                disabled={isLoading}
                className="flex-1 py-6 rounded-2xl font-semibold shadow-none border-border hover:bg-muted-foreground/10"
              >
                <ArrowLeft className="h-4 w-4 " />
                Kembali
              </Button>

              <Button
                onClick={() => {
                  if (selectedRole === "user") {
                    handleFinalSubmit();
                  } else if (selectedRole === "organizer") {
                    organizerForm.handleSubmit(handleFinalSubmit)();
                  } else {
                    toast.error("Pilih peran terlebih dahulu");
                  }
                }}
                disabled={isLoading || !selectedRole}
                className="flex-[2] py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-2xl font-semibold text-md shadow-glow transition-all"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
