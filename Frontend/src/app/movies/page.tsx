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
import { getMoviesByGenre, getNowPlayingMovies } from '@/lib/movie-service';

// Expanded mock data with more movies across all genres


const GENRES = [
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentary" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Family" },
  { id: "14", name: "Fantasy" },
  { id: "36", name: "History" },
  { id: "27", name: "Horror" },
  { id: "10402", name: "Music" },
  { id: "9648", name: "Mystery" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Science Fiction" },
  { id: "10770", name: "TV Movie" },
  { id: "53", name: "Thriller" },
  { id: "10752", name: "War" },
  { id: "37", name: "Western" }
];

export default function MoviesPage() {
  const isAuthenticated = true;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [genreMovies, setGenreMovies] = useState<{ [key: string]: any[] }>({});
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch movies by genre from TMDB
  useEffect(() => {
    async function fetchMoviesByGenres() {
      setLoading(true);
      try {
        const genreData: { [key: string]: any[] } = {};

        // Fetch featured movies for hero section - Now Playing (Current Releases)
        const nowPlaying = await getNowPlayingMovies();

        // Use now playing movies for hero section (current releases in theaters)
        setFeaturedMovies(nowPlaying.slice(0, 5));

        // Fetch movies for each genre
        for (const genre of GENRES) {
          try {
            const movies = await getMoviesByGenre(genre.name);
            if (movies.length > 0) {
              genreData[genre.name] = movies.slice(0, 20); // Limit to 20 movies per genre
            }
          } catch (error) {
            console.error(`Failed to fetch ${genre.name} movies:`, error);
          }
        }

        setGenreMovies(genreData);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMoviesByGenres();
  }, []);

  // Get all movies from all genres for filtering
  const allMovies = Object.values(genreMovies).flat();

  // Filter and sort movies
  const filteredMovies = allMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || movie.genres.some((genre: string) =>
      GENRES.find(g => g.name === genre)?.id === selectedGenre
    );
    const matchesYear = selectedYear === 'all' ||
      new Date(movie.releaseDate).getFullYear().toString() === selectedYear;

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-white/60">Loading movies...</p>
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
        {/* Hero Section with Featured Movies */}
        {featuredMovies.length > 0 && (
          <MoviesHeroSection
            featuredMovies={featuredMovies}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* Search and Filters */}
        <section className="full-width-minimal py-8 bg-background">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md w-screen px-2">
              <Input
                type="search"
                placeholder="Search movies, shows, actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40"
              />
              <Search className="absolute px-1 left-3 top-1/2 transform -translate-y-1/2 h-7 w-7 text-white/60" />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All Genres</SelectItem>
                  {GENRES.map((genre) => (
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
            <p className="body-small text-white/70">
              Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        </section>

        {/* Genre Sections - Full width with minimal padding */}
        <div className="w-full pb-12 space-y-12">
          {GENRES.map((genre) => {
            // Get movies for this genre
            const movies = genreMovies[genre.name] || [];

            // Apply filters to genre movies
            const filteredGenreMovies = movies.filter(movie => {
              const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesYear = selectedYear === 'all' ||
                new Date(movie.releaseDate).getFullYear().toString() === selectedYear;

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

            // Skip if no movies in this genre or if genre filter doesn't match
            if (filteredGenreMovies.length === 0 ||
              (selectedGenre !== 'all' && selectedGenre !== genre.id)) {
              return null;
            }

            return (
              <GenreSection
                key={genre.id}
                genre={genre}
                movies={filteredGenreMovies}
                isAuthenticated={isAuthenticated}
              />
            );
          })}

          {/* No Results State */}
          {filteredMovies.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-24 h-24 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                  <Search className="h-12 w-12 text-white/40" />
                </div>
                <h3 className="heading-subsection font-bold text-white">No movies found</h3>
                <p className="body-text text-white/60">
                  Try adjusting your search criteria or browse our featured collections.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGenre('all');
                    setSelectedYear('all');
                    setSortBy('newest');
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Call to Action for Guest Users */}
          {!isAuthenticated && filteredMovies.length > 0 && (
            <section className="mt-16 py-16 text-center bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="max-w-3xl mx-auto space-y-6 px-6">
                <h2 className="heading-section font-bold text-white">
                  Unlock Full Access
                </h2>
                <p className="body-large text-white/80">
                  Get unlimited access to our entire library of movies and TV shows.
                  Stream in 4K, download for offline viewing, and enjoy ad-free entertainment.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white" asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                    <Link href="/subscription">View All Plans</Link>
                  </Button>
                </div>
                <p className="caption-text text-white/60">
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

// MovieCard component is now imported from @/components/ui/movie-card

interface MoviesHeroSectionProps {
  featuredMovies: any[];
  isAuthenticated: boolean;
}

function MoviesHeroSection({ featuredMovies, isAuthenticated }: MoviesHeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentMovie = featuredMovies[currentIndex];

  // Get sliding window of 3 movies starting from the next movie after current
  const getCarouselMovies = () => {
    const carouselMovies = [];
    const totalMovies = featuredMovies.length;

    // Start from the next movie after current and get 3 movies
    for (let i = 1; i <= 3; i++) {
      const movieIndex = (currentIndex + i) % totalMovies;
      carouselMovies.push({
        movie: featuredMovies[movieIndex],
        originalIndex: movieIndex
      });
    }

    return carouselMovies;
  };

  const carouselMovies = getCarouselMovies();

  // Auto-rotate featured content
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [featuredMovies.length]);

  if (!currentMovie) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentMovie.backdrop || currentMovie.thumbnail}
          alt={currentMovie.title}
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
      <div className="relative z-10 flex h-full items-center">
        <div className="full-width-minimal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
            {/* Left Side - Movie Info */}
            <div className="lg:col-span-8 xl:col-span-7">
              <div className="max-w-3xl h-full flex flex-col justify-center space-y-8">
                {/* Movie Title */}
                <div>
                  <h1 className="heading-hero font-bold w-screen text-white leading-tight tracking-wide mb-4">
                    {currentMovie.title.toUpperCase()}
                  </h1>

                  {/* Movie Badges and Metadata */}
                  <div className="flex items-center space-x-4 text-white/90">
                    {/* Badges */}
                    {currentMovie.isNew && (
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                        New Release
                      </div>
                    )}
                    {currentMovie.isTrending && (
                      <div className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium uppercase tracking-wider">
                        Trending
                      </div>
                    )}
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                      {currentMovie.contentRating}
                    </div>

                    {/* Separator */}
                    <span className="text-white/60">|</span>

                    {/* Metadata */}
                    <span className="caption-text font-medium">
                      {currentMovie.genres.slice(0, 2).join(', ')}
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="caption-text font-medium">
                      {new Date(currentMovie.releaseDate).getFullYear()}
                    </span>
                    <span className="text-white/60">|</span>
                    <span className="caption-text font-medium">
                      {Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="max-w-2xl">
                  <p className="text-white/90 body-text leading-relaxed line-clamp-2">
                    {currentMovie.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300"
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
                    <Link href={createDetailUrl('movie', currentMovie.id, currentMovie.title)}>
                      <EllipsisVertical />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Side - Reserved space for carousel */}
            <div className="flex lg:block lg:col-span-4 xl:col-span-5">
              {/* This space is reserved for the absolutely positioned movie carousel */}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Movie Navigation Carousel */}
      <div className="absolute bottom-0 right-1 z-20">
        {/* Carousel Container */}
        <div className="rounded-3xl p-6">
          {/* Carousel Movies */}
          <div className="flex space-x-3">
            {carouselMovies.map(({ movie, originalIndex }, carouselIndex) => (
              <div
                key={movie.id}
                className="group cursor-pointer transition-all duration-300 flex-shrink-0"
                onClick={() => setCurrentIndex(originalIndex)}
              >
                <div className="relative w-[100px] h-[140px] rounded-2xl overflow-hidden border transition-all duration-300">
                  {/* Movie Poster */}
                  <Image
                    src={movie.thumbnail}
                    alt={movie.title}
                    fill
                    sizes="100px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Next Indicator */}
                  {carouselIndex === 0 && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-bold rounded-full uppercase tracking-wider">
                        Next
                      </div>
                    </div>
                  )}

                  {/* Play Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
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

interface GenreSectionProps {
  genre: { id: string; name: string };
  movies: any[];
  isAuthenticated: boolean;
}

function GenreSection({ genre, movies, isAuthenticated }: GenreSectionProps) {
  return (
    <MovieCarousel
      title={genre.name}
      movies={movies}
      isAuthenticated={isAuthenticated}
      variant="default"
      showCount={true}
    />
  );
}