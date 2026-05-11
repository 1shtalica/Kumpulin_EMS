import { Skeleton } from "@/components/ui/skeleton";

const skel = "bg-slate-200/70";
const skelSoft = "bg-slate-100";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <div className="pt-16 md:pt-18">
        <div className="relative w-full">
          <div className="relative z-10 py-5 md:py-7">
            <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl">
              <div className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-lg shadow-slate-900/10">
                <Skeleton
                  className={`${skel} w-full rounded-none h-54 sm:h-76 md:h-96 lg:h-108 xl:h-120 max-h-120`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-14 md:pb-18 relative z-20">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 lg:gap-6">
            <div className="xl:col-span-8">
              <section className="w-full flex flex-col items-center justify-between relative z-20">
                <div className="w-full h-fit p-5 sm:p-6 lg:p-7 bg-white shadow-md shadow-slate-900/5 border border-slate-200/80 rounded-2xl">
                  <div className="flex flex-col gap-5 md:gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className={`${skel} h-6 w-24 rounded-xl`} />
                      <Skeleton className={`${skel} h-6 w-16 rounded-xl`} />
                      <Skeleton className={`${skel} h-6 w-20 rounded-xl`} />
                    </div>

                    <div className="flex items-start gap-3 py-3 md:py-4">
                      <Skeleton className="mt-1 h-9 w-1 rounded-full bg-primary/30 shrink-0" />
                      <div className="w-full space-y-3">
                        <Skeleton className={`${skel} h-9 w-4/5 rounded-xl`} />
                        <Skeleton className={`${skel} h-9 w-2/3 rounded-xl`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5"
                        >
                          <Skeleton className={`${skel} w-10 h-10 shrink-0 rounded-xl`} />
                          <div className="flex flex-col w-full gap-2 mt-0.5">
                            <Skeleton className={`${skel} h-3 w-24 rounded-md`} />
                            <Skeleton className={`${skel} h-4 w-3/4 rounded-md`} />
                            <Skeleton className={`${skel} h-3 w-1/2 rounded-md`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <Skeleton className={`${skelSoft} h-px w-full`} />

                    <div className="bg-primary-light/70 py-4 px-4 sm:px-5 rounded-2xl border border-primary/10">
                      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-row items-center gap-4 w-full md:w-auto">
                          <Skeleton className={`${skel} h-12 w-12 rounded-full shrink-0`} />
                          <div className="flex flex-col gap-2 w-full md:w-56">
                            <Skeleton className={`${skel} h-5 w-40 rounded-md`} />
                            <Skeleton className={`${skel} h-4 w-full rounded-md`} />
                            <Skeleton className={`${skel} h-4 w-3/4 rounded-md`} />
                          </div>
                        </div>
                        <Skeleton className={`${skel} h-9 w-full md:w-28 rounded-xl`} />
                      </div>
                    </div>

                    <div className="pt-2 md:pt-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-7 w-1 rounded-full bg-primary/30" />
                        <Skeleton className={`${skel} h-7 w-40 rounded-lg`} />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className={`${skel} h-4 w-full rounded-md`} />
                        <Skeleton className={`${skel} h-4 w-full rounded-md`} />
                        <Skeleton className={`${skel} h-4 w-5/6 rounded-md`} />
                        <Skeleton className={`${skel} h-4 w-4/6 rounded-md`} />
                      </div>
                    </div>

                    <div className="pt-2 md:pt-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Skeleton className="h-7 w-1 rounded-full bg-primary/30" />
                        <Skeleton className={`${skel} h-7 w-44 rounded-lg`} />
                      </div>
                      <div className="flex flex-col gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex flex-col md:flex-row gap-3 md:gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                          >
                            <Skeleton className={`${skel} h-8 w-28 rounded-xl shrink-0`} />
                            <div className="flex flex-col w-full gap-2">
                              <Skeleton className={`${skel} h-5 w-1/2 rounded-md`} />
                              <Skeleton className={`${skel} h-4 w-1/3 rounded-md`} />
                              <Skeleton className={`${skel} h-12 w-full mt-1 rounded-xl`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="xl:col-span-4 relative">
              <div className="sticky top-24">
                <section className="w-full flex flex-col relative z-20">
                  <div className="w-full bg-white shadow-md shadow-slate-900/5 border border-slate-200/80 rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-5 pb-3 flex flex-col gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24 rounded-md bg-primary/20" />
                        <Skeleton className={`${skel} h-7 w-36 rounded-lg`} />
                      </div>

                      <div className="flex flex-col gap-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <div className="w-12 sm:w-16 bg-slate-100" />
                            <div className="flex-1 p-3.5">
                              <Skeleton className={`${skel} h-4 w-1/2 mb-2 rounded-md`} />
                              <Skeleton className={`${skel} h-5 w-1/3 mb-2 rounded-md`} />
                              <Skeleton className={`${skel} h-3 w-full mb-1 rounded-md`} />
                              <Skeleton className={`${skel} h-3 w-4/5 mb-3 rounded-md`} />
                              <div className="mt-3 flex items-center gap-2">
                                <Skeleton className={`${skel} h-1.5 w-full rounded-full`} />
                                <Skeleton className={`${skel} h-3 w-16 shrink-0 rounded-md`} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-primary-light rounded-xl flex items-center justify-between border border-primary/10">
                        <Skeleton className={`${skel} h-5 w-24 rounded-md`} />
                        <Skeleton className={`${skel} h-8 w-24 rounded-xl`} />
                      </div>
                    </div>

                    <div className="shrink-0 p-5 pt-3 flex flex-col gap-3 border-t border-slate-100 bg-white">
                      <div className="flex justify-between items-end">
                        <Skeleton className={`${skel} h-5 w-16 rounded-md`} />
                        <Skeleton className={`${skel} h-7 w-32 rounded-lg`} />
                      </div>
                      <Skeleton className="h-14 w-full rounded-xl bg-primary/20" />
                      <Skeleton className={`${skelSoft} h-px w-full`} />
                      <div className="flex items-center justify-between">
                        <Skeleton className={`${skel} h-4 w-32 rounded-md`} />
                        <div className="flex gap-2">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className={`${skel} w-8 h-8 rounded-full`} />
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
