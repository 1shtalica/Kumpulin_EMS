import LandingNavbar from "@/components/landingpage/LandingNavbar";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";
import InfiniteEventList from "@/components/explore/InfiniteEventList";
import { INDONESIA_REGIONS } from "@/constants/regions";
import { EventService } from "@/services/event-service";
import type { HomeEventCard } from "@/types/event";
import { Suspense } from "react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata = {
  title: "Cari Event - Kumpulin",
  description: "Temukan berbagai acara seru di sekitarmu.",
};

const getProvinceFilter = (value: string) => {
  if (!value || value === "online") return "";

  return (
    INDONESIA_REGIONS.find((province) => province.id === value)?.name ?? value
  );
};

export default async function ExplorePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const typeFilter =
    typeof searchParams.type === "string" ? searchParams.type : "";
  const categoryFilter =
    typeof searchParams.category === "string" ? searchParams.category : "";
  const rawProvinceFilter =
    typeof searchParams.province === "string"
      ? searchParams.province
      : typeof searchParams.location === "string"
        ? searchParams.location
        : "";
  const provinceFilter = getProvinceFilter(rawProvinceFilter);
  const priceFilter =
    typeof searchParams.price === "string" ? searchParams.price : "";
  const sortOption =
    typeof searchParams.sort === "string" ? searchParams.sort : "";

  const LIMIT = 12;

  let initialEvents: HomeEventCard[] = [];
  let initialHasMore = false;
  let initialNextCursor: string | null = null;
  let error: string | null = null;

  try {
    const response = await EventService.getEvents({
      limit: LIMIT,
      type: typeFilter,
      q: query,
      category: categoryFilter,
      province: provinceFilter,
      price: priceFilter,
      sort: sortOption,
    });
    initialEvents = response.data;
    initialHasMore = response.pagination.has_more;
    initialNextCursor = response.pagination.next_cursor;
  } catch (err) {
    console.error("Failed to fetch events:", err);
    error = "Gagal memuat event. Silakan coba lagi nanti.";
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <main className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-20 grow">
        <Suspense fallback={<div className="w-full h-32" />}>
          <SearchBar />
        </Suspense>

        <div className="mb-8 relative z-20">
          <Suspense fallback={<div className="w-full h-16" />}>
            <FilterBar />
          </Suspense>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {query && (
          <div className="mb-6 text-muted text-sm md:text-base">
            Hasil pencarian untuk <strong>&quot;{query}&quot;</strong>
          </div>
        )}

        <InfiniteEventList
          initialEvents={initialEvents}
          initialHasMore={initialHasMore}
          initialNextCursor={initialNextCursor}
          searchQuery={query}
          typeFilter={typeFilter}
          categoryFilter={categoryFilter}
          provinceFilter={provinceFilter}
          priceFilter={priceFilter}
          sortOption={sortOption}
          limit={LIMIT}
        />
      </main>
    </div>
  );
}
