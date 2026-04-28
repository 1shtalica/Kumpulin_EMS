import LandingNavbar from "@/components/landingpage/LandingNavbar";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";
import EventList from "@/components/explore/EventList";
import { EventService } from "@/services/event-service";
import type { HomeEventCard } from "@/types/event";
import { Suspense } from "react";
import EventPagination from "@/components/explore/EventPagination";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata = {
  title: "Cari Event - Kumpulin",
  description:
    "Temukan berbagai acara musik, teknologi, dan olahraga seru di sekitarmu.",
};

export default async function ExplorePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : "Terbaru";
  const offsetStr =
    typeof searchParams.offset === "string" ? searchParams.offset : "0";

  let offset = parseInt(offsetStr, 10);
  if (isNaN(offset) || offset < 0) offset = 0;

  const LIMIT = 12;

  let events: HomeEventCard[] = [];
  let totalData = 0;
  let error: string | null = null;

  try {
    const response = await EventService.getEvents({
      limit: LIMIT,
      offset: offset,
      q: query,
    });
    events = response.data;
    totalData = response.total;
  } catch (err) {
    console.error("Failed to fetch events:", err);
    error = "Gagal memuat event. Silakan coba lagi nanti.";
  }

  const category =
    typeof searchParams.category === "string" ? searchParams.category : "";
  const location =
    typeof searchParams.location === "string" ? searchParams.location : "";
  const priceType =
    typeof searchParams.price === "string" ? searchParams.price : "";

  const filteredEvents = events.filter((event) => {
    // Note: ðŸŒŸ 'event.type' digunakan krn backend saat ini tdk memiliki endpoint 'category' yg dikirim
    if (category) {
      // Filter category diabaikan krn structure belum mensupportnya
    }
    if (location && location !== "semua_lokasi") {
      if (location === "online" && !event.is_online) return false;
    }
    if (priceType === "gratis" && event.ticket_price > 0) return false;
    if (priceType === "berbayar" && event.ticket_price === 0) return false;
    return true;
  });

  if (sort === "Harga_Terendah") {
    filteredEvents.sort((a, b) => a.ticket_price - b.ticket_price);
  } else if (sort === "Harga_Tertinggi") {
    filteredEvents.sort((a, b) => b.ticket_price - a.ticket_price);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f9fafb]">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.24,
          }}
        />
        <div className="absolute top-8 right-8 h-[22rem] w-[22rem] rounded-full bg-[#002cee14]" />
        <div className="absolute bottom-8 left-8 h-[18rem] w-[18rem] rounded-full bg-[#6366f112]" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">
      <LandingNavbar />
      <main className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-20 grow">
        {/* Search Bar - Interactive */}
        <Suspense fallback={<div className="w-full h-32" />}>
          <SearchBar />
        </Suspense>

        {/* Filter Bar - Interactive */}
        <div className="mb-8 relative z-20">
          <Suspense fallback={<div className="w-full h-16" />}>
            <FilterBar />
          </Suspense>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 text-muted text-sm md:text-base">
          Menampilkan {filteredEvents.length} event
          {query && (
            <span>
              {" "}
              untuk pencarian <strong>"{query}"</strong>
            </span>
          )}
        </div>

        {/* List UI - Server-Side Rendered */}
        <EventList events={filteredEvents} />

        {/* Pagination UI - Interactive */}
        <div className="mt-12 flex justify-center">
          <Suspense fallback={<div className="h-10 w-full" />}>
            <EventPagination
              limit={LIMIT}
              totalItems={totalData}
              currentOffset={offset}
            />
          </Suspense>
        </div>
      </main>
      </div>
    </div>
  );
}
