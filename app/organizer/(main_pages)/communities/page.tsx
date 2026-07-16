import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight,
    CalendarCheck2,
    FileText,
    Globe2,
    Info,
    Plus,
    Settings,
    ShieldCheck,
    UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Community, CommunityResponse } from "@/types/community";

const getApiBaseUrl = () =>
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

const readSetCookieHeaders = (headers: Headers): string[] => {
    const headersWithSetCookie = headers as Headers & {
        getSetCookie?: () => string[];
    };

    return (
        headersWithSetCookie.getSetCookie?.() ??
        (headers.get("set-cookie") ? [headers.get("set-cookie") as string] : [])
    );
};

const getCookieValue = (cookieHeader: string, name: string) =>
    cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.slice(name.length + 1);

async function getOrganizerCommunities(): Promise<{
    communities: Community[];
    errorMessage?: string;
}> {
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
        return {
            communities: [],
            errorMessage: "Konfigurasi API belum tersedia.",
        };
    }

    const cookieStore = await cookies();
    let accessToken = cookieStore.get("access_token")?.value;
    let cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    try {
        const fetchCommunities = () =>
            fetch(`${apiBaseUrl}/organizer/communities`, {
                method: "GET",
                headers: {
                    ...(accessToken
                        ? { Authorization: `Bearer ${accessToken}` }
                        : {}),
                    Cookie: cookieHeader,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });

        let response = await fetchCommunities();

        // Server components do not use the browser Axios refresh interceptor.
        // Refresh here so a recently rotated or expired access token does not
        // make an authenticated organizer appear to have no communities.
        if (response.status === 401) {
            const refreshResponse = await fetch(`${apiBaseUrl}/auth/refresh`, {
                method: "POST",
                headers: {
                    Cookie: cookieHeader,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            });

            if (refreshResponse.ok) {
                const refreshedCookies = readSetCookieHeaders(refreshResponse.headers)
                    .map((cookie) => cookie.split(";", 1)[0])
                    .filter(Boolean);

                cookieHeader = [...refreshedCookies, cookieHeader]
                    .filter(Boolean)
                    .join("; ");
                accessToken = getCookieValue(cookieHeader, "access_token");
                response = await fetchCommunities();
            }
        }

        if (response.status === 404) {
            return { communities: [] };
        }

        if (!response.ok) {
            return {
                communities: [],
                errorMessage: "Gagal mengambil data komunitas.",
            };
        }

        const payload = (await response.json()) as { data?: Community[] };

        return { communities: payload.data ?? [] };
    } catch {
        return {
            communities: [],
            errorMessage: "Gagal mengambil data komunitas.",
        };
    }
}

function formatNumber(value?: number) {
    return new Intl.NumberFormat("id-ID").format(value ?? 0);
}

function formatDate(value?: string) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
}

function PageSurface({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-[calc(100vh-136px)] overflow-hidden bg-[#f9fafb] px-4 py-6 md:-mx-8 md:px-8">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    opacity: 0.18,
                }}
            />
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full text-primary"
                viewBox="0 0 1440 640"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
            >
                <path
                    d="M92 420C246 300 356 486 512 350C652 228 760 306 920 210C1086 111 1205 218 1362 98"
                    stroke="currentColor"
                    strokeOpacity="0.07"
                    strokeWidth="2"
                />
                <path
                    d="M122 176C292 250 408 96 566 172C708 240 812 144 966 210C1110 272 1218 392 1360 318"
                    stroke="#10b981"
                    strokeOpacity="0.055"
                    strokeWidth="2"
                />
            </svg>
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5">
                {children}
            </div>
        </main>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {label}
                </p>
                <p className="mt-1 text-2xl font-semibold leading-none text-slate-950">
                    {value}
                </p>
            </div>
        </div>
    );
}

function EmptyCommunityState({ message }: { message?: string }) {
    return (
        <PageSurface>
            <div className="flex min-h-[calc(100vh-196px)] items-center justify-center">
                <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-md shadow-slate-900/5">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-light" />
                    <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                        <UsersRound className="h-8 w-8" strokeWidth={2.2} />
                    </div>
                    <p className="mt-6 text-[11px] font-medium uppercase tracking-wider text-primary">
                        Komunitas organizer
                    </p>
                    <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                        Belum ada komunitas
                    </h1>
                    <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-slate-600 md:text-sm">
                        {message ??
                            "Buat ruang komunitas untuk mengumpulkan peserta, membagikan informasi, dan menjaga hubungan setelah event selesai."}
                    </p>
                    <Button
                        asChild
                        className="mt-6 h-11 rounded-xl px-5 text-sm font-semibold shadow-md shadow-primary/20"
                    >
                        <Link href="/organizer/communities/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Komunitas
                        </Link>
                    </Button>
                </div>
            </div>
        </PageSurface>
    );
}

