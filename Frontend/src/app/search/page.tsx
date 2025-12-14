'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Film, Tv, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fullSearch, SearchResults } from '@/lib/search-service';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie } from '@/types';
import { cn } from '@/lib/utils';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [page, setPage] = useState(1);

  // Perform search when query or filter changes
  useEffect(() => {
    const performSearch = async () => {
      if (!initialQuery || initialQuery.trim().length < 2) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await fullSearch(initialQuery, page, filter);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [initialQuery, filter, page]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Get all results combined
  const allResults = results 
    ? [...results.movies, ...results.tvShows].sort((a, b) => b.rating - a.rating)
    : [];

  const displayResults = filter === 'movies' 
    ? results?.movies || []
    : filter === 'tv'
    ? results?.tvShows || []
    : allResults;

  return (
    <div className="min-h-screen bg-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV shows..."
              className="w-full h-14 pl-12 pr-12 bg-white/10 border-white/20 text-white text-lg placeholder:text-white/50 rounded-xl focus:bg-white/15 focus:border-white/40"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>
        </div>

        {/* Results Section */}
        {initialQuery && (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">
                  {isLoading ? 'Searching...' : `Results for "${initialQuery}"`}
                </h1>
                {results && !isLoading && (
                  <span className="text-white/60 text-sm">
                    {results.total} {results.total === 1 ? 'result' : 'results'}
                  </span>
                )}
              </div>
              
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <TabsList className="bg-white/10">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white/20">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="movies" className="data-[state=active]:bg-white/20">
                    <Film className="h-4 w-4 mr-1" />
                    Movies
                  </TabsTrigger>
                  <TabsTrigger value="tv" className="data-[state=active]:bg-white/20">
                    <Tv className="h-4 w-4 mr-1" />
                    TV Shows
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            )}

            {/* Results Grid */}
            {!isLoading && displayResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayResults.map((item) => (
                  <SearchResultCard key={`${item.contentType}-${item.id}`} item={item} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && displayResults.length === 0 && results && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">No results found</h2>
                <p className="text-white/60 max-w-md mx-auto">
                  We couldn't find anything matching "{initialQuery}". Try different keywords or browse our categories.
                </p>
                <div className="flex justify-center gap-3 mt-6">
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link href="/movies">Browse Movies</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link href="/tv-shows">Browse TV Shows</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && results && results.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-white/60">
                  Page {page} of {results.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(results.totalPages, p + 1))}
                  disabled={page === results.totalPages}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State - No Query */}
        {!initialQuery && (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Search CineStream</h2>
            <p className="text-white/60 max-w-md mx-auto">
              Find your favorite movies, TV shows, documentaries, and more.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Search Result Card Component
function SearchResultCard({ item }: { item: Movie }) {
  const isTV = item.contentType === 'tv-shows';
  const href = createDetailUrl(
    isTV ? 'tv-shows' : 'movie',
    item.id,
    item.title
  );

  return (
    <Link href={href} className="group">
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5">
        <Image
          src={item.thumbnail || '/placeholder-movie.jpg'}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Content Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-medium",
            isTV ? "bg-blue-500/80 text-white" : "bg-red-500/80 text-white"
          )}>
            {isTV ? 'TV' : 'Movie'}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-2 right-2 bg-black/60 px-1.5 py-0.5 rounded text-xs text-yellow-400 font-medium">
          ★ {item.rating.toFixed(1)}
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-white/50 text-xs mt-1">
          {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
          {item.genres?.length > 0 && ` • ${item.genres[0]}`}
        </p>
      </div>
    </Link>
  );
}

// Main page component with Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
