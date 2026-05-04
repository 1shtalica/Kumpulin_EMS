import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, MoreHorizontal, Share, ThumbsUp } from "lucide-react";

export const metadata = {
  title: "Post Detail - Kumpul.in",
  description: "Detail diskusi dan komentar pada post.",
};

export default function PostDetailPage({ params }: { params: { postId: string } }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-28 md:px-0">
        <div className="flex w-full flex-col gap-8">
          
          {/* Post Detail Card */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center gap-3 p-6 pb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-700">
                  B
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Budi Santoso</span>
                    <span className="text-sm text-slate-500">@budisantoso</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-sm text-slate-500">2 jam yang lalu</span>
                  </div>
                  <Link href="/komunitas/kumpulin-music" className="text-sm font-medium text-blue-700 hover:underline">
                    k/FotografiIndonesia
                  </Link>
                </div>
                <button className="text-slate-500 hover:text-slate-900">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <h1 className="mb-4 text-2xl font-bold text-slate-900">
                  Momen Emas di Gunung Bromo: Panduan Komprehensif Menangkap Sunrise
                </h1>
                <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                  Setelah bertahun-tahun merencanakan, akhirnya saya berhasil mengabadikan momen matahari terbit yang sempurna di Gunung Bromo minggu lalu. Cahaya keemasan yang menyapu lautan pasir dan memantul di lereng gunung berapi menciptakan pemandangan yang tak terlupakan.
{"\n\n"}
Bagi teman-teman yang berencana ke sana untuk fotografi lanskap, beberapa tips singkat:
1. Datang lebih awal (sekitar jam 3 pagi) untuk mendapatkan spot terbaik di Penanjakan.
2. Gunakan tripod yang kokoh; angin bisa sangat kencang.
3. Lensa wide-angle (16-35mm) sangat direkomendasikan untuk menangkap keseluruhan panorama, tapi lensa telephoto (70-200mm) juga berguna untuk detail kawah.
4. Bawa baterai cadangan! Suhu dingin membuat baterai cepat habis.
{"\n\n"}
Berikut adalah salah satu bidikan favorit saya dari pagi itu. Bagaimana menurut kalian komposisinya?
                </p>

                {/* Featured Image */}
                <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <img
                    alt="Gunung Bromo Sunrise"
                    className="h-auto max-h-[600px] w-full object-cover"
                    src="https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2071&auto=format&fit=crop"
                  />
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
                <div className="flex items-center gap-4">
                  <button className="group flex items-center gap-1.5 text-slate-500 transition-colors hover:text-blue-700">
                    <ThumbsUp className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-semibold">1.2k</span>
                  </button>
                  <button className="group flex items-center gap-1.5 text-slate-500 transition-colors hover:text-blue-700">
                    <MessageCircle className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="text-sm font-semibold">84</span>
                  </button>
                </div>
                <button className="group flex items-center gap-1.5 text-slate-500 transition-colors hover:text-blue-700">
                  <Share className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="hidden text-sm font-semibold sm:inline">Bagikan</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Komentar (84)</h2>

            {/* Comment Input */}
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                Me
              </div>
              <div className="flex-1 space-y-3">
                <textarea
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-base text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Tulis komentar..."
                ></textarea>
                <div className="flex justify-end">
                  <Button className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white">
                    Kirim
                  </Button>
                </div>
              </div>
            </div>

            {/* Comment Thread */}
            <div className="mt-8 space-y-6">
              {/* Comment 1 */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-700">
                  S
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Siti Aminah</span>
                    <span className="text-sm text-slate-500">45 menit yang lalu</span>
                  </div>
                  <p className="mb-2 text-base text-slate-700">
                    Luar biasa! Tone warnanya sangat natural. Apakah Anda menggunakan filter ND untuk menangkap detail awan tersebut?
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700">
                      <ThumbsUp className="h-4 w-4" /> 12
                    </button>
                    <button className="text-sm font-semibold text-blue-700 hover:underline">Balas</button>
                  </div>

                  {/* Nested Reply */}
                  <div className="mt-4 flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      B
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-700">Budi Santoso (Author)</span>
                        <span className="text-sm text-slate-500">30 menit yang lalu</span>
                      </div>
                      <p className="mb-2 text-base text-slate-700">
                        Terima kasih, Siti! Ya, saya menggunakan filter ND gradasi lunak untuk menyeimbangkan eksposur antara langit dan lanskap bawah.
                      </p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700">
                          <ThumbsUp className="h-4 w-4" /> 5
                        </button>
                        <button className="text-sm font-semibold text-blue-700 hover:underline">Balas</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment 2 */}
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                  R
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Rizal F.</span>
                    <span className="text-sm text-slate-500">1 jam yang lalu</span>
                  </div>
                  <p className="mb-2 text-base text-slate-700">
                    Tips yang sangat berguna, Mas Budi. Saya berencana ke sana bulan depan. Spot persisnya di Penanjakan 1 atau 2?
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-700">
                      <ThumbsUp className="h-4 w-4" /> 3
                    </button>
                    <button className="text-sm font-semibold text-blue-700 hover:underline">Balas</button>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="mt-8 w-full rounded-xl border-slate-200 text-blue-700 hover:bg-slate-50">
              Muat lebih banyak komentar
            </Button>
          </section>

        </div>
      </main>
    </div>
  );
}
