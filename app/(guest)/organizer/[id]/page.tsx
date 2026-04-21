import LandingNavbar from "@/components/landingpage/LandingNavbar";
import LandingFooter from "@/components/landingpage/LandingFooter";
import PublicOrganizerProfile from "@/components/organizer/profile/PublicOrganizerProfile";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return {
    title: `Profil Organizer - Kumpulin`,
    description: `Lihat profil, event mendatang, dan ulasan dari organizer ini.`,
    // TODO: swap to real organizer name once BE is integrated
    openGraph: {
      title: `Profil Organizer - Kumpulin`,
      description: `Event mendatang dan ulasan dari organizer ${id}`,
    },
  };
}

/**
 * Public organizer profile page.
 * Route: /organizer/[id]
 *
 * Accessible to all users (guests + logged-in).
 * Fetches profile data by organizer ID from GET /organizer/:id/profile.
 */
export default async function PublicOrganizerProfilePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#f8f8fa] flex flex-col">
      <LandingNavbar />
      <main className="flex-1 pt-16">
        <PublicOrganizerProfile organizerId={id} />
      </main>
      <LandingFooter />
    </div>
  );
}
