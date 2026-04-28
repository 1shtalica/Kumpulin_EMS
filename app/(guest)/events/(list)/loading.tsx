import LandingNavbar from "@/components/landingpage/LandingNavbar";
import { EventCardSkeletonList } from "@/components/reusable/EventCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingEvents() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <main className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-20 grow">

        {/* Search Bar Skeleton */}
        <section className="w-full pt-28 md:pt-36 pb-4 relative z-10">
          <div className="w-full max-w-3xl mx-auto space-y-4 md:space-y-5 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Eksplorasi <span className="text-primary relative inline-block">
                Event Seru
              </span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
              Temukan dan ikuti berbagai acara menarik di sekitarmu, mulai dari konser, workshop, hingga seminar.
            </p>

            <div className="relative mt-6 md:mt-8 group w-full">
              <div className="relative flex items-center w-full bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[1.5rem] sm:rounded-full p-1.5 lg:p-2 h-14 lg:h-16">
                 {/* Search icon placeholder */}
                 <Skeleton className="h-5 w-5 rounded-full ml-3 shrink-0" />
                 <Skeleton className="h-4 w-1/2 ml-4" />
                 <div className="hidden sm:flex ml-auto pr-0.5 shrink-0">
                   <Skeleton className="h-10 lg:h-12 w-24 rounded-full" />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Bar Skeleton */}
        <div className="mb-8 relative z-20">
          <section className="sticky top-20 z-40 py-4 pointer-events-none">
            <div className="w-full max-w-4xl mx-auto pointer-events-auto">
              <div className="relative w-full bg-white/95 border border-slate-200/80 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-[1.5rem] lg:rounded-full p-2 lg:p-1.5">
                <div className="flex flex-col lg:flex-row lg:items-center">
                  <div className="grid grid-cols-2 lg:flex w-full flex-1 gap-1 lg:gap-0 lg:divide-x divide-slate-100">
                    {/* Category */}
                    <div className="flex-1 w-full p-2 flex flex-col justify-center items-center gap-2 h-16">
                       <Skeleton className="h-3 w-16" />
                       <Skeleton className="h-4 w-20" />
                    </div>
                    {/* Location */}
                    <div className="flex-1 w-full p-2 flex flex-col justify-center items-center gap-2 h-16">
                       <Skeleton className="h-3 w-16" />
                       <Skeleton className="h-4 w-24" />
                    </div>
                    {/* Price */}
                    <div className="flex-1 w-full p-2 flex flex-col justify-center items-center gap-2 h-16">
                       <Skeleton className="h-3 w-16" />
                       <Skeleton className="h-4 w-20" />
                    </div>
                    {/* Sort */}
                    <div className="flex-1 w-full p-2 flex flex-col justify-center items-center gap-2 h-16">
                       <Skeleton className="h-3 w-16" />
                       <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-full ml-auto mr-1 mt-2 lg:mt-0 bg-slate-50 border border-slate-100 shrink-0">
                    <Skeleton className="w-6 h-6 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* "Menampilkan X event" Skeleton */}
        <div className="mb-6">
           <Skeleton className="h-6 w-48" />
        </div>

        {/* Event List Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <EventCardSkeletonList count={12} />
        </div>

        {/* Pagination Skeleton */}
        <div className="mt-12 flex justify-center">
          <Skeleton className="h-10 w-64 rounded-full" />
        </div>
      </main>
    </div>
  );
}
