import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "../reusable/EventCard"; // Sesuaikan path import

// DUMMY DATA: 6 Event yang akan segera dimulai
const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "React JS Advanced Workshop 2025",
    category: "Teknologi",
    date: "18 Jan 2025",
    location: "Online via Zoom",
    price: 100000,
    originalPrice: 250000,
    organizer: "Code ID",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    slug: "react-js-workshop",
    isHot: true,
    isOnline: true,
    isRtPintar: false,
    quota: 190,
    maxQuota: 200,
  },
  {
    id: 2,
    title: "Festival Kuliner Nusantara",
    category: "Kuliner",
    date: "19 Jan 2025",
    location: "Parkir Timur Senayan",
    price: 25000,
    organizer: "Jajan Fest",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
    slug: "festival-kuliner",
    isHot: false,
    isOnline: false,
    isRtPintar: true,
    quota: 450,
    maxQuota: 1000,
  },
  {
    id: 3,
    title: "Yoga Sunrise Jakarta",
    category: "Olahraga",
    date: "20 Jan 2025",
    location: "Hutan Kota GBK",
    price: 50000,
    organizer: "Sehat Bersama",
    // Link Baru: Yoga Outdoor
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",

    slug: "yoga-sunrise",
    isHot: false,
    isOnline: false,
    isRtPintar: false,
    quota: 28,
    maxQuota: 30,
  },
  {
    id: 4,
    title: "Pameran Lukisan Abstrak",
    category: "Seni",
    date: "21 Jan 2025",
    location: "Galeri Nasional",
    price: 0,
    organizer: "Art Indo",
    image:
      "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=800&auto=format&fit=crop",
    slug: "pameran-lukisan",
    isHot: false,
    isOnline: false,
    isRtPintar: false,
    quota: 120,
    maxQuota: 200,
  },
  {
    id: 5,
    title: "Seminar Bisnis Digital 2025",
    category: "Bisnis",
    date: "22 Jan 2025",
    location: "Ritz Carlton Jakarta",
    price: 750000,
    organizer: "BizGrowth",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop",
    slug: "seminar-bisnis",
    isHot: true,
    isOnline: false,
    isRtPintar: true,
    quota: 45,
    maxQuota: 50,
  },
  {
    id: 6,
    title: "Konser Amal Peduli Kasih",
    category: "Musik",
    date: "23 Jan 2025",
    location: "Balai Sarbini",
    price: 150000,
    organizer: "Yayasan Peduli",
    // Link Baru: Concert Stage
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop",
    slug: "konser-amal",
    isHot: true,
    isOnline: false,
    isRtPintar: false,
    quota: 500,
    maxQuota: 500,
  },
];

export default function UpcomingEvents() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Event Segera Hadir
            </h2>
            <p className="text-slate-500 mt-1">
              Daftar sekarang sebelum ketinggalan
            </p>
          </div>

          <Button variant="link" asChild className="px-0 md:px-4">
            <Link
              href="/events?sort=upcoming"
              className="flex items-center gap-1"
            >
              Lihat Semua <ArrowRight size={18} />
            </Link>
          </Button>
        </div>

        {/* GRID LAYOUT */}
        {/* Responsive Logic:
            - Mobile (< sm): 1 Kolom
            - Tablet (sm - lg): 2 Kolom
            - Desktop (>= lg): 3 Kolom (Agar 6 item pas jadi 2 baris)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {UPCOMING_EVENTS.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              category={event.category}
              date={event.date}
              location={event.location}
              price={event.price}
              originalPrice={event.originalPrice}
              organizer={event.organizer}
              image={event.image}
              slug={event.slug}
              isHot={event.isHot}
              isOnline={event.isOnline}
              isRtPintar={event.isRtPintar}
              quota={event.quota}
              maxQuota={event.maxQuota}
            />
          ))}
        </div>

        {/* Tombol Mobile (Opsional jika header sudah ada link) */}
        <div className="mt-8 flex justify-center md:hidden">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/events?sort=upcoming">Lihat Semua Event</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
