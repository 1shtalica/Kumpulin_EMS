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

// ⭐ Buat skema register

export default function RegisterForm() {
  //  ⭐ Buat daftar state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