function CommunityCard({ community }: { community: Community }) {
    const bannerSrc =
        community.banner_url || "/organizer-cover-placeholder.png";
    const initials = getInitials(community.name) || "K";

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
            <div className="relative h-44 overflow-hidden bg-slate-900 sm:h-56 lg:h-64">
                <Image
                    src={bannerSrc}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-white/75">
                            k/{community.slug}
                        </p>
                        <h2 className="mt-1 text-3xl font-bold leading-[1.08] text-white md:text-5xl">
                            {community.name}
                        </h2>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                    <div className="-mt-14 mb-5 flex items-end gap-4">
                        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-950 text-xl font-semibold text-cyan-300 shadow-lg shadow-slate-900/10">
                            {community.logo_url ? (
                                <Image
                                    src={community.logo_url}
                                    alt={community.name}
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            ) : (
                                initials
                            )}
                        </div>
                        <div className="pb-1">
                            <div className="inline-flex items-center gap-2 rounded-xl border border-primary/10 bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Komunitas aktif
                            </div>
                            <p className="mt-2 text-xs font-normal text-slate-500">
                                Dibuat {formatDate(community.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="max-w-3xl">
                        <h3 className="text-xl font-semibold text-slate-950">
                            Ringkasan komunitas
                        </h3>
                        <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-600">
                            {community.description ||
                                "Komunitas ini belum memiliki deskripsi. Tambahkan deskripsi agar calon anggota memahami tujuan dan aktivitas komunitas."}
                        </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <StatCard
                            icon={UsersRound}
                            label="Anggota"
                            value={formatNumber(community.member_count)}
                        />
                        <StatCard
                            icon={CalendarCheck2}
                            label="Event"
                            value={formatNumber(community.event_count)}
                        />
                        <StatCard
                            icon={FileText}
                            label="Postingan"
                            value={formatNumber(community.post_count)}
                        />
                    </div>
                </div>

                <aside className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                        Aksi cepat
                    </p>
                    <div className="mt-3 grid gap-2">
                        <Link
                            href={`/organizer/communities/${community.id}/edit`}
                            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md"
                        >
                            <span className="flex items-center gap-2">
                                <Settings className="h-4 w-4 text-primary" />
                                Edit profil komunitas
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                        <Link
                            href={`/k/${community.slug}`}
                            className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md"
                        >
                            <span className="flex items-center gap-2">
                                <Globe2 className="h-4 w-4 text-primary" />
                                Buka halaman publik
                            </span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                        </Link>
                    </div>
                    <div className="mt-4 rounded-xl border border-primary/10 bg-primary-light/70 p-3">
                        <div className="flex gap-2">
                            <Info
                                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                strokeWidth={2.3}
                            />
                            <p className="text-xs leading-relaxed text-slate-600">
                                Kelola komunitas Anda dan pantau interaksi dengan peserta.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default async function Communities() {
    const { communities, errorMessage } = await getOrganizerCommunities();

    if (communities.length === 0) {
        return <EmptyCommunityState message={errorMessage} />;
    }

    return (
        <PageSurface>
            <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <svg
                    className="pointer-events-none absolute -right-8 -top-8 h-48 w-72 text-primary md:right-2 md:top-1/2 md:-translate-y-1/2"
                    viewBox="0 0 288 192"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M34 126C72 78 109 95 143 62C178 28 217 44 254 18"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M48 52C85 89 116 78 149 114C180 148 219 141 252 166"
                        stroke="#10b981"
                        strokeOpacity="0.1"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                    <path
                        d="M86 150C119 128 132 87 176 86C210 85 228 68 248 45"
                        stroke="currentColor"
                        strokeOpacity="0.07"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    {[
                        [34, 126, 12],
                        [143, 62, 16],
                        [254, 18, 12],
                        [48, 52, 13],
                        [149, 114, 18],
                        [252, 166, 13],
                        [176, 86, 11],
                    ].map(([cx, cy, r]) => (
                        <g key={`${cx}-${cy}`}>
                            <circle
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill="white"
                                stroke="currentColor"
                                strokeOpacity="0.13"
                                strokeWidth="2"
                            />
                            <circle
                                cx={cx}
                                cy={cy}
                                r={Math.max(3, r / 3)}
                                fill="currentColor"
                                fillOpacity="0.12"
                            />
                        </g>
                    ))}
                    <rect
                        x="193"
                        y="105"
                        width="34"
                        height="34"
                        rx="10"
                        fill="#10b981"
                        fillOpacity="0.08"
                    />
                    <rect
                        x="94"
                        y="24"
                        width="24"
                        height="24"
                        rx="8"
                        fill="currentColor"
                        fillOpacity="0.08"
                    />
                </svg>

                <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                        Organizer workspace
                    </p>
                    <h1 className="mt-2 text-2xl font-bold leading-[1.12] text-slate-950 md:text-3xl">
                        Komunitas
                    </h1>
                    <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-600 md:text-sm">
                        Kelola identitas komunitas, pantau aktivitas, dan buka
                        halaman publik dari satu tempat.
                    </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-primary/30 hover:text-primary"
                    >
                        <Link href="/organizer/communities/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Komunitas
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="grid gap-6">
                {communities.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                ))}
            </div>
        </PageSurface>
    );
}
