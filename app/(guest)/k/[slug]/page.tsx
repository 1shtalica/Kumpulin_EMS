import LandingNavbar from "@/components/landingpage/LandingNavbar";
import CommunityDetailClient from "@/components/community/CommunityDetailClient";

export const metadata = {
    title: "Komunitas - Kumpul.in",
    description: "Detail komunitas dan post terbaru.",
};

export default async function CommunitySlugDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <LandingNavbar />
            <CommunityDetailClient communitySlug={slug} />
        </div>
    );
}