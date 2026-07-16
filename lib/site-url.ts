const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kumpul.in";

export const SITE_URL = configuredSiteUrl.replace(/\/$/, "");
export const SITE_URL_OBJECT = new URL(SITE_URL);
