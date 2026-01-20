import EventHero from "@/components/eventdetail/ImageSection";
import DetailSection from "@/components/eventdetail/DetailSection";
import TicketSection from "@/components/eventdetail/TicketSection";

export default function EventDetail({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {" "}
      {/* Background abu-abu muda banget biar card putih pop-up */}
      <main className="container mx-auto px-4 pb-20 pt-24">
        {/* 1. HERO IMAGE (Full Width di Container) */}
        <EventHero />

        {/* 2. MAIN LAYOUT (Grid 2 Kolom) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          {/* KOLOM KIRI: Detail Konten (Lebar 8/12 atau sekitar 66%) */}
          <div className="lg:col-span-8">
            <DetailSection />
          </div>

          {/* KOLOM KANAN: Tiket (Lebar 4/12 atau sekitar 33%) */}
          <div className="lg:col-span-4 relative">
            {/* Wrapper sticky agar tiket nempel pas discroll */}
            {/* top-28 disesuaikan biar gak ketabrak navbar */}
            <div className="sticky top-28">
              <TicketSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
