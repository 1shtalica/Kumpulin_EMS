"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Home, Loader2 } from "lucide-react";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "../ui/checkbox";
import { AuthService } from "@/services/auth-service";

// ⭐ 2 skema register
const baseFields = {
  fullName: z.string().min(1, { message: "Nama lengkap harus diisi" }),
  email: z
    .email({ message: "Format email tidak valid" })
    .min(1, { message: "Email Wajib diisi" }),
  phoneNumber: z
    .string()
    .min(10, { message: "Nomor HP minimal 10 digit" })
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, {
      message: "Format nomor HP tidak valid (contoh: 08xx-xxxx-xxxx)",
    }),
  password: z
    .string()
    .min(8, { message: "Password minimal 8 karakter" })
    .regex(/[A-Z]/, { message: "Password harus mengandung huruf besar" })
    .regex(/[a-z]/, { message: "Password harus mengandung huruf kecil" })
    .regex(/[0-9]/, { message: "Password harus mengandung angka" }),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "Anda harus menyetujui syarat dan ketentuan",
  }),
};

const attendeeSchema = z
  .object({
    role: z.literal("attendee"),
    ...baseFields,
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

const organizerSchema = z
  .object({
    role: z.literal("organizer"),
    ...baseFields,
    organizerName: z.string().min(1, { message: "Nama Organizer wajib diisi" }),
    organizerType: z.enum(["Individu", "Komunitas", "Perusahaan", "Rt_Pintar"]),
    rtNumber: z.string().optional(),
    rwNumber: z.string().optional(),
    kelurahan: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        message: "Password tidak cocok",
        code: z.ZodIssueCode.custom,
      });
    }
    if (data.organizerType === "Rt_Pintar") {
      if (!data.rtNumber)
        ctx.addIssue({
          path: ["rtNumber"],
          message: "RT Wajib diisi",
          code: z.ZodIssueCode.custom,
        });
      if (!data.rwNumber)
        ctx.addIssue({
          path: ["rwNumber"],
          message: "RW Wajib diisi",
          code: z.ZodIssueCode.custom,
        });
      if (!data.kelurahan)
        ctx.addIssue({
          path: ["kelurahan"],
          message: "Kelurahan Wajib diisi",
          code: z.ZodIssueCode.custom,
        });
    }
  });

