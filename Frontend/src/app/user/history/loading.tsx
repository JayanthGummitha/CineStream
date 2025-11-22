import { Skeleton } from '@/components/ui/skeleton';
import { IconHistory } from '@tabler/icons-react';

/**
 * Loading State for Watch History Page
 * 
 * Displays skeleton placeholders while watch history data is being loaded.
 * Matches the layout structure of the main WatchHistoryClient component.
 * 
 * Requirements: 6.2, 6.4
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-purple-500/20">
          <IconHistory className="h-6 w-6 text-purple-400" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="mb-6 space-y-4">
        {/* Search Input Skeleton */}
        <Skeleton className="h-10 w-full" />

        {/* Filter Buttons Skeleton */}
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-6 w-16 ml-auto" />
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
