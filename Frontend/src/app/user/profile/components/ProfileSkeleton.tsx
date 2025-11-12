/**
 * ProfileSkeleton Component
 * Loading skeleton for the profile page
 * Displays placeholder content while profile data is being fetched
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProfileSkeleton() {
  return (
    <div 
      className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl animate-in fade-in duration-300"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading profile information"
    >
      {/* Screen reader announcement */}
      <span className="sr-only">Loading profile information, please wait...</span>
      
      {/* Header Skeleton */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 py-6 sm:py-8 animate-in fade-in slide-in-from-top-4 duration-500">
        {/* Profile Photo Skeleton */}
        <Skeleton className="w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full animate-pulse" aria-hidden="true" />
        
        {/* User Identity Skeleton */}
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-48 animate-pulse" aria-hidden="true" />
          <Skeleton className="h-4 w-64 animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {/* Sections Grid Skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mt-6 sm:mt-8">
        {/* Render 4 section skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <Card 
            key={i} 
            className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all" 
            style={{ animationDelay: `${i * 100}ms` }}
            aria-hidden="true"
          >
            <CardHeader>
              <Skeleton className="h-6 w-40 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Render 5-7 row skeletons per section */}
                {Array.from({ length: i === 1 || i === 2 ? 7 : 6 }).map((_, j) => (
                  <div key={j} className="flex items-start gap-4 py-2 sm:py-3 px-3 sm:px-4">
                    <Skeleton className="h-4 w-[40%] animate-pulse" style={{ animationDelay: `${j * 50}ms` }} />
                    <Skeleton className="h-4 w-[60%] animate-pulse" style={{ animationDelay: `${j * 50 + 25}ms` }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
