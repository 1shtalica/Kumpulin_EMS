import LandingNavbar from "@/components/landingpage/LandingNavbar";
import PostDetailSlugClient from "@/components/community/PostDetailSlugClient";

export const metadata = {
    title: "Post Komunitas - Kumpul.in",
    description: "Detail post dan komentar komunitas.",
};

export default async function CommunitySlugPostDetailPage({
    params,
}: {
    params: Promise<{ slug: string; postId: string }>;
}) {
    const { slug, postId } = await params;

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <LandingNavbar />
            <PostDetailSlugClient slug={slug} postId={postId} />
        </div>
    );
}