"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Building2,
    Mail,
    Loader2,
    Phone,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, generateSlug } from "@/lib/utils";
import { organizerSchema, phoneSchema } from "@/lib/validator/auth";
import { AuthService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { User } from "@/types/user";

type PhoneFormValues = z.infer<typeof phoneSchema>;
type OrganizerFormValues = z.infer<typeof organizerSchema>;

interface GetStartedFormProps {
    initialUser?: User | null;
}

export default function GetStartedForm({ initialUser }: GetStartedFormProps) {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [phoneNumber, setPhoneNumber] = useState(
        initialUser?.phone_number ?? "",
    );
    const [otpCode, setOtpCode] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(
        initialUser?.email_verified ?? false,
    );
    const [hasSentCode, setHasSentCode] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    const [selectedRole, setSelectedRole] = useState<
        "user" | "organizer" | null
    >(null);
    const [isLoading, setIsLoading] = useState(false);

    const phoneForm = useForm<PhoneFormValues>({
        resolver: zodResolver(phoneSchema),
        defaultValues: {
            phone_number:
                initialUser?.phone_number?.replace(/^\+?62/, "") ?? "",
        },
    });

    const organizerForm = useForm<OrganizerFormValues>({
        resolver: zodResolver(organizerSchema),
        defaultValues: { organizer_name: "" },
    });

    const accountEmail = initialUser?.email ?? "";

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = window.setInterval(() => {
            setResendCooldown((current) => Math.max(current - 1, 0));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [resendCooldown]);

    const handleSendEmailCode = async () => {
        if (isEmailVerified) {
            const organizerData = await getOrganizerData();
            if (organizerData === null) return;
            await handleFinalSubmit(organizerData);
            return;
        }

        if (!accountEmail) {
            toast.error("Email akun tidak ditemukan");
            return;
        }

        setIsSendingCode(true);
        const toastId = toast.loading("Mengirim kode verifikasi...");

        try {
            await AuthService.sendEmailVerificationCode(accountEmail);
            setHasSentCode(true);
            setResendCooldown(60);
            toast.success("Kode verifikasi dikirim ke email Anda", {
                id: toastId,
            });
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                "Gagal mengirim kode verifikasi";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSendingCode(false);
        }
    };

    const getOrganizerData = async () => {
        if (selectedRole !== "organizer") return undefined;

        const isValid = await organizerForm.trigger();
        if (!isValid) return null;

        return organizerForm.getValues();
    };

    const handleVerifyEmailCode = async () => {
        if (initialUser?.email_verified) {
            try {
                const organizerData = await getOrganizerData();
                await handleFinalSubmit(organizerData!);
            } catch (error) {
                const axiosError = error as AxiosError<{ message: string }>;
                const errorMessage =
                    axiosError.response?.data?.message ||
                    "Kode verifikasi tidak valid atau sudah kedaluwarsa";
                toast.error(errorMessage);
            } finally {
                setIsVerifyingCode(false);
            }
            return;
        }

        const code = otpCode.trim();
        if (!accountEmail) {
            toast.error("Email akun tidak ditemukan");
            return;
        }
        if (!selectedRole) {
            toast.error("Pilih peran terlebih dahulu");
            return;
        }
        if (!/^[0-9A-Za-z]{4,8}$/.test(code)) {
            toast.error("Masukkan kode OTP yang valid");
            return;
        }

        const organizerData = await getOrganizerData();
        if (organizerData === null) return;

        setIsVerifyingCode(true);
        const toastId = toast.loading("Memverifikasi kode...");

        try {
            await AuthService.verifyEmailCode({
                email: accountEmail,
                code,
            });
            setIsEmailVerified(true);
            toast.success("Email berhasil diverifikasi", { id: toastId });

            await handleFinalSubmit(organizerData);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                "Kode verifikasi tidak valid atau sudah kedaluwarsa";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleNextStep = async () => {
        const isValid = await phoneForm.trigger();
        if (!isValid) return;

        const phone = phoneForm.getValues("phone_number");
        setPhoneNumber(`+62${phone}`);
        setSelectedRole(null);
        setOtpCode("");
        setHasSentCode(false);
        setResendCooldown(0);
        setStep(2);
    };

    const handleRoleNextStep = async () => {
        if (!selectedRole) {
            toast.error("Pilih peran terlebih dahulu");
            return;
        }

        const organizerData = await getOrganizerData();
        if (organizerData === null) return;

        if (isEmailVerified) {
            await handleFinalSubmit(organizerData);
        } else {
            setStep(3);
        }
    };

    const handleFinalSubmit = async (organizerData?: OrganizerFormValues) => {
        if (!selectedRole) {
            toast.error("Pilih peran terlebih dahulu");
            return;
        }

        setIsLoading(true);
        const isOrganizer = selectedRole === "organizer";
        const toastId = toast.loading(
            isOrganizer
                ? "Membuat profil organizer..."
                : "Melengkapi profil...",
        );

        try {
            await AuthService.updateProfile({
                phone_number: phoneNumber,
                role: selectedRole,
            });

            if (isOrganizer && organizerData) {
                await AuthService.createOrganizer({
                    name: organizerData.organizer_name,
                    slug: generateSlug(organizerData.organizer_name),
                });
            }

            await useAuthStore.getState().checkAuth();

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
        <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-slate-900/[0.07] backdrop-blur sm:p-6">
            <span className="absolute -left-3 top-28 size-6 rounded-full bg-[#f7f8fb]" />
            <span className="absolute -right-3 top-28 size-6 rounded-full bg-[#f7f8fb]" />
            <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />

            <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xl font-bold">
                        <Image
                            src="/kumpulin_wordmark.svg"
                            alt="Kumpulin Logo"
                            height={40}
                            width={120}
                            priority
                        />
                    </div>
                    <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#047857]">
                        Setup
                    </span>
                </div>

                <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                        <div
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                step === 1 ? "bg-primary" : "bg-primary/25",
                            )}
                        />
                        <div
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                step === 2
                                    ? "bg-primary"
                                    : step === 3
                                      ? "bg-primary/25"
                                      : "bg-slate-200",
                            )}
                        />
                        <div
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                                step === 3 ? "bg-primary" : "bg-slate-200",
                            )}
                        />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Lengkapi profil
                    </p>
                    <h1 className="mt-1 text-xl font-bold leading-tight text-slate-950">
                        Satu langkah lagi
                    </h1>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold text-slate-950">
                            Nomor WhatsApp
                        </h2>
                        <p className="text-sm text-slate-500">
                            Dipakai untuk notifikasi tiket dan update event.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label
                                htmlFor="phone_number"
                                className="text-sm font-semibold text-slate-700"
                            >
                                Nomor telepon
                            </Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                                    <Phone className="size-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        +62
                                    </span>
                                    <span className="text-slate-300">|</span>
                                </div>

                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="8xxxxxxxx"
                                    autoComplete="tel"
                                    {...phoneForm.register("phone_number")}
                                    className={cn(
                                        "h-10 rounded-xl border-slate-200 bg-slate-50 pl-20 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                        phoneForm.formState.errors
                                            .phone_number && "border-danger",
                                    )}
                                    onChange={(event) => {
                                        let value = event.target.value.replace(
                                            /\D/g,
                                            "",
                                        );
                                        if (value.startsWith("0")) {
                                            value = value.replace(/^0+/, "");
                                        }
                                        if (value.length > 13) {
                                            value = value.slice(0, 13);
                                        }
                                        phoneForm.setValue(
                                            "phone_number",
                                            value,
                                            {
                                                shouldValidate: true,
                                            },
                                        );
                                    }}
                                />
                            </div>
                            {phoneForm.formState.errors.phone_number && (
                                <p className="text-xs font-medium text-danger">
                                    {
                                        phoneForm.formState.errors.phone_number
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleNextStep}
                            className="h-10 w-full rounded-xl bg-primary text-sm font-semibold shadow-glow hover:bg-primary-hover"
                        >
                            Lanjutkan
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold text-slate-950">
                            Pilih peran
                        </h2>
                    </div>

                    <div className="grid gap-2.5">
                        <div
                            className={cn(
                                "relative flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all duration-200 hover:bg-slate-50",
                                selectedRole === "user"
                                    ? "border-primary/40 bg-primary/5 shadow-sm"
                                    : "border-slate-200/80",
                            )}
                            onClick={() =>
                                !isLoading && setSelectedRole("user")
                            }
                        >
                            <div
                                className={cn(
                                    "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                                    selectedRole === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-slate-100 text-slate-500",
                                )}
                            >
                                <Users className="size-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-slate-950">
                                    Pengguna
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Cari event dan beli tiket.
                                </p>
                            </div>
                            {selectedRole === "user" && (
                                <div className="absolute right-4 top-4 size-2.5 rounded-full bg-primary" />
                            )}
                        </div>

                        <div
                            className={cn(
                                "relative flex flex-col gap-3 rounded-2xl border p-3 transition-all duration-200",
                                selectedRole === "organizer"
                                    ? "border-[#10b981]/40 bg-[#10b981]/5 shadow-sm"
                                    : "cursor-pointer border-slate-200/80 hover:bg-slate-50",
                            )}
                            onClick={() =>
                                !isLoading &&
                                selectedRole !== "organizer" &&
                                setSelectedRole("organizer")
                            }
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                                        selectedRole === "organizer"
                                            ? "bg-[#10b981] text-white"
                                            : "bg-slate-100 text-slate-500",
                                    )}
                                >
                                    <Briefcase className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-slate-950">
                                        Organizer
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Buat dan kelola event.
                                    </p>
                                </div>
                                {selectedRole === "organizer" && (
                                    <div className="absolute right-4 top-4 size-2.5 rounded-full bg-[#10b981]" />
                                )}
                            </div>

                            {selectedRole === "organizer" && (
                                <div
                                    className="space-y-2 border-t border-dashed border-slate-200 pt-3 animate-in slide-in-from-top-2 duration-200"
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <Label
                                        htmlFor="organizer_name"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Nama organizer
                                    </Label>
                                    <Input
                                        startIcon={
                                            <Building2 className="size-4 text-slate-400" />
                                        }
                                        id="organizer_name"
                                        placeholder="Nama organisasi atau komunitas"
                                        autoComplete="organization"
                                        {...organizerForm.register(
                                            "organizer_name",
                                        )}
                                        className={cn(
                                            "h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20",
                                            organizerForm.formState.errors
                                                .organizer_name &&
                                                "border-danger",
                                        )}
                                    />
                                    {organizerForm.formState.errors
                                        .organizer_name && (
                                        <p className="text-xs font-medium text-danger">
                                            {
                                                organizerForm.formState.errors
                                                    .organizer_name.message
                                            }
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStep(1);
                                setSelectedRole(null);
                            }}
                            disabled={isLoading}
                            className="h-10 flex-1 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Button>

                        <Button
                            onClick={handleRoleNextStep}
                            disabled={isLoading || !selectedRole}
                            className="h-10 flex-1 rounded-xl bg-primary text-sm font-semibold shadow-glow hover:bg-primary-hover"
                        >
                            Lanjutkan
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1">
                        <h2 className="text-base font-semibold text-slate-950">
                            {isEmailVerified
                                ? "Email sudah terverifikasi"
                                : "Verifikasi email"}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {isEmailVerified
                                ? "Selesaikan setup untuk menyimpan profil Anda."
                                : "Kirim kode OTP ke email akun Anda sebagai langkah terakhir."}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Email tujuan
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Mail className="size-4 shrink-0 text-primary" />
                                        <span className="truncate">
                                            {accountEmail ||
                                                "Email tidak tersedia"}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant={
                                        hasSentCode ? "outline" : "default"
                                    }
                                    onClick={handleSendEmailCode}
                                    disabled={
                                        isSendingCode ||
                                        isEmailVerified ||
                                        isLoading ||
                                        resendCooldown > 0 ||
                                        !accountEmail
                                    }
                                    className={cn(
                                        "h-9 shrink-0 rounded-xl px-3 text-xs font-semibold",
                                        hasSentCode
                                            ? "border-slate-200 bg-white text-slate-600 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                                            : "bg-primary text-white shadow-sm hover:bg-primary-hover",
                                    )}
                                >
                                    {isSendingCode ? (
                                        <>
                                            <Loader2 className="size-3.5 animate-spin" />
                                            Mengirim
                                        </>
                                    ) : hasSentCode ? (
                                        resendCooldown > 0 ? (
                                            `Kirim ulang ${resendCooldown}s`
                                        ) : (
                                            "Kirim ulang"
                                        )
                                    ) : isEmailVerified ? (
                                        "Terverifikasi"
                                    ) : (
                                        "Kirim kode"
                                    )}
                                </Button>
                            </div>

                            {isEmailVerified ? (
                                <span className="mt-3 inline-flex rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
                                    Email akun ini sudah terverifikasi.
                                </span>
                            ) : (
                                hasSentCode && (
                                    <span className="mt-3 inline-flex rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
                                        Kode sudah dikirim. Cek inbox atau spam.
                                    </span>
                                )
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="otp_code"
                                className="text-sm font-semibold text-slate-700"
                            >
                                Kode OTP
                            </Label>
                            <Input
                                id="otp_code"
                                inputMode="text"
                                autoComplete="one-time-code"
                                placeholder={
                                    isEmailVerified
                                        ? "Email sudah terverifikasi"
                                        : hasSentCode
                                          ? "Masukkan kode dari email"
                                          : "Kirim kode dulu"
                                }
                                value={otpCode}
                                disabled={
                                    !hasSentCode ||
                                    isEmailVerified ||
                                    isVerifyingCode ||
                                    isLoading
                                }
                                onChange={(event) =>
                                    setOtpCode(
                                        event.target.value.trim().slice(0, 8),
                                    )
                                }
                                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-center text-base font-semibold tracking-[0.35em] focus-visible:border-primary/40 focus-visible:ring-primary/20 disabled:opacity-70"
                            />
                            {!isEmailVerified && (
                                <p className="text-xs text-slate-400">
                                    Masukkan 6 karakter kode verifikasi dari
                                    email.
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(2)}
                                disabled={isVerifyingCode || isLoading}
                                className="h-10 flex-1 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                            >
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Button>

                            <Button
                                onClick={handleVerifyEmailCode}
                                disabled={
                                    isVerifyingCode ||
                                    isLoading ||
                                    (!isEmailVerified &&
                                        (!hasSentCode || !otpCode.trim()))
                                }
                                className="h-10 flex-1 rounded-xl bg-primary text-sm font-semibold shadow-glow hover:bg-primary-hover"
                            >
                                {isVerifyingCode || isLoading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        {isEmailVerified
                                            ? "Selesai"
                                            : "Verifikasi & selesai"}
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
