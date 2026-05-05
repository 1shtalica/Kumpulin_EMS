import { Plus, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Communities() {
    return (
        <main className=" flex h-[calc(100vh-136px)] min-h-0 items-center justify-center overflow-hidden bg-white px-6 py-3 md:-mx-8 md:px-8">
            <section className="w-full max-w-130 text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[linear-gradient(180deg,#e8e9f8_0%,#e8e9f8_58%,#87939d_59%,#cfd8df_100%)] shadow-[inset_0_1px_8px_rgba(15,23,42,0.08)] sm:h-40 sm:w-40">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_12px_24px_rgba(15,23,42,0.13)] sm:h-24 sm:w-24">
                        <div className="absolute bottom-3 h-2 w-14 rounded-[100%] bg-slate-300/70 blur-[1px]" />
                        <UsersRound
                            className="relative h-8 w-8 text-primary sm:h-10 sm:w-10"
                            strokeWidth={3}
                        />
                    </div>
                </div>

                <h1 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                    Belum ada komunitas
                </h1>
                <p className="mx-auto mt-3 max-w-110 text-sm leading-6 text-slate-500">
                    Anda saat ini belum mengelola komunitas apa pun. Mulai
                    bangun ekosistem eksklusif untuk berinteraksi langsung
                    dengan audiens Anda sekarang.
                </p>

                <Button className="mt-6 h-11 rounded-3xl px-7 text-sm font-semibold shadow-[0_8px_16px_rgba(37,99,235,0.2)]">
                    <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    Buat Komunitas Sekarang
                </Button>
            </section>
        </main>
    );
}
