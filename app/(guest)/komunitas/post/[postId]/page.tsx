import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import PostDetailClient from "@/components/community/PostDetailClient";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Post Komunitas - Kumpul.in",
    description: "Detail post dan komentar komunitas.",
};

export default function LegacyPostDetailPage({
    params,
    searchParams,
}: {
    params: { postId: string };
    searchParams: { communityId?: string };
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <LandingNavbar />
            {searchParams.communityId ? (
                <PostDetailClient
                    communityId={searchParams.communityId}
                    postId={params.postId}
                />
            ) : (
                <main className="mx-auto w-full max-w-[800px] px-4 pb-32 pt-32 text-center sm:px-6">
                    <h1 className="text-xl font-semibold text-slate-950">
                        Link post perlu ID komunitas
                    </h1>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                        Buka post dari halaman komunitas agar komentar dapat
                        dimuat melalui API.
                    </p>
                    <Button asChild className="mt-6 rounded-full">
                        <Link href="/komunitas">Lihat komunitas</Link>
                    </Button>
                </main>
            )}
        </div>
    );
}
