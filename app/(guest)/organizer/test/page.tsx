import LandingNavbar from "@/components/landingpage/LandingNavbar";
import LandingFooter from "@/components/landingpage/LandingFooter";
import PublicOrganizerProfile from "@/components/organizer/profile/PublicOrganizerProfile";

export async function generateMetadata() {
  return {
    title: "Profil Organizer - Kumpulin",
    description: "Lihat profil, event mendatang, dan ulasan dari organizer ini.",
  };
}

export default function PublicOrganizerProfilePage() {
  return (
    <div className="min-h-screen bg-[#f8f8fa] flex flex-col">
      <LandingNavbar />
      <main className="flex-1 pt-16">
        <PublicOrganizerProfile />
      </main>
      <LandingFooter />
    </div>
  );
}
