"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import EventList from "./EventList";
import {
  EventListRequestError,
  EventService,
} from "@/services/event-service";
import type { HomeEventCard, InfiniteEventListProps } from "@/types/event";
import { Loader2 } from "lucide-react";

export default function InfiniteEventList({
  initialEvents,
  initialHasMore,
  initialNextCursor,
  searchQuery,
  typeFilter,
  categoryFilter,
  provinceFilter,
  locationFilter,
  priceFilter,
  sortOption,
  followingFilter,
  limit,
}: InfiniteEventListProps) {
  const [events, setEvents] = useState<HomeEventCard[]>(initialEvents);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialNextCursor,
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  const reloadFirstPage = useCallback(async () => {
    try {
      const result = await EventService.getEventsClient({
        limit,
        type: typeFilter,
        q: searchQuery,
        category: categoryFilter,
        province: provinceFilter,
        location: locationFilter,
        price: priceFilter,
        sort: sortOption,
        following: followingFilter,
      });

      setEvents(result.data);
      setHasMore(result.pagination.has_more);
      setNextCursor(result.pagination.next_cursor);
      setError(null);
    } catch (error) {
      console.error("[InfiniteEventList] Failed to reload first page:", error);
    }
  }, [
    limit,
    typeFilter,
    searchQuery,
    categoryFilter,
    provinceFilter,
    locationFilter,
    priceFilter,
    sortOption,
    followingFilter,
  ]);
  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || isLoading || !hasMore || !nextCursor) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await EventService.getEventsClient({
        cursor: nextCursor,
        limit,
        type: typeFilter,
        q: searchQuery,
        category: categoryFilter,
        province: provinceFilter,
        location: locationFilter,
        price: priceFilter,
        sort: sortOption,
        following: followingFilter,
      });

      setEvents((prev) => [...prev, ...result.data]);
      setHasMore(result.pagination.has_more);
      setNextCursor(result.pagination.next_cursor);
    } catch (error) {
      console.error("[InfiniteEventList] Failed to load more:", error);

      if (error instanceof EventListRequestError && error.status === 400) {
        try {
          const result = await EventService.getEventsClient({
            limit,
            type: typeFilter,
            q: searchQuery,
            category: categoryFilter,
            province: provinceFilter,
            location: locationFilter,
            price: priceFilter,
            sort: sortOption,
            following: followingFilter,
          });

          setEvents(result.data);
          setHasMore(result.pagination.has_more);
          setNextCursor(result.pagination.next_cursor);
          return;
        } catch (resetError) {
          console.error(
            "[InfiniteEventList] Failed to reload first page:",
            resetError,
          );
        }
      }

      setError("Gagal memuat event berikutnya. Silakan coba lagi.");
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [
    isLoading,
    hasMore,
    nextCursor,
    limit,
    typeFilter,
    searchQuery,
    categoryFilter,
    provinceFilter,
    locationFilter,
    priceFilter,
    sortOption,
    followingFilter,
  ]);


  useEffect(() => {
    void reloadFirstPage();
  }, [reloadFirstPage]);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      {
        rootMargin: "0px 0px 400px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    isFetchingRef.current = false;
    setEvents(initialEvents);
    setNextCursor(initialNextCursor);
    setHasMore(initialHasMore);
    setIsLoading(false);
    setError(null);
  }, [
    searchQuery,
    typeFilter,
    categoryFilter,
    provinceFilter,
    locationFilter,
    priceFilter,
    sortOption,
    followingFilter,
    initialEvents,
    initialHasMore,
    initialNextCursor,
  ]);

  return (
    <div>
      <EventList events={events} />

      <div ref={sentinelRef} className="h-2" aria-hidden="true" />

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin text-primary h-7 w-7" />
        </div>
      )}

      {error && !isLoading && (
        <p className="text-center text-danger text-sm py-6">{error}</p>
      )}

      {!hasMore && !isLoading && events.length > 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">
          Semua event sudah ditampilkan
        </p>
      )}
    </div>
  );
}
