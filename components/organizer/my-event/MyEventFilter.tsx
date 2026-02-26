"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STATUS_FILTERS = ["Semua", "Draft", "Diterbitkan", "Diarsipkan", "Dibatalkan"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function MyEventFilter() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("Semua");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-accent">Event Saya</h1>
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
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

      <div className="w-full bg-primary-light rounded-3xl flex flex-wrap justify-center md:justify-start items-center gap-2 p-4">
        {STATUS_FILTERS.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "brand" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className="min-w-30 min-h-10 rounded-full"
          >
            {filter}
          </Button>
        ))}
      </div>
    </section>
  );
}