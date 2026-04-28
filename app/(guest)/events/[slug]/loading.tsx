import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="pt-18">
        {/* Skeleton Banner Image matching ImageSection */}
        <div className="relative w-full">
          <div className="relative z-10 py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-12">
                  <Skeleton className="w-full rounded-2xl h-50 sm:h-75 md:h-100 lg:h-112.5 xl:h-125 max-h-125" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Content matching EventDetailContent */}
        <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-20 relative z-20">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left: Detail Section Skeleton */}
            <div className="xl:col-span-8">
              <section className="w-full flex flex-col items-center justify-between relative z-20">
                <div className="w-full h-fit p-10 bg-white shadow-xs border border-slate-200 rounded-3xl">
                  <div className="flex flex-col gap-4">
                    {/* Badges Skeleton */}
                    <div className="flex flex-wrap items-center gap-4">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>

                    {/* Title Skeleton */}
                    <Skeleton className="h-8 w-3/4 mt-2" />

                    {/* Icon Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-row items-center gap-4">
                          <Skeleton className="w-12 h-12 shrink-0 rounded-full" />
                          <div className="flex flex-col w-full gap-2 mt-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Skeleton className="h-px w-full my-4" />

                    {/* Organizer Profile Skeleton */}
                    <div className="bg-primary-light p-6 rounded-3xl">
                      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-row items-center gap-3 w-full md:w-auto">
                          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                          <div className="flex flex-col gap-2 w-40">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                        <Skeleton className="h-10 w-full md:w-24 rounded-full" />
                      </div>
                    </div>

                    {/* About Event Skeleton */}
                    <div className="mt-4">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                    </div>

                    {/* Rundown Skeleton */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Skeleton className="h-8 w-1 rounded-full bg-primary/20" />
                        <Skeleton className="h-6 w-40" />
                      </div>
                      <div className="flex flex-col gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="flex flex-col md:flex-row gap-3 md:gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                            <div className="shrink-0 flex flex-col justify-start md:justify-center pt-1">
                              <Skeleton className="h-8 w-28 rounded-xl" />
                            </div>
                            <div className="flex flex-col w-full gap-2">
                              <Skeleton className="h-6 w-1/2" />
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-12 w-full mt-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Ticket Section Skeleton */}
            <div className="xl:col-span-4 relative">
              <div className="sticky top-28">
                <section className="w-full flex flex-col items-center justify-between relative z-20">
                  <div className="w-full h-fit p-6 bg-white shadow-xs border border-slate-200 rounded-3xl sticky top-24">
                    <div className="flex flex-col gap-6">
                      <Skeleton className="h-6 w-32" />

                      {/* Ticket List Skeleton */}
                      <div className="flex flex-col gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i} className="p-4 border border-border rounded-2xl bg-white">
                            <Skeleton className="h-5 w-1/2 mb-2" />
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-3 w-full mb-1" />
                            <Skeleton className="h-3 w-4/5 mb-3" />
                            <div className="mt-3 flex items-center gap-2">
                              <Skeleton className="h-1.5 w-full rounded-full" />
                              <Skeleton className="h-3 w-16 shrink-0" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Counter Skeleton */}
                      <div className="p-4 bg-primary-light rounded-xl flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-8 w-24 rounded-3xl" />
                      </div>

                      <Skeleton className="h-px w-full" />

                      {/* Total Skeleton */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-end">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-14 w-full rounded-2xl" />
                      </div>

                      <Skeleton className="h-px w-full" />

                      {/* Share Buttons Skeleton */}
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="w-8 h-8 rounded-full" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

