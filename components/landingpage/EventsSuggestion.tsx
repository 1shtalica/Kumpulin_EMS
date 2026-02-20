import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "../reusable/EventCard";

const DUMMY_EVENTS = [
  {
    id: 1,
    title: "Jakarta Music Festival 2025",
    category: "Musik",
    date: "20 Jan 2025",
    location: "Gelora Bung Karno, Jakarta",
    price: 150000,
    originalPrice: 300000,
    organizer: "GBK Entertainment",
    image:
      "https://s3.temanbicara.web.id/test/test.jpg",
    slug: "jakarta-music-festival-2025",
    isHot: true,
    isOnline: false,
    isRtPintar: false,
    quota: 200,
    maxQuota: 200,
  },
  {
    id: 2,
    title: "Tech Conference Indonesia: AI Future",
    category: "Teknologi",
    date: "25 Jan 2025",
    location: "Grand Indonesia Hall",
    price: 350000,
    organizer: "Tech Indo",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    slug: "tech-conference-indonesia",
    isHot: false,
    isOnline: true,
    isRtPintar: true,
    quota: 89,
    maxQuota: 100,
  },
  {
    id: 3,
    title: "Workshop UI/UX Design untuk Pemula",
    category: "Desain",
    date: "01 Feb 2025",
    location: "Zoom Meeting",
    price: 50000,
    originalPrice: 150000,
    organizer: "Design Community ID",
    image:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
    slug: "workshop-ui-ux-design",
    isHot: false,
    isOnline: true,
    isRtPintar: false,
    quota: 45,
    maxQuota: 50,
  },
  {
    id: 4,
    title: "Lari Pagi Sehat 5K",
    category: "Olahraga",
    date: "05 Feb 2025",
    location: "Monas, Jakarta",
    price: 0,
    organizer: "Indo Runners",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800",
    slug: "lari-pagi-sehat-5k",
    isHot: false,
    isOnline: false,
    isRtPintar: true,
    quota: 234,
    maxQuota: 500,
  },
];

export default function UpcomingEvents() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-2 mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-3xl font-bold text-accent">
              Event Pilihan
            </h2>
            <Button variant="link" asChild>
              <Link href="/events?sort=Populer">
                Lihat Semua <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
          <p className="text-sm md:text-base text-muted">
            Jangan lewatkan event seru yang akan datang
          </p>
        </div>

        {/* GRID EVENT CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DUMMY_EVENTS.slice(0, 4).map((event, index) => (
            <div key={event.id} className={cn(index > 0 && "hidden md:block")}>
              <EventCard
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
