"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Mail,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/lib/validator/auth";
import { AuthService } from "@/services/auth-service";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [timer, setTimer] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        setError,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    useEffect(() => {
        const email = new URLSearchParams(window.location.search).get("email");
        if (email) {
            setValue("email", email, { shouldValidate: true });
        }
    }, [setValue]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
        const toastId = toast.loading("Mengirim email reset...");
        try {
            await AuthService.forgotPassword(data.email);
            toast.success("Email terkirim!", { id: toastId });

            setSubmittedEmail(data.email);
            setIsSubmitted(true);
            setTimer(60);
        } catch (error) {
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
        if (timer > 0) return;

        setIsLoading(true);
        const toastId = toast.loading("Mengirim ulang email...");
        try {
            await AuthService.forgotPassword(submittedEmail);

            toast.success("Email terkirim ulang!", { id: toastId });
            setTimer(60);
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage =
                axiosError.response?.data?.message ||
                "Gagal mengirim ulang email.";

            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

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
                        Recovery
                    </span>
                </div>

                <div className="mt-4 border-t border-dashed border-slate-300 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        Akses akun
                    </p>
                    <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-950">
                        Reset password dengan email
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {!isSubmitted
                            ? "Masukkan email terdaftar untuk menerima tautan pemulihan akun."
                            : "Tautan reset sudah dikirim. Cek inbox atau folder spam Anda."}
                    </p>
                </div>
            </div>

            {!isSubmitted ? (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid gap-3.5"
                >
                    <div className="grid gap-2">
                        <Label
                            htmlFor="email"
                            className="text-sm font-semibold text-slate-700"
                        >
                            Email
                        </Label>
                        <Input
                            startIcon={<Mail className="size-4 text-primary" />}
                            id="email"
                            type="email"
                            placeholder="nama@email.com"
                            disabled={isLoading}
                            autoComplete="email"
                            aria-invalid={!!errors.email}
                            className="h-10 rounded-xl border-slate-200 bg-slate-50 text-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-xs font-medium text-danger">
                                {errors.email.message}
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
                            Link reset hanya dapat digunakan satu kali dan akan
                            mengikuti masa berlaku keamanan dari sistem.
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
                                Mengirim...
                            </>
                        ) : (
                            <>
                                Kirim link reset
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
            ) : (
                <div className="grid gap-3.5">
                    <div className="rounded-2xl border border-primary/20 bg-primary-light/75 p-4">
                        <div className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-glow">
                                <CheckCircle2 className="size-5" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">
                                    Link reset password telah dikirim
                                </p>
                                <p className="mt-1 wrap-break-words text-sm font-semibold text-primary">
                                    {submittedEmail}
                                </p>
                                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                    Buka email tersebut dari perangkat yang
                                    aman, lalu ikuti instruksi untuk membuat
                                    password baru.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed"
                        onClick={handleResend}
                        disabled={isLoading || timer > 0}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                Mengirim...
                            </>
                        ) : timer > 0 ? (
                            <>
                                <Mail className="size-4" />
                                Kirim ulang dalam {timer}s
                            </>
                        ) : (
                            <>
                                <Mail className="size-4" />
                                Kirim ulang email
                            </>
                        )}
                    </Button>

                    <Button
                        asChild
                        className="h-10 w-full rounded-xl bg-primary text-sm font-semibold shadow-glow hover:bg-primary-hover"
                    >
                        <Link href="/login">
                            Kembali ke login
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </section>
    );
}
