import HeaderSection from "@/components/eventdetail/HeaderSection";
import ImageSection from "@/components/eventdetail/ImageSection";
import DetailSection from "@/components/eventdetail/DetailSection";
import TicketSection from "@/components/eventdetail/TicketSection";

export default function EventDetail({ params }: { params: { slug: string } }) {
  return (
    <>
      <HeaderSection />
      <main className="min-h-screen bg-white">
        <div className="pt-24">
          {/* Image Section dengan Blur Background */}
          <ImageSection />

          {/* Main Content - Pastikan z-index lebih tinggi */}
          <div className="container mx-auto px-4 pb-20 relative z-20">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Detail Section */}
              <div className="xl:col-span-8">
                <DetailSection />
              </div>

              {/* Ticket Section */}
              <div className="xl:col-span-4 relative">
                <div className="sticky top-28">
                  <TicketSection />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
