import LandingNavbar from "@/components/landingpage/LandingNavbar";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";
import InfiniteEventList from "@/components/explore/InfiniteEventList";
import { EventService } from "@/services/event-service";
import type { HomeEventCard } from "@/types/event";
import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata = {
  title: "Cari Event - Kumpulin",
  description: "Temukan berbagai acara seru di sekitarmu.",
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
  const category =
    typeof searchParams.category === "string" ? searchParams.category : "";
  const location =
    typeof searchParams.location === "string" ? searchParams.location : "";
  const priceType =
    typeof searchParams.price === "string" ? searchParams.price : "";

  let offset = parseInt(offsetStr, 10);
  if (isNaN(offset) || offset < 0) offset = 0;

  const LIMIT = 12;

  let initialEvents: HomeEventCard[] = [];
  let initialHasMore = false;
  let error: string | null = null;

  try {
    const response = await EventService.getEvents({
      limit: LIMIT + 1, // limit+1 trick: deteksi hasMore tanpa extra fetch kosong
      offset: 0,
      q: query,
    });
    // Jika BE kembalikan (LIMIT+1) item → masih ada data di batch berikutnya
    initialHasMore = response.data.length > LIMIT;
    // Potong item ke-13 sebelum di-pass ke client
    initialEvents = initialHasMore ? response.data.slice(0, LIMIT) : response.data;
  } catch (err) {
    console.error("Failed to fetch events:", err);
    error = "Gagal memuat event. Silakan coba lagi nanti.";
  }

  // TODO (iterasi filter): variable sort, category, location, priceType sudah
  // dibaca dari searchParams di atas. Akan diteruskan ke BE setelah endpoint
  // GET /events mendukung query params: is_online, price_type, sort_by.

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

        {/* Info pencarian */}
        {query && (
          <div className="mb-6 text-muted text-sm md:text-base">
            Hasil pencarian untuk <strong>"{query}"</strong>
          </div>
        )}

        <InfiniteEventList
          initialEvents={initialEvents}
          initialHasMore={initialHasMore}
          searchQuery={query}
          limit={LIMIT}
        />

      </main>
    </div>
  );
}
