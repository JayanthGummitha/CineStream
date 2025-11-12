import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Skeleton } from '@/components/ui/loading-skeleton';

// Create skeleton components
function HeroSectionSkeleton() {
  return (
    <div className="relative h-screen w-full">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="relative z-10 flex h-full items-center">
        <div className="container max-w-screen-2xl px-4">
          <div className="space-y-6">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full max-w-3xl" />
            <div className="flex space-x-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContentCarouselSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-80">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={false} />
      
      <main>
        <HeroSectionSkeleton />
        
        <div className="container max-w-screen-2xl px-4 py-12 space-y-12">
          <ContentCarouselSkeleton />
          <ContentCarouselSkeleton />
          <ContentCarouselSkeleton />
          <ContentCarouselSkeleton />
        </div>
      </main>

      <Footer />
    </div>
  );
}