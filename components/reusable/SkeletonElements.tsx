import { Skeleton } from "@/components/ui/skeleton";
import { EventCardSkeletonList } from "@/components/reusable/EventCard";

// --- Explore Page ---

export function SkeletonExploreHeader() {
    return (
        <div className="bg-white border-b border-border">
            <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl py-8">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-lg border border-border overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-20" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonEventGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <EventCardSkeletonList count={8} />
        </div>
    );
}

// --- Organizer Events Page ---

export function SkeletonOrganizerEventCard({
    layout = "list",
}: {
    layout?: "list" | "grid";
}) {
    const isGrid = layout === "grid";

    return (
        <div
            className={`flex h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-card-foreground shadow-sm shadow-slate-900/5 ${isGrid ? "flex-col" : "flex-col lg:flex-row"}`}
        >
            <div
                className={`relative z-10 flex shrink-0 items-center justify-center overflow-hidden ${isGrid ? "m-3 h-44 w-[calc(100%-24px)] rounded-xl sm:h-48" : "m-3 h-48 w-[calc(100%-24px)] rounded-xl lg:m-4 lg:mr-0 lg:h-auto lg:min-h-52 lg:w-72"}`}
            >
                <Skeleton className="h-full w-full rounded-none" />
            </div>

            <div
                className={`relative z-10 flex flex-1 flex-col justify-between gap-4 bg-white ${isGrid ? "px-5 pb-5 pt-2" : "p-5 pt-2 lg:p-6"}`}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <Skeleton className="h-3 w-14" />
                            <Skeleton className="mt-2 h-5 w-3/4" />
                            <Skeleton className="mt-1.5 h-5 w-1/2" />
                        </div>
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>

                <Skeleton className="h-px w-full" />

                <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                    <Skeleton className="h-9 w-16 rounded-xl" />
                    <Skeleton className="h-9 w-16 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function SkeletonOrganizerEvents({
    layout = "list",
}: {
    layout?: "list" | "grid";
}) {
    return (
        <div
            className={
                layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "flex flex-col gap-4"
            }
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonOrganizerEventCard key={i} layout={layout} />
            ))}
        </div>
    );
}
