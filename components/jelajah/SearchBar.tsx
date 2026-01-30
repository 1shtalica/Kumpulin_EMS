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
    // HAPUS 'sticky top-0'. Gunakan relative.
    // pt-32 disesuaikan agar turun kebawah tidak ketabrak navbar fixed
    <section className=" border-b border-slate-200 pt-32 pb-10 relative z-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Cari Event Seru
          </h1>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Cari konser, workshop, atau seminar..."
              className="w-full pl-12 h-12 bg-white rounded-full border-slate-200 shadow-sm focus-visible:ring-kumpulinPurple text-base"
              // Default value dari URL
              defaultValue={searchParams.get("q")?.toString()}
              // Event Listener Hybrid
              onChange={(e) => debouncedSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
