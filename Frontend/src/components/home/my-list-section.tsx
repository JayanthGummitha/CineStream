'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createDetailUrl } from '@/lib/url-utils';
import { useMyList } from '@/hooks/useMyList';

interface MyListSectionProps {
  isAuthenticated: boolean;
}

export function MyListSection({ isAuthenticated }: MyListSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { myList, isLoading } = useMyList();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = scrollRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Don't show section if not authenticated or loading
  if (!isAuthenticated || isLoading) {
    return null;
  }

  // Don't show section if list is empty
  if (myList.length === 0) {
    return null;
  }

  return (
    <section className="w-full space-y-6">
      {/* Header with minimal padding on sides */}
      <div className="flex items-center justify-between full-width-minimal">
        <h2 className="heading-section text-white">My Watchlist</h2>
        <div className="flex items-center space-x-2">
          <Link href="/user/watchlist">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 w-full sm:flex-none transition-all bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
            >
              View All
            </Button>
          </Link>
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
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 full-width-minimal"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {myList.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 carousel-card-width"
          >
            <MyListCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}

interface MyListCardProps {
  item: any;
}

function MyListCard({ item }: MyListCardProps) {
  return (
    <Link href={createDetailUrl('movie', item.id, item.title)}>
      <div className="group w-full cursor-pointer transition-all duration-300 hover:scale-105">
        
        {/* Movie Card Image */}
        <div className="relative rounded-lg overflow-hidden bg-black mb-3">
          <div className="relative aspect-video">
            <Image
              src={item.backdrop || item.thumbnail}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-center transition-all duration-300 group-hover:brightness-110"
            />
          </div>
        </div>

        {/* Content Info - Outside and Below the Card */}
        <div className="space-y-2">
          <h3 className="heading-card text-white font-bold leading-tight">
            {item.title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
