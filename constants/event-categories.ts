export const APPROVED_EVENT_CATEGORIES = [
  "Pendidikan",
  "Bisnis",
  "Teknologi",
  "Hiburan",
  "Olahraga",
  "Komunitas",
  "Budaya",
  "Keagamaan",
  "Kesehatan",
  "Lifestyle",
  "Sosial",
  "Seni",
  "Kuliner",
  "Pariwisata",
  "Gaming",
  "Keluarga",
  "Festival",
  "Workshop",
  "Seminar",
  "Pameran",
  "lainnya",
] as const;

export type ApprovedEventCategory = (typeof APPROVED_EVENT_CATEGORIES)[number];

export const isApprovedEventCategory = (
  category: unknown,
): category is ApprovedEventCategory =>
  typeof category === "string" &&
  APPROVED_EVENT_CATEGORIES.includes(category as ApprovedEventCategory);

export const toApprovedEventCategory = (
  category: unknown,
  fallback: ApprovedEventCategory = "lainnya",
): ApprovedEventCategory =>
  isApprovedEventCategory(category) ? category : fallback;

export const normalizeEventCategoryList = (payload: unknown): string[] => {
  const items = Array.isArray(payload) ? payload : [];
  const normalized = items
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object" && "name" in item) {
        const name = (item as { name?: unknown }).name;
        return typeof name === "string" ? name.trim() : "";
      }
      return "";
    })
    .filter((name) => name.length > 0);

  return normalized.length > 0 ? [...new Set(normalized)] : [...APPROVED_EVENT_CATEGORIES];
};
