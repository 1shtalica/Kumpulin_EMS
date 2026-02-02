"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AxiosError } from "axios";

const forgotPasswordSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
  setIsLoading(true);
  const toastId = toast.loading("Mengirim email reset...");
  try {
    // TODO: await AuthService.forgotPassword(data.email);
    
    toast.success("Email terkirim!", { id: toastId });
    
    setSubmittedEmail(data.email);
    setIsSubmitted(true);
  } catch (error: any) {
    const axiosError = error as AxiosError<{ message: string }>;
    const errorMessage =
      axiosError.response?.data?.message ||
      "Gagal mengirim email. Coba lagi.";
    toast.error("Pengiriman gagal", { id: toastId });
    
    setError("root", {
      type: "manual",
      message: errorMessage,
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleResend = async () => {
  setIsLoading(true);
  const toastId = toast.loading("Mengirim ulang email...");
  try {
    // TODO: await AuthService.forgotPassword(submittedEmail);
    
    toast.success("Email terkirim ulang!", { id: toastId });
  } catch (error: any) {
    toast.error("Gagal mengirim ulang", { id: toastId });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div>
      

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <h1 className="font-bold text-3xl mb-4">
            🎉
            <span className="bg-linear-to-r from-primary to-secondary text-transparent bg-clip-text">
              kumpul.in
            </span>
          </h1>
          <CardTitle className="font-semibold text-xl sm:text-2xl text-accent">Lupa Password</CardTitle>
          <CardDescription className="text-sm text-muted">
            {!isSubmitted 
              ? "Masukkan email Anda untuk reset password"
              : "Kami telah mengirim link reset password"
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className={
                    errors.email
                      ? "border-danger rounded-lg"
                      : "rounded-lg"
                  }
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs sm:text-sm text-danger font-medium">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-linear-to-r from-primary to-secondary hover:opacity-90 rounded-lg font-bold" disabled={isLoading}>
                {isLoading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-secondary-light p-3">
                  <CheckCircle className="h-12 w-12 text-secondary" />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">
                  Link reset password telah dikirim ke:
                </p>
                <p className="font-medium">{submittedEmail}</p>
                <p className="text-xs text-muted-foreground">
                  Cek inbox atau folder spam Anda
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full hover:bg-primary/10"
                onClick={handleResend}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? "Mengirim..." : "Kirim Ulang"}
              </Button>

              <Link href="/login" className="block text-sm text-primary hover:underline">
                Kembali ke Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}