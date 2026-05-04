import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { Button } from "@/components/ui/button";
import { CalendarDays, MessageCircle, MoreHorizontal, Share, ThumbsUp, Flame, Sparkles, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Kumpul.in Tech - Komunitas",
  description: "Tempat berkumpulnya para antusias teknologi.",
};

export default function CommunityDetailPage({ params }: { params: { communityId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main className="mx-auto w-full max-w-[800px] px-4 pb-24 pt-28 sm:px-6">
        <div className="flex w-full flex-col gap-8">
          {/* Community Header Component */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            {/* Banner */}
            <div className="relative h-64 w-full bg-slate-200">
              <img
                alt="Technology abstract banner"
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
              />
            </div>
            
            {/* Header Info */}
            <div className="relative px-8 pb-8">
              <div className="mb-6 -mt-12 flex items-end justify-between">
                <div className="relative z-10 h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm">
                  <img
                    alt="Kumpul.in Tech Logo"
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex items-center gap-2 rounded-full border-slate-200 text-slate-700">
                    <Share className="h-4 w-4" />
                    Bagikan
                  </Button>
                  <Button className="rounded-full bg-primary px-6 text-white hover:bg-primary/90">
                    Bergabung
                  </Button>
                </div>
              </div>
              
              <div>
                <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">Kumpul.in Tech</h1>
                <p className="text-sm font-medium text-slate-500">k/{params.communityId} • Komunitas Teknologi Terbesar</p>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                  Tempat berkumpulnya para antusias teknologi, developer, dan inovator di Indonesia. Diskusikan tren terbaru, bagikan proyekmu, dan belajar bersama.
                </p>
                
                <div className="mt-6 flex items-center gap-8 border-t border-slate-100 pt-6 text-sm text-slate-700">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-slate-900">124K</span>
                    <span className="text-xs text-slate-500">Anggota</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> 1.2K
                    </span>
                    <span className="text-xs text-slate-500">Online</span>
                  </div>
                  <div className="ml-auto flex flex-col text-right">
                    <span className="flex items-center gap-2 font-medium text-slate-400">
                      <CalendarDays className="h-5 w-5" />
                      Dibuat Mar 2020
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Filters */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Flame className="h-4 w-4" /> Hot
            </button>
            <button className="flex items-center gap-2 rounded-full border border-slate-100 bg-transparent px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100">
              <Sparkles className="h-4 w-4" /> Baru
            </button>
            <button className="flex items-center gap-2 rounded-full border border-slate-100 bg-transparent px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100">
              <TrendingUp className="h-4 w-4" /> Teratas
            </button>
          </div>

          {/* Post Card 1: Text Only */}
          <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              {/* Metadata Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    alt="Avatar Budi"
                    className="h-12 w-12 rounded-full bg-slate-100 object-cover shadow-sm ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                  />
                  <div>
                    <div className="mb-0.5 flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">Budi Santoso</span>
                      <span className="text-xs font-medium text-slate-400">• 2 jam yang lalu</span>
                    </div>
                  </div>
                </div>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2">
                <Link href="/komunitas/post/tren-desain-minimalis" className="group block">
                  <h2 className="mb-3 text-2xl font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                    Diskusi: Framework Front-end apa yang paling cocok untuk proyek skala besar di 2024?
                  </h2>
                  <p className="text-base leading-relaxed text-slate-600">
                    Tim kami sedang merencanakan migrasi besar-besaran dari arsitektur lama. Kami mempertimbangkan antara React (dengan Next.js) atau Angular, mengingat tim memiliki pengalaman campuran. Apakah ada yang baru saja melakukan migrasi serupa? Faktor apa saja yang paling krusial untuk dipertimbangkan selain learning curve?
                  </p>
                </Link>
              </div>

              {/* Interactions */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-5">
                <button className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <ThumbsUp className="h-5 w-5" />
                  <span>245</span>
                </button>
                <Link href="/komunitas/post/tren-desain-minimalis" className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span>42 Komentar</span>
                </Link>
                <button className="group ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <Share className="h-5 w-5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>
          </article>

          {/* Post Card 2: With Image */}
          <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              {/* Metadata Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    alt="Avatar Rina"
                    className="h-12 w-12 rounded-full bg-slate-100 object-cover shadow-sm ring-2 ring-white"
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                  />
                  <div>
                    <div className="mb-0.5 flex items-center gap-2.5">
                      <span className="text-sm font-bold text-slate-900">Rina Melati</span>
                      <span className="text-xs font-medium text-slate-400">• 5 jam yang lalu</span>
                    </div>
                  </div>
                </div>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2">
                <Link href="/komunitas/post/review-singkat" className="group block">
                  <h2 className="mb-3 text-2xl font-bold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-primary">
                    Setup WFH baru akhirnya selesai! 🚀
                  </h2>
                  <p className="mb-4 text-base leading-relaxed text-slate-600">
                    Setelah menabung berbulan-bulan, akhirnya bisa upgrade setup. Monitor ultrawide benar-benar mengubah cara saya koding. Keyboard mekanikal custom juga sangat direkomendasikan.
                  </p>
                  <div className="max-h-[500px] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <img
                      alt="WFH Desk Setup"
                      className="h-full w-full object-cover"
                      src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop"
                    />
                  </div>
                </Link>
              </div>

              {/* Interactions */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-5">
                <button className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <ThumbsUp className="h-5 w-5" />
                  <span>1.2k</span>
                </button>
                <Link href="/komunitas/post/review-singkat" className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span>128 Komentar</span>
                </Link>
                <button className="group ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <Share className="h-5 w-5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
