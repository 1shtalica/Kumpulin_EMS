import LandingNavbar from "@/components/landingpage/LandingNavbar";
import SearchBar from "@/components/explore/SearchBar";
import FilterBar from "@/components/explore/FilterBar";
import EventList from "@/components/explore/EventList";
import { EventService } from "@/services/event-service";
import type { Event } from "@/types/event";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ExplorePage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;

  // Fetch events from API
  let events: Event[] = [];
  let error: string | null = null;

  try {
    events = await EventService.getEvents({ limit: 10 });
  } catch (err) {
    console.error("Failed to fetch events:", err);
    error = "Gagal memuat event. Silakan coba lagi nanti.";
  }

  // Extract query params
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const category =
    typeof searchParams.category === "string" ? searchParams.category : "";
  const location =
    typeof searchParams.location === "string" ? searchParams.location : "";
  const priceType =
    typeof searchParams.price === "string" ? searchParams.price : "";
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : "Terbaru";

  // Client-side filtering (temporary until backend supports query params)
  let filteredEvents = events.filter((event) => {
    // Search filter - with null safety
    if (query) {
      const eventTitle = event.title?.toLowerCase() || "";
      if (!eventTitle.includes(query.toLowerCase())) {
        return false;
      }
    }

    // Category filter - with null safety
    if (category) {
      const eventCategory = event.category?.toLowerCase() || "";
      if (eventCategory !== category.toLowerCase()) {
        return false;
      }
    }

    // Location filter - with null safety
    if (location && location !== "semua_lokasi") {
      const eventLocation = event.location?.toLowerCase() || "";
      if (!eventLocation) return false; // Skip events without location

      const normalizedLocation = eventLocation.replace(/ /g, "_");
      const isLocationMatch = normalizedLocation === location;
      const isOnlineEvent = eventLocation === "online";
      const isOnlineFilter = location === "online";

      if (!isLocationMatch && !(isOnlineEvent && isOnlineFilter)) {
        return false;
      }
    }

    // Price type filter - with null safety
    const eventPrice = event.price ?? 0;
    if (priceType === "gratis" && eventPrice > 0) return false;
    if (priceType === "berbayar" && eventPrice === 0) return false;

    return true;
  });

  // Client-side sorting - with null safety
  if (sort === "Harga_Terendah") {
    filteredEvents.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (sort === "Harga_Tertinggi") {
    filteredEvents.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  }
  // Default "Terbaru" would need created_at field from backend

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="container mx-auto px-4 pb-20">
        <SearchBar />

        {/* Sticky Filter */}
        <div className="-mt-8 mb-8 relative z-20">
          <FilterBar />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6 text-muted text-sm md:text-base">
          Menampilkan <strong>{filteredEvents?.length}</strong> event
          {query && <span> untuk pencarian "{query}"</span>}
        </div>

        {/* Event List */}
        <EventList events={filteredEvents} />
      </main>
    </div>
  );
}
