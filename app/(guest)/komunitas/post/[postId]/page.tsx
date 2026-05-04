import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { MessageCircle, MoreHorizontal, Share, ThumbsUp } from "lucide-react";

export const metadata = {
  title: "Post Detail - Kumpul.in",
  description: "Detail diskusi dan komentar pada post.",
};

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main className="mx-auto w-full max-w-[800px] px-4 pb-32 pt-28 sm:px-6">
        <div className="flex w-full flex-col gap-8">
          
          {/* Post Detail Card */}
          <article className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-5 p-6 sm:p-8">
              {/* Header */}
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
                      <span className="text-xs font-medium text-slate-400">@budisantoso • 2 jam yang lalu</span>
                    </div>
                    <Link href="/komunitas/fotografi-indonesia" className="text-sm font-semibold text-primary transition-colors hover:text-primary/80 hover:underline">
                      k/FotografiIndonesia
                    </Link>
                  </div>
                </div>
                <button className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="mt-2">
                <h1 className="mb-5 text-3xl font-bold leading-snug tracking-tight text-slate-900">
                  Momen Emas di Gunung Bromo: Panduan Komprehensif Menangkap Sunrise
                </h1>
                <div className="space-y-4 text-base leading-relaxed text-slate-700">
                  <p>
                    Setelah bertahun-tahun merencanakan, akhirnya saya berhasil mengabadikan momen matahari terbit yang sempurna di Gunung Bromo minggu lalu. Cahaya keemasan yang menyapu lautan pasir dan memantul di lereng gunung berapi menciptakan pemandangan yang tak terlupakan.
                  </p>
                  <p>Bagi teman-teman yang berencana ke sana untuk fotografi lanskap, beberapa tips singkat:</p>
                  <ol className="ml-4 list-decimal space-y-2">
                    <li>Datang lebih awal (sekitar jam 3 pagi) untuk mendapatkan spot terbaik di Penanjakan.</li>
                    <li>Gunakan tripod yang kokoh; angin bisa sangat kencang.</li>
                    <li>Lensa wide-angle (16-35mm) sangat direkomendasikan untuk menangkap keseluruhan panorama, tapi lensa telephoto (70-200mm) juga berguna untuk detail kawah.</li>
                    <li>Bawa baterai cadangan! Suhu dingin membuat baterai cepat habis.</li>
                  </ol>
                  <p>Berikut adalah salah satu bidikan favorit saya dari pagi itu. Bagaimana menurut kalian komposisinya?</p>
                </div>

                {/* Featured Image */}
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <img
                    alt="Gunung Bromo Sunrise"
                    className="h-auto max-h-[600px] w-full object-cover"
                    src="https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2071&auto=format&fit=crop"
                  />
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-5">
                <button className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <ThumbsUp className="h-5 w-5" />
                  <span>1.2k</span>
                </button>
                <button className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <MessageCircle className="h-5 w-5" />
                  <span>84 Komentar</span>
                </button>
                <button className="group ml-auto flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-primary/10 hover:text-primary">
                  <Share className="h-5 w-5" />
                  <span className="hidden sm:inline">Bagikan</span>
                </button>
              </div>
            </div>
          </article>

          {/* Comments Section */}
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Komentar (84)</h2>

            {/* Comment Input */}
            <div className="mb-8 flex items-start gap-4">
              <img
                alt="Current user"
                className="mt-1 h-10 w-10 shrink-0 rounded-full bg-slate-200 object-cover shadow-sm"
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"
              />
              <div className="flex-1 space-y-3">
                <textarea
                  className="h-24 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Tulis komentar..."
                ></textarea>
                <div className="flex justify-end">
                  <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90">
                    Kirim
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Thread */}
            <div className="space-y-8">
              {/* Comment 1 */}
              <div className="flex gap-4">
                <img
                  alt="Avatar Siti"
                  className="mt-1 h-10 w-10 shrink-0 rounded-full bg-slate-200 object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop"
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-900">Siti Aminah</span>
                    <span className="text-xs font-medium text-slate-400">45 menit yang lalu</span>
                  </div>
                  <p className="mb-2 text-sm leading-relaxed text-slate-700">
                    Luar biasa! Tone warnanya sangat natural. Apakah Anda menggunakan filter ND untuk menangkap detail awan tersebut?
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-primary">
                      <ThumbsUp className="h-4 w-4" /> 12
                    </button>
                    <button className="text-xs font-semibold text-primary hover:underline">Balas</button>
                  </div>

                  {/* Nested Reply */}
                  <div className="mt-6 flex gap-4">
                    <img
                      alt="Avatar Budi"
                      className="mt-1 h-10 w-10 shrink-0 rounded-full bg-slate-200 object-cover shadow-sm"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                    />
                    <div className="flex-1">
                      <div className="mb-1 flex items-baseline gap-2">
                        <span className="text-sm font-bold text-primary">Budi Santoso (Author)</span>
                        <span className="text-xs font-medium text-slate-400">30 menit yang lalu</span>
                      </div>
                      <p className="mb-2 text-sm leading-relaxed text-slate-700">
                        Terima kasih, Siti! Ya, saya menggunakan filter ND gradasi lunak untuk menyeimbangkan eksposur antara langit dan lanskap bawah.
                      </p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-primary">
                          <ThumbsUp className="h-4 w-4" /> 5
                        </button>
                        <button className="text-xs font-semibold text-primary hover:underline">Balas</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment 2 */}
              <div className="flex gap-4">
                <img
                  alt="Avatar Rizal"
                  className="mt-1 h-10 w-10 shrink-0 rounded-full bg-slate-200 object-cover shadow-sm"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                />
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-900">Rizal F.</span>
                    <span className="text-xs font-medium text-slate-400">1 jam yang lalu</span>
                  </div>
                  <p className="mb-2 text-sm leading-relaxed text-slate-700">
                    Tips yang sangat berguna, Mas Budi. Saya berencana ke sana bulan depan. Spot persisnya di Penanjakan 1 atau 2?
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-primary">
                      <ThumbsUp className="h-4 w-4" /> 3
                    </button>
                    <button className="text-xs font-semibold text-primary hover:underline">Balas</button>
                  </div>
                </div>
              </div>
            </div>

            <button className="mt-8 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-slate-50">
              Muat lebih banyak komentar
            </button>
          </section>

        </div>
      </main>
    </div>
  );
}
