"use client";

import { useEffect, useState } from "react";
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

// ⭐ 2 skema register
const baseFields = {
  fullName: z.string().min(2),
  email: z
    .email({ message: "Format email tidak valid" })
    .min(1, { message: "Email Wajib diisi" }),
  phoneNumber: z
    .string()
    .min(12, { message: "Nomor HP minimal 12 digit" })
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, {
      message: "Format nomor HP tidak valid (contoh: 081234567890)",
    }),
  password: z
    .string()
    .min(8, { message: "Password minimal 8 karakter" })
    .regex(/[A-Z]/, { message: "Password harus mengandung huruf besar" })
    .regex(/[a-z]/, { message: "Password harus mengandung huruf kecil" })
    .regex(/[0-9]/, { message: "Password harus mengandung angka" }),
  confirmPassword: z.string(),
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
  //  ⭐ Daftar state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultValues = (role: "attendee" | "organizer") => ({
    role,
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    ...(role === "organizer" && {
      organizerName: "",
      organizerType: "Individu" as const,
      rtNumber: "",
      rwNumber: "",
      kelurahan: "",
    }),
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  // Kondisional skema yang dipakai
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "attendee",
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const role = form.watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);

      if (role === "attendee") {
        // const response = await registerAttendee(data);
        console.log("Data Attendee:", data);
      } else {
        // const response = await registerOrganizer(data);
        console.log("Data Organizer:", data);
      }

      // Handle success (redirect, toast, etc)
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

          <CardTitle className="font-bold text-3xl "></CardTitle>
          <CardDescription className="text-sm text-slate-400">
            Buat akun kumpul.in kamu
          </CardDescription>
          <div className="flex gap-4 mb-4">
            <div
              className={
                role === "attendee" ? "border-blue-500" : "border-gray-200"
              }
              onClick={() => form.setValue("role", "attendee")}
            >
              Daftar Menjadi Attendee
            </div>

            <div
              className={
                role === "organizer" ? "border-blue-500" : "border-gray-200"
              }
              onClick={() => form.setValue("role", "organizer")}
            >
              Daftar Menjadi Organizer
            </div>
          </div>
        </CardHeader>

        {/* Isi halaman login */}
        <CardContent></CardContent>

        <CardFooter className="flex flex-col gap-4">
          {/* ⭐ REGISTER WITH GITHUB */}
          {/* DISINI  */}

          {/* ⭐ REGISTER WITH RTPINTAR */}
          {/* DISINI  */}

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
