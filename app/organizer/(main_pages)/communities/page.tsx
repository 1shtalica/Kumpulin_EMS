import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import type { LucideIcon } from "lucide-react";
import {
    ArrowUpRight,
    CalendarCheck2,
    FileText,
    Info,
    Plus,
    Settings,
    UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Community, CommunityResponse } from "@/types/community";

const getApiBaseUrl = () =>
    process.env.INTERNAL_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL;

async function getOrganizerCommunity(): Promise<{
    community: Community | null;
    errorMessage?: string;
}> {
    const apiBaseUrl = getApiBaseUrl();

    if (!apiBaseUrl) {
        return {
            community: null,
            errorMessage: "Konfigurasi API belum tersedia.",
        };
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    if (!accessToken) {
        return {
            community: null,
            errorMessage: "Sesi login tidak ditemukan.",
        };
    }

    try {
        const response = await fetch(`${apiBaseUrl}/organizer/community`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Cookie: cookieHeader,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (response.status === 404) {
            return { community: null };
        }

        if (!response.ok) {
            return {
                community: null,
                errorMessage: "Gagal mengambil data komunitas.",
            };
        }

        const payload = (await response.json()) as CommunityResponse;

        return { community: payload.data ?? null };
    } catch {
        return {
            community: null,
            errorMessage: "Gagal mengambil data komunitas.",
        };
    }
}

function formatNumber(value?: number) {
    return new Intl.NumberFormat("id-ID").format(value ?? 0);
}

function getInitials(name: string) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("");
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
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-primary">
                <Icon className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                </p>
                <p className="mt-1 text-lg font-semibold leading-none text-slate-950">
                    {value}
                </p>
            </div>
        </div>
    );
}

function EmptyCommunityState({ message }: { message?: string }) {
    return (
        <main className="flex min-h-[calc(100vh-136px)] items-center justify-center bg-white px-6 py-4 md:-mx-8 md:px-8">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
                    <UsersRound className="h-9 w-9" strokeWidth={2.2} />
                </div>
                <h1 className="mt-6 text-xl font-semibold text-slate-950">
                    Belum ada komunitas
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                    {message ??
                        "Anda saat ini belum mengelola komunitas apa pun."}
                </p>
                <Button
                    asChild
                    className="mt-6 h-10 rounded-full px-5 text-sm font-semibold"
                >
                    <Link href="/organizer/communities/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Komunitas
                    </Link>
                </Button>
            </div>
        </main>
    );
}

function CommunityCard({ community }: { community: Community }) {
    const bannerSrc =
        community.banner_url || "/organizer-cover-placeholder.png";
    const initials = getInitials(community.name) || "K";

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="relative m-3 h-32 overflow-hidden rounded-[12px] bg-slate-900 sm:h-36">
                <Image
                    src={bannerSrc}
                    alt=""
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 1200px"
                />
            </div>

            <div className="relative px-5 pb-6 pt-0 sm:px-7">
                <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-slate-950 text-base font-semibold text-cyan-300 shadow-md">
                        {community.logo_url ? (
                            <Image
                                src={community.logo_url}
                                alt={community.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:justify-end">
                        <Button
                            asChild
                            className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-white hover:text-primary"
                        >
                            <Link href={`/komunitas/${community.id}`}>
                                <ArrowUpRight className="mr-2 h-4 w-4" />
                                Lihat Halaman Komunitas
                            </Link>
                        </Button>
                        <Button
                            asChild
                            className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-white hover:text-primary"
                        >
                            <Link href={`/organizer/communities/${community.id}/edit`}>
                                <Settings className="mr-2 h-4 w-4" />
                                Kelola Komunitas
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-6 max-w-4xl">
                    <h2 className="text-xl font-semibold leading-tight text-slate-950">
                        {community.name}
                    </h2>
                    <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
                        {community.description ||
                            "Komunitas ini belum memiliki deskripsi."}
                    </p>
                </div>

                <div className="my-6 h-px bg-slate-200" />

                <div className="grid gap-4 sm:grid-cols-3">
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
        </article>
    );
}

export default async function Communities() {
    const { community, errorMessage } = await getOrganizerCommunity();

    if (!community) {
        return <EmptyCommunityState message={errorMessage} />;
    }

    return (
        <main className="min-h-[calc(100vh-136px)] bg-white px-6 py-3 md:-mx-8 md:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        disabled
                        className="h-10 rounded-full border-slate-200 bg-white px-4 text-sm font-medium text-slate-400 disabled:opacity-70"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Komunitas
                    </Button>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50/70 px-5 py-4 text-slate-800">
                    <Info
                        className="h-4 w-4 shrink-0 text-primary"
                        strokeWidth={2.4}
                    />
                    <p className="text-sm">
                        Saat ini, akun Organizer hanya dapat mengelola{" "}
                        <span className="font-semibold">satu komunitas.</span>
                    </p>
                </div>

                <CommunityCard community={community} />
            </div>
        </main>
    );
}
