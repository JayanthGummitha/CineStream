'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, TVShow } from '@/types';

interface PopularWeekSectionProps {
  items: (Movie | TVShow)[];
  isAuthenticated: boolean;
}

export function PopularWeekSection({ items, isAuthenticated }: PopularWeekSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      // Calculate scroll amount based on viewport width for 4 cards from md onwards
      const viewportWidth = window.innerWidth;
      let scrollAmount;
      
      if (viewportWidth >= 768) {
        // md and above: scroll by 2 cards (half of 4 visible cards)
        scrollAmount = (viewportWidth * 0.99 - viewportWidth * 0.01 - 48) / 4 * 2; // 48px = 3rem gap
      } else if (viewportWidth >= 640) {
        // sm: scroll by 1 card
        scrollAmount = 384; // w-96 = 384px
      } else {
        // mobile: scroll by 1 card
        scrollAmount = 320; // w-80 = 320px
      }

      const newScrollLeft = scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="w-full space-responsive-large">
      {/* Header with minimal padding on sides */}
      <div className="flex items-center justify-between full-width-minimal">
        <h2 className="heading-section text-white">Popular of the week</h2>
        <div className="flex items-center gap-responsive-compact">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="h-10 w-10 p-0 bg-black/40 border-white/20 hover:bg-black/60 touch-target"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Horizontal Scrolling Carousel - Full width with minimal padding */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 full-width-minimal"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.slice(0, 10).map((item, index) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-80 sm:w-96 md:w-[calc((100vw-1vw-3rem)/4)] lg:w-[calc((100vw-1vw-3rem)/4)] xl:w-[calc((100vw-1vw-3rem)/4)]"
          >
            <PopularWeekCard
              item={item}
              rank={index + 1}
              isAuthenticated={isAuthenticated}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

interface PopularWeekCardProps {
  item: Movie | TVShow;
  rank: number;
  isAuthenticated: boolean;
}

function PopularWeekCard({ item, rank, isAuthenticated }: PopularWeekCardProps) {
  const isMovie = !('seasons' in item);

  return (
    <Link href={isMovie ? createDetailUrl('movie', item.id, item.title) : createDetailUrl('tv', item.id, item.title)}>
      <div className="group flex items-center gap-responsive cursor-pointer transition-all duration-300 hover:scale-105 w-full">

        {/* Rank Number */}
        <div className="flex-shrink-0">
          <span className="text-6xl font-black text-white leading-none">
            {rank}
          </span>
        </div>

        {/* Movie Poster */}
        <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="96px"
            className="object-cover transition-all duration-300 group-hover:brightness-110"
          />
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 space-responsive-compact overflow-text-responsive">
          {/* Content Rating Badge - Above Title */}
          <div className="mb-1">
            <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
              {item.contentRating}
            </span>
          </div>

          <h3 className="heading-card text-white font-bold leading-tight overflow-ellipsis-responsive">
            {item.title}
          </h3>

          {/* Genres */}
          <div className="flex items-center gap-1 caption-text text-white/70">
            <span className="w-2 h-2 bg-white/50 rounded-full"></span>
            <span>{item.genres.slice(0, 2).join(' • ')}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-responsive-compact">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-semibold caption-text">{item.rating}</span>
            </div>
            <span className="text-white/60 caption-text">
              {isMovie ? 'Movie' : 'TV Show'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}