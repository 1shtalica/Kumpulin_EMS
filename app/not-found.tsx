import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Compass,
    Home,
    Search,
    Ticket,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const quickLinks = [
    {
        href: "/events",
        label: "Jelajahi event",
        icon: Search,
    },
    {
        href: "/user/my-ticket",
        label: "Tiket saya",
        icon: Ticket,
    },
    {
        href: "/login",
        label: "Masuk akun",
        icon: Compass,
    },
];

const NotFound = () => {
    return (
        <main className="relative h-svh overflow-hidden bg-[#f8fafc] text-accent">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
            >
                <div
                    className="absolute inset-0 opacity-[0.22]"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/25 to-transparent" />
            </div>

            <section className="relative z-10 mx-auto flex h-svh w-full max-w-6xl flex-col justify-center px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                <div className="grid w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
                        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                            <Compass className="size-3.5" />
                            Halaman tidak ditemukan
                        </div>

                        <p className="mb-2 text-sm font-semibold uppercase text-muted">
                            Error 404
                        </p>
                        <h1 className="max-w-xl text-3xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                            Rute ini belum tersedia.
                        </h1>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-muted sm:text-base">
                            Link yang kamu buka mungkin sudah berubah,
                            dipindahkan, atau belum bisa diakses. Kembali ke
                            halaman utama atau lanjut cari event yang tersedia.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <Button
                                asChild
                                size="lg"
                                className="h-11 rounded-xl px-5"
                            >
                                <Link href="/">
                                    <Home className="size-4" />
                                    Kembali ke Beranda
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="h-11 rounded-xl border-slate-200 bg-white px-5 text-accent hover:border-primary/30"
                            >
                                <Link href="/events">
                                    <Search className="size-4" />
                                    Cari Event
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-6 hidden gap-1.5 border-t border-slate-100 pt-4 sm:grid sm:grid-cols-3">
                            {quickLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="group flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted transition hover:bg-slate-50 hover:text-primary"
                                    >
                                        <Icon className="size-4 text-slate-400 transition group-hover:text-primary" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="relative hidden min-h-[440px] border-l border-slate-200 bg-slate-50 lg:block">
                        <div
                            className="absolute inset-0 opacity-70"
                            style={{
                                backgroundImage:
                                    "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)",
                                backgroundSize: "44px 44px",
                            }}
                        />
                        <div className="absolute inset-6 flex items-center justify-center">
                            <div className="relative w-full max-w-sm rotate-[-4deg] rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/60">
                                <div className="absolute -left-4 top-1/2 size-8 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
                                <div className="absolute -right-4 top-1/2 size-8 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-muted">
                                            Kumpulin EMS
                                        </p>
                                        <h2 className="mt-2 text-7xl font-bold text-primary">
                                            404
                                        </h2>
                                    </div>
                                    <div className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                                        <Ticket className="size-6" />
                                    </div>
                                </div>

                                <div className="my-6 border-t border-dashed border-slate-200" />

                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted">
                                            Status
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            Tidak tersedia
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted">
                                            Tujuan
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            Halaman valid
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-muted">Aksi</span>
                                        <span className="font-semibold text-primary">
                                            Cari ulang
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-7 flex items-center gap-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                    <CalendarDays className="size-4 text-primary" />
                                    Event aktif tetap bisa dilihat dari halaman
                                    event.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default NotFound;
