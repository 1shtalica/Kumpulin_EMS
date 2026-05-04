import Link from "next/link";
import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MessageCircle, Users } from "lucide-react";

export const metadata = {
  title: "Komunitas - Kumpulin",
  description: "Post terbaru dari beberapa komunitas di Kumpul.in",
};

type CommunityItem = {
  id: string;
  name: string;
  description: string;
  members: number;
};

type PostItem = {
  id: string;
  authorName: string;
  authorInitial: string;
  timestamp: string;
  communityName: string;
  communityHref: string;
  title: string;
  preview: string;
  commentCount: number;
  comments: string[];
};

const communities: CommunityItem[] = [
  {
    id: "kumpulin-music",
    name: "Kumpulin Music",
    description: "Diskusi event konser, venue, dan kolaborasi musisi lokal.",
    members: 1240,
  },
  {
    id: "startup-jakarta",
    name: "Startup Jakarta",
    description: "Berbagi insight meetup startup, pitch night, dan networking.",
    members: 980,
  },
  {
    id: "creative-hub",
    name: "Creative Hub",
    description: "Ruang komunitas kreatif untuk design, foto, dan konten event.",
    members: 760,
  },
  {
    id: "sport-weekend",
    name: "Sport Weekend",
    description: "Update kegiatan lari, futsal, dan agenda olahraga komunitas.",
    members: 635,
  },
];

const posts: PostItem[] = [
  {
    id: "post-1",
    authorName: "Nadia Putri",
    authorInitial: "N",
    timestamp: "2 jam lalu",
    communityName: "Kumpulin Music",
    communityHref: "/komunitas/kumpulin-music",
    title: "Open volunteer untuk mini festival minggu depan",
    preview:
      "Kita lagi buka volunteer untuk bagian registrasi, stage helper, dan dokumentasi. Jadwal briefing hari Kamis malam.",
    commentCount: 18,
    comments: [
      "Aku daftar bagian dokumentasi ya.",
      "Shift pagi masih ada slot?",
      "Briefing online atau offline?",
      "Bisa gabung walau baru pertama kali?",
    ],
  },
  {
    id: "post-2",
    authorName: "Rizky Hanafi",
    authorInitial: "R",
    timestamp: "4 jam lalu",
    communityName: "Startup Jakarta",
    communityHref: "/komunitas/startup-jakarta",
    title: "Thread speaker recommendation untuk meetup Mei",
    preview:
      "Lagi nyusun line-up pembicara untuk topik product-market fit. Drop rekomendasi founder/operator yang relevan.",
    commentCount: 11,
    comments: [
      "Coba invite ex-PM dari fintech B2B.",
      "Setuju, topik GTM juga menarik.",
      "Kalau bisa tambahin sesi AMA singkat.",
    ],
  },
  {
    id: "post-3",
    authorName: "Gita Prameswari",
    authorInitial: "G",
    timestamp: "6 jam lalu",
    communityName: "Creative Hub",
    communityHref: "/komunitas/creative-hub",
    title: "Template rundown event creator update v1",
    preview:
      "Aku share template rundown terbaru biar flow acara lebih rapi. Silakan dipakai, kalau ada masukan tinggal komentar.",
    commentCount: 7,
    comments: [
      "Formatnya enak dibaca, makasih.",
      "Boleh minta versi spreadsheet juga?",
      "Kolom PIC sudah pas banget.",
    ],
  },
];

export default function KomunitasPage() {
  const totalCommunities = communities.length;
  const totalCommentPreviews = posts.reduce(
    (acc, post) => acc + Math.min(post.comments.length, 3),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 md:px-8 lg:px-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-medium text-slate-500">Komunitas</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
            Post terbaru dari beberapa komunitas
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Pantau diskusi lintas komunitas dalam satu tempat. Realtime komentar
            hanya tersedia di halaman detail post.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Card className="border-slate-200 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Jumlah komunitas</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {totalCommunities}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Preview komentar</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  {totalCommentPreviews}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-none">
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">Realtime feed global</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  Nonaktif
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  Tentang komunitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>Daftar komunitas yang aktif berdiskusi minggu ini.</p>
                <Badge
                  variant="secondary"
                  className="rounded-full bg-slate-100 text-slate-700"
                >
                  Aturan v1
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  Direktori Komunitas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/komunitas/${community.id}`}
                    className="group block rounded-xl border border-slate-200 p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {community.name}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {community.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-blue-600" />
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500">
                      <Users className="h-3.5 w-3.5" />
                      {community.members.toLocaleString("id-ID")} anggota
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Semua post komunitas
              </h2>
              <Badge className="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-50">
                Diskusi terbaru
              </Badge>
            </div>

            {posts.map((post) => (
              <Card
                key={post.id}
                className="rounded-xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                      {post.authorInitial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {post.authorName}
                        </span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                        <span>•</span>
                        <Link
                          href={post.communityHref}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          {post.communityName}
                        </Link>
                      </div>

                      <h3 className="mt-2 text-base font-semibold text-slate-900">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {post.preview}
                      </p>

                      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {post.commentCount} komentar
                        </p>
                        <ul className="space-y-1.5">
                          {post.comments.slice(0, 3).map((comment) => (
                            <li
                              key={comment}
                              className="text-xs leading-5 text-slate-600"
                            >
                              • {comment}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button asChild variant="ghost" className="mt-3 px-0 text-blue-700 hover:bg-transparent hover:text-blue-800">
                        <Link href={`/komunitas/post/${post.id}`}>Muat lebih banyak</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <aside>
            <Card className="sticky top-24 border-slate-200 bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  Cara kerja halaman
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
                <p>Post dikumpulkan dari beberapa komunitas dalam satu feed.</p>
                <p>Setiap post tetap menampilkan sumber komunitas asalnya.</p>
                <p>Global realtime feed tidak tersedia pada halaman ini.</p>
                <p>Realtime komentar hanya aktif di halaman detail post.</p>
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>
    </div>
  );
}
