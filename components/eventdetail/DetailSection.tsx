import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Dot,
  Plus,
  CheckCircle2,
} from "lucide-react";

import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";

export default function DetailSection() {
  return (
    <section className="w-full flex flex-col items-center justify-between relative z-20">
      <div className="w-full h-fit p-4 bg-white shadow rounded-2xl">
        <div className="flex flex-col gap-4">
          {/* Baris Kategori */}
          <div className="flex flex-row items-center gap-4 overflow-auto">
            {/* badge kategori (Contoh placeholder) */}
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
              Technology
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
              Event Publik
            </span>
          </div>

          {/* Judul event */}
          <h2 className="text-2xl font-bold text-accent">
            Tech Startup Meetup Jakarta 2024
          </h2>

          {/* Detail Event Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            {/* 1. Tanggal */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary">
                <Calendar size={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-muted">Tanggal</p>
                <p className="font-semibold text-accent">25 Desember 2024</p>
              </div>
            </div>

            {/* 2. Waktu */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                {/* FIX 3: Label diganti jadi Waktu */}
                <p className="text-sm text-muted">Waktu</p>
                <p className="font-semibold text-accent">
                  18:00 - 21:00 WIB
                </p>
              </div>
            </div>

            {/* 3. Lokasi */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary">
                <MapPin size={24} />
              </div>
              <div className="flex flex-col">
                {/* FIX 4: Label diganti jadi Lokasi */}
                <p className="text-sm text-muted">Lokasi</p>
                <p className="font-semibold text-accent">JCC, Hall A</p>
              </div>
            </div>

            {/* 4. Peserta / Attendee */}
            <div className="flex flex-row items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary">
                <Users size={24} />
              </div>
              <div className="flex flex-col">
                {/* FIX 5: Label diganti jadi Peserta */}
                <p className="text-sm text-muted">Peserta</p>
                <p className="font-semibold text-accent">
                  156/200 terdaftar
                </p>
              </div>
            </div>
          </div>

          {/* Pemisah  */}
          <Separator orientation="horizontal" />

          {/* Detail Profil Event Organizer  */}
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Wrapper Kiri: Foto + Teks (Tetap sebaris di mobile) */}
            <div className="flex flex-row items-center gap-3 w-full md:w-auto">
              {/* Avatar / Foto Profil */}
              <div className="shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-white font-bold text-lg overflow-hidden">
                  {/* Ganti dengan <Image /> jika ada URL gambar */}
                  SG
                </div>
              </div>

              {/* Teks Profil */}
              <div className="flex flex-col">
                {/* Baris 1: Nama + Verified Badge */}
                <div className="flex flex-row items-center gap-1">
                  <p className="font-semibold text-accent text-base">
                    Startup Grind Jakarta
                  </p>
                  <CheckCircle2
                    size={16}
                    className="text-blue-500 fill-blue-50"
                  />
                </div>
                {/* Baris 2: Stats */}
                <div className="flex flex-row items-center text-sm text-muted">
                  <p>12.500 pengikut</p>
                  <Dot size={16} />
                  <p>45 Events</p>
                </div>
              </div>
            </div>

            {/* Tombol Ikuti */}
            {/* FIX: w-full di mobile, w-fit di md */}
            <Button
              asChild
              className="w-full md:w-fit rounded-full"
              size="default"
            >
              <Link href="/">
                <Plus size={18} className="mr-1" />
                Ikuti
              </Link>
            </Button>
          </div>

          {/* Bagian Tentang Event  */}
          <div>
            <h4 className="font-bold mb-4">Tentang Event</h4>
            <p>
              Bergabunglah dengan kami dalam acara networking terbesar untuk
              para founder, developer, dan investor di Jakarta! Dalam event ini,
              Anda akan mendapatkan: • Keynote dari founder startup unicorn
              Indonesia • Panel diskusi tentang fundraising dan scaling •
              Workshop hands-on tentang product development • Networking session
              dengan 200+ peserta • Makan malam dan minuman gratis Acara ini
              cocok untuk: - Founder startup tahap awal hingga growth -
              Developer yang ingin membangun produk sendiri - Investor yang
              mencari peluang investasi - Profesional yang ingin switch ke
              startup
            </p>
            <p>
              Bergabunglah dengan kami dalam acara networking terbesar untuk
              para founder, developer, dan investor di Jakarta! Dalam event ini,
              Anda akan mendapatkan: • Keynote dari founder startup unicorn
              Indonesia • Panel diskusi tentang fundraising dan scaling •
              Workshop hands-on tentang product development • Networking session
              dengan 200+ peserta • Makan malam dan minuman gratis Acara ini
              cocok untuk: - Founder startup tahap awal hingga growth -
              Developer yang ingin membangun produk sendiri - Investor yang
              mencari peluang investasi - Profesional yang ingin switch ke
              startup
            </p>
            <p>
              Bergabunglah dengan kami dalam acara networking terbesar untuk
              para founder, developer, dan investor di Jakarta! Dalam event ini,
              Anda akan mendapatkan: • Keynote dari founder startup unicorn
              Indonesia • Panel diskusi tentang fundraising dan scaling •
              Workshop hands-on tentang product development • Networking session
              dengan 200+ peserta • Makan malam dan minuman gratis Acara ini
              cocok untuk: - Founder startup tahap awal hingga growth -
              Developer yang ingin membangun produk sendiri - Investor yang
              mencari peluang investasi - Profesional yang ingin switch ke
              startup
            </p>
          </div>

          {/* Bagian Rundown Acara  */}
          <div className="flex flex-col">
            <h4 className="font-bold mb-4">Rundown Acara</h4>

            {/* Daftar Node Rundown Acara  */}
            <div className="flex flex-col gap-2">
              <div className="w-full flex gap-4 p-4 rounded-lg bg-muted/10">
                <p>18:00</p>
                <p>Registration & Networking</p>
              </div>
              <div className="w-full flex gap-4 p-4 rounded-lg bg-muted/10">
                <p>18:00</p>
                <p>Registration & Networking</p>
              </div>
              <div className="w-full flex gap-4 p-4 rounded-lg bg-muted/10">
                <p>18:00</p>
                <p>Registration & Networking</p>
              </div>
              <div className="w-full flex gap-4 p-4 rounded-lg bg-muted/10">
                <p>18:00</p>
                <p>Registration & Networking</p>
              </div>
              <div className="w-full flex gap-4 p-4 rounded-lg bg-muted/10">
                <p>18:00</p>
                <p>Registration & Networking</p>
              </div>
            </div>
          </div>

          {/* Bagian Syarat & Ketentuan  */}
          {/* Setiap syarat dikasih point/dot  */}
          <div>
            <h4 className="font-bold">Syarat & Ketentuan</h4>
            <div className="flex gap-2">
              <Dot />
              <p>Syarat</p>
            </div>
            <div className="flex gap-2">
              <Dot />
              <p>Syarat</p>
            </div>
            <div className="flex gap-2">
              <Dot />
              <p>Syarat</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
