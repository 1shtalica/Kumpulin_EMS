import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "../reusable/EventCard"; // Sesuaikan path import
import { EventService } from "@/services/event-service";

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
  {
    id: 7,
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
    id: 8,
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

export default async function UpcomingEvents() {
  let events: Awaited<ReturnType<typeof EventService.getEvents>> = [];

  try {
    events = await EventService.getEvents();
  } catch (error) {
    console.error("Failed to load random events:", error);
  }

  if (!events || events.length === 0) {
    return null;
  }
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Row 1: Title + Button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold text-accent">
              Event Segera Hadir
            </h2>
            <Button variant="link" asChild className="px-0 md:px-4">
              <Link
                href="/events?sort=terbaru"
                className="flex items-center gap-1"
              >
                Lihat Semua <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          {/* Row 2: Description */}
          <p className="text-muted">
            Jangan lewatkan event seru yang akan datang
          </p>
        </div>

        {/* GRID LAYOUT */}
        {/* Responsive Logic:
            - Mobile (< sm): 1 Kolom
            - Tablet (sm - lg): 2 Kolom
            - Desktop (>= lg): 3 Kolom (Agar 6 item pas jadi 2 baris)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              category={""}
              date={event.start_date}
              location={event.address_title}
              price={event.ticket_price}
              originalPrice={event.ticket_price}
              organizer={event.organizer_name}
              image={event.image_url}
              slug={event.slug}
              isHot={false}
              isOnline={event.is_online}
              isRtPintar={event.type === "internal"}
              ticketSold={event.total_sold}
              maxQuota={event.max_capacity}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
