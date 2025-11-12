import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-primary/10', className)}
      {...props}
    />
  );
}

function ContentCarouselSkeleton({
  className,
  itemCount = 6,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  itemCount?: number;
}) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Section title skeleton */}
      <Skeleton className="h-8 w-48" />
      
      {/* Carousel items skeleton */}
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="flex-shrink-0 space-y-2">
            {/* Movie poster skeleton */}
            <Skeleton className="h-64 w-44 rounded-lg" />
            {/* Movie title skeleton */}
            <Skeleton className="h-4 w-40" />
            {/* Movie year/rating skeleton */}
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { Skeleton, ContentCarouselSkeleton };