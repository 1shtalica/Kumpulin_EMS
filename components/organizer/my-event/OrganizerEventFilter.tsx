"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    LayoutList,
    LayoutGrid,
    SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useViewPreferenceStore } from "@/stores/view-preference-store";

// type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
type filterItems = {
    title: string;
    value: string;
};

const statusFilter: filterItems[] = [
    { title: "Semua", value: "all" },
    { title: "Draft", value: "draft" },
    { title: "Diterbitkan", value: "published" },
    { title: "Pendaftaran Selesai", value: "registration closed" },
    { title: "Berlangsung", value: "ongoing" },
    { title: "Selesai", value: "finished" },
    { title: "Diarsipkan", value: "archived" },
    { title: "Dibatalkan", value: "cancelled" },
];

export default function MyEventFilter() {
    const { replace } = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const query = searchParams.get("q") ?? "";
    const status = searchParams.get("status") ?? "all";
    const { layout, setLayout } = useViewPreferenceStore();
    const activeFilter =
        statusFilter.find((filter) => filter.value === status)?.title ??
        "Semua";

    const handleURL = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete("offset");
        replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const debounceSearch = useDebouncedCallback((term: string) => {
        handleURL("q", term);
    }, 500);

    return (
        <section className="flex flex-col gap-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-900/5">
                <svg
                    className="pointer-events-none absolute -right-10 -top-12 h-40 w-56 text-primary"
                    viewBox="0 0 224 160"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M15 96C48 34 91 12 144 30C183 43 199 81 210 132"
                        stroke="currentColor"
                        strokeOpacity="0.1"
                        strokeWidth="18"
                        strokeLinecap="round"
                    />
                    <path
                        d="M54 125C82 80 115 65 153 78C179 87 193 108 201 143"
                        stroke="#10b981"
                        strokeOpacity="0.1"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    <rect
                        x="126"
                        y="24"
                        width="18"
                        height="18"
                        rx="5"
                        fill="currentColor"
                        fillOpacity="0.1"
                    />
                    <rect
                        x="155"
                        y="43"
                        width="26"
                        height="26"
                        rx="7"
                        fill="currentColor"
                        fillOpacity="0.08"
                    />
                </svg>

                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                            Organizer workspace
                        </p>
                        <div>
                            <h2 className="text-3xl font-bold leading-[1.12] tracking-normal text-slate-950 md:text-4xl">
                                Event Saya
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base">
                                Pantau publikasi, kapasitas, dan akses cepat
                                untuk setiap event yang kamu kelola.
                            </p>
                        </div>
                    </div>

                    <Button
                        size="default"
                        className="h-10 w-full rounded-xl px-4 text-sm font-semibold shadow-md shadow-primary/20 sm:w-auto"
                        asChild
                    >
                        <Link href="/organizer/create-event">
                            <Plus className="h-4 w-4" />
                            Buat Event
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm shadow-slate-900/5 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="text"
                        className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium shadow-none transition-all focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/20"
                        placeholder="Cari judul, lokasi, atau tipe event..."
                        defaultValue={query}
                        onChange={(e) => debounceSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                debounceSearch.cancel();
                                handleURL("q", e.currentTarget.value);
                            }
                        }}
                    />
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <div className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-[13px] font-medium text-slate-500 sm:flex">
                        <SlidersHorizontal className="h-4 w-4" />
                        Status:{" "}
                        <span className="text-slate-900">{activeFilter}</span>
                    </div>

                    <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                        <Button
                            variant={layout === "list" ? "brand" : "ghost"}
                            size="icon"
                            onClick={() => setLayout("list")}
                            aria-label="Tampilkan sebagai daftar"
                            className={`h-8 w-8 rounded-lg shadow-none ${layout !== "list" && "text-slate-500 hover:text-slate-900"}`}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={layout === "grid" ? "brand" : "ghost"}
                            size="icon"
                            onClick={() => setLayout("grid")}
                            aria-label="Tampilkan sebagai grid"
                            className={`h-8 w-8 rounded-lg shadow-none ${layout !== "grid" && "text-slate-500 hover:text-slate-900"}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-1">
                {statusFilter.map((filter) => {
                    const isActive = status === filter.value;

                    return (
                        <Button
                            key={filter.value}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleURL("status", filter.value)}
                            className={
                                isActive
                                    ? "h-9 shrink-0 rounded-xl border border-primary bg-primary px-4 font-medium text-white shadow-md shadow-primary/20 transition-all hover:bg-primary-hover hover:text-white"
                                    : "h-9 shrink-0 rounded-xl border-slate-200 bg-white px-4 font-medium text-slate-600 shadow-sm shadow-slate-900/5 transition-all hover:border-primary/30 hover:text-primary"
                            }
                        >
                            {filter.title}
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}
