"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import Link from "next/link";
import {
    AlertCircle,
    AtSign,
    Camera,
    CheckCircle2,
    Eye,
    EyeOff,
    ImagePlus,
    KeyRound,
    Loader2,
    LockKeyhole,
    Mail,
    Phone,
    RefreshCw,
    Save,
    ShieldCheck,
    Trash2,
    User,
    X,
} from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    UpdateUserProfilePayload,
    UserProfile,
    UserService,
} from "@/services/user-service";
import { useAuthStore } from "@/stores/auth-store";
import type { User as AuthUser } from "@/types/user";
import { AuthService } from "@/services/auth-service";

const profileSchema = z.object({
    username: z
        .string()
        .trim()
        .toLowerCase()
        .min(3, "Username minimal 3 karakter")
        .max(30, "Username maksimal 30 karakter")
        .regex(
            /^[a-z0-9._]+$/,
            "Username hanya boleh berisi huruf kecil, angka, titik, dan underscore",
        ),
    phone_number: z
        .string()
        .trim()
        .refine((value) => {
            if (!value) return true;
            const normalized = normalizePhoneNumber(value);
            return normalized.length >= 9 && normalized.length <= 20;
        }, "Nomor telepon harus 9-20 karakter setelah spasi dan strip dihapus")
        .refine((value) => {
            if (!value) return true;
            return /^\+?\d+$/.test(normalizePhoneNumber(value));
        }, "Nomor telepon hanya boleh berisi + dan angka"),
    first_name: z.string().trim().max(100, "Nama depan maksimal 100 karakter"),
    last_name: z
        .string()
        .trim()
        .max(100, "Nama belakang maksimal 100 karakter"),
});

const passwordRule = z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung angka");

const changePasswordSchema = z
    .object({
        current_password: z.string().min(1, "Password saat ini wajib diisi"),
        new_password: passwordRule,
        confirm_password: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .superRefine((data, ctx) => {
        if (data.current_password === data.new_password) {
            ctx.addIssue({
                code: "custom",
                message: "Password baru harus berbeda dari password saat ini",
                path: ["new_password"],
            });
        }

        if (data.new_password !== data.confirm_password) {
            ctx.addIssue({
                code: "custom",
                message: "Password tidak cocok",
                path: ["confirm_password"],
            });
        }
    });

type ProfileFormValues = z.infer<typeof profileSchema>;
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
type ProfileField = keyof ProfileFormValues;
type ProfileTab = "profile" | "security";
type PasswordVisibilityField = keyof ChangePasswordFormValues;

interface ProfileApiError {
    code?: string;
    message?: string;
    errors?: Array<{
        field?: string;
        message?: string;
    }>;
}

const profileFields: ProfileField[] = [
    "username",
    "phone_number",
    "first_name",
    "last_name",
];

function normalizePhoneNumber(value?: string | null) {
    return (value ?? "").replace(/[\s-]/g, "");
}

function normalizeUsername(value?: string | null) {
    return (value ?? "").trim().toLowerCase();
}

function normalizeName(value?: string | null) {
    return (value ?? "").trim();
}

function getProfileId(profile: UserProfile) {
    const id = profile.id ?? profile.user_id;
    return id === undefined || id === null ? undefined : String(id);
}

function getProfileDisplayName(
    profile: UserProfile | null,
    user: AuthUser | null,
) {
    const firstName = profile?.first_name ?? user?.first_name;
    const lastName = profile?.last_name ?? user?.last_name;
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return (
        fullName ||
        profile?.username ||
        user?.username ||
        profile?.email ||
        user?.email ||
        "Pengguna"
    );
}

function getInitials(name: string) {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0]?.toUpperCase())
            .join("") || "U"
    );
}

function profileToFormValues(profile: UserProfile): ProfileFormValues {
    return {
        username: profile.username ?? "",
        phone_number: profile.phone_number ?? "",
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
    };
}

function mergeProfileWithUser(
    profile: UserProfile,
    currentUser: AuthUser | null,
): AuthUser | null {
    const id = getProfileId(profile) ?? currentUser?.id;

    if (!id) return null;

    return {
        id,
        email: profile.email ?? currentUser?.email ?? "",
        username: profile.username ?? currentUser?.username ?? "",
        role: profile.role ?? currentUser?.role ?? "user",
        profile_url: profile.profile_url ?? undefined,
        phone_number: profile.phone_number ?? undefined,
        first_name: profile.first_name ?? undefined,
        last_name: profile.last_name ?? undefined,
        email_verified:
            profile.email_verified ?? currentUser?.email_verified ?? false,
    };
}

