"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, LayoutList, LayoutGrid } from "lucide-react";
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
  const layout = searchParams.get("layout") ?? "list";

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
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold bg-clip-text text-foreground tracking-tight">Event Saya</h2 >
          <p className="text-muted-foreground/80 text-[13px] font-medium">Atur eventmu dengan mudah</p>
        </div>

        <Button size="default" className="rounded-full px-5 font-semibold shadow-md shadow-primary/20" asChild>
          <Link href="/organizer/create-event">Buat Event</Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
          <Input
            type="text"
            className="w-full pl-11 h-11 bg-card rounded-full border-border text-[14px] shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all font-medium"
            placeholder="Cari event kamu di sini..."
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

        <div className="flex items-center bg-card rounded-full p-1 border border-border shadow-sm shrink-0">
          <Button
            variant={layout === "list" ? "brand" : "ghost"}
            size="icon"
            onClick={() => handleURL("layout", "list")}
            className={`h-9 w-9 rounded-full ${layout !== "list" && "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === "grid" ? "brand" : "ghost"}
            size="icon"
            onClick={() => handleURL("layout", "grid")}
            className={`h-9 w-9 rounded-full ${layout !== "grid" && "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-wrap justify-center md:justify-start items-center gap-2 py-1">
        {statusFilter.map((filter) => (
          <Button
            key={filter.value}
            variant={status === filter.value ? "brand" : "outline"}
            size="sm"
            onClick={() => handleURL("status", filter.value)}
            className="min-w-24 min-h-9 rounded-full px-4 font-medium transition-all"
          >
            {filter.title}
          </Button>
        ))}
      </div>
    </section>
  );
}