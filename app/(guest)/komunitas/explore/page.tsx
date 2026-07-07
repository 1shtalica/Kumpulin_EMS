import LandingNavbar from "@/components/landingpage/LandingNavbar";
import CommunityExploreClient from "@/components/community/CommunityExploreClient";
import GoToTopButton from "@/components/reusable/GoToTopButton";

export const metadata = {
    title: "Jelajahi Komunitas - Kumpulin",
    description: "Jelajahi berbagai komunitas di Kumpul.in",
};

export default function CommunityExplorePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <LandingNavbar />
            <CommunityExploreClient />
            <GoToTopButton />
        </div>
    );
}
