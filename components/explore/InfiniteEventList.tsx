"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import EventList from "./EventList";
import { EventService } from "@/services/event-service";
import type { HomeEventCard, InfiniteEventListProps } from "@/types/event";
import { Loader2 } from "lucide-react";

export default function InfiniteEventList({
  initialEvents,
  initialHasMore,
  searchQuery,
  limit,
}: InfiniteEventListProps) {
  // Akumulasi semua event (dimulai dari batch SSR)
  const [events, setEvents] = useState<HomeEventCard[]>(initialEvents);

  // Offset untuk fetch berikutnya: mulai dari panjang data SSR (bukan 0)
  const [offset, setOffset] = useState(initialEvents.length);

  // Apakah masih ada data di BE yang belum di-load?
  const [hasMore, setHasMore] = useState(initialHasMore);

  // Guard: mencegah double-fetch jika IntersectionObserver trigger berkali-kali
  const [isLoading, setIsLoading] = useState(false);

  // Ref ke div invisible (sentinel) yang diawasi IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Load More ───────────────────────────────────────────────────────────────
  // useCallback: agar fungsi tidak dibuat ulang setiap render.
  // Jika tidak pakai useCallback, useEffect [loadMore] akan terus re-run
  // setiap render → observer disconnect/reconnect terus → potensi infinite fetch.
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await EventService.getEventsClient({
        offset,
        limit,
        q: searchQuery,
      });

      setEvents((prev) => [...prev, ...result.data]); // append, bukan replace
      setOffset((prev) => prev + result.data.length);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("[InfiniteEventList] Failed to load more:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, offset, limit, searchQuery]);

  // ── IntersectionObserver ────────────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      {
        // rootMargin "400px ke bawah": fetch dimulai saat sentinel
        // masih 400px di bawah viewport → scroll terasa mulus tanpa jeda
        rootMargin: "0px 0px 400px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  // ── Reset saat Search Berubah ───────────────────────────────────────────────
  // Saat user ganti keyword, ExplorePage (server) fetch ulang dan kirim
  // initialEvents baru. Sync state client dengan props baru dari server.
  // Pakai [searchQuery] bukan [initialEvents] agar tidak loop
  // (initialEvents adalah array baru setiap render → reference selalu beda).
  useEffect(() => {
    setEvents(initialEvents);
    setOffset(initialEvents.length);
    setHasMore(initialHasMore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* EventList: pure display, tidak berubah */}
      <EventList events={events} />

      {/* Sentinel: div invisible tepat di bawah list.
          IntersectionObserver mengawasi div ini.
          Saat masuk zona rootMargin (400px), loadMore() dipanggil. */}
      <div ref={sentinelRef} className="h-2" aria-hidden="true" />

      {/* Loading spinner: muncul saat fetch batch baru berlangsung */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-primary h-7 w-7" />
        </div>
      )}

      {/* End state: semua event sudah dimuat */}
      {!hasMore && !isLoading && events.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">
          Semua event sudah ditampilkan ✓
        </p>
      )}
    </div>
  );
}