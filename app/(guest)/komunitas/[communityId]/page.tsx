import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MessageCircle, MoreHorizontal, Share, ArrowUp, ArrowDown, Bookmark, Flame, Sparkles, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Kumpul.in Tech - Komunitas",
  description: "Tempat berkumpulnya para antusias teknologi.",
};

export default function CommunityDetailPage({ params }: { params: { communityId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-28 md:px-0">
        <div className="flex w-full flex-col gap-8">
          {/* Community Header Component */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                  <Button variant="outline" className="rounded-xl flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    Bagikan
                  </Button>
                  <Button className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white">
                    Bergabung
                  </Button>
                </div>
              </div>
              
              <div>
                <h1 className="mb-1 text-3xl font-bold text-slate-900">Kumpul.in Tech</h1>
                <p className="text-base font-medium text-slate-500">k/{params.communityId} • Komunitas Teknologi Terbesar</p>
                <p className="mt-4 max-w-2xl text-slate-700 leading-relaxed">
                  Tempat berkumpulnya para antusias teknologi, developer, dan inovator di Indonesia. Diskusikan tren terbaru, bagikan proyekmu, dan belajar bersama.
                </p>
                
                <div className="mt-6 flex items-center gap-6 border-t border-slate-200 pt-6 text-sm text-slate-700">
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">124K</span>
                    <span className="text-sm text-slate-500">Anggota</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 text-lg font-bold">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span> 1.2K
                    </span>
                    <span className="text-sm text-slate-500">Online</span>
                  </div>
                  <div className="ml-auto flex flex-col text-right">
                    <span className="flex items-center gap-2 font-medium text-slate-500">
                      <CalendarDays className="h-4 w-4" />
                      Dibuat Mar 2020
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Filters */}
          <div className="mb-2 flex items-center gap-3">
            <Button variant="outline" className="rounded-xl bg-white flex items-center gap-2">
              <Flame className="h-4 w-4" /> Hot
            </Button>
            <Button variant="ghost" className="rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Baru
            </Button>
            <Button variant="ghost" className="rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Teratas
            </Button>
          </div>

          {/* Post Card 1: Text Only */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
                    D
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="font-semibold text-slate-900">@dev_diana</span>
                    <span className="text-slate-500">• 2 jam yang lalu</span>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-slate-900">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </header>
              <Link href={`/komunitas/post/post-framework`} className="group block mb-5">
                <h3 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  Diskusi: Framework Front-end apa yang paling cocok untuk proyek skala besar di 2024?
                </h3>
                <p className="text-base leading-relaxed text-slate-700">
                  Tim kami sedang merencanakan migrasi besar-besaran dari arsitektur lama. Kami mempertimbangkan antara React (dengan Next.js) atau Angular, mengingat tim memiliki pengalaman campuran. Apakah ada yang baru saja melakukan migrasi serupa? Faktor apa saja yang paling krusial untuk dipertimbangkan selain learning curve?
                </p>
              </Link>
              <footer className="flex items-center gap-6 pt-2">
                <div className="flex items-center rounded-full bg-slate-100">
                  <button className="group rounded-l-full p-2 transition-colors hover:bg-slate-200">
                    <ArrowUp className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                  </button>
                  <span className="px-3 text-sm font-semibold">342</span>
                  <button className="group rounded-r-full p-2 transition-colors hover:bg-slate-200">
                    <ArrowDown className="h-5 w-5 text-slate-500 group-hover:text-red-500" />
                  </button>
                </div>
                <Link href={`/komunitas/post/post-framework`} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                  <MessageCircle className="h-5 w-5" />
                  45 Komentar
                </Link>
                <button className="ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                  <Bookmark className="h-5 w-5" />
                  Simpan
                </button>
              </footer>
            </CardContent>
          </Card>

          {/* Post Card 2: With Image */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                    T
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="font-semibold text-slate-900">@tech_budi</span>
                    <span className="text-slate-500">• 5 jam yang lalu</span>
                  </div>
                </div>
                <button className="text-slate-500 hover:text-slate-900">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </header>
              <Link href={`/komunitas/post/post-setup`} className="group block mb-5">
                <h3 className="mb-3 text-xl font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Setup WFH baru akhirnya selesai! 🚀</h3>
                <p className="mb-4 text-base leading-relaxed text-slate-700">
                  Setelah menabung berbulan-bulan, akhirnya bisa upgrade setup. Monitor ultrawide benar-benar mengubah cara saya koding. Keyboard mekanikal custom juga sangat direkomendasikan.
                </p>
                <div className="max-h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    alt="WFH Desk Setup"
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2042&auto=format&fit=crop"
                  />
                </div>
              </Link>
              <footer className="flex items-center gap-6 pt-2">
                <div className="flex items-center rounded-full bg-slate-100">
                  <button className="group rounded-l-full p-2 transition-colors hover:bg-slate-200">
                    <ArrowUp className="h-5 w-5 text-slate-500 group-hover:text-blue-600" />
                  </button>
                  <span className="px-3 text-sm font-semibold">1.2k</span>
                  <button className="group rounded-r-full p-2 transition-colors hover:bg-slate-200">
                    <ArrowDown className="h-5 w-5 text-slate-500 group-hover:text-red-500" />
                  </button>
                </div>
                <Link href={`/komunitas/post/post-setup`} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                  <MessageCircle className="h-5 w-5" />
                  128 Komentar
                </Link>
                <button className="ml-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                  <Bookmark className="h-5 w-5" />
                  Simpan
                </button>
              </footer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
