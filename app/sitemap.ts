import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { EventService } from "@/services/event-service";

export const revalidate = 3600;

const publicRoutes = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/events", changeFrequency: "daily" as const, priority: 0.9 },
  { path: "/komunitas", changeFrequency: "daily" as const, priority: 0.8 },
  { path: "/komunitas/explore", changeFrequency: "daily" as const, priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const eventEntries: MetadataRoute.Sitemap = [];
    let cursor: string | null = null;
    let hasMore = true;
    const seenCursors = new Set<string>();

    while (hasMore) {
      const result = await EventService.getEvents({ limit: 100, cursor });

      eventEntries.push(
        ...result.data.map((event) => ({
          url: `${SITE_URL}/events/${encodeURIComponent(event.slug)}`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          images: event.image_url ? [event.image_url] : undefined,
        })),
      );

      const nextCursor = result.pagination.next_cursor;
      hasMore =
        result.pagination.has_more &&
        Boolean(nextCursor) &&
        !seenCursors.has(nextCursor as string);

      if (nextCursor) seenCursors.add(nextCursor);
      cursor = nextCursor;
    }

    return [...staticEntries, ...eventEntries];
  } catch (error) {
    console.error("Unable to generate event sitemap entries:", error);
    return staticEntries;
  }
}
