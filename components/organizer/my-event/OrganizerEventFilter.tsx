"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";


// type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type filterItems = {
  title: string;
  value: string;
}

const statusFilter: filterItems[] = [
  { title: "Semua", value: "all" },
  { title: "Draft", value: "draft" },
  { title: "Diterbitkan", value: "published" },
  { title: "Pendaftaran Selesai", value: "registration closed" },
  { title: "Berlangsung", value: "ongoing" },
  { title: "Selesai", value: "finished" },
  { title: "Diarsipkan", value: "archived" },
  { title: "Dibatalkan", value: "cancelled" },
];

export default function MyEventFilter() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";

  const handleURL = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("offset");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const debounceSearch = useDebouncedCallback((term: string) => {
    handleURL("q", term);
  }, 500);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-accent">Event Saya</h2 >
          <p className="text-muted">Atur eventmu dengan mudah</p>
        </div>

        <Button variant="brand" size="lg" asChild>
          <Link href="/organizer/create-event">Buat Event</Link>
        </Button>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-5 w-5" />
        <Input
          type="text"
          className="w-full pl-12 h-12 bg-white rounded-full border-border text-base"
          defaultValue={query}
          onChange={(e) => debounceSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              debounceSearch.cancel();
              handleURL("q", e.currentTarget.value);
            }
          }}
        />
      </div>

      <div className="w-full bg-primary-light rounded-3xl flex flex-wrap justify-center md:justify-start items-center gap-2 p-4">
        {statusFilter.map((filter) => (
          <Button
            key={filter.value}
            variant={status === filter.value ? "brand" : "outline"}
            size="sm"
            onClick={() => handleURL("status", filter.value)}
            className="min-w-30 min-h-10 rounded-full"
          >
            {filter.title}
          </Button>
        ))}
      </div>
    </section>
  );
}