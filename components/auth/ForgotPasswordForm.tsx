"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Link href="/login" className="inline-flex items-center text-sm mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Login
      </Link>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Lupa Password?</CardTitle>
          <p className="text-sm text-muted-foreground">
            {!isSubmitted 
              ? "Masukkan email Anda untuk reset password"
              : "Kami telah mengirim link reset password"
            }
          </p>
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
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
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
                className="w-full"
                onClick={handleResend}
                disabled={isLoading}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isLoading ? "Mengirim..." : "Kirim Ulang"}
              </Button>

              <Link href="/login" className="block text-sm text-blue-600 hover:underline">
                Kembali ke Login
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}