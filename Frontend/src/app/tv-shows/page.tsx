'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MovieCarousel } from '@/components/ui/movie-carousel';
import { Search, Play, Plus, EllipsisVertical } from 'lucide-react';
import { createDetailUrl } from '@/lib/url-utils';

// TV Show specific genres (more series-focused)
const TV_GENRES = [
  { id: "action-adventure", name: "Action & Adventure" },
  { id: "animation", name: "Animation" },
  { id: "comedy", name: "Comedy" },
  { id: "crime", name: "Crime" },
  { id: "drama", name: "Drama" },
  { id: "sci-fi", name: "Sci-Fi & Fantasy" },
  { id: "trending", name: "Trending" }
];

export default function TVShowsPage() {
  const isAuthenticated = true;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [genreShows, setGenreShows] = useState<{ [key: string]: any[] }>({});
  const [featuredShows, setFeaturedShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch TV shows from TMDB TV endpoints
  useEffect(() => {
    async function fetchTVShowsByGenres() {
      setLoading(true);
      try {
        const { getTVShowsContent } = await import('@/lib/movie-service');

        // Fetch TV shows content from TMDB TV endpoints
        const tvContent = await getTVShowsContent();

        setFeaturedShows(tvContent.featured);
        setGenreShows({
          "Action & Adventure": tvContent.actionAdventure,
          "Animation": tvContent.animation,
          "Comedy": tvContent.comedy,
          "Crime": tvContent.crime,
          "Drama": tvContent.drama,
          "Sci-Fi & Fantasy": tvContent.sciFi,
          "Trending": tvContent.trending
        });
      } catch (error) {
        console.error('Failed to fetch TV shows:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTVShowsByGenres();
  }, []);

  // Get all shows from all genres for filtering
  const allShows = Object.values(genreShows).flat();

  // Filter and sort shows
  const filteredShows = allShows.filter(show => {
    const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' ||
      TV_GENRES.find(g => g.id === selectedGenre)?.name === selectedGenre;
    const matchesYear = selectedYear === 'all' ||
      new Date(show.releaseDate).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesGenre && matchesYear;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      case 'oldest':
        return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-white/60">Loading TV shows...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero Section with Featured TV Shows */}
        {featuredShows.length > 0 && (
          <TVShowsHeroSection
            featuredShows={featuredShows}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* Search and Filters */}
        <section className="full-width-minimal py-8 bg-background">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-screen px-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
              <Input
                type="search"
                placeholder="Search TV shows, series, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All Genres</SelectItem>
                  {TV_GENRES.map((genre) => (
                    <SelectItem key={genre.id} value={genre.id} className="text-white hover:bg-white/10">
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All Years</SelectItem>
                  <SelectItem value="2024" className="text-white hover:bg-white/10">2024</SelectItem>
                  <SelectItem value="2023" className="text-white hover:bg-white/10">2023</SelectItem>
                  <SelectItem value="2022" className="text-white hover:bg-white/10">2022</SelectItem>
                  <SelectItem value="2021" className="text-white hover:bg-white/10">2021</SelectItem>
                  <SelectItem value="2020" className="text-white hover:bg-white/10">2020</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="newest" className="text-white hover:bg-white/10">Newest</SelectItem>
                  <SelectItem value="oldest" className="text-white hover:bg-white/10">Oldest</SelectItem>
                  <SelectItem value="rating" className="text-white hover:bg-white/10">Rating</SelectItem>
                  <SelectItem value="title" className="text-white hover:bg-white/10">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-6">
            <p className="text-white/70">
              Showing {filteredShows.length} {filteredShows.length === 1 ? 'show' : 'shows'}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        </section>

        {/* Genre Sections - Full width with minimal padding */}
        <div className="w-full pb-12 space-y-12">
          {TV_GENRES.map((genre) => {
            // Get shows for this genre
            const shows = genreShows[genre.name] || [];

            // Apply filters to genre shows
            const filteredGenreShows = shows.filter(show => {
              const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesYear = selectedYear === 'all' ||
                new Date(show.releaseDate).getFullYear().toString() === selectedYear;

              return matchesSearch && matchesYear;
            }).sort((a, b) => {
              switch (sortBy) {
                case 'newest':
                  return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
                case 'oldest':
                  return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
                case 'rating':
                  return b.rating - a.rating;
                case 'title':
                  return a.title.localeCompare(b.title);
                default:
                  return 0;
              }
            });

            // Skip if no shows in this genre or if genre filter doesn't match
            if (filteredGenreShows.length === 0 ||
              (selectedGenre !== 'all' && selectedGenre !== genre.id)) {
              return null;
            }

            return (
              <TVGenreSection
                key={genre.id}
                genre={genre}
                shows={filteredGenreShows}
                isAuthenticated={isAuthenticated}
              />
            );
          })}

          {/* No Results State */}
          {filteredShows.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-white/40" />
                </div>
                <h3 className="text-2xl font-bold text-white">No TV shows found</h3>
                <p className="text-white/60">
                  Try adjusting your search criteria or browse our featured collections.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('all');
                    setSelectedYear('all');
                    setSortBy('newest');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Call to Action for Guest Users */}
          {!isAuthenticated && filteredShows.length > 0 && (
            <section className="mt-16 py-16 text-center bg-gradient-to-br from-blue-600/20 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="max-w-3xl mx-auto space-y-6 px-6">
                <h2 className="text-3xl font-bold text-white">
                  Unlock Full Access
                </h2>
                <p className="text-lg text-white/80">
                  Get unlimited access to our entire library of TV shows and series.
                  Stream in 4K, download for offline viewing, and enjoy ad-free entertainment.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                    <Link href="/subscription">View All Plans</Link>
                  </Button>
                </div>
                <p className="text-sm text-white/60">
                  14-day free trial • Cancel anytime • No commitments
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

interface TVGenreSectionProps {
  genre: { id: string; name: string };
  shows: any[];
  isAuthenticated: boolean;
}

function TVGenreSection({ genre, shows, isAuthenticated }: TVGenreSectionProps) {
  return (
    <MovieCarousel
      title={genre.name}
      movies={shows}
      isAuthenticated={isAuthenticated}
      variant="default"
      showCount={true}
      contentType="tv-shows"
    />
  );
}

interface TVShowsHeroSectionProps {
  featuredShows: any[];
  isAuthenticated: boolean;
}

function TVShowsHeroSection({ featuredShows, isAuthenticated }: TVShowsHeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentShow = featuredShows[currentIndex];

  // Get sliding window of 3 shows starting from the next show after current
  const getCarouselShows = () => {
    const carouselShows = [];
    const totalShows = featuredShows.length;

    // Start from the next show after current and get 3 shows
    for (let i = 1; i <= 3; i++) {
      const showIndex = (currentIndex + i) % totalShows;
      carouselShows.push({
        show: featuredShows[showIndex],
        originalIndex: showIndex
      });
    }

    return carouselShows;
  };

  const carouselShows = getCarouselShows();

  // Auto-rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredShows.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredShows.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + featuredShows.length) % featuredShows.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % featuredShows.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [featuredShows.length]);

  if (!currentShow) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentShow.backdrop || currentShow.thumbnail}
          alt={currentShow.title}
          fill
          sizes="100vw"
          className="object-cover scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative px-2 z-10 flex h-full items-center">
        <div className="full-width-minimal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
            {/* Left Side - Show Info */}
            <div className="lg:col-span-8 xl:col-span-7">
              <div className="max-w-3xl h-full flex flex-col justify-center  space-y-3 sm:space-y-8">
                {/* Show Title */}
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-wide mb-4">
                    {currentShow.title.toUpperCase()}
                  </h1>

                  {/* Show Badges and Metadata */}
                  <div className="flex items-center space-x-4 text-white/90">
                    {/* Badges */}
                    <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                      TV Series
                    </div>
                    {currentShow.isNew && (
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                        New Release
                      </div>
                    )}
                    {currentShow.isTrending && (
                      <div className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium uppercase tracking-wider">
                        Trending
                      </div>
                    )}
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                      {currentShow.contentRating}
                    </div>

                    {/* Separator */}
                    <span className="text-white/60">|</span>

                    {/* Metadata */}
                    <span className="text-sm font-medium">
                      {currentShow.genres.slice(0, 2).join(', ')}
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="text-sm font-medium">
                      {new Date(currentShow.releaseDate).getFullYear()}
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="text-sm font-medium">
                      {currentShow.totalSeasons} Season{currentShow.totalSeasons > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="max-w-2xl">
                  <p className="text-white/90 text-base leading-relaxed line-clamp-2">
                    {currentShow.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <Button
                    size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    <Play className="mr-3 h-6 w-6 fill-white" />
                    {isAuthenticated ? 'Watch Now' : 'Watch Trailer'}
                  </Button>

                  {isAuthenticated && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30 font-semibold rounded-2xl transition-all duration-300"
                    >
                      <Plus className="mr-3 h-6 w-6" />
                      My List
                    </Button>
                  )}

                  <Button
                    size="lg"
                    variant="ghost"
                                        className="h-14 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:border-white/30 font-semibold rounded-2xl transition-all duration-300"

                    // className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
                    asChild
                  >
                    <Link href={createDetailUrl('tv-shows', currentShow.id, currentShow.title)}>
                     <EllipsisVertical />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Reserved space for carousel */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-5">
              {/* This space is reserved for the absolutely positioned show carousel */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Show Navigation Carousel */}
      <div className="absolute  -bottom-8 sm:bottom-0 right-1 z-20">
        {/* Carousel Container */}
        <div className="rounded-3xl p-6">
          {/* Carousel Shows */}
          <div className="flex space-x-3">
            {carouselShows.map(({ show, originalIndex }, carouselIndex) => (
              <div
                key={show.id}
                className="group cursor-pointer transition-all duration-300 flex-shrink-0"
                onClick={() => setCurrentIndex(originalIndex)}
              >
                <div className="relative w-[100px] h-[140px] rounded-2xl overflow-hidden border transition-all duration-300">
                  {/* Show Poster */}
                  <Image
                    src={show.thumbnail}
                    alt={show.title}
                    fill
                    sizes="100px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Next Indicator */}
                  {carouselIndex === 0 && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[8px] font-bold rounded-full uppercase tracking-wider">
                        Next
                      </div>
                    </div>
                  )}

                  {/* Play Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}