import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

function buildQueryString(searchParams?: SearchParams) {
  if (!searchParams) return "";

  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default async function LegacyMyOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  redirect(`/user/my-orders${buildQueryString(await searchParams)}`);
}