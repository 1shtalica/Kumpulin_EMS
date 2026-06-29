"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CommunityService } from "@/services/community-service";
import type { Community } from "@/types/community";
import PostDetailClient from "./PostDetailClient";

export default function PostDetailSlugClient({
    slug,
    postId,
}: {
    slug: string;
    postId: string;
}) {
    const [community, setCommunity] = useState<Community | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadCommunity = async () => {
            setIsLoading(true);
            try {
                const data = await CommunityService.getCommunityBySlug(slug);
                if (mounted) setCommunity(data);
            } catch {
                if (mounted) setCommunity(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void loadCommunity();

        return () => {
            mounted = false;
        };
    }, [slug]);

    if (isLoading) {
        return (
            <main className="relative overflow-hidden bg-[#f9fafb] px-4 pb-32 pt-28 sm:px-6">
                <div className="relative mx-auto w-full max-w-6xl">
                    <div className="h-80 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5" />
                    <div className="mt-5 h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5" />
                </div>
            </main>
        );
    }

    if (!community) {
        return (
            <main className="relative overflow-hidden bg-[#f9fafb] px-4 pb-32 pt-32 text-center sm:px-6">
                <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white px-6 py-12 shadow-md shadow-slate-900/5">
                    <h1 className="text-xl font-semibold text-slate-950">
                        Komunitas tidak ditemukan
                    </h1>
                    <p className="mt-3 text-sm text-slate-500">
                        Periksa kembali link komunitas yang dibuka.
                    </p>
                    <Button asChild className="mt-6 h-10 rounded-xl text-sm font-semibold">
                        <Link href="/komunitas">Kembali ke komunitas</Link>
                    </Button>
                </div>
            </main>
        );
    }

    return <PostDetailClient communityId={community.id} postId={postId} />;
}