// Dipisahkan oleh discriminator role
const registerSchema = z.discriminatedUnion("role", [
  attendeeSchema,
  organizerSchema,
]);

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  type RegisterFormValues = z.infer<typeof registerSchema>;

  // Kondisional skema yang dipakai
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "attendee",
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
      organizerName: "",
      organizerType: "Individu",
      rtNumber: "",
      rwNumber: "",
      kelurahan: "",
    } as Partial<RegisterFormValues>,
  });

  // Buat ngecek kondisional form dari rhf
  const role = watch("role");
  const organizerType = watch("organizerType");

  const onSubmit = async (data: RegisterFormValues) => {
    console.log("🎯 Form Submitted!");
    try {
      setIsLoading(true);

      if (data.role === "attendee") {
        const response = await AuthService.registerUser({
          email: data.email,
          password: data.password,
          username: data.fullName,
          first_name: data.fullName,
          last_name: "",
          phone_number: data.phoneNumber,
        });
        console.log("Data Attendee:", response);
      } else {
        const response = await AuthService.registerOrganizer({
          email: data.email,
          password: data.password,
          username: data.fullName,
          first_name: data.fullName,
          last_name: "",
          phone_number: data.phoneNumber,
          name: data.organizerName,
          slug: "",
        });
        console.log("Data Organizer:", response);
      }

      console.log("Data:", data);
      // Handle success (redirect, toast, etc)
      // window.location.href = "/";
    } catch (error) {
      // Handle error
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

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

          <CardTitle className="font-bold text-3xl ">Register</CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Buat akun kumpul.in kamu
          </CardDescription>
        </CardHeader>

        {/* Isi card */}
        <CardContent>
          {/* Switcher role pada form register  */}
          <div className="grid gap-4 mb-6">
            <Label>Daftar Sebagai</Label>
            <RadioGroup
              value={role}
              onValueChange={(value) =>
                setValue("role", value as "attendee" | "organizer", {
                  shouldValidate: true,
                })
              }
            >
              <FieldLabel htmlFor="attendee">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Peserta Event</FieldTitle>
                    <FieldDescription>
                      Temukan dan ikuti berbagai event menarik
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="attendee" id="attendee" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="organizer">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Event Organizer</FieldTitle>
                    <FieldDescription>
                      Buat dan kelola event Anda sendiri
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="organizer" id="organizer" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </div>

          <form
            onSubmit={handleSubmit(
              onSubmit,
              // ⭐ Tambahkan error handler ini
              (errors) => {
                console.log("❌ VALIDASI GAGAL!");
                console.log("Errors:", errors);
                console.log("Form Values:", watch());
              },
            )}
            className="grid gap-4"
          >
            {/* 🌟 nama lengkap - email - no hp - password - confirm password */}

            {/* Input Fullname  */}
            <div className="grid gap-4">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masukkan nama lengkap"
                disabled={isLoading}
                {...register("fullName")}
                className={
                  errors.fullName
                    ? "border-red-500 focus-visible:ring-red-500 rounded-lg"
                    : "rounded-lg"
                }
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            {/* Input Email  */}
            <div className="grid gap-4">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isLoading}
                {...register("email")}
                className={
                  errors.fullName
                    ? "border-red-500 focus-visible:ring-red-500 rounded-lg"
                    : "rounded-lg"
                }
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            {/* Input No HP  */}
            <div className="grid gap-4">
              <Label htmlFor="phoneNumber">Nomor WhatsApp</Label>
              <Input
                id="phoneNumber"
                type="text"
                placeholder="08xxxxxxxxxx"
                disabled={isLoading}
                {...register("phoneNumber")}
                className={
                  errors.phoneNumber
                    ? "border-red-500 focus-visible:ring-red-500 rounded-lg"
                    : "rounded-lg"
                }
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* 🌟 Menampilkan field tambahan untuk organizer  */}
            {role === "organizer" && (
              <div className="grid gap-4">
                {/* Input nama organizer  */}
                <div className="grid gap-4">
                  <Label htmlFor="organizerName">Nama Organizer</Label>
                  <Input
                    id="organizerName"
                    type="text"
                    placeholder="Masukkan nama organisasi anda"
                    disabled={isLoading}
                    {...register("organizerName")}
                  />
                  {"organizerName" in errors && errors.organizerName && (
                    <p className="text-sm text-red-500">
                      {errors.organizerName.message}
                    </p>
                  )}
                </div>

                {/* Input tipe organizer  */}
                <div className="grid gap-4">
                  <Label>Tipe Organizer</Label>
                  <RadioGroup
                    value={organizerType}
                    onValueChange={(value) =>
                      setValue(
                        "organizerType",
                        value as
                        | "Individu"
                        | "Komunitas"
                        | "Perusahaan"
                        | "Rt_Pintar",
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                    className="grid grid-cols-1 sm:grid-cols-2"
                  >
                    <FieldLabel htmlFor="Individu">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Individu</FieldTitle>
                          <FieldDescription>
                            Satu orang menjadi pengelola
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="Individu" id="Individu" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="Komunitas">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Komunitas</FieldTitle>
                          <FieldDescription>
                            Komunitas menjadi pengelola
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="Komunitas" id="Komunitas" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="Perusahaan">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Perusahaan</FieldTitle>
                          <FieldDescription>
                            Perusahaan menjadi pengelola
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="Perusahaan" id="Perusahaan" />
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="Rt_Pintar">
                      <Field orientation="horizontal">
                        <FieldContent>
                          <FieldTitle>Rt Pintar</FieldTitle>
                          <FieldDescription>
                            Pengguna Rt Pintar menjadi pengelola
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="Rt_Pintar" id="Rt_Pintar" />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </div>

                {role === "organizer" && organizerType === "Rt_Pintar" && (
                  <div className="grid gap-4">
                    {/* Input no rt  */}
                    <div className="grid gap-4">
                      <Label htmlFor="rtNumber">Nomor RT</Label>
                      <Input
                        id="rtNumber"
                        type="text"
                        placeholder="Contoh: 01"
                        disabled={isLoading}
                        {...register("rtNumber")}
                      />
                      {"rtNumber" in errors && errors.rtNumber && (
                        <p className="text-sm text-red-500">
                          {errors.rtNumber.message}
                        </p>
                      )}
                    </div>
                    {/* Input no rw  */}
                    <div className="grid gap-4">
                      <Label htmlFor="rwNumber">Nomor RW</Label>
                      <Input
                        id="rwNumber"
                        type="text"
                        placeholder="Contoh: 01"
                        disabled={isLoading}
                        {...register("rwNumber")}
                      />
                      {"rwNumber" in errors && errors.rwNumber && (
                        <p className="text-sm text-red-500">
                          {errors.rwNumber.message}
                        </p>
                      )}
                    </div>
                    {/* Input kelurahan  */}
                    <div className="grid gap-4">
                      <Label htmlFor="kelurahan">Nama Kelurahan</Label>
                      <Input
                        id="kelurahan"
                        type="text"
                        placeholder="Masukkan nama kelurahan Anda"
                        disabled={isLoading}
                        {...register("kelurahan")}
                      />
                      {"kelurahan" in errors && errors.kelurahan && (
                        <p className="text-sm text-red-500">
                          {errors.kelurahan.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Input Password */}
            <div className="grid gap-4">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat password"
                  disabled={isLoading}
                  {...register("password")}
                  className={
                    errors.password
                      ? "border-red-500 focus-visible:ring-red-500 rounded-lg pr-10"
                      : "rounded-lg pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/* Input Confirm Password  */}
            <div className="grid gap-4">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500 rounded-lg pr-10"
                      : "rounded-lg pr-10"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
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
                  // Tambahkan mt-1 agar sejajar dengan baris pertama teks karena teks menggunakan leading-relaxed
                  className="mt-1"
                />

                <label
                  htmlFor="agreeToTerms"
                  className="text-sm font-normal leading-relaxed text-slate-600 cursor-pointer"
                >
                  Saya menyetujui{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:underline font-medium hover:text-blue-800 transition-colors"
                    target="_blank"
                    // Cegah klik link memicu checkbox (opsional, tapi UX bagus)
                    onClick={(e) => e.stopPropagation()}
                  >
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline font-medium hover:text-blue-800 transition-colors"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Kebijakan Privasi
                  </Link>
                </label>
              </div>

              {/* Pesan Error */}
              {errors.agreeToTerms && (
                // ml-7 disesuaikan agar lurus dengan teks (melewati lebar checkbox + gap)
                <p className="text-sm text-red-500 font-medium ml-7">
                  {errors.agreeToTerms.message}
                </p>
              )}
            </div>

            {/* Tombol Submit */}
            <Button
              type="submit"
              disabled={isLoading || !watch("agreeToTerms")}
              className="w-full bg-linear-to-r from-kumpulinPurple to-kumpulinGreen hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
            type="button"
            variant="outline"
            className="w-full font-bold rounded-lg"
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

          {/* ⭐ REGISTER WITH RTPINTAR */}
          <Button
            type="button"
            variant="rtpintar"
            className="w-full rounded-lg"
            disabled={isLoading}
          >
            <Home className="mr-2 h-4 w-4" />
            Lanjutkan dengan RT Pintar
          </Button>

          {/* ⭐ KE HALAMAN LOGIN */}
          <div className="text-center text-sm text-slate-600 mt-2">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Masuk sekarang
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
