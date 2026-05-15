import LandingNavbar from "@/components/landingpage/LandingNavbar";
import NewestPostsFeedClient from "@/components/community/NewestPostsFeedClient";
import GoToTopButton from "@/components/reusable/GoToTopButton";

export const metadata = {
    title: "Komunitas - Kumpulin",
    description: "Post terbaru dari beberapa komunitas di Kumpul.in",
};

export default function CommunityHubPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <LandingNavbar />
            <NewestPostsFeedClient />
            <GoToTopButton />
        </div>
    );
}
