'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MovieCard } from './movie-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MovieCarouselProps {
    title: string;
    movies: any[];
    isAuthenticated: boolean;
    variant?: 'default' | 'compact' | 'featured';
    showCount?: boolean;
    className?: string;
    contentType?: 'movie' | 'tv-shows' | 'kids' | 'documentaries';
    viewAllLink?: string;
}

export function MovieCarousel({
    title,
    movies,
    isAuthenticated,
    variant = 'default',
    showCount = true,
    className = '',
    contentType = 'movie',
    viewAllLink
}: MovieCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            // Calculate scroll amount based on viewport width to scroll by visible cards
            const viewportWidth = window.innerWidth;
            let scrollAmount;
            
            if (viewportWidth >= 1280) {
                // xl: scroll by 6 cards width
                scrollAmount = (viewportWidth * 0.99 - viewportWidth * 0.01) / 6 * 3; // Scroll 3 cards
            } else if (viewportWidth >= 1024) {
                // lg: scroll by 5 cards width  
                scrollAmount = (viewportWidth * 0.99 - viewportWidth * 0.01) / 5 * 3; // Scroll 3 cards
            } else if (viewportWidth >= 768) {
                // md: scroll by 4 cards width
                scrollAmount = (viewportWidth * 0.99 - viewportWidth * 0.01) / 4 * 2; // Scroll 2 cards
            } else if (viewportWidth >= 640) {
                // sm: scroll by 3 cards width
                scrollAmount = (viewportWidth * 0.99 - viewportWidth * 0.01) / 3 * 2; // Scroll 2 cards
            } else {
                // mobile: scroll by 1 card width
                scrollAmount = (viewportWidth * 0.99 - viewportWidth * 0.01)/ 3 * 2; // Scroll 1 card
            }

            const newScrollLeft = scrollRef.current.scrollLeft +
                (direction === 'left' ? -scrollAmount : scrollAmount);

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    if (!movies || movies.length === 0) {
        return null;
    }

    return (
        <section className={`w-full space-y-6 ${className}`}>
            {/* Header with minimal padding on sides */}
            <div className="flex items-center px-5 justify-between full-width-minimal">
                <div className="flex items-center gap-3">
                    <h2 className="heading-section text-white">{title}</h2>
                    {showCount && (
                        <span className="text-white/60 text-sm">
                            ({movies.length} {movies.length === 1 ? 'item' : 'items'})
                        </span>
                    )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center space-x-5">
                    {viewAllLink && (
                        <Link href={viewAllLink}>
                            <Button  size="sm" 
                 
                            variant="outline"
                   
                    className="flex-1 w-full sm:flex-none   transition-all 
                                      bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
  >
                                View All
                            </Button>
                        </Link>
                    )}
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
                className="flex  px-4 gap-6 overflow-x-auto scrollbar-hide pb-4 full-width-minimal"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {movies.map((movie, index) => (
                    <div
                        key={`${title}-${movie.id}-${index}`}
                        className="flex-shrink-0 carousel-card-width"
                    >
                        <MovieCard
                            movie={movie}
                            isAuthenticated={isAuthenticated}
                            variant={variant}
                            contentType={contentType}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}