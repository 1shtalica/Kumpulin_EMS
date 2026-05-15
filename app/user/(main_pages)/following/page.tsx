'use client';

import { useState } from "react";
import { Building2, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaymentInterstitial, { type PaymentStatus } from "@/components/Interstitial/PaymentInterstitial";
import CheckInInterstitial, { type CheckInStatus } from "@/components/Interstitial/CheckInInterstitial";

/* ─── Dummy Data ─────────────────────────────────────────────────────────── */

const DUMMY_FOLLOWING = [
  {
    id: "1",
    name: "Jakarta Event Co.",
    category: "Konferensi & Seminar",
    followers: 12_450,
    totalEvents: 48,
    avatarInitial: "JE",
    recentEvent: "Tech Summit 2026",
    recentDate: "10 Jun 2026",
  },
  {
    id: "2",
    name: "Komunitas Startup ID",
    category: "Networking & Komunitas",
    followers: 8_210,
    totalEvents: 31,
    avatarInitial: "KS",
    recentEvent: "Startup Pitch Night Vol.7",
    recentDate: "22 Jun 2026",
  },
  {
    id: "3",
    name: "Soundwave Productions",
    category: "Musik & Hiburan",
    followers: 24_800,
    totalEvents: 93,
    avatarInitial: "SW",
    recentEvent: "Malam Akustik - Open Stage",
    recentDate: "15 Jul 2026",
  },
  {
    id: "4",
    name: "Bumi Kreatif Studio",
    category: "Workshop & Seni",
    followers: 3_540,
    totalEvents: 17,
    avatarInitial: "BK",
    recentEvent: "Workshop Fotografi Urban",
    recentDate: "28 Jun 2026",
  },
  {
    id: "5",
    name: "EduNusantara",
    category: "Pendidikan & Pelatihan",
    followers: 6_780,
    totalEvents: 62,
    avatarInitial: "EN",
    recentEvent: "Bootcamp Data Science 2026",
    recentDate: "5 Agu 2026",
  },
];

/* ─── OrganizerCard ──────────────────────────────────────────────────────── */

function OrganizerCard({
  organizer,
}: {
  organizer: (typeof DUMMY_FOLLOWING)[number];
}) {
  return (
    <article className="group flex items-start gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:p-5">
      {/* Avatar */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-secondary font-bold text-base text-white shadow-md shadow-primary/20">
        {organizer.avatarInitial}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="truncate text-base font-semibold text-slate-900">
              {organizer.name}
            </h3>
            <p className="text-xs font-medium text-primary/70">
              {organizer.category}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0 rounded-full border-primary/30 px-4 text-xs font-semibold text-primary hover:bg-primary/5"
          >
            Mengikuti
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {organizer.followers.toLocaleString("id-ID")} pengikut
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            {organizer.totalEvents} event
          </span>
        </div>

        {/* Recent event */}
        <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate font-medium text-slate-700">
            {organizer.recentEvent}
          </span>
          <span className="ml-auto shrink-0 text-slate-400">
            {organizer.recentDate}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function FollowingPage() {
  const [paymentState, setPaymentState] = useState<{
    isOpen: boolean;
    status: PaymentStatus;
  }>({
    isOpen: false,
    status: "success",
  });

  const [checkInState, setCheckInState] = useState<{
    isOpen: boolean;
    status: CheckInStatus;
  }>({
    isOpen: false,
    status: "success",
  });

  const handlePayment = (status: PaymentStatus) => {
    setPaymentState({ isOpen: true, status });
  };

  const handleCheckIn = (status: CheckInStatus) => {
    setCheckInState({ isOpen: true, status });
  };

  return (
    <main className="min-h-[calc(100vh-136px)] bg-slate-50 -mx-6 md:-mx-8 px-6 md:px-8 py-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">

        {/* ── Header Block ── */}
        <header className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-sm">
          <div className="relative bg-linear-to-r from-primary via-primary to-secondary p-6 text-white sm:p-8">
            {/* Decorative blobs */}
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                  Organizer hub
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Following
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  Organizer yang kamu ikuti. Pantau event terbaru mereka dan jangan sampai ketinggalan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:min-w-72">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                    Diikuti
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {DUMMY_FOLLOWING.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                    Total Event
                  </p>
                  <p className="mt-1 text-3xl font-bold">
                    {DUMMY_FOLLOWING.reduce((sum, o) => sum + o.totalEvents, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-header info bar */}
          <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-3">
            <Building2 className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-slate-500">
              Menampilkan <span className="font-semibold text-slate-800">{DUMMY_FOLLOWING.length}</span> organizer yang kamu ikuti.
            </p>
          </div>
        </header>

        {/* ── Following List ── */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-950">
              Daftar Organizer
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Organizer di bawah ini adalah data dummy untuk pengembangan.
            </p>
          </div>

          <div className="space-y-3">
            {DUMMY_FOLLOWING.map((organizer) => (
              <OrganizerCard key={organizer.id} organizer={organizer} />
            ))}
          </div>
        </section>

        {/* ── Dev: Interstitial Test Panel ── */}
        <section className="rounded-[2rem] border border-dashed border-indigo-200 bg-indigo-50/60 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
              Dev Tools
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              Uji Interstitial Screen
            </h2>
          </div>
          <p className="mb-5 text-sm text-slate-500">
            Tombol di bawah hanya untuk keperluan testing — tidak akan muncul di production.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Payment */}
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
                Simulasi Payment
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handlePayment('success')}
                >
                  Berhasil
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handlePayment('failed')}
                >
                  Gagal
                </Button>
              </div>
            </div>

            {/* Check-in */}
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">
                Simulasi Check-in
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleCheckIn('success')}
                >
                  Berhasil
                </Button>
                <Button
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-50"
                  onClick={() => handleCheckIn('failed')}
                >
                  Gagal
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Interstitial Overlays ── */}
      <PaymentInterstitial
        isOpen={paymentState.isOpen}
        status={paymentState.status}
        orderNumber="ORD-8X912-2026"
        customerName="John"
        onClose={() => setPaymentState((prev) => ({ ...prev, isOpen: false }))}
        onPrimaryAction={() => {
          setPaymentState((prev) => ({ ...prev, isOpen: false }));
        }}
      />

      <CheckInInterstitial
        isOpen={checkInState.isOpen}
        status={checkInState.status}
        participantName="Rhein"
        ticketCategory="VIP - Early Bird"
        errorMessage="Tiket sudah digunakan pada 10:45 AM"
        onClose={() => setCheckInState((prev) => ({ ...prev, isOpen: false }))}
      />
    </main>
  );
}