// app/event/[slug]/loading.tsx
export default function Loading() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 w-full max-w-7xl pb-20 pt-24">
          {/* Skeleton untuk image */}
          <div className="w-full h-96 bg-gray-200 animate-pulse rounded-2xl" />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-4">
            <div className="xl:col-span-8 space-y-4">
              <div className="h-8 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4" />
            </div>
            <div className="xl:col-span-4">
              <div className="h-96 bg-gray-200 animate-pulse rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
