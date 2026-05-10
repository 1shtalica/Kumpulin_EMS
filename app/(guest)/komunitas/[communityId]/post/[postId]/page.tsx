import LandingNavbar from "@/components/landingpage/LandingNavbar";
import PostDetailClient from "@/components/community/PostDetailClient";

export const metadata = {
    title: "Post Komunitas - Kumpul.in",
    description: "Detail post dan komentar komunitas.",
};

export default async function CommunityPostDetailPage({
    params,
}: {
    params: Promise<{ communityId: string; postId: string }>;
}) {
    const { communityId, postId } = await params;

    return (
        <div className="min-h-screen bg-slate-50">
            <LandingNavbar />
            <PostDetailClient communityId={communityId} postId={postId} />
        </div>
    );
}
