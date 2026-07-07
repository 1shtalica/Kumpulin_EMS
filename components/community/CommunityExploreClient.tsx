"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, Search, UsersRound, FileText, ShieldCheck, ArrowUpRight, Globe2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CommunityService } from "@/services/community-service";
import type { Community } from "@/types/community";
import { useDebounce } from "use-debounce";

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

function CommunityExploreCard({ community }: { community: Community }) {
    const bannerSrc = community.banner_url || "/organizer-cover-placeholder.png";
    const initials = getInitials(community.name) || "K";
    const communityHref = community.slug ? `/k/${community.slug}` : `/komunitas/${community.id}`;

    return (
        <article className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
            <div className="relative h-32 overflow-hidden bg-slate-900">
                <Image
                    src={bannerSrc}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 to-transparent" />
            </div>
            
            <div className="relative px-5 pb-5">
                <div className="-mt-8 mb-3 flex items-end justify-between">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-slate-950 text-lg font-semibold text-cyan-300 shadow-sm">
                        {community.logo_url ? (
                            <Image
                                src={community.logo_url}
                                alt={community.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                            />
                        ) : (
                            initials
                        )}
                    </div>
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold leading-snug text-slate-950 transition-colors group-hover:text-primary line-clamp-1">
                        <Link href={communityHref} className="focus:outline-none before:absolute before:inset-0">
                            {community.name}
                        </Link>
                    </h2>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatDate(community.created_at)}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="font-medium text-slate-600">{community.visibility === 'public' ? 'Publik' : 'Private'}</span>
                    </div>
                    
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 h-10">
                        {community.description || "Tidak ada deskripsi."}
                    </p>
                    
                    <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                            <UsersRound className="h-4 w-4 text-slate-400" />
                            {formatNumber(community.member_count)}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {formatNumber(community.post_count)}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function CommunityExploreClient() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const isFetchingRef = useRef(false);

    const loadCommunities = useCallback(async (pageNum: number, search: string, isInitial: boolean) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        
        if (isInitial) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const result = await CommunityService.getAllCommunities({
                page: pageNum,
                limit: 20,
                search: search || undefined
            });

            if (isInitial) {
                setCommunities(result.data);
            } else {
                setCommunities(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newCommunities = result.data.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newCommunities];
                });
            }
            
            setHasMore(result.hasNext);
            setPage(pageNum);
        } catch (error) {
            toast.error("Gagal memuat komunitas.");
        } finally {
            isFetchingRef.current = false;
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        setCommunities([]);
        setHasMore(true);
        void loadCommunities(1, debouncedSearch, true);
    }, [debouncedSearch, loadCommunities]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasMore || isLoading || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !isFetchingRef.current) {
                    void loadCommunities(page + 1, debouncedSearch, false);
                }
            },
            { rootMargin: "400px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, isLoading, isLoadingMore, page, debouncedSearch, loadCommunities]);

    return (
        <main className="min-h-screen bg-[#f9fafb] px-4 pb-24 pt-28 sm:px-6 lg:px-8 relative">
            <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "linear-gradient(135deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px), linear-gradient(45deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)",
                    backgroundSize: "34px 34px, 56px 56px",
                    opacity: 0.55,
                }}
            />
            
            <div className="relative mx-auto w-full max-w-6xl">
                <header className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                                Eksplorasi
                            </p>
                            <h1 className="mt-2 text-3xl font-bold leading-[1.12] text-slate-950 md:text-4xl">
                                Jelajahi Komunitas
                            </h1>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                                Temukan dan bergabunglah dengan berbagai komunitas event yang sesuai dengan minat Anda di Kumpul.in.
                            </p>
                        </div>
                        
                        <div className="relative w-full md:w-72 shrink-0">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari komunitas..."
                                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : communities.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white shadow-sm text-center px-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-slate-900">Tidak ada komunitas ditemukan</h3>
                        <p className="mt-2 text-sm text-slate-500">Coba gunakan kata kunci pencarian yang berbeda.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {communities.map((community) => (
                            <CommunityExploreCard key={community.id} community={community} />
                        ))}
                    </div>
                )}
                
                <div ref={sentinelRef} className="h-4" />
                
                {isLoadingMore && (
                    <div className="mt-8 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                )}
                
                {!isLoading && !isLoadingMore && !hasMore && communities.length > 0 && (
                    <p className="mt-8 text-center text-sm font-medium text-slate-400">
                        Semua komunitas telah ditampilkan.
                    </p>
                )}
            </div>
        </main>
    );
}
