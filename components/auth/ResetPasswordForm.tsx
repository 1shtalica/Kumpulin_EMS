"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { AuthService } from "@/services/auth-service";
import { resetPasswordSchema } from "@/lib/validator/auth";

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");
  const token = rawToken?.includes("/") ? rawToken.split("/")[0] : rawToken;

  useEffect(() => {
    if (!token) {
      notFound();
    }
  }, [token]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    // migrated to zod v4
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    const toastId = toast.loading("Mereset password...");
    try {
      await AuthService.resetPassword({
        token: token!,
        new_password: data.password,
      });
      toast.success("Password berhasil direset!", { id: toastId });
      router.push("/login");
    } catch (error: any) {
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

  // Token validation
  if (!token) {
    return (
      <Card className="w-full max-w-md mx-auto rounded-3xl py-10 px-4 shadow-lg border-border/50">
        <CardContent className="pt-6">
          <p className="text-center text-red-500">
            Link reset password tidak valid atau sudah kadaluarsa
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto rounded-3xl py-10 px-4 shadow-lg border-border/50">
      <CardHeader className="space-y-1 text-center">
        <h1 className="font-bold text-3xl mb-4">
          🎉
          <span className="bg-linear-to-r from-primary to-secondary text-transparent bg-clip-text">
            kumpul.in
          </span>
        </h1>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Masukkan password baru Anda
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                disabled={isLoading}
                autoComplete="new-password"
                className={
                  errors.password
                    ? "border-danger rounded-lg pr-10"
                    : "rounded-lg pr-10"
                }
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs sm:text-sm text-danger font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Ulangi password"
                disabled={isLoading}
                autoComplete="new-password"
                className={
                  errors.confirm_password
                    ? "border-danger rounded-lg pr-10"
                    : "rounded-lg pr-10"
                }
                {...register("confirm_password")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs sm:text-sm text-danger font-medium">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          {errors.root && (
            <div className="p-3 rounded-lg bg-danger-light border border-danger text-xs sm:text-sm font-medium text-danger">
              {errors.root.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-linear-to-r from-primary to-secondary hover:opacity-90 rounded-lg font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
