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

// ⭐ 2 skema register
// Skema Attendee
const baseSchema = z
  .object({
    // role: z.enum(["attendee", "organizer"]),
    fullName: z.string().min(2),
    email: z
      .email({ message: "Format email tidak valid" })
      .min(1, { message: "Email Wajib diisi" }),
    phoneNumber: z
      .string()
      .min(12, { message: "Nomor HP minimal 12 digit" })
      .regex(/^\d+$/, { message: "Nomor HP hanya boleh angka" }),
    password: z.string().min(8, { message: "Password minimal 8 karakter" }),
    confirmPassword: z.string(),
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

const attendeeSchema = baseSchema;

// Skema Organizer
const organizerSchema = baseSchema
  .and(
    z.object({
      organizerName: z
        .string()
        .min(1, { message: "Nama Organizer wajib diisi" }),
      organizerType: z.enum([
        "Individu",
        "Komunitas",
        "Perusahaan",
        "Rt_Pintar",
      ]),
      rtNumber: z.string().optional(),
      rwNumber: z.string().optional(),
      kelurahan: z.string().optional(),
    }),
  )
  .superRefine((data, ctx) => {
    // Validasi manual: Kalau tipe RT Pintar, wajib isi RT/RW
    if (data.organizerType === "Rt_Pintar") {
      if (!data.rtNumber)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RT Wajib diisi",
          path: ["rtNumber"],
        });
      if (!data.rwNumber)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RW Wajib diisi",
          path: ["rwNumber"],
        });
      if (!data.kelurahan)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RW Wajib diisi",
          path: ["kelurahan"],
        });
    }
  });

type AttendeeFormValues = z.infer<typeof attendeeSchema>;
type OrganizerFormValues = z.infer<typeof organizerSchema>;

export default function RegisterForm() {
  //  ⭐ Daftar state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"attendee" | "organizer">("attendee");

  // Kondisional skema yang dipakai
  const form = useForm({
    resolver: zodResolver(
      role === "attendee" ? attendeeSchema : organizerSchema,
    ),
    defaultValues: {
      // role: "attendee",
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      organizerName: "",
      organizerType: "Individu",
      rtNumber: "",
      rwNumber: "",
      kelurahan: "",
    },
  });

  const onSubmit = async (data: AttendeeFormValues | OrganizerFormValues) => {
    if (role === "attendee") {
      // Panggil API Register User Biasa
      // POST /api/auth/register-attendee
      // Payload: { fullName, email, password, role: 'user' }
      console.log("Data Attendee:", data);
    } else {
      // Panggil API Register EO (Transaction: Create User + Create Org)
      // POST /api/auth/register-organizer
      // Payload: { fullName, email, password, role: 'organizer', orgName, orgType, ... }
      console.log("Data EO:", data);
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
              onClick={() => setRole("attendee")}
            >
              Peserta Event
            </div>
            <div
              className={
                role === "organizer" ? "border-blue-500" : "border-gray-200"
              }
              onClick={() => setRole("organizer")}
            >
              Event Organizer
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