function buildChangedPayload(
    profile: UserProfile,
    values: ProfileFormValues,
): UpdateUserProfilePayload {
    const payload: UpdateUserProfilePayload = {};
    const nextUsername = normalizeUsername(values.username);

    if (nextUsername !== normalizeUsername(profile.username)) {
        payload.username = nextUsername;
    }

    const nextPhoneNumber = normalizePhoneNumber(values.phone_number);
    if (nextPhoneNumber !== normalizePhoneNumber(profile.phone_number)) {
        payload.phone_number = nextPhoneNumber;
    }

    const nextFirstName = normalizeName(values.first_name);
    if (nextFirstName !== normalizeName(profile.first_name)) {
        payload.first_name = nextFirstName;
    }

    const nextLastName = normalizeName(values.last_name);
    if (nextLastName !== normalizeName(profile.last_name)) {
        payload.last_name = nextLastName;
    }

    return payload;
}

function isProfileField(value?: string): value is ProfileField {
    return profileFields.includes(value as ProfileField);
}

function getApiError(error: unknown) {
    const axiosError = error as AxiosError<ProfileApiError>;
    return {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
    };
}

function getGenericErrorMessage(status?: number, code?: string) {
    if (status === 500 || code === "INTERNAL_ERROR") {
        return "Terjadi kendala di server. Coba lagi sebentar.";
    }

    return "Permintaan belum berhasil diproses. Periksa data lalu coba lagi.";
}

