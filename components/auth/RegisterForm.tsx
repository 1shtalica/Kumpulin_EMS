"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Ticket,
  User,
} from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { splitFullName } from "@/lib/utils";
import { registerSchema } from "@/lib/validator/auth";
import { AuthService } from "@/services/auth-service";

type RegisterFormValues = z.infer<typeof registerSchema>;

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
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
  );
}

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
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      agree_to_terms: false,
    } as Partial<RegisterFormValues>,
  });

  const agreeToTerms = watch("agree_to_terms");
  const { firstName, lastName } = splitFullName(watch("username"));

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Sedang mendaftar...");

    try {
      await AuthService.registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
        first_name: firstName,
        last_name: lastName,
      });
      toast.success("Akun berhasil dibuat!", { id: toastId });
      router.push("/login");
    } catch (error: unknown) {
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
      setIsLoading(true);
      const toastId = toast.loading("Memproses registrasi Google...");

      try {
        await AuthService.googleAuth({ code: response.code });
        toast.success("Akun berhasil dibuat!", { id: toastId });
        window.location.href = "/get-started";
      } catch {
        toast.error("Registrasi gagal", { id: toastId });
        setError("root", {
          type: "manual",
          message: "Gagal registrasi dengan Google. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Registrasi gagal");
      setError("root", {
        type: "manual",
        message: "Gagal terhubung dengan Google.",
      });
    },
    flow: "auth-code",
  });

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-slate-900/[0.07] backdrop-blur sm:p-6">
      <span className="absolute -left-3 top-28 size-6 rounded-full bg-[#f7f8fb]" />
      <span className="absolute -right-3 top-28 size-6 rounded-full bg-[#f7f8fb]" />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary via-[#10b981] to-primary" />

      <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-glow">
              <Ticket className="size-4" />
            </span>
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              kumpul.in
            </span>
          </Link>
          <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#047857]">
            New pass
          </span>
        </div>

        <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Akun baru
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
            Buat akses Kumpul.in
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Simpan tiket, ikuti komunitas, dan buka dashboard organizer saat
            dibutuhkan.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2.5">
        <div className="grid gap-2">
          <Label
            htmlFor="username"
            className="text-sm font-semibold text-slate-700"
          >
            Nama pengguna
          </Label>
          <Input
            startIcon={<User className="size-4 text-slate-400" />}
            id="username"
            type="text"
            placeholder="Masukkan nama pengguna"
            disabled={isLoading}
            autoComplete="username"
            aria-invalid={!!errors.username}
            className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-xs font-medium text-danger">
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email
          </Label>
          <Input
            startIcon={<Mail className="size-4 text-slate-400" />}
            id="email"
            type="email"
            placeholder="nama@email.com"
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              startIcon={<Lock className="size-4 text-slate-400" />}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Buat password"
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-10 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <Label
            htmlFor="confirm_password"
            className="text-sm font-semibold text-slate-700"
          >
            Konfirmasi password
          </Label>
          <div className="relative">
            <Input
              startIcon={<Lock className="size-4 text-slate-400" />}
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi password"
              disabled={isLoading}
              autoComplete="new-password"
              aria-invalid={!!errors.confirm_password}
              className="h-10 rounded-xl border-slate-200 bg-slate-50 pr-10 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
              {...register("confirm_password")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan konfirmasi password"
                  : "Tampilkan konfirmasi password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="text-xs font-medium text-danger">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <div className="grid gap-1.5 pt-0.5">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5">
            <Checkbox
              id="agree_to_terms"
              disabled={isLoading}
              checked={agreeToTerms}
              onCheckedChange={(checked) => {
                setValue("agree_to_terms", checked === true, {
                  shouldValidate: true,
                });
              }}
              aria-invalid={!!errors.agree_to_terms}
              className="mt-0.5"
            />

            <label
              htmlFor="agree_to_terms"
              className="cursor-pointer text-xs leading-relaxed text-slate-600"
            >
              Saya menyetujui{" "}
              <Link
                href="/terms"
                className="font-semibold text-primary hover:text-primary-hover"
                target="_blank"
                onClick={(event) => event.stopPropagation()}
              >
                Syarat & Ketentuan
              </Link>{" "}
              dan{" "}
              <Link
                href="/privacy"
                className="font-semibold text-primary hover:text-primary-hover"
                target="_blank"
                onClick={(event) => event.stopPropagation()}
              >
                Kebijakan Privasi
              </Link>
              .
            </label>
          </div>
          {errors.agree_to_terms && (
            <p className="text-xs font-medium text-danger">
              {errors.agree_to_terms.message}
            </p>
          )}
        </div>

        {errors.root && (
          <div className="rounded-xl border border-danger/20 bg-danger-light px-3 py-2 text-sm font-medium text-danger">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !agreeToTerms}
          className="mt-1 h-10 w-full rounded-xl bg-primary text-sm font-semibold shadow-glow hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mendaftar...
            </>
          ) : (
            <>
              Daftar
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-3 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs font-medium text-slate-400">
          atau lanjutkan dengan
        </span>
        <Separator className="flex-1" />
      </div>

      <Button
        onClick={() => onGoogleSubmit()}
        type="button"
        variant="outline"
        className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        disabled={isLoading}
      >
        <GoogleIcon />
        Google
      </Button>

      <p className="mt-4 text-center text-sm text-slate-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary-hover"
        >
          Masuk sekarang
        </Link>
      </p>
    </section>
  );
}
