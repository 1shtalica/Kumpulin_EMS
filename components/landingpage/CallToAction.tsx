"use client";

import { ArrowRight, Compass, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";

const ctaConfig = {
  guest: {
    eyebrow: "Mulai sebagai organizer",
    title: "Punya event yang ingin dipublikasikan?",
    desc: "Buat halaman event, atur tiket, dan kelola peserta dari satu tempat.",
    btnText: "Daftar Sekarang",
    link: "/register",
    Icon: Sparkles,
  },
  user: {
    eyebrow: "Temukan agenda baru",
    title: "Cari event seru hari ini?",
    desc: "Jelajahi konser, workshop, seminar, dan agenda komunitas yang sesuai minatmu.",
    btnText: "Jelajah Event",
    link: "/events",
    Icon: Compass,
  },
  organizer: {
    eyebrow: "Organizer workspace",
    title: "Siap bikin event berikutnya?",
    desc: "Buka dashboard pembuatan event, lengkapi detail acara, lalu mulai kelola tiket dan peserta.",
    btnText: "Buat Event",
    link: "/organizer/create-event",
    Icon: PlusCircle,
  },
};

export default function CallToAction() {
  const { user, isLoading } = useAuthStore();

  const content = isLoading
    ? ctaConfig.guest
    : user?.role === "organizer"
    ? ctaConfig.organizer
    : user?.role === "user"
    ? ctaConfig.user
    : ctaConfig.guest;
  const Icon = content.Icon;

  return (
    <section className="relative overflow-hidden bg-[#f9fafb] py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.18,
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-white p-5 shadow-md shadow-slate-900/5 md:p-7">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 text-primary md:block">
            <svg
              className="h-full w-full"
              viewBox="0 0 520 260"
              preserveAspectRatio="none"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M96 210C178 128 238 244 322 148C382 80 428 96 500 34"
                stroke="currentColor"
                strokeOpacity="0.11"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M230 42h160M268 72h104M330 102h92"
                stroke="currentColor"
                strokeOpacity="0.09"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <g fill="currentColor" fillOpacity="0.08">
                <rect x="364" y="146" width="58" height="58" rx="14" />
                <rect x="438" y="110" width="32" height="32" rx="10" />
                <circle cx="186" cy="70" r="11" />
              </g>
            </svg>
          </div>

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                <Icon size={14} />
                {content.eyebrow}
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold leading-tight text-slate-950 md:text-3xl">
                  {content.title}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                  {content.desc}
                </p>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="h-11 self-start rounded-xl px-5 text-sm font-semibold md:self-center"
            >
              <Link href={content.link}>
                {content.btnText}
                <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
