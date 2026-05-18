import Link from "next/link";
import {
    ArrowUpRight,
    Banknote,
    CalendarCheck,
    CheckCircle2,
    Clock3,
    MapPin,
    Plus,
    ScanLine,
    Ticket,
    Users,
    WalletCards,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stats = [
    {
        label: "Pendapatan bulan ini",
        value: "Rp 86,4 jt",
        helper: "+18,2% dari bulan lalu",
        icon: Banknote,
        tone: "text-primary bg-primary/10",
    },
    {
        label: "Tiket terjual",
        value: "1.248",
        helper: "74% dari kapasitas aktif",
        icon: Ticket,
        tone: "text-success bg-success-light/70",
    },
    {
        label: "Event aktif",
        value: "12",
        helper: "4 event berlangsung pekan ini",
        icon: CalendarCheck,
        tone: "text-info bg-info-light/80",
    },
    {
        label: "Check-in hari ini",
        value: "326",
        helper: "42 tiket menunggu validasi",
        icon: ScanLine,
        tone: "text-warning-hover bg-warning-light/80",
    },
];

const weeklySales = [
    { day: "Sen", value: 42 },
    { day: "Sel", value: 58 },
    { day: "Rab", value: 76 },
    { day: "Kam", value: 64 },
    { day: "Jum", value: 88 },
    { day: "Sab", value: 94 },
    { day: "Min", value: 71 },
];

const priorityEvents = [
    {
        title: "Jakarta Creative Meetup 2026",
        status: "Published",
        date: "12 Mei",
        location: "Jakarta Selatan",
        sold: 486,
        capacity: 600,
        revenue: "Rp 38,8 jt",
    },
    {
        title: "Kelas UI/UX Portfolio Review",
        status: "Ongoing",
        date: "16 Mei",
        location: "Online",
        sold: 212,
        capacity: 240,
        revenue: "Rp 12,7 jt",
    },
    {
        title: "Bandung Founder Night",
        status: "Draft",
        date: "22 Mei",
        location: "Bandung",
        sold: 0,
        capacity: 180,
        revenue: "Rp 0",
    },
];

const recentTransactions = [
    {
        buyer: "Nadia Putri",
        event: "Jakarta Creative Meetup",
        amount: "Rp 150.000",
        status: "Lunas",
        time: "10 menit lalu",
    },
    {
        buyer: "Rizky Ardiansyah",
        event: "Kelas UI/UX Portfolio Review",
        amount: "Rp 75.000",
        status: "Lunas",
        time: "28 menit lalu",
    },
    {
        buyer: "Dewi Lestari",
        event: "Bandung Founder Night",
        amount: "Rp 125.000",
        status: "Menunggu",
        time: "1 jam lalu",
    },
    {
        buyer: "Arman Hakim",
        event: "Jakarta Creative Meetup",
        amount: "Rp 300.000",
        status: "Lunas",
        time: "2 jam lalu",
    },
];

const tasks = [
    {
        title: "Lengkapi rekening pencairan",
        description: "Payout Jakarta Creative Meetup siap diproses setelah rekening diverifikasi.",
        due: "Hari ini",
    },
    {
        title: "Aktifkan sesi check-in",
        description: "Kelas UI/UX Portfolio Review mulai dalam 2 hari.",
        due: "Besok",
    },
    {
        title: "Terbitkan draft event",
        description: "Bandung Founder Night sudah punya 86 pengikut yang menunggu tiket.",
        due: "22 Mei",
    },
];

const audienceSegments = [
    { label: "Komunitas", value: 44 },
    { label: "Referral", value: 27 },
    { label: "Pencarian", value: 18 },
    { label: "Sosial", value: 11 },
];

const formatPercent = (value: number, capacity: number) =>
    capacity > 0 ? Math.round((value / capacity) * 100) : 0;

export default function DashboardStatisticRow() {
    return (
        <div className="flex flex-col gap-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-sm">
                <div className="grid gap-6 p-5 md:grid-cols-[1.35fr_0.65fr] md:p-7">
                    <div className="flex flex-col justify-between gap-8">
                        <div className="space-y-3">
                            <Badge className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                                Ringkasan operasional
                            </Badge>
                            <div className="max-w-2xl space-y-2">
                                <h2 className="text-xl font-bold leading-tight text-white md:text-2xl">
                                    Dashboard organizer terisi untuk memantau event, tiket, dan payout.
                                </h2>
                                <p className="max-w-xl text-xs leading-relaxed text-slate-300 md:text-sm">
                                    Data dummy ini memberi gambaran lengkap sambil menunggu endpoint statistik organizer siap dipakai.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                                <Link href="/organizer/create-event">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Event
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href="/organizer/my-event">
                                    Lihat Event
                                    <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/8 p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase text-slate-400">Target penjualan</p>
                                <p className="mt-1 text-2xl font-bold text-white">82%</p>
                            </div>
                            <WalletCards className="h-8 w-8 text-slate-300" />
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[82%] rounded-full bg-white" />
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-slate-400">Terjual</p>
                                <p className="font-semibold text-white">1.248 tiket</p>
                            </div>
                            <div>
                                <p className="text-slate-400">Target</p>
                                <p className="font-semibold text-white">1.520 tiket</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.label}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <Badge variant="outline" className="rounded-full border-slate-200 text-xs text-slate-500">
                                    Mei 2026
                                </Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-500">{item.label}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-950">{item.value}</p>
                            <p className="mt-2 text-xs font-medium text-slate-500">{item.helper}</p>
                        </div>
                    );
                })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-950">Penjualan 7 hari</h3>
                            <p className="text-sm text-slate-500">Jumlah tiket terjual dari semua event aktif.</p>
                        </div>
                        <Badge className="w-fit rounded-full bg-success-light text-success-hover hover:bg-success-light">
                            +12,4%
                        </Badge>
                    </div>

                    <div className="flex h-64 items-end gap-3">
                        {weeklySales.map((item) => (
                            <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-3">
                                <div className="flex flex-1 items-end rounded-full bg-slate-100">
                                    <div
                                        className="w-full rounded-full bg-primary transition-all duration-300"
                                        style={{ height: `${item.value}%` }}
                                    />
                                </div>
                                <span className="text-center text-xs font-medium text-slate-500">{item.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-950">Sumber audiens</h3>
                        <p className="text-sm text-slate-500">Distribusi pendaftar berdasarkan kanal masuk.</p>
                    </div>

                    <div className="space-y-5">
                        {audienceSegments.map((segment) => (
                            <div key={segment.label}>
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-700">{segment.label}</span>
                                    <span className="font-semibold text-slate-950">{segment.value}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-slate-900"
                                        style={{ width: `${segment.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start gap-3">
                            <Users className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm font-semibold text-slate-950">1.876 calon peserta</p>
                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    312 orang menyimpan event dan belum checkout. Prioritaskan broadcast komunitas pekan ini.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-950">Event prioritas</h3>
                            <p className="text-sm text-slate-500">Event yang paling perlu dipantau oleh organizer.</p>
                        </div>
                        <Button asChild variant="outline" className="rounded-full">
                            <Link href="/organizer/my-event">Kelola</Link>
                        </Button>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {priorityEvents.map((event) => {
                            const progress = formatPercent(event.sold, event.capacity);

                            return (
                                <div key={event.title} className="p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <h4 className="font-semibold text-slate-950">{event.title}</h4>
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-full border-slate-200 text-xs text-slate-500"
                                                >
                                                    {event.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock3 className="h-4 w-4" />
                                                    {event.date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-3 lg:min-w-[330px]">
                                            <div>
                                                <p className="text-slate-500">Terjual</p>
                                                <p className="mt-1 font-semibold text-slate-950">
                                                    {event.sold}/{event.capacity}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Progress</p>
                                                <p className="mt-1 font-semibold text-slate-950">{progress}%</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Revenue</p>
                                                <p className="mt-1 font-semibold text-slate-950">{event.revenue}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-5">
                        <h3 className="text-lg font-semibold text-slate-950">Tugas organizer</h3>
                        <p className="text-sm text-slate-500">Antrian kerja yang berpengaruh ke event aktif.</p>
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.title} className="flex gap-3">
                                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <p className="font-semibold text-slate-950">{task.title}</p>
                                        <span className="shrink-0 text-xs font-medium text-slate-500">{task.due}</span>
                                    </div>
                                    <p className="mt-1 text-sm leading-5 text-slate-500">{task.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-950">Transaksi terbaru</h3>
                        <p className="text-sm text-slate-500">Pembayaran terakhir dari seluruh event organizer.</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-slate-200 text-slate-500">
                        Live dummy
                    </Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-5 py-3 font-semibold">Pembeli</th>
                                <th className="px-5 py-3 font-semibold">Event</th>
                                <th className="px-5 py-3 font-semibold">Nominal</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold">Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentTransactions.map((transaction) => (
                                <tr key={`${transaction.buyer}-${transaction.time}`} className="hover:bg-slate-50/70">
                                    <td className="px-5 py-4 font-semibold text-slate-950">{transaction.buyer}</td>
                                    <td className="px-5 py-4 text-slate-600">{transaction.event}</td>
                                    <td className="px-5 py-4 font-semibold text-slate-950">{transaction.amount}</td>
                                    <td className="px-5 py-4">
                                        <Badge
                                            className={
                                                transaction.status === "Lunas"
                                                    ? "rounded-full bg-success-light text-success-hover hover:bg-success-light"
                                                    : "rounded-full bg-warning-light text-warning-hover hover:bg-warning-light"
                                            }
                                        >
                                            {transaction.status}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500">{transaction.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
