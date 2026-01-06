"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
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

// NOTES
// GANTI REGISTER KE LOGIN  DI SETUP RHF

// ⭐ BUAT SKEMA ZOD SISI FORM
const loginSchema = z.object({
  email: z
    .email({ message: "Format email tidak valid" })
    .min(1, { message: "Email wajib diisi" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  //   ⭐ buat daftar state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ⭐ SETUP RHF
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // Sambungkan ke Zod
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ⭐ FUNGSI HANDLE SUBMIT
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    // --- AREA SIMULASI BACKEND ---
    console.log("🔥 FORM SUBMITTED!");
    console.log(
      "Format Data JSON yang akan dikirim ke BE:",
      JSON.stringify(data, null, 2)
    );

    // TODO: Nanti disini panggil service, misal:
    // try {
    //   await authService.login(data);
    //   router.push('/dashboard');
    // } catch (err) { ... }

    // Simulasi loading 2 detik biar kelihatan keren
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    // -----------------------------
  };

  // ⭐ FORM LOGIN
  return (
    <div>
      {/* Kembali ke landingpage */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        <p>Kembali ke beranda</p>
      </Link>

      {/* ⭐ BAGIAN HEADER */}
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <h1 className="font-semibold text-3xl mb-4">
            🎉
            <span className="bg-linear-to-r from-kumpulinPurple to-kumpulinGreen  text-transparent bg-clip-text">
              kumpul.in
            </span>
          </h1>

          <CardTitle className="font-bold text-3xl ">
            Selamat Datang Kembali
          </CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Masuk ke akun kumpul.in kamu
          </CardDescription>
        </CardHeader>

        {/* Isi halaman login */}
        <CardContent>
          {/* Form Mulai Disini */}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            {/* Input Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                disabled={isLoading}
                // Hook Form Register:
                {...register("email")}
              />
              {/* Error Message Manual (Lebih simpel dari komponen FormField) */}
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Input Password */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...register("password")}
                />
                {/* Tombol Mata Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Tombol Submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
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
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>

          {/* ⭐ LOGIN WITH GOOGLE */}
          <Button variant="outline" className="w-full" disabled={isLoading}>
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

          {/* ⭐ LOGIN WITH RTPINTAR */}
          {/* DISINI  */}

          {/* ⭐ KE HALAMAN REGISTER */}
          <div className="text-center text-sm text-slate-600 mt-2">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
