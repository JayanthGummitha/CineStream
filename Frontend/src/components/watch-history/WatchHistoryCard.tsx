'use client';

import { memo } from 'react';
import { WatchProgressData } from '@/types/watch-progress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface WatchHistoryCardProps {
  item: WatchProgressData;
  onDelete: () => void;
}

/**
 * WatchHistoryCard Component
 * 
 * Displays an individual watch history item with:
 * - Thumbnail image with progress overlay
 * - Title and episode details (for TV shows)
 * - Progress bar showing completion percentage
 * - Last watched timestamp in relative format
 * - Delete button on hover
 * - Navigation to appropriate content page
 * 
 * Performance Optimizations:
 * - Wrapped with React.memo to prevent unnecessary re-renders
 * - Next.js Image component with lazy loading and responsive sizes
 * - Optimized image sizes for different viewports
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.3, 6.1, 6.2
 */
function WatchHistoryCardComponent({ item, onDelete }: WatchHistoryCardProps) {
  // Check if item is completed (90% or higher) - Requirement 2.4, 2.6
  const isCompleted = item.percentage >= 90;

  // Determine navigation URL based on content type (Requirement 3.1)
  const getContentUrl = () => {
    // For TV shows, use seriesName if available, otherwise fall back to title
    const titleForSlug = item.contentType === 'tv-show' && item.seriesName 
      ? item.seriesName 
      : item.title;
    
    // Create URL-friendly slug from title
    const slug = titleForSlug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    if (item.contentType === 'movie') {
      return `/movie/${item.videoId}/${slug}`;
    } else if (item.contentType === 'tv-show') {
      return `/tv-shows/${item.videoId}/${slug}`;
    }
    // Fallback for other content types
    return '#';
  };

  // Format episode info for screen readers
  const episodeInfo = item.contentType === 'tv-show' && item.episodeTitle
    ? `Season ${item.seasonNumber}, Episode ${item.episodeNumber}: ${item.episodeTitle}`
    : '';

  // Format progress for screen readers
  const progressText = `${Math.round(item.percentage)}% watched`;
  const completionStatus = isCompleted ? 'Completed' : 'In progress';

  // Format timestamp for screen readers
  const timestampText = formatDistanceToNow(new Date(item.lastWatchedAt), { addSuffix: true });

  // Comprehensive aria-label for the link
  const linkAriaLabel = [
    isCompleted ? `Rewatch ${item.title}` : `Continue watching ${item.title}`,
    episodeInfo,
    completionStatus,
    progressText,
    `Last watched ${timestampText}`,
  ].filter(Boolean).join('. ');

  return (
    <Card className="group relative overflow-hidden hover:ring-primary hover:border-2  transition-all border-2  p-2">
      <Link 
        href={getContentUrl()}
        aria-label={linkAriaLabel}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
      >
        <article>
          <div className="relative aspect-video">
            <Image
              src={item.thumbnail || '/placeholder-movie.jpg'}
              alt=""
              role="presentation"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
            
            {/* Completed Badge - Requirement 2.4, 2.6 */}
            {isCompleted && (
              <div className="absolute top-1 left-0 z-10 ">
                <Badge 
                  variant="secondary" 
                  className="bg-green-500/90 hover:bg-green-500 text-white border-0 shadow-lg backdrop-blur-sm gap-1"
                  aria-label="Completed"
                >
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span className="font-semibold">Completed</span>
                </Badge>
              </div>
            )}
            

            <div className="absolute bottom-0 left-0 p-1">
              {/* <Progress 
                value={item.percentage} 
                className="h-1 mb-2 bg-white/20" 
                aria-label={progressText}
                role="progressbar"
                aria-valuenow={Math.round(item.percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              /> */}
              <p 
                  className="text-white border-0 shadow-lg backdrop-blur-sm gap-1"
              
              aria-hidden="true">
                {progressText}
              </p>
            </div>
          </div>

          <div className="p-1 space-y-2">
            <h3 className="font-semibold line-clamp-1 text-base" aria-hidden="true">
              {item.title}
            </h3>
            
            {item.contentType === 'tv-show' && item.episodeTitle && (
              <p className="text-sm text-muted-foreground line-clamp-1" aria-hidden="true">
                S{item.seasonNumber} E{item.episodeNumber}: {item.episodeTitle}
              </p>
            )}
            
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="capitalize" aria-hidden="true">
                {item.contentType === 'tv-show' ? 'TV Show' : item.contentType}
              </span>
              <span aria-hidden="true">•</span>
              <time dateTime={item.lastWatchedAt} aria-hidden="true">
                {timestampText}
              </time>
            </div>
          </div>
        </article>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 focus:bg-black/80 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Remove ${item.title} from watch history`}
        tabIndex={0}
      >
        <Trash2 className="h-4 w-4 text-white" aria-hidden="true" />
      </Button>
    </Card>
  );
}

/**
 * Memoized WatchHistoryCard
 * 
 * Uses React.memo to prevent unnecessary re-renders when parent component updates.
 * Only re-renders when item data or onDelete callback changes.
 * 
 * Performance Impact:
 * - Reduces re-renders when filtering or pagination changes
 * - Improves performance with large lists (>20 items)
 * - Maintains smooth UI interactions
 */
export const WatchHistoryCard = memo(WatchHistoryCardComponent);
