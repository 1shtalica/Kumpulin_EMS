import LandingNavbar from "@/components/landingpage/LandingNavbar";
import CommunityDetailClient from "@/components/community/CommunityDetailClient";

export const metadata = {
    title: "Komunitas - Kumpul.in",
    description: "Detail komunitas dan post terbaru.",
};

export default async function CommunityDetailPage({
    params,
}: {
    params: Promise<{ communityId: string }>;
}) {
    const { communityId } = await params;

    return (
        <div className="min-h-screen bg-slate-50">
            <LandingNavbar />
            <CommunityDetailClient communityId={communityId} />
        </div>
    );
}
