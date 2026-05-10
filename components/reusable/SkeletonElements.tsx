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
            className={`flex bg-card relative text-card-foreground border border-border rounded-2xl overflow-hidden shadow-sm h-full ${isGrid ? "flex-col" : "flex-col sm:flex-row"}`}
        >
            {/* Image Skeleton */}
            <div
                className={`relative shrink-0 flex justify-center items-center z-10 overflow-hidden ${isGrid ? "m-3 rounded-[12px] w-[calc(100%-24px)] h-48" : "m-3 sm:m-4 sm:mr-0 rounded-[12px] w-[calc(100%-24px)] sm:w-70 h-48 sm:min-h-55"}`}
            >
                <Skeleton className="w-full h-full rounded-none" />
            </div>

            {/* Content Skeleton */}
            <div
                className={`flex flex-col flex-1 z-10 relative bg-card justify-between gap-4 ${isGrid ? "p-5 pt-2" : "p-5 sm:p-6"}`}
            >
                {/* Top-Right Badge Skeleton */}
                <div className="absolute top-5 right-5 z-20">
                    <Skeleton className="h-5 w-16 md:w-20 rounded-full" />
                </div>

                {/* Top: Category and Title Skeleton */}
                <div className="space-y-1.5 mt-2 md:mt-0 pr-20">
                    <Skeleton className="h-3 w-12" />
                    <div className="mt-1">
                        <Skeleton className="h-5 w-3/4 mb-1.5" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="flex items-center gap-5 mt-3 pt-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>

                <Skeleton className="w-full h-px my-1" />

                {/* Bottom: Stats and Actions Skeleton */}
                <div
                    className={`flex justify-between gap-4 flex-col sm:flex-row sm:items-end mt-auto ${!isGrid && "w-full"}`}
                >
                    <div className="flex gap-10">
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-10" />
                            <Skeleton className="h-3 w-14" />
                        </div>
                    </div>

                    <div
                        className={`flex items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto`}
                    >
                        {/* 34px is approx h-8.5 */}
                        <Skeleton className="h-8.5 w-8.5 shrink-0 rounded-full" />
                        <Skeleton className="h-8.5 flex-1 sm:w-20 rounded-full" />
                    </div>
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
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "flex flex-col gap-5"
            }
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonOrganizerEventCard key={i} layout={layout} />
            ))}
        </div>
    );
}