export default function UserProfilePage() {
    const { logout, setUser, user } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isClearingPhoto, setIsClearingPhoto] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>("profile");
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [visiblePasswordFields, setVisiblePasswordFields] = useState<
        Record<PasswordVisibilityField, boolean>
    >({
        current_password: false,
        new_password: false,
        confirm_password: false,
    });

    const {
        clearErrors,
        formState: { errors },
        handleSubmit,
        register,
        reset,
        setError,
        setValue,
        watch,
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: "",
            phone_number: "",
            first_name: "",
            last_name: "",
        },
    });

    const {
        formState: { errors: passwordErrors },
        handleSubmit: handlePasswordSubmit,
        register: registerPassword,
        reset: resetPasswordForm,
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            current_password: "",
            new_password: "",
            confirm_password: "",
        },
    });

    const watchedValues = watch();
    const displayName = useMemo(
        () => getProfileDisplayName(profile, user),
        [profile, user],
    );
    const initials = useMemo(() => getInitials(displayName), [displayName]);
    const avatarUrl = profile?.profile_url ?? user?.profile_url;
    const profileEmail = profile?.email || user?.email || "";
    const pendingPayload = useMemo(
        () => (profile ? buildChangedPayload(profile, watchedValues) : {}),
        [profile, watchedValues],
    );
    const hasChangedFields = Object.keys(pendingPayload).length > 0;
    const isBusy = isSaving || isUploadingPhoto || isClearingPhoto;

    const handleSessionError = useCallback(
        async (status?: number) => {
            if (status === 401 || status === 404) {
                toast.error("Sesi tidak valid. Silakan masuk kembali.");
                await logout();
                return true;
            }

            return false;
        },
        [logout],
    );

    const refreshProfile = useCallback(
        async ({ silent = false }: { silent?: boolean } = {}) => {
            if (!silent) setIsRefreshing(true);
            setLoadError(null);

            try {
                const nextProfile = await UserService.getProfile();
                const currentUser = useAuthStore.getState().user;
                const mergedUser = mergeProfileWithUser(
                    nextProfile,
                    currentUser,
                );

                setProfile(nextProfile);
                reset(profileToFormValues(nextProfile));

                if (mergedUser) {
                    setUser(mergedUser);
                }
            } catch (error) {
                const { status } = getApiError(error);
                const handledSession = await handleSessionError(status);

                if (!handledSession) {
                    setLoadError(
                        "Gagal memuat profil. Coba muat ulang halaman ini.",
                    );
                    toast.error("Gagal memuat profil");
                }
            } finally {
                if (!silent) setIsRefreshing(false);
            }
        },
        [handleSessionError, reset, setUser],
    );

    useEffect(() => {
        let active = true;

        const loadProfile = async () => {
            await refreshProfile({ silent: true });
            if (active) setIsLoading(false);
        };

        void loadProfile();

        return () => {
            active = false;
        };
    }, [refreshProfile]);

    const applyApiErrors = (error: unknown) => {
        const { status, data } = getApiError(error);

        if (data?.code === "USERNAME_ALREADY_USED" || status === 409) {
            setError("username", {
                type: "server",
                message: "Username sudah digunakan",
            });
            return "Username sudah digunakan.";
        }

        if (data?.code === "EMPTY_UPDATE_PAYLOAD") {
            return "Tidak ada perubahan untuk disimpan.";
        }

        if (data?.code === "VALIDATION_ERROR" && data.errors?.length) {
            data.errors.forEach((fieldError) => {
                if (isProfileField(fieldError.field)) {
                    setError(fieldError.field, {
                        type: "server",
                        message: fieldError.message ?? "Data belum valid",
                    });
                }
            });

            return "Periksa kembali data profil.";
        }

        return data?.message ?? getGenericErrorMessage(status, data?.code);
    };

    const validatePatchPayload = (payload: UpdateUserProfilePayload) => {
        let invalid = false;

        if ("phone_number" in payload && !payload.phone_number) {
            setError("phone_number", {
                type: "manual",
                message: "Nomor telepon tidak boleh kosong",
            });
            invalid = true;
        }

        if ("first_name" in payload && !payload.first_name) {
            setError("first_name", {
                type: "manual",
                message: "Nama depan tidak boleh kosong",
            });
            invalid = true;
        }

        if ("last_name" in payload && !payload.last_name) {
            setError("last_name", {
                type: "manual",
                message: "Nama belakang tidak boleh kosong",
            });
            invalid = true;
        }

        return !invalid;
    };

    const onSubmit = async (values: ProfileFormValues) => {
        if (!profile) return;

        clearErrors();

        const payload = buildChangedPayload(profile, values);

        if (Object.keys(payload).length === 0) {
            toast.info("Tidak ada perubahan untuk disimpan.");
            return;
        }

        if (!validatePatchPayload(payload)) return;

        setIsSaving(true);
        const toastId = toast.loading("Menyimpan profil...");

        try {
            await UserService.updateProfile(payload);
            await refreshProfile({ silent: true });
            toast.success("Profil berhasil diperbarui", { id: toastId });
        } catch (error) {
            const { status } = getApiError(error);
            const handledSession = await handleSessionError(status);

            if (!handledSession) {
                toast.error(applyApiErrors(error), { id: toastId });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Pilih file gambar untuk foto profil.");
            event.target.value = "";
            return;
        }

        setIsUploadingPhoto(true);
        const toastId = toast.loading("Mengunggah foto profil...");

        try {
            await UserService.uploadProfilePhoto(file);
            await refreshProfile({ silent: true });
            toast.success("Foto profil berhasil diperbarui", { id: toastId });
        } catch (error) {
            const { status } = getApiError(error);
            const handledSession = await handleSessionError(status);

            if (!handledSession) {
                toast.error(applyApiErrors(error), { id: toastId });
            }
        } finally {
            event.target.value = "";
            setIsUploadingPhoto(false);
        }
    };

    const handleClearPhoto = async () => {
        if (!avatarUrl) return;

        setIsClearingPhoto(true);
        const toastId = toast.loading("Menghapus foto profil...");

        try {
            await UserService.updateProfile({ profile_url: null });
            await refreshProfile({ silent: true });
            toast.success("Foto profil berhasil dihapus", { id: toastId });
        } catch (error) {
            const { status } = getApiError(error);
            const handledSession = await handleSessionError(status);

            if (!handledSession) {
                toast.error(applyApiErrors(error), { id: toastId });
            }
        } finally {
            setIsClearingPhoto(false);
        }
    };

    const closeChangePasswordPanel = () => {
        resetPasswordForm();
        setIsChangePasswordOpen(false);
        setVisiblePasswordFields({
            current_password: false,
            new_password: false,
            confirm_password: false,
        });
    };

    const togglePasswordVisibility = (field: PasswordVisibilityField) => {
        setVisiblePasswordFields((current) => ({
            ...current,
            [field]: !current[field],
        }));
    };

    const onChangePasswordSubmit = async (values: ChangePasswordFormValues) => {
        try {
            await AuthService.changePassword({
                currentPassword: values.current_password,
                newPassword: values.new_password,
            });
            closeChangePasswordPanel();
            toast.success("Berhasil mengubah password");
        } catch {
            toast.error("Gagal mengubah password");
        }
    };

    if (isLoading) {
        return (
            <PageSurface>
                <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
                    <Skeleton className="h-80 rounded-2xl bg-primary/10" />
                    <Skeleton className="h-140 rounded-2xl bg-primary/10" />
                </div>
            </PageSurface>
        );
    }

    return (
        <PageSurface>
            <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <svg
                    className="pointer-events-none absolute -right-8 -top-8 h-48 w-72 text-primary md:right-2 md:top-1/2 md:-translate-y-1/2"
                    viewBox="0 0 288 192"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M34 126C72 78 109 95 143 62C178 28 217 44 254 18"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M48 52C85 89 116 78 149 114C180 148 219 141 252 166"
                        stroke="#10b981"
                        strokeOpacity="0.1"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M86 150C119 128 132 87 176 86C210 85 228 68 248 45"
                        stroke="currentColor"
                        strokeOpacity="0.07"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    {[
                        [34, 126, 12],
                        [143, 62, 16],
                        [254, 18, 12],
                        [48, 52, 13],
                        [149, 114, 18],
                        [252, 166, 13],
                        [176, 86, 11],
                    ].map(([cx, cy, r]) => (
                        <g key={`${cx}-${cy}`}>
                            <circle
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill="white"
                                stroke="currentColor"
                                strokeOpacity="0.13"
                                strokeWidth="2"
                            />
                            <circle
                                cx={cx}
                                cy={cy}
                                r={Math.max(3, r / 3)}
                                fill="currentColor"
                                fillOpacity="0.12"
                            />
                        </g>
                    ))}
                    <rect
                        x="193"
                        y="105"
                        width="34"
                        height="34"
                        rx="10"
                        fill="#10b981"
                        fillOpacity="0.08"
                    />
                    <rect
                        x="94"
                        y="24"
                        width="24"
                        height="24"
                        rx="8"
                        fill="currentColor"
                        fillOpacity="0.08"
                    />
                </svg>

                <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Akun pengguna
                        </p>
                        <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
                            Profil Saya
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                            Kelola identitas akun yang dipakai untuk tiket,
                            komunitas, dan aktivitas di Kumpul.in.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => void refreshProfile()}
                        disabled={isRefreshing || isBusy}
                        className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-900/5 hover:border-primary/30 hover:text-primary"
                    >
                        {isRefreshing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Muat ulang
                    </Button>
                </div>
            </header>

            {loadError && (
                <Alert className="rounded-xl border-danger/20 bg-danger-light text-danger">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profil belum termuat</AlertTitle>
                    <AlertDescription>{loadError}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
                    <div className="h-20 border-b border-primary/10 bg-primary-light/80" />
                    <div className="-mt-14 flex flex-col items-center px-5 pb-5 text-center">
                        <div className="relative">
                            <Avatar className="h-28 w-28 rounded-3xl border-4 border-white bg-primary-light shadow-lg shadow-slate-900/10">
                                <AvatarImage
                                    src={avatarUrl ?? undefined}
                                    alt={displayName}
                                    className="object-cover"
                                />
                                <AvatarFallback className="rounded-3xl bg-primary-light text-3xl font-semibold text-primary">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white bg-primary text-white shadow-md shadow-primary/20">
                                <Camera className="h-4 w-4" />
                            </span>
                        </div>

                        <h2 className="mt-5 text-2xl font-semibold leading-tight text-slate-950">
                            {displayName}
                        </h2>
                        <p className="mt-1 max-w-full truncate text-sm font-medium text-slate-500">
                            @{profile?.username || user?.username || "username"}
                        </p>
                        <p className="mt-1 max-w-full truncate text-sm text-slate-500">
                            {profile?.email ||
                                user?.email ||
                                "Email belum tersedia"}
                        </p>

                        <div className="mt-6 grid w-full grid-cols-2 gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) =>
                                    void handlePhotoChange(event)
                                }
                            />
                            <Button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isBusy}
                                className="h-10 rounded-xl px-3 text-xs font-semibold shadow-md shadow-primary/15"
                            >
                                {isUploadingPhoto ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ImagePlus className="h-4 w-4" />
                                )}
                                Unggah
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => void handleClearPhoto()}
                                disabled={!avatarUrl || isBusy}
                                className="h-10 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:border-danger/30 hover:bg-danger-light hover:text-danger"
                            >
                                {isClearingPhoto ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                                Hapus
                            </Button>
                        </div>

                        <div className="mt-5 w-full rounded-xl border border-primary/10 bg-primary-light/70 p-3 text-left">
                            <div className="flex gap-2">
                                <CheckCircle2
                                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                    strokeWidth={2.3}
                                />
                                <p className="text-xs leading-relaxed text-slate-600">
                                    Foto dan data profil disimpan terpisah
                                    supaya perubahan lebih mudah diperiksa.
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
                    <div className="border-b border-slate-200/80 bg-slate-50/70 p-3">
                        <div
                            role="tablist"
                            aria-label="Profile Saya"
                            className="grid grid-cols-2 rounded-xl border border-slate-200 bg-white p-1 sm:inline-grid "
                        >
                            <ProfileTabButton
                                active={activeTab === "profile"}
                                icon={<User className="h-4 w-4 " />}
                                label="Data profil"
                                onClick={() => setActiveTab("profile")}
                            />
                            <ProfileTabButton
                                active={activeTab === "security"}
                                icon={<ShieldCheck className="h-4 w-4" />}
                                label="Keamanan"
                                onClick={() => setActiveTab("security")}
                            />
                        </div>
                    </div>

                    <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-950">
                                    {activeTab === "profile"
                                        ? "Detail profil"
                                        : "Keamanan akun"}
                                </h2>
                                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                    {activeTab === "profile"
                                        ? "Hanya field yang berubah yang akan dikirim ke server."
                                        : "Kelola akses masuk dan pemulihan akun."}
                                </p>
                            </div>
                            {activeTab === "profile" ? (
                                <span
                                    className={cn(
                                        "mt-2 inline-flex w-fit items-center gap-2 rounded-xl border px-3 py-1 text-xs font-medium sm:mt-0",
                                        hasChangedFields
                                            ? "border-warning/30 bg-warning-light text-slate-800"
                                            : "border-success/20 bg-success-light text-success-hover",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "h-2 w-2 rounded-full",
                                            hasChangedFields
                                                ? "bg-warning"
                                                : "bg-success",
                                        )}
                                    />
                                    {hasChangedFields
                                        ? "Ada perubahan"
                                        : "Tersimpan"}
                                </span>
                            ) : (
                                <span className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl border border-primary/10 bg-primary-light px-3 py-1 text-xs font-medium text-primary sm:mt-0">
                                    <LockKeyhole className="h-3.5 w-3.5" />
                                    Password
                                </span>
                            )}
                        </div>
                    </div>

                    {activeTab === "profile" ? (
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="grid gap-5 p-5 md:p-6"
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <ProfileFieldControl
                                    error={errors.first_name?.message}
                                    htmlFor="first_name"
                                    icon={
                                        <User className="h-4 w-4 text-slate-400" />
                                    }
                                    label="Nama depan"
                                >
                                    <Input
                                        id="first_name"
                                        placeholder="John"
                                        disabled={isBusy}
                                        aria-invalid={!!errors.first_name}
                                        autoComplete="given-name"
                                        className="h-11 border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                        {...register("first_name")}
                                    />
                                </ProfileFieldControl>

                                <ProfileFieldControl
                                    error={errors.last_name?.message}
                                    htmlFor="last_name"
                                    icon={
                                        <User className="h-4 w-4 text-slate-400" />
                                    }
                                    label="Nama belakang"
                                >
                                    <Input
                                        id="last_name"
                                        placeholder="Doe"
                                        disabled={isBusy}
                                        aria-invalid={!!errors.last_name}
                                        autoComplete="family-name"
                                        className="h-11 border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                        {...register("last_name")}
                                    />
                                </ProfileFieldControl>
                            </div>

                            <ProfileFieldControl
                                description="3-30 karakter. Huruf kecil, angka, titik, dan underscore."
                                error={errors.username?.message}
                                htmlFor="username"
                                icon={
                                    <AtSign className="h-4 w-4 text-slate-400" />
                                }
                                label="Username"
                            >
                                <Input
                                    id="username"
                                    placeholder="john_doe_2"
                                    disabled={isBusy}
                                    aria-invalid={!!errors.username}
                                    autoComplete="username"
                                    className="h-11 border-slate-200 bg-slate-50 text-sm lowercase focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                    startIcon={
                                        <AtSign className="h-4 w-4 text-slate-400" />
                                    }
                                    {...register("username", {
                                        onBlur: (event) => {
                                            setValue(
                                                "username",
                                                normalizeUsername(
                                                    event.target.value,
                                                ),
                                                {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                },
                                            );
                                        },
                                    })}
                                />
                            </ProfileFieldControl>

                            <ProfileFieldControl
                                description="Spasi dan strip akan dihapus otomatis saat disimpan."
                                error={errors.phone_number?.message}
                                htmlFor="phone_number"
                                icon={
                                    <Phone className="h-4 w-4 text-slate-400" />
                                }
                                label="Nomor telepon"
                            >
                                <Input
                                    id="phone_number"
                                    placeholder="+62 812-3456-7890"
                                    disabled={isBusy}
                                    aria-invalid={!!errors.phone_number}
                                    autoComplete="tel"
                                    className="h-11 border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                                    startIcon={
                                        <Phone className="h-4 w-4 text-slate-400" />
                                    }
                                    {...register("phone_number")}
                                />
                            </ProfileFieldControl>

                            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                                <div className="flex gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Email
                                        </p>
                                        <p className="mt-1 truncate text-sm text-slate-500">
                                            {profileEmail ||
                                                "Email belum tersedia"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-slate-200/80 pt-5 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        profile &&
                                        reset(profileToFormValues(profile))
                                    }
                                    disabled={!hasChangedFields || isBusy}
                                    className="h-11 rounded-xl border-slate-200 px-5 text-sm font-semibold text-slate-600"
                                >
                                    Batalkan
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!hasChangedFields || isBusy}
                                    className="h-11 rounded-xl px-5 text-sm font-semibold shadow-md shadow-primary/15"
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Simpan perubahan
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid gap-3 p-5 md:p-6">
                            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/3">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                                            <KeyRound className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800">
                                                Password akun
                                            </p>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                                Gunakan password yang kuat dan
                                                berbeda dari layanan lain.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsChangePasswordOpen(
                                                (current) => !current,
                                            )
                                        }
                                        className={cn(
                                            isChangePasswordOpen
                                                ? "text-red-500 border-red-200"
                                                : "text-primary border-slate-200",
                                            "h-10 rounded-xl  px-4 text-sm font-semibold",
                                        )}
                                    >
                                        {isChangePasswordOpen ? (
                                            <X className="h-4 w-4" />
                                        ) : (
                                            <LockKeyhole className="h-4 w-4" />
                                        )}
                                        {isChangePasswordOpen
                                            ? "Tutup"
                                            : "Ubah password"}
                                    </Button>
                                </div>

                                {isChangePasswordOpen && (
                                    <form
                                        onSubmit={handlePasswordSubmit(
                                            onChangePasswordSubmit,
                                        )}
                                        className="mt-5 grid gap-4 border-t border-slate-200/80 pt-5"
                                    >
                                        <div className="grid gap-4">
                                            <PasswordFieldControl
                                                autoComplete="current-password"
                                                error={
                                                    passwordErrors
                                                        .current_password
                                                        ?.message
                                                }
                                                htmlFor="current_password"
                                                label="Password saat ini"
                                                placeholder="Masukkan password saat ini"
                                                register={registerPassword(
                                                    "current_password",
                                                )}
                                                showPassword={
                                                    visiblePasswordFields.current_password
                                                }
                                                onToggleVisibility={() =>
                                                    togglePasswordVisibility(
                                                        "current_password",
                                                    )
                                                }
                                            />

                                            <PasswordFieldControl
                                                autoComplete="new-password"
                                                description="Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka."
                                                error={
                                                    passwordErrors.new_password
                                                        ?.message
                                                }
                                                htmlFor="new_password"
                                                label="Password baru"
                                                placeholder="Buat password baru"
                                                register={registerPassword(
                                                    "new_password",
                                                )}
                                                showPassword={
                                                    visiblePasswordFields.new_password
                                                }
                                                onToggleVisibility={() =>
                                                    togglePasswordVisibility(
                                                        "new_password",
                                                    )
                                                }
                                            />

                                            <PasswordFieldControl
                                                autoComplete="new-password"
                                                error={
                                                    passwordErrors
                                                        .confirm_password
                                                        ?.message
                                                }
                                                htmlFor="confirm_password"
                                                label="Konfirmasi password baru"
                                                placeholder="Ulangi password baru"
                                                register={registerPassword(
                                                    "confirm_password",
                                                )}
                                                showPassword={
                                                    visiblePasswordFields.confirm_password
                                                }
                                                onToggleVisibility={() =>
                                                    togglePasswordVisibility(
                                                        "confirm_password",
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={
                                                    closeChangePasswordPanel
                                                }
                                                className="h-10 rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-600"
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="h-10 rounded-xl px-4 text-sm font-semibold shadow-md shadow-primary/15"
                                            >
                                                <Save className="h-4 w-4" />
                                                Simpan password
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            <div className="rounded-xl border border-primary/10 bg-primary-light/60 p-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm shadow-primary/10">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800">
                                                Lupa password
                                            </p>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                                Kirim instruksi reset ke{" "}
                                                <span className="font-semibold">
                                                    {profileEmail ||
                                                        "email akun"}
                                                </span>
                                                .
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="h-10 rounded-xl border-primary/20 bg-white px-4 text-sm font-semibold text-primary shadow-sm shadow-primary/10 hover:bg-white hover:text-primary"
                                    >
                                        <Link
                                            href={
                                                profileEmail
                                                    ? `/forgot-password?email=${encodeURIComponent(
                                                          profileEmail,
                                                      )}`
                                                    : "/forgot-password"
                                            }
                                        >
                                            Reset password
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                                <div className="flex gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-light text-success">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Status keamanan
                                        </p>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                            Aksi ubah password langsung bisa
                                            diaktifkan setelah backend
                                            menyediakan endpoint perubahan
                                            password.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </PageSurface>
    );
}

function PageSurface({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.14,
                }}
            />
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full text-primary"
                viewBox="0 0 1440 640"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M92 420C246 300 356 486 512 350C652 228 760 306 920 210C1086 111 1205 218 1362 98"
                    stroke="currentColor"
                    strokeOpacity="0.055"
                    strokeWidth="2"
                />
                <path
                    d="M122 176C292 250 408 96 566 172C708 240 812 144 966 210C1110 272 1218 392 1360 318"
                    stroke="#10b981"
                    strokeOpacity="0.045"
                    strokeWidth="2"
                />
            </svg>
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

function ProfileFieldControl({
    children,
    description,
    error,
    htmlFor,
    icon,
    label,
}: {
    children: React.ReactNode;
    description?: string;
    error?: string;
    htmlFor: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <Label
                    htmlFor={htmlFor}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-800"
                >
                    {icon}
                    {label}
                </Label>
            </div>
            {children}
            {description && !error && (
                <p className="text-xs leading-relaxed text-slate-500">
                    {description}
                </p>
            )}
            {error && (
                <p className="text-xs font-medium text-danger">{error}</p>
            )}
        </div>
    );
}

function PasswordFieldControl({
    autoComplete,
    description,
    error,
    htmlFor,
    label,
    onToggleVisibility,
    placeholder,
    register,
    showPassword,
}: {
    autoComplete: string;
    description?: string;
    error?: string;
    htmlFor: string;
    label: string;
    onToggleVisibility: () => void;
    placeholder: string;
    register: UseFormRegisterReturn;
    showPassword: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label
                htmlFor={htmlFor}
                className="flex items-center gap-2 text-sm font-semibold text-slate-800"
            >
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                {label}
            </Label>
            <div className="relative">
                <Input
                    id={htmlFor}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    aria-invalid={!!error}
                    className="h-11 border-slate-200 bg-slate-50 pr-11 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                    {...register}
                />
                <button
                    type="button"
                    onClick={onToggleVisibility}
                    aria-label={
                        showPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
            {description && !error && (
                <p className="text-xs leading-relaxed text-slate-500">
                    {description}
                </p>
            )}
            {error && (
                <p className="text-xs font-medium text-danger">{error}</p>
            )}
        </div>
    );
}

function ProfileTabButton({
    active,
    icon,
    label,
    onClick,
}: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all cursor-pointer",
                active
                    ? "bg-white text-primary shadow-sm shadow-slate-900/5"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800",
            )}
        >
            {icon}
            {label}
        </button>
    );
}
