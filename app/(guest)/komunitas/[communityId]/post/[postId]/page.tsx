import LandingNavbar from "@/components/landingpage/LandingNavbar";
import PostDetailClient from "@/components/community/PostDetailClient";

export const metadata = {
    title: "Post Komunitas - Kumpul.in",
    description: "Detail post dan komentar komunitas.",
};

export default function CommunityPostDetailPage({
    params,
}: {
    params: { communityId: string; postId: string };
}) {
    return (
        <div className="min-h-screen bg-slate-50">
            <LandingNavbar />
            <PostDetailClient
                communityId={params.communityId}
                postId={params.postId}
            />
        </div>
    );
}
