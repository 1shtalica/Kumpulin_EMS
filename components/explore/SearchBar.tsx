"use client";

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 1. Logika Update URL (Dipisah agar bisa dipanggil Instant atau Debounce)
  const updateQuery = (term: string) => {
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    params.delete("page"); // Reset pagination
    params.delete("offset");

    // Update URL
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // 2. Versi Debounce (Untuk auto-update saat ngetik)
  // Saya turunkan ke 500ms agar lebih responsif, 1000ms terlalu lama
  const debouncedSearch = useDebouncedCallback((term: string) => {
    updateQuery(term);
  }, 500);

  // 3. Handle Keyboard Event (Untuk tombol Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Ambil value dari target input
      const target = e.currentTarget;
      // Batalkan debounce yang sedang berjalan (biar gak double request)
      debouncedSearch.cancel();
      // Eksekusi langsung
      updateQuery(target.value);
      // Opsional: Hilangkan fokus keyboard (blur) agar keyboard HP turun
      target.blur();
    }
  };

  return (
    <section className="w-full pt-28 md:pt-36 pb-4 relative z-10">
      <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-5 text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Eksplorasi <span className="text-primary relative inline-block">
            Event Seru
            <svg className="absolute -bottom-1.5 left-0 w-full h-2 text-primary/20 -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0 15 Q 50 0 100 15 L 100 20 L 0 20 Z" fill="currentColor" />
            </svg>
          </span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
          Temukan dan ikuti berbagai acara menarik di sekitarmu, mulai dari konser, workshop, hingga seminar.
        </p>

        <div className="relative mt-6 md:mt-8 group w-full">
          <div className="relative flex items-center w-full bg-white backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[1.5rem] sm:rounded-full p-1.5 lg:p-2 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">

            <div className="pl-3 sm:pl-4 pr-1 sm:pr-2 flex items-center justify-center shrink-0">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
            </div>

            <Input
              type="text"
              placeholder="Cari konser, workshop, atau seminar..."
              className="w-full h-10 lg:h-12 bg-transparent border-0 shadow-none text-sm md:text-base text-slate-900 placeholder:text-slate-400 font-medium focus-visible:ring-0 focus-visible:ring-offset-0 px-2 rounded-none"
              defaultValue={searchParams.get("q")?.toString()}
              onChange={(e) => debouncedSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="hidden sm:flex pr-0.5 shrink-0">
              <button
                type="button"
                className="h-10 lg:h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-full flex items-center justify-center font-semibold text-sm shadow-sm transition-all"
              >
                Cari
              </button>
            </div>

          </div>

          <div className="absolute -z-10 inset-0 -mx-4 -my-4 bg-primary/20 rounded-full blur-[40px] opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
