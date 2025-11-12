'use client';

import { MovieCarousel } from '@/components/ui/movie-carousel';
import { Movie, TVShow } from '@/types';

interface YourWatchlistSectionProps {
    items: (Movie | TVShow)[];
    isAuthenticated: boolean;
}

export function YourWatchlistSection({ items, isAuthenticated }: YourWatchlistSectionProps) {
    if (!items || !Array.isArray(items) || items.length === 0) return null;

    return (
        <MovieCarousel
            title="Your Watchlist"
            movies={items}
            isAuthenticated={isAuthenticated}
            variant="default"
            showCount={false}
        />
    );
}

// WatchlistCard functionality is now handled by MovieCard component in MovieCarousel