import { SkeletonEventGrid } from "@/components/reusable/SkeletonElements";

export default function LoadingEvents() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <SkeletonEventGrid />
      </div>
    </div>
  );
}
