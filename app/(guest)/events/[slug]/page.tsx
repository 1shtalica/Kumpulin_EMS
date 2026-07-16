import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventDetailHeader from "@/components/eventdetail/EventDetailHeader";
import EventDetailContent from "@/components/eventdetail/EventDetailContent";
import {EventService} from "@/services/event-service";
import type { Event } from "@/types/event";

const kumpulinLogo = "/kumpulin_wordmark.svg";

const getEventDescription = (description: Event["description"]) => {
  if (typeof description === "string") return description;
  if (description && typeof description === "object" && "content" in description) {
    const content = (description as { content?: unknown }).content;
    return typeof content === "string" ? content : undefined;
  }
  return undefined;
};

const getEventStructuredData = (event: Event) => {
  const primaryImage =
    event.images?.find((image) => image.is_primary)?.image_url ||
    event.images?.[0]?.image_url;
  const lowestTicketPrice = event.ticket_categories?.reduce<number | undefined>(
    (lowest, ticket) =>
      lowest === undefined ? ticket.price : Math.min(lowest, ticket.price),
    undefined,
  );

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: getEventDescription(event.description),
    startDate: event.event_start_date,
    endDate: event.event_end_date,
    image: primaryImage ? [primaryImage] : undefined,
    eventAttendanceMode: event.is_online
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.is_online
      ? { "@type": "VirtualLocation", url: event.meeting_url }
      : {
          "@type": "Place",
          name: event.address.title || event.address.city,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.address.raw_address,
            addressLocality: event.address.city,
            addressRegion: event.address.province,
            postalCode: event.address.postal_code,
            addressCountry: "ID",
          },
        },
    organizer: {
      "@type": "Organization",
      name: event.organizer.name,
      url: event.organizer.slug ? `/organizer/${event.organizer.slug}` : undefined,
    },
    offers:
      lowestTicketPrice === undefined
        ? undefined
        : {
            "@type": "Offer",
            url: `/events/${event.slug}`,
            price: lowestTicketPrice,
            priceCurrency: "IDR",
            availability: "https://schema.org/InStock",
          },
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await EventService.getEventBySlug(slug).catch(() => null);

  if (!event) {
    return {
      title: "404 - Kumpulin",
      description: "Event tidak ditemukan",
      openGraph: {
        title: "404 - Kumpulin",
        description: "Event tidak ditemukan",
        url: "/",
        type: "website",
        images: [
          {
            url: kumpulinLogo,
            width: 1175,
            height: 327,
            alt: "Logo Kumpulin",
            type: "image/svg+xml",
          },
        ],
      },
    };
  }

  const eventImage =
    event.images?.find((image) => image.is_primary)?.image_url ||
    event.images?.[0]?.image_url ||
    kumpulinLogo;

  return {
    title: `${event.title} - Kumpulin`,
    description: `Ikuti acara ${event.title} sekarang juga di Kumpulin.`,
    alternates: {
      canonical: `/events/${slug}`,
    },
    openGraph: {
      title: event.title,
      description: `Dapatkan Tiket ${event.title} sekarang juga di 🎊Kumpulin!`,
      url: `/events/${slug}`,
      type: "website",
      images: [
        {
          url: eventImage,
          alt: `${event.title} - Kumpulin`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: `Dapatkan Tiket ${event.title} sekarang juga di Kumpulin!`,
      images: [eventImage],
    },
  };
}

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await EventService.getEventBySlug(slug);

  if (!event) {
    return notFound();
  }

  const structuredData = getEventStructuredData(event);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <EventDetailHeader />
      <main className="min-h-screen bg-[#f9fafb]">
        <EventDetailContent event={event} />
      </main>
    </>
  );
}
