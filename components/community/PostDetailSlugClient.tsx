"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
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
            <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f9fafb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
                <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                    style={{
                        backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.16,
                    }}
                />
                <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-4">
                    <div className="h-14 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5" />
                    <div className="h-72 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-900/5" />
                    <div className="h-64 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5" />
                </div>
            </main>
        );
    }

    if (!community) {
        return (
            <main className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f9fafb] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
                <div
                    className="pointer-events-none absolute inset-0"
                    aria-hidden="true"
                    style={{
                        backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        opacity: 0.16,
                    }}
                />
                <div className="relative mx-auto w-full max-w-3xl rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center shadow-md shadow-slate-900/5">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                        <MessageCircle className="h-6 w-6 text-slate-400" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-950">
                        Komunitas tidak ditemukan
                    </h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Periksa kembali link komunitas yang dibuka.
                    </p>
                    <Button asChild className="mt-6 h-10 rounded-xl text-sm font-semibold">
                        <Link href="/komunitas">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke komunitas
                        </Link>
                    </Button>
                </div>
            </main>
        );
    }

    return <PostDetailClient communityId={community.id} postId={postId} />;
}