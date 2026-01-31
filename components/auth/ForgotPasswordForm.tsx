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
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    
    // TODO: Nanti diganti dengan real API call
    // await authService.forgotPassword(data.email)
    
    // Simulate API call
    setTimeout(() => {
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = async () => {
    setIsLoading(true);
    
    // TODO: Same API call as onSubmit
    
    setTimeout(() => {
      alert("Email terkirim ulang!");
      setIsLoading(false);
    }, 1000);
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
            // ====== FORM EMAIL INPUT ======
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
            // ====== SUCCESS STATE ======
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