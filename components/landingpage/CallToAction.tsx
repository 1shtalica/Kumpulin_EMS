"use client";

import { ArrowRight, Compass, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { useAuthStore } from "@/stores/auth-store";

// Definisi konten CTA berdasarkan role
const ctaConfig = {
  guest: {
    title: "Punya event?",
    desc: "Ciptakan eventmu dan jangkau ribuan peserta dengan mudah.",
    btnText: "Daftar Sekarang",
    link: "/register",
  },
  user: {
    title: "Cari event seru hari ini?",
    desc: "Temukan ratusan event menarik di sekitarmu — konser, workshop, seminar, dan masih banyak lagi!",
    btnText: "Jelajah Event",
    link: "/events",
  },
  organizer: {
    title: "Siap bikin event berikutnya?",
    desc: "Buat dan kelola eventmu sekarang, jangkau lebih banyak peserta dengan mudah.",
    btnText: "Buat Event",
    link: "/organizer/create-event",
  },
};

export default function CallToAction() {
  const { user, isLoading } = useAuthStore();

  // Pilih konten berdasarkan role.
  // Saat isLoading, tampilkan guest agar tidak ada layout shift saat halaman baru dibuka.
  const content = isLoading
    ? ctaConfig.guest
    : user?.role === "organizer"
    ? ctaConfig.organizer
    : user?.role === "user"
    ? ctaConfig.user
    : ctaConfig.guest;

  return (
    <section className="w-full bg-linear-to-r from-primary to-primary-hover py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Text Area */}
        <div className="text-white text-center md:text-left space-y-2">
          <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-white">
            {content.title}
          </h2>
          <p className="text-white/90 text-sm md:text-lg max-w-xl">
            {content.desc}
          </p>
        </div>

        {/* Button CTA */}
        <Button
          asChild
          variant="light"
          size="xl"
          className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] rounded-full"
        >
          <Link className="text-3xl" href={content.link}>
            {content.btnText}
          </Link>
        </Button>
      </div>
    </section>
  );
}
