import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { MessageCircle, MoreHorizontal, Share, ThumbsUp } from "lucide-react";

export const metadata = {
  title: "Komunitas - Kumpulin",
  description: "Post terbaru dari beberapa komunitas di Kumpul.in",
};

export default function CommunityHubPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main className="mx-auto w-full max-w-[800px] px-4 pb-24 pt-28 sm:px-6">
        <div className="flex flex-col gap-8">
          
          {/* Hero Banner */}
          <div className="mb-6 pt-4 text-center">
            <h1 className="mb-4 text-xl font-semibold leading-7 text-slate-900 sm:text-2xl">
              Post terbaru dari komunitas
            </h1>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-slate-500">
              Temukan diskusi hangat, wawasan baru, dan cerita menarik dari komunitas yang Anda ikuti.
            </p>
          </div>

          {/* Post Card 1 */}
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
                      <span className="text-sm font-semibold text-slate-900">Budi Santoso</span>
                      <span className="text-xs font-medium text-slate-400">• 2 jam yang lalu</span>
                    </div>
                    <Link href="/komunitas/desain-ui" className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                      k/DesainUI
                    </Link>
                  </div>
                </div>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2">
                <Link href="/komunitas/post/tren-desain-minimalis" className="group block">
                  <h2 className="mb-2.5 text-lg font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary sm:text-xl sm:leading-7">
                    Tren Desain Minimalis di 2024: Apakah Masih Relevan?
                  </h2>
                  <p className="text-sm leading-6 text-slate-600">
                    Saya baru saja membaca beberapa artikel tentang bagaimana desain antarmuka mulai bergeser kembali ke arah skeumorphism ringan atau glassmorphism. Namun, banyak platform enterprise yang masih teguh memegang prinsip minimalis ekstrim. Bagaimana pendapat teman-teman desainer di sini? Apakah kita akan melihat akhir dari era &apos;flat design&apos; murni tahun depan?
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

            {/* Nested Comments Preview */}
            <div className="flex flex-col gap-5 rounded-b-3xl border-t border-slate-100 bg-slate-50/50 px-6 py-5 sm:px-8">
              <div className="flex gap-3.5">
                <img
                  alt="Avatar Siti"
                  className="mt-1 h-8 w-8 rounded-full bg-slate-200 shadow-sm object-cover"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
                />
                <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="mb-1.5 flex items-baseline gap-2.5">
                  <span className="text-sm font-semibold text-slate-900">Siti R.</span>
                    <span className="text-xs font-medium text-slate-400">1 jam yang lalu</span>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">
                    Menurut saya minimalis akan tetap bertahan karena kebutuhan performa dan aksesibilitas, tapi mungkin dengan tambahan depth seperti shadow yang lebih natural.
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5">
                <img
                  alt="Avatar Andi"
                  className="mt-1 h-8 w-8 rounded-full bg-slate-200 shadow-sm object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                />
                <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-100 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="mb-1.5 flex items-baseline gap-2.5">
                  <span className="text-sm font-semibold text-slate-900">Andi Wijaya</span>
                    <span className="text-xs font-medium text-slate-400">45 menit yang lalu</span>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">
                    Setuju dengan Siti. Glassmorphism bagus untuk marketing site, tapi untuk dashboard SaaS, flat/minimalist masih juara.
                  </p>
                </div>
              </div>
              <Link href="/komunitas/post/tren-desain-minimalis" className="mt-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/10 hover:text-primary/80 rounded-xl py-2.5">
                Lihat 40 komentar lainnya
              </Link>
            </div>
          </article>

          {/* Post Card 2 */}
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
                      <span className="text-sm font-semibold text-slate-900">Rina Melati</span>
                      <span className="text-xs font-medium text-slate-400">• 5 jam yang lalu</span>
                    </div>
                    <Link href="/komunitas/tech-indo" className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                      k/TechIndo
                    </Link>
                  </div>
                </div>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2">
                <Link href="/komunitas/post/review-singkat" className="group block">
                  <h2 className="mb-2.5 text-lg font-semibold leading-6 text-slate-900 transition-colors group-hover:text-primary sm:text-xl sm:leading-7">
                    Review Singkat Framework Frontend Baru
                  </h2>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    Baru saja mencoba framework X yang sedang ramai dibicarakan. Secara performa memang luar biasa cepat saat initial load. Dokumentasinya juga sangat rapi. Tapi ekosistem library pihak ketiganya masih sangat terbatas dibandingkan React atau Vue. Worth it gak ya untuk project produksi saat ini?
                  </p>
                </Link>
              </div>

              {/* Interactions */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-5">
                <button className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <ThumbsUp className="h-5 w-5" />
                  <span>128</span>
                </button>
                <Link href="/komunitas/post/review-singkat" className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span>15 Komentar</span>
                </Link>
                <button className="group ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <Share className="h-5 w-5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>
          </article>

          {/* Load More Full Width */}
          <div className="flex justify-center pb-8 pt-4">
            <button className="rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-primary/20 hover:bg-primary/10 hover:text-primary hover:shadow-md">
              Muat lebih banyak post
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
