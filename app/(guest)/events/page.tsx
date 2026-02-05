import LandingNavbar from "@/components/landingpage/LandingNavbar";
import SearchBar from "@/components/jelajah/SearchBar";
import FilterBar from "@/components/jelajah/FilterBar";
import EventList from "@/components/jelajah/EventList";

const DUMMY_DB = [
  // ... (Data Dummy biarkan sama)
  {
    id: 1,
    title: "Java Jazz Festival 2025",
    category: "Musik",
    date: "12 Mar 2025",
    location: "DKI Jakarta",
    price: 850000,
    organizer: "Java Festival Production",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800",
    slug: "java-jazz-2025",
    isHot: true,
    isOnline: false,
    quota: 500,
    maxQuota: 1000,
  },
  {
    id: 2,
    title: "React JS Deep Dive Workshop",
    category: "Teknologi",
    date: "15 Mar 2025",
    location: "Online",
    price: 150000,
    originalPrice: 300000,
    organizer: "Code ID",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800",
    slug: "react-js-workshop",
    isHot: false,
    isOnline: true,
    quota: 45,
    maxQuota: 50,
  },
  {
    id: 3,
    title: "Lari Pagi Sehat 5K",
    category: "Olahraga",
    date: "20 Mar 2025",
    location: "Bandung",
    price: 0,
    organizer: "Indo Runners",
    image:
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800",
    slug: "lari-pagi-5k",
    isHot: false,
    isOnline: false,
    quota: 200,
    maxQuota: 200,
  },
  {
    id: 4,
    title: "Pameran Lukisan Abstrak",
    category: "Seni",
    date: "22 Mar 2025",
    location: "DI Yogyakarta",
    price: 50000,
    organizer: "Jogja Art",
    image:
      "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=800",
    slug: "pameran-lukisan",
    isHot: false,
    isOnline: false,
    quota: 10,
    maxQuota: 100,
  },
  {
    id: 5,
    title: "Seminar Bisnis Digital",
    category: "Bisnis",
    date: "25 Mar 2025",
    location: "Surabaya",
    price: 0,
    organizer: "BizGrowth",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800",
    slug: "seminar-bisnis",
    isHot: true,
    isOnline: false,
    quota: 150,
    maxQuota: 300,
  },
  {
    id: 6,
    title: "Festival Kuliner Nusantara",
    category: "Kuliner",
    date: "01 Apr 2025",
    location: "DKI Jakarta",
    price: 25000,
    organizer: "Jajan Fest",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800",
    slug: "festival-kuliner",
    isHot: true,
    isOnline: false,
    quota: 800,
    maxQuota: 1000,
  },
];

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ExplorePage(props: {
  searchParams: SearchParams;
}) {
  // 1. FIX NEXT.JS 15: AWAIT SEARCH PARAMS
  // Kita harus menunggu props ini resolve dulu
  const searchParams = await props.searchParams;

  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const category =
    typeof searchParams.category === "string" ? searchParams.category : "";
  const location =
    typeof searchParams.location === "string" ? searchParams.location : "";
  const priceType =
    typeof searchParams.price === "string" ? searchParams.price : "";
  const sort =
    typeof searchParams.sort === "string" ? searchParams.sort : "Terbaru";

  // 2. LOGIC FILTERING YANG LEBIH AMAN
  let filteredEvents = DUMMY_DB.filter((event) => {
    // A. Filter Pencarian
    if (query && !event.title.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }

    // B. Filter Kategori
    if (category && event.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    // C. Filter Lokasi (Logic Diperbaiki)
    if (location && location !== "semua_lokasi") {
      const normalizedLocation = event.location
        .toLowerCase()
        .replace(/ /g, "_");
      const isLocationMatch = normalizedLocation === location;
      const isOnlineException = location === "online" && event.isOnline;

      // Jika BUKAN match lokasi DAN BUKAN online exception -> Buang
      if (!isLocationMatch && !isOnlineException) {
        return false;
      }

      // JANGAN return true disini!
      // Biarkan dia lanjut ke pengecekan Harga di bawah.
    }

    // D. Filter Harga
    if (priceType === "gratis" && event.price > 0) return false;
    if (priceType === "berbayar" && event.price === 0) return false;

    // Jika lolos semua filter di atas, baru return true
    return true;
  });

  // 3. SORTING
  if (sort === "Harga_Terendah") {
    filteredEvents.sort((a, b) => a.price - b.price);
  } else if (sort === "Harga_Tertinggi") {
    filteredEvents.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main className="container mx-auto px-4 pb-20">
        <SearchBar />

        {/* Sticky Filter */}
        <div className="-mt-8 mb-8 relative z-20">
          <FilterBar />
        </div>

        <div className="mb-6 text-muted text-sm md:text-base">
          Menampilkan <strong>{filteredEvents.length}</strong> event
          {query && <span> untuk pencarian "{query}"</span>}
        </div>

        <EventList events={filteredEvents} />
      </main>
    </div>
  );
}
