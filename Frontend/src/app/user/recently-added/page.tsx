'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Star, Play, Calendar, Sparkles, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { createDetailUrl } from '@/lib/url-utils';
import { MOCK_MOVIES } from '@/lib/mock-data';

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
  const [recentlyAdded, setRecentlyAdded] = useState<RecentlyAddedMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching recently added content
    // In production, this would be an API call
    const fetchRecentlyAdded = () => {
      const mockRecentlyAdded: RecentlyAddedMovie[] = MOCK_MOVIES.map((movie, index) => ({
        ...movie,
        addedDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
        daysAvailable: index + 1,
        isNew: movie.isNew ?? false,
        isTrending: movie.isTrending ?? false,
      }));

      setRecentlyAdded(mockRecentlyAdded);
      setIsLoading(false);
    };

    setTimeout(fetchRecentlyAdded, 500);
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-screen-2xl px-4 md:px-8 lg:px-12 py-8">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Recently Added
              </h1>
              <p className="text-white/70 text-lg">
                Fresh content just added to CineStream • {recentlyAdded.length} titles
              </p>
            </div>
          </div>

          {/* Filter Badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                         bg-gradient-to-r from-green-500/20 to-emerald-500/20 
                         border-2 border-green-500/50 text-green-400 
                         hover:from-green-500/30 hover:to-emerald-500/30 
                         hover:border-green-400 hover:shadow-lg hover:shadow-green-500/30
                         hover:scale-105 active:scale-95"
            >
              <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
              All New
            </Badge>
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                         bg-white/5 border-2 border-white/20 text-white/70 
                         hover:bg-white/10 hover:border-white/40 hover:text-white
                         hover:shadow-lg hover:shadow-white/10
                         hover:scale-105 active:scale-95"
            >
              <Clock className="h-4 w-4 mr-2" />
              Last 7 Days
            </Badge>
            <Badge 
              variant="outline" 
              className="px-4 py-2 text-sm font-semibold cursor-pointer transition-all duration-300
                         bg-white/5 border-2 border-white/20 text-white/70 
                         hover:bg-white/10 hover:border-white/40 hover:text-white
                         hover:shadow-lg hover:shadow-white/10
                         hover:scale-105 active:scale-95"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Badge>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {recentlyAdded.map((movie) => (
            <Card
              key={movie.id}
              className="group relative overflow-hidden border-white/10 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 bg-gradient-to-b from-neutral-900 to-neutral-950"
            >
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
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm font-bold">
                      {movie.rating}
                    </span>
                  </div>

                  {/* Added Date Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
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
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
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
