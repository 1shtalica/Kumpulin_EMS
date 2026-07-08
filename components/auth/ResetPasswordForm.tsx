"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import * as z from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/lib/validator/auth";
import { AuthService } from "@/services/auth-service";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");
  const token = rawToken?.includes("/") ? rawToken.split("/")[0] : rawToken;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      notFound();
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    setIsLoading(true);
    const toastId = toast.loading("Mereset password...");

    try {
      await AuthService.resetPassword({
        token,
        new_password: data.password,
      });
      toast.success("Password berhasil direset!", { id: toastId });
      router.push("/login");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      let errorMessage = "Gagal reset password.";

      if (axiosError.response?.status === 400) {
        errorMessage = "Token sudah kadaluarsa. Silakan request ulang.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      }

      toast.error("Reset gagal", { id: toastId });
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-slate-900/[0.07] backdrop-blur sm:p-6">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <div className="rounded-2xl border border-danger/20 bg-danger-light p-4 text-sm font-medium text-danger">
          Link reset password tidak valid atau sudah kadaluarsa.
        </div>
        <Button
          asChild
          variant="outline"
          className="mt-4 h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <Link href="/forgot-password">
            <ArrowLeft className="size-4" />
            Minta link baru
          </Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-xl shadow-slate-900/[0.07] backdrop-blur sm:p-6">
      <span className="absolute -left-3 top-28 size-6 rounded-full bg-[#f7f8fb]" />
      <span className="absolute -right-3 top-28 size-6 rounded-full bg-[#f7f8fb]" />
      <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />

      <div className="mb-5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold"
          >
            <Image
              src="/kumpulin_wordmark.svg"
              alt="Kumpulin Logo"
              height={40}
              width={120}
              priority
            />
          </Link>
          <span className="rounded-full border border-primary/20 bg-primary-light px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            Secure reset
          </span>
        </div>

        <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Password baru
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
            Buat password pengganti
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Gunakan password baru yang kuat agar akses akun tetap aman.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5">
        <div className="grid gap-2">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password baru
          </Label>
          <div className="relative">
            <Input
              startIcon={<Lock className="size-4 text-primary" />}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
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
              startIcon={<Lock className="size-4 text-primary" />}
              id="confirm_password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi password baru"
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

        {errors.root && (
          <div className="rounded-xl border border-danger/20 bg-danger-light px-3 py-2 text-sm font-medium text-danger">
            {errors.root.message}
          </div>
        )}

        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary-light/70 p-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
            <ShieldCheck className="size-4" />
          </span>
          <p className="text-xs leading-relaxed text-slate-600">
            Setelah password tersimpan, gunakan password baru untuk masuk ke
            akun Kumpul.in Anda.
          </p>
        </div>

        <Button
          type="submit"
          className="mt-1 h-10 w-full rounded-xl bg-primary text-sm font-semibold shadow-glow hover:bg-primary-hover"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Simpan password
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <Button
          asChild
          type="button"
          variant="outline"
          className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
          <Link href="/login">
            <ArrowLeft className="size-4" />
            Kembali ke login
          </Link>
        </Button>
      </form>
    </section>
  );
}
