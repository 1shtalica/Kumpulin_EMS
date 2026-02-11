"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { Checkbox } from "../ui/checkbox";
import { AuthService } from "@/services/auth-service";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { splitFullName } from "@/lib/name-utils";

// ⭐ 2 skema register
const registerSchema = z
  .object({
    fullName: z.string().min(1, { message: "Nama lengkap harus diisi" }),
    email: z
      .string()
      .min(1, { message: "Email wajib diisi" })
      .email({ message: "Format email tidak valid" }),
    password: z
      .string()
      .min(8, { message: "Password minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password harus mengandung huruf besar" })
      .regex(/[a-z]/, { message: "Password harus mengandung huruf kecil" })
      .regex(/[0-9]/, { message: "Password harus mengandung angka" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi" }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "Anda harus menyetujui syarat dan ketentuan",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Password tidak cocok",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    } as Partial<RegisterFormValues>,
  });


  const { firstName, lastName } = splitFullName(watch("fullName"));
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Sedang Mendaftar...");
    try {
      await AuthService.registerUser({
        email: data.email,
        password: data.password,
        username: data.fullName,
        first_name: firstName,
        last_name: lastName,
      });
      toast.success("Akun berhasil dibuat!", { id: toastId });
      router.push("/login");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Gagal mendaftar. Silakan coba lagi.";
      toast.error("Registrasi gagal", { id: toastId });

      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSubmit = useGoogleLogin({
    onSuccess: async (response) => {
      await AuthService.googleAuth({ code: response.code });
      toast.success("Akun berhasil dibuat!");
      router.push("/get-started");
    },
    onError: (error) => {
      toast.error("Registrasi gagal");
      console.error("Google Login Error:", error);
    },
    flow: "auth-code",
  });

  return (
    <Card className="w-full rounded-3xl py-10 px-4">
      <CardHeader className="space-y-1 text-center">
        <h1 className="font-bold text-3xl mb-4">
          🎉
          <span className="bg-linear-to-r from-primary to-secondary  text-transparent bg-clip-text">
            kumpul.in
          </span>
        </h1>

        <CardTitle className="font-semibold text-xl sm:text-2xl text-accent ">
          Mulai Perjalanan Anda Sekarang!
        </CardTitle>
        <CardDescription className="text-sm text-muted">
          Buat akun kumpul.in kamu
        </CardDescription>
      </CardHeader>

      {/* Isi card */}
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          {/* 🌟 nama lengkap - email - no hp - password - confirm password */}

          {/* Input Fullname  */}
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input
              startIcon={<User className="h-4 w-4 text-muted-foreground" />}
              id="fullName"
              type="text"
              placeholder="Masukkan nama lengkap"
              disabled={isLoading}
              autoComplete="name"
              {...register("fullName")}
              className={errors.fullName ? "border-danger" : ""}
            />
            {errors.fullName && (
              <p className="text-xs sm:text-sm text-danger font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>
          {/* Input Email  */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              startIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              autoComplete="email"
              {...register("email")}
              className={errors.email ? "border-danger" : ""}
            />
            {errors.email && (
              <p className="text-xs sm:text-sm text-danger font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Input Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                startIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Buat password"
                disabled={isLoading}
                autoComplete="new-password"
                {...register("password")}
                className={errors.password ? "border-danger pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs sm:text-sm text-danger font-medium">
                {errors.password.message}
              </p>
            )}
          </div>
          {/* Input Confirm Password  */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                startIcon={<Lock className="h-4 w-4 text-muted-foreground" />}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password"
                disabled={isLoading}
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-danger pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs sm:text-sm text-danger font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Input Agreement */}
          <div className="grid gap-2">
            {/* Gunakan div biasa dengan flex agar lebih mudah diatur daripada komponen <Field> bawaan */}
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox
                id="agreeToTerms"
                disabled={isLoading}
                checked={watch("agreeToTerms")}
                onCheckedChange={(checked) => {
                  setValue("agreeToTerms", checked === true, {
                    shouldValidate: true,
                  });
                }}
                aria-invalid={!!errors.agreeToTerms}
                className="mt-1"
              />

              <label
                htmlFor="agreeToTerms"
                className="text-sm font-normal leading-relaxed text-muted cursor-pointer"
              >
                Saya menyetujui{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline font-medium transition-colors"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  Syarat & Ketentuan
                </Link>{" "}
                dan{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium transition-colors"
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  Kebijakan Privasi
                </Link>
              </label>
            </div>

            {/* Pesan Error */}
            {errors.agreeToTerms && (
              <p className="text-xs sm:text-sm text-danger font-medium ml-7">
                {errors.agreeToTerms.message}
              </p>
            )}
          </div>

          {/* ⭐ Root Error Message */}
          {errors.root && (
            <div className="p-3 rounded-xl bg-danger-light border border-danger text-xs sm:text-sm font-medium text-danger">
              {errors.root.message}
            </div>
          )}

          {/* Tombol Submit */}
          <Button
            type="submit"
            disabled={isLoading || !watch("agreeToTerms")}
            className="w-full bg-linear-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-semibold text-md shadow-glow py-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mendaftar...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        {/* Divider "Atau Lanjutkan Dengan" */}
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-muted-foreground">
              Atau lanjutkan dengan
            </span>
          </div>
        </div>
        {/* ⭐ REGISTER WITH GOOGLE */}
        <Button
          onClick={() => onGoogleSubmit()}
          type="button"
          variant="outline"
          className="w-full font-semibold hover:bg-primary/10 rounded-2xl py-5 shadow-none"
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Lanjutkan dengan Google
        </Button>

        {/* ⭐ KE HALAMAN LOGIN */}
        <div className="text-center text-sm text-muted-foreground mt-2">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Masuk sekarang
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
