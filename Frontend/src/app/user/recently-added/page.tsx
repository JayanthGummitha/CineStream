'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Play, Calendar, Sparkles, TrendingUp, Info, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createDetailUrl } from '@/lib/url-utils';
import {
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchGenres,
  getImageUrl,
  getBackdropUrl,
  type TMDBMovie,
  type TMDBGenre
} from '@/lib/tmdb';

interface RecentlyAddedMovie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  rating: number;
  releaseDate: string;
  genres: string[];
  duration: number;
  addedDate: string;
  daysAvailable: number;
  isNew: boolean;
  isTrending?: boolean;
}

export default function RecentlyAddedPage() {
  const [allMovies, setAllMovies] = useState<RecentlyAddedMovie[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<RecentlyAddedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | '7days' | '14days' | '30days'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecentlyAdded = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch genres for mapping
        const genresData = await fetchGenres();
        const genreMap = new Map(genresData.genres.map(g => [g.id, g.name]));

        // Fetch now playing and upcoming movies
        const [nowPlayingData, upcomingData] = await Promise.all([
          fetchNowPlayingMovies(1),
          fetchUpcomingMovies(1)
        ]);

        // Combine and remove duplicates by movie ID
        const combinedMovies = [...nowPlayingData.results, ...upcomingData.results];
        const uniqueMovies = Array.from(
          new Map(combinedMovies.map(movie => [movie.id, movie])).values()
        );

        // Sort by release date (most recent first) and limit to 18 movies
        const allMovies = uniqueMovies
          .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
          .slice(0, 18);

        // Convert TMDB movies to our format
        const convertedMovies: RecentlyAddedMovie[] = allMovies.map((movie, index) => {
          const movieGenres = movie.genre_ids
            .map(id => genreMap.get(id))
            .filter(Boolean) as string[];

          const releaseDate = new Date(movie.release_date);
          const now = new Date();
          const daysAgo = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

          return {
            id: movie.id.toString(),
            title: movie.title,
            description: movie.overview,
            thumbnail: getImageUrl(movie.poster_path, 'w500'),
            backdrop: getBackdropUrl(movie.backdrop_path, 'w1280'),
            rating: Math.round(movie.vote_average * 10) / 10,
            releaseDate: movie.release_date,
            genres: movieGenres.length > 0 ? movieGenres : ['Drama'],
            duration: 120, // Default duration
            addedDate: movie.release_date,
            daysAvailable: Math.max(1, daysAgo),
            isNew: daysAgo <= 30,
            isTrending: movie.popularity > 100
          };
        });

        setAllMovies(convertedMovies);
        setRecentlyAdded(convertedMovies);
      } catch (err) {
        console.error('Error fetching recently added movies:', err);
        setError('Failed to load recently added content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyAdded();
  }, []);

  // Apply both time filter and search query
  const applyFilters = (timeFilter: 'all' | '7days' | '14days' | '30days', search: string) => {
    const now = new Date();
    let filtered = allMovies;

    // Apply time filter
    if (timeFilter === '7days') {
      filtered = filtered.filter(movie => {
        const releaseDate = new Date(movie.releaseDate);
        const daysAgo = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 7;
      });
    } else if (timeFilter === '14days') {
      filtered = filtered.filter(movie => {
        const releaseDate = new Date(movie.releaseDate);
        const daysAgo = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 14;
      });
    } else if (timeFilter === '30days') {
      filtered = filtered.filter(movie => {
        const releaseDate = new Date(movie.releaseDate);
        const daysAgo = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 30;
      });
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchLower) ||
        movie.description.toLowerCase().includes(searchLower) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchLower))
      );
    }

    setRecentlyAdded(filtered);
  };

  // Filter movies based on selected time period
  const filterMovies = (filter: 'all' | '7days' | '14days' | '30days') => {
    setActiveFilter(filter);
    applyFilters(filter, searchQuery);
  };

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // When searching, automatically switch to "All New" filter
    if (query.trim()) {
      setActiveFilter('all');
      applyFilters('all', query);
    } else {
      // When clearing search, apply the current active filter
      applyFilters(activeFilter, query);
    }
  };

  const formatAddedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Added today';
    if (diffDays === 1) return 'Added yesterday';
    if (diffDays < 7) return `Added ${diffDays} days ago`;
    if (diffDays < 30) return `Added ${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading recently added content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container max-w-screen-2xl px-4 md:px-8 lg:px-12 py-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 mb-8 opacity-20">
              <Clock className="w-full h-full text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Failed to Load Content
            </h2>
            <p className="text-white/60 text-center max-w-md mb-8">
              {error}
            </p>
            <Button
              size="lg"
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-screen-2xl space-y-10 px-4 md:px-8 lg:px-12 py-8">
        {/* Header Section */}
        <Card className=" @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4  transition-all duration-300 hover:shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {/* Title and Icon */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 "></div>
                <div className="relative p-5 rounded-2xl">
                  <Clock className="h-10 w-10 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-3xl font-bold  mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Recently Added
                </h1>
                <p className="text-white/70 text-lg md:text-xl">
                  Fresh content just added to CineStream
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-black/30 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Sparkles className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Total Movies</p>
                  <p className="text-white text-xl font-bold">{allMovies.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Showing</p>
                  <p className="text-white text-xl font-bold">{recentlyAdded.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Star className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Avg Rating</p>
                  <p className="text-white text-xl font-bold">
                    {recentlyAdded.length > 0 
                      ? (recentlyAdded.reduce((sum, m) => sum + m.rating, 0) / recentlyAdded.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
              </div>
            </div> */}

            {/* Filter Badges */}
          </CardContent>
        </Card>

        {/* Search and Filters Section */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            <Input
              type="text"
              placeholder="Search movies by title, genre, or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 h-12 bg-white/5 border-2 border-white/20 text-white placeholder:text-white/50 focus:border-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Badges - Hidden when searching */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-3">
              <Badge
                variant="outline"
                onClick={() => filterMovies('all')}
                className={`px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                           ${activeFilter === 'all'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-white/5 border-2 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-lg hover:shadow-white/10'}
                           hover:scale-105 active:scale-95`}
              >
                <Sparkles className={`h-4 w-4 mr-2 ${activeFilter === 'all' ? 'animate-pulse' : ''}`} />
                All New ({allMovies.length})
              </Badge>
              <Badge
                variant="outline"
                onClick={() => filterMovies('7days')}
                className={`px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                           ${activeFilter === '7days'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-white/5 border-2 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-lg hover:shadow-white/10'}
                           hover:scale-105 active:scale-95`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Last 7 Days
              </Badge>
              <Badge
                variant="outline"
                onClick={() => filterMovies('14days')}
                className={`px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                           ${activeFilter === '14days'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-white/5 border-2 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-lg hover:shadow-white/10'}
                           hover:scale-105 active:scale-95`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Last 14 Days
              </Badge>
              <Badge
                variant="outline"
                onClick={() => filterMovies('30days')}
                className={`px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                           ${activeFilter === '30days'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30'
                    : 'bg-white/5 border-2 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-lg hover:shadow-white/10'}
                           hover:scale-105 active:scale-95`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Last 30 Days
              </Badge>
            </div>
          )}

          {/* Results Count */}
          {searchQuery && (
            <div className="text-white/70 text-sm">
              Found <span className="text-green-400 font-semibold">{recentlyAdded.length}</span> {recentlyAdded.length === 1 ? 'movie' : 'movies'} matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {recentlyAdded.map((movie) => (
            <Card
              key={movie.id}
              className="mb-6 @container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden">

              {/* Movie Backdrop/Poster */}
              <Link href={createDetailUrl('movie', movie.id, movie.title)}>
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={movie.backdrop || movie.thumbnail}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-green-500 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-green-500/50">
                      <Play className="h-8 w-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {movie.isNew && (
                      <Badge className="bg-green-500 text-white border-0 shadow-lg">
                        <Sparkles className="h-3 w-3 mr-1" />
                        NEW
                      </Badge>
                    )}
                    {movie.isTrending && (
                      <Badge className="bg-orange-500 text-white border-0 shadow-lg">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>

                  {/* Rating Badge */}
                  {/* <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-bold">
                      {movie.rating}
                    </span>
                  </div> */}

                  {/* Added Date Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg
                flex-1 sm:flex-none   bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                    <span className="text-white text-xs font-semibold">
                      {formatAddedDate(movie.addedDate)}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Movie Info */}
              <CardContent className="p-5 space-y-4">
                {/* Title */}
                <Link href={createDetailUrl('movie', movie.id, movie.title)}>
                  <h3 className="text-white font-bold text-xl line-clamp-1 group-hover:text-green-400 transition-colors">
                    {movie.title}
                  </h3>
                </Link>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(movie.duration)}
                  </span>
                  <span>•</span>
                  <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  <span>•</span>
                  <span className="text-green-400 font-medium flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(movie.addedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {movie.genres.slice(0, 3).map((genre) => (
                    <Badge
                      key={genre}
                      variant="outline"
                      className="bg-white/5 border-white/20 text-white/70 text-xs"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>

                {/* Description */}
                <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">
                  {movie.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link href={createDetailUrl('movie', movie.id, movie.title)} className="flex-1">
                    <Button
                      className="w-full
                                      flex-1 sm:flex-none   bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900

                      text-white shadow-lg shadow-red-500/30"
                    >
                      <Play className="h-4 w-4 mr-2 fill-white" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link href={createDetailUrl('movie', movie.id, movie.title)}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-white/20 hover:bg-white/10 hover:border-white/40"
                    >
                      <Info className="h-4 w-4 text-white" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State (if no content) */}
        {recentlyAdded.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 mb-8 opacity-20">
              <Clock className="w-full h-full text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No recently added content
            </h2>
            <p className="text-white/60 text-center max-w-md mb-8">
              Check back soon for new movies and shows
            </p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Browse All Content
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
