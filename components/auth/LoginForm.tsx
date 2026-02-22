"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
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
import { useAuthStore } from "@/stores/auth-store";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthService } from "@/services/auth-service";
import { toast } from "sonner"
import { Lock } from "lucide-react";


const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email Wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);

  const handlePostLoginRedirect = () => {
    const user = useAuthStore.getState().user;
    if (!user?.phone_number) {
      window.location.href = "/get-started";
      return;
    }
    window.location.href = user.role === "organizer"
      ? "/organizer/dashboard"
      : "/";
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Sedang Masuk...");

    try {
      await loginWithEmail(data);
      toast.success("Login berhasil!", { id: toastId });
      handlePostLoginRedirect();
    } catch (error: any) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        "Periksa kembali email dan password Anda.";

      toast.error("Login gagal", { id: toastId });
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
      setIsLoading(true);
      const toastId = toast.loading("Memproses login Google...");

      try {
        await loginWithGoogle(response.code);

        toast.success("Login berhasil!", { id: toastId });
        handlePostLoginRedirect();
      } catch (error) {
        toast.error("Login gagal", { id: toastId });
        setError("root", {
          type: "manual",
          message: "Gagal login dengan Google. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Login gagal");
      setError("root", {
        type: "manual",
        message: "Gagal terhubung dengan Google.",
      });
    },
    flow: "auth-code",
  });

  return (
    <div>
      <Card className="w-full rounded-3xl py-10 px-4">
        <CardHeader className="space-y-1 text-center">
          <h1 className="font-bold text-3xl mb-4">
            🎉
            <span className="bg-linear-to-r from-primary to-secondary  text-transparent bg-clip-text">
              kumpul.in
            </span>
          </h1>

          <CardTitle className="font-semibold text-xl sm:text-2xl text-accent ">Selamat Datang Kembali!</CardTitle>
          <CardDescription className="text-sm text-muted">
            Masuk ke akun kumpul.in kamu
          </CardDescription>
        </CardHeader>

        {/* Isi card */}
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Input Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                startIcon={<Mail className="h-4 w-4 text-muted-foreground" />}
                id="email"
                type="email"
                placeholder="nama@email.com"
                disabled={isLoading}
                autoComplete="email"
                className={
                  errors.email
                    ? "border-danger"
                    : ""
                }
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs sm:text-sm text-danger font-medium">{errors.email.message}</p>
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
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                  {...register("password")}
                  className={
                    errors.password
                      ? "border-danger"
                      : ""
                  }
                />
                {/* Tombol Mata Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-between items-start mt-1">
                {/* Area Pesan Error (Kiri) */}
                <div className="text-xs sm:text-sm text-danger font-medium">
                  {errors.password && <span>{errors.password.message}</span>}
                </div>

                {/* Area Forgot Password (Kanan) */}
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:underline font-medium ml-auto whitespace-nowrap"
                >
                  Lupa password?
                </Link>
              </div>
            </div>

            {/* ⭐ Root Error Message */}
            {errors.root && (
              <div className="p-3 rounded-lg bg-danger-light border border-danger text-xs sm:text-sm font-medium text-danger">
                {errors.root.message}
              </div>
            )}

            {/* Tombol Submit */}
            <Button
              type="submit"
              className="w-full py-5 bg-linear-to-r from-primary to-secondary hover:opacity-90 rounded-2xl font-semibold text-md shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Masuk...
                </>
              ) : (
                "Masuk"
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

          {/* ⭐ LOGIN WITH GOOGLE */}
          <Button
            type="button"
            variant="outline"
            className="w-full font-semibold hover:bg-primary/10 rounded-2xl py-5 shadow-none"
            disabled={isLoading}
            onClick={() => onGoogleSubmit()}
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

          {/* ⭐ KE HALAMAN REGISTER */}
          <div className="text-center text-sm text-muted mt-2">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-primary font-medium hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
