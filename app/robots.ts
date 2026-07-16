import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/dashboard/",
        "/user/",
        "/organizer/account",
        "/organizer/check-in/",
        "/organizer/communities/",
        "/organizer/dashboard",
        "/organizer/finance/",
        "/organizer/my-event/",
        "/organizer/profile",
        "/organizer/team",
        "/organizer/create-event",
        "/checkout/",
        "/orders/",
        "/payment/",
        "/my-orders",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
