
'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight, X, Save, Check, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMovieDetails, getMoviesByGenre, getMovieTrailer } from '@/lib/movie-service';
import { searchPersonImage } from '@/lib/tmdb';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, Season } from '@/types';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import { TrailerButton } from '@/components/TrailerButton';
import { useTrailerPerformance } from '@/hooks/useTrailerPerformance';
import { useMyList } from '@/hooks/useMyList';
import { useLikes } from '@/hooks/useLikes';
import { useParentalControls } from '@/hooks/useParentalControls';
import { ContentRestrictionOverlay } from '@/components/parental/ContentRestrictionOverlay';
import { ContentAccessResult } from '@/lib/parental-controls';

interface MovieDetailPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

interface TrailerState {
  trailerSrc: string | null;
  isLoading: boolean;
  hasError: boolean;
}



export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [trailerState, setTrailerState] = useState<TrailerState>({
    trailerSrc: null,
    isLoading: false,
    hasError: false
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [directorImage, setDirectorImage] = useState<string | null>(null);

  const { isInList, toggleList, myList } = useMyList();
  const { isLiked, toggleLike, likes } = useLikes();
  const { canAccessContent, setPinVerified } = useParentalControls();
  const [contentAccess, setContentAccess] = useState<ContentAccessResult>({ allowed: true });
  const resolvedParams = use(params);

  // Force re-render when myList or likes changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [myList, likes]);

  const handleToggleList = () => {
    if (movie) {
      const wasInList = isInList(movie.id);
      toggleList({ ...movie, contentType: 'movie' });
      setToastMessage(wasInList ? 'Removed from your list' : 'Added to your list');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleToggleLike = () => {
    if (movie) {
      const wasLiked = isLiked(movie.id);
      toggleLike({ ...movie, contentType: 'movie' });
      setToastMessage(wasLiked ? 'Removed from likes' : 'Added to your likes');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };
  // Initialize performance monitoring
  const {
    startPerformanceMonitoring,
    endPerformanceMonitoring,
    logPerformanceInsights
  } = useTrailerPerformance(resolvedParams.id);

  // Sample video URL - using local DASH manifest from public folder
  const videoSrc = 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd'
  

  const isAuthenticated = true;

  // Optimized asynchronous trailer loading function with performance monitoring
  const loadTrailerAsync = async (movieId: string, movieData: Movie) => {
    const startTime = startPerformanceMonitoring();

    try {
      let trailerUrl: string | null = null;
      let cacheHit = false;

      // First check if trailer is already available in movie data (cache hit)
      if (movieData.trailer && movieData.trailer.includes('youtube.com/embed/')) {
        trailerUrl = movieData.trailer;
        cacheHit = true;
      } else {
        // Background fetch with optimized timeout and priority

        // Use requestIdleCallback for non-blocking execution when available
        const fetchTrailer = () => {
          return new Promise<string | null>((resolve, reject) => {
            const trailerPromise = getMovieTrailer(movieId);
            const timeoutPromise = new Promise<never>((_, timeoutReject) => {
              setTimeout(() => timeoutReject(new Error('Trailer fetch timeout')), 3000); // Reduced to 3 seconds
            });

            Promise.race([trailerPromise, timeoutPromise])
              .then(resolve)
              .catch(reject);
          });
        };

        // Use requestIdleCallback for better performance if available
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          trailerUrl = await new Promise<string | null>((resolve, reject) => {
            window.requestIdleCallback(async () => {
              try {
                const result = await fetchTrailer();
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, { timeout: 5000 });
          });
        } else {
          // Fallback to immediate execution with setTimeout for non-blocking
          trailerUrl = await new Promise<string | null>((resolve, reject) => {
            setTimeout(async () => {
              try {
                const result = await fetchTrailer();
                resolve(result);
              } catch (error) {
                reject(error);
              }
            }, 0);
          });
        }

        if (trailerUrl) {
        } else {
        }
      }

      const performanceReport = endPerformanceMonitoring(cacheHit);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Update trailer state
      setTrailerState({
        trailerSrc: trailerUrl,
        isLoading: false,
        hasError: trailerUrl === null && !movieData.trailer
      });

      // Enhanced performance logging with insights


      // Log performance insights after a delay to allow for multiple loads
      setTimeout(() => {
        logPerformanceInsights();
      }, 1000);

    } catch (trailerError) {
      const performanceReport = endPerformanceMonitoring(false);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.error(`[Movie Detail Page] Critical error during trailer processing for movie ${movieId}:`, trailerError);

      setTrailerState({
        trailerSrc: null,
        isLoading: false,
        hasError: true
      });

      // Log error performance impact
      console.error(`[Movie Detail Page] Trailer error performance impact:`, {
        duration: `${duration.toFixed(2)}ms`,
        performanceGrade: performanceReport?.performanceGrade || 'Poor',
        errorType: trailerError instanceof Error ? trailerError.name : 'Unknown'
      });
    }
  };

  useEffect(() => {
    async function fetchMovieData() {
      try {
        const movieData = await getMovieDetails(resolvedParams.id);

        if (!movieData) {
          notFound();
          return;
        }

        setMovie(movieData);

        // Check parental controls access (including genre-based blocking)
        const accessResult = canAccessContent(movieData.id, movieData.contentRating || 'TV-MA', movieData.genres);
        setContentAccess(accessResult);

        // Fetch director image from TMDB (non-blocking)
        if (movieData.director && movieData.director !== 'Unknown') {
          searchPersonImage(movieData.director).then(imageUrl => {
            setDirectorImage(imageUrl);
          });
        }

        // Initialize trailer loading state (non-blocking)
        setTrailerState(prev => ({ ...prev, isLoading: true, hasError: false }));

        // Start asynchronous trailer loading in background with priority scheduling
        // Use requestIdleCallback for better performance, fallback to setTimeout
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => {
            loadTrailerAsync(resolvedParams.id, movieData);
          }, { timeout: 2000 }); // 2 second timeout for idle callback
        } else {
          // Fallback to setTimeout with minimal delay for non-blocking execution
          setTimeout(() => {
            loadTrailerAsync(resolvedParams.id, movieData);
          }, 16); // ~1 frame delay for better perceived performance
        }

        // For movie detail page, we should only show episodes if it's actually a TV show
        // Check if this is a real TV show (has seasons property) or just a movie
        const isActualTVShow = 'seasons' in movieData &&
          Array.isArray(movieData.seasons) &&
          movieData.seasons.length > 0;

        if (isActualTVShow) {
          setSeasons(movieData.seasons as Season[]);
        } else {
          // This is a movie, don't generate fake episodes
          setSeasons([]);
        }

        // Get related movies based on the first genre
        if (movieData.genres.length > 0) {
          const related = await getMoviesByGenre(movieData.genres[0]);
          const filtered = related.filter(m => m.id !== movieData.id).slice(0, 10);
          setRelatedMovies(filtered);
        }
      } catch (error) {
        console.error('Error fetching movie data:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchMovieData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading {movie?.title} Movie</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!movie) {
    notFound();
  }

  // Handle PIN verification for restricted content
  const handlePinVerified = () => {
    setPinVerified(true);
    setContentAccess({ allowed: true });
  };

  // Show restriction overlay if content is not accessible
  if (!contentAccess.allowed && movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <ContentRestrictionOverlay
          accessResult={contentAccess}
          contentTitle={movie.title}
          onPinVerified={handlePinVerified}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} />

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-[9999] max-w-sm"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-xl border bg-green-500/20 border-green-500/50">
              <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="text-sm font-medium text-white">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={movie.backdrop}
              alt={movie.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full items-center">
            <div className="container max-w-screen-2xl px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Movie Poster */}
                <div className="hidden lg:block mt-5">
                  <div className="relative aspect-[2/3] w-65  mx-auto">
                    <Image
                      src={movie.thumbnail}
                      alt={movie.title}
                      fill
                      sizes="192px"
                      className="object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </div>

                {/* Movie Info */}
                <div className="lg:col-span-2 space-y-6 text-white">
                  {/* Title */}
                  <h1 className="text-4xl md:text-4xl font-bold leading-tight">
                    {movie.title}
                  </h1>

                  {/* Movie Badges and Metadata - All in one horizontal line */}
                  <div className="flex flex-wrap items-center gap-3 caption-text">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{movie.rating}/10</span>
                    </div>
                    <span className="text-white/70">•</span>
                    <span className="text-white/80">{new Date(movie.releaseDate).getFullYear()}</span>
                    <span className="text-white/70">•</span>
                    <Badge variant="outline" className="border-white/20 text-white bg-white/10 micro-text">
                      {movie.contentRating}
                    </Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/80">{movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'N/A'}</span>
                    <span className="text-white/70">•</span>
                    <Badge className="bg-red-600 micro-text">Movie</Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/70">{movie.genres.slice(0, 2).join(' • ')}</span>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-white/90 leading-relaxed max-w-3xl line-clamp-3">
                    {movie.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    {isAuthenticated && (
                      <Link
                        href={`/watch/${movie.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(movie.title)}&src=${videoSrc}&poster=${encodeURIComponent(movie.backdrop)}`}
                      >
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          <Play className="mr-2 h-5 w-5" />
                          Play Now
                        </Button>
                      </Link>

                    )}



                    <TrailerButton
                      trailerSrc={trailerState.trailerSrc}
                      isLoading={trailerState.isLoading}
                      hasError={trailerState.hasError}
                      movieId={movie.id}
                      movieTitle={movie.title}
                      size="sm"
                    />

                    {isAuthenticated && movie && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleToggleList}
                          className={`border-white/20 text-white hover:bg-white/10 transition-all ${isInList(movie.id)
                            ? 'text-white'
                            : ''
                            }`}
                        >
                          {isInList(movie.id) ? (
                            <>
                              <Save className="mr-2 h-5 w-5" />
                              <span className="">Saved </span>
                            </>
                          ) : (
                            <>
                          <Plus className="mr-2 h-5 w-5" />
                              Add to List
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleToggleLike}
                          className={`border-white/20 text-white hover:bg-white/10 transition-all ${isLiked(movie.id)
                            ? 'text-white'
                            : ''
                            }`}
                        >
                          {isLiked(movie.id) ? (
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          ) : (
                            <Heart className="h-5 w-5" />
                          )}
                        </Button>
                      </>
                    )}

                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Share className="mr-2 h-5 w-5" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="container max-w-screen-2xl px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - Description and Cast */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border  hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2  rounded-lg">
                    <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">Story Line</h2>
                </div>
                <p className="text-white/80 leading-relaxed text-sm">
                  {movie.description}
                </p>
              </div>

          

              {/* Top Cast Section */}
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border  hover:border-white/20 transition-colors ">
                  <div className="flex items-center justify-between mb-6">

                    <div className="flex items-center gap-3">
                      <div className="p-2  rounded-lg">
                        <svg className="w-5 h-5 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h2 className="text-lg font-bold text-white">Top Cast</h2>
                      <span className="text-white/40 text-sm">({movie.cast.length} actors)</span>
                    </div>                  <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const container = document.getElementById('cast-carousel');
                          if (container) {
                            container.scrollBy({ left: -300, behavior: 'smooth' });
                          }
                        }}
                        className="h-9 w-9 p-0 rounded-full bg-white/10 hover:bg-white/20 border-0"
                      >
                        <ChevronLeft className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const container = document.getElementById('cast-carousel');
                          if (container) {
                            container.scrollBy({ left: 300, behavior: 'smooth' });
                          }
                        }}
                        className="h-9 w-9 p-0 rounded-full bg-white/10 hover:bg-white/20 border-0"
                      >
                        <ChevronRight className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                  <div
                    id="cast-carousel"
                    className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {movie.cast.map((actor, index) => (
                      <motion.div
                        key={actor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex-shrink-0 group cursor-pointer"
                      >
                        <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl p-4 border border-white/10  hover:bg-white/10 transition-all duration-300 w-[140px]">
                          <div className="relative w-20 h-20 mx-auto mb-3">
                            <div className="absolute inset-0  rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                            <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-white/20 transition-all duration-300">
                              <Image
                                src={actor.profileImage}
                                alt={actor.name}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-semibold text-sm truncate mb-1  transition-colors">
                              {actor.name}
                            </p>
                            <p className="text-white/50 text-xs truncate">
                              as {actor.character}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

            </div>


            {/* Right Column - Information Panel */}
            <div className="space-y-4">
              {/* Movie Details Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2  rounded-lg">
                      <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">Movie Details</h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4">
                  {/* Released Year */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Released</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {new Date(movie.releaseDate).getFullYear()}
                    </span>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Duration */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <span className="text-white font-medium text-sm">
                      {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : 'N/A'}
                    </span>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Content Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/60">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm">Rating</span>
                    </div>
                    <span className="border-2 border-white/10 text-white px-2.5 py-1 rounded-md text-xs font-semibold">
                      {movie.contentRating}
                    </span>
                  </div>




                  <div className="h-px bg-white/10" />
                  {/* Languages Card */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">
                        <div className="p-2  rounded-lg">
                          <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </div>
                        <h3 className="text-white font-semibold">Languages</h3>
                        <span className="text-white/40 text-xs ml-auto">{movie.languages.length} available</span>
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="flex flex-wrap gap-2">
                        {movie.languages.map((language) => (
                          <span
                            key={language}
                            className=" text-white px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-white/10"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />

                  {/* Genres Card */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">

                        <div className="p-2 rounded-lg">
                          <svg className="w-4 h-4 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <h3 className="text-white font-semibold">Genres</h3>

                      </div>
                    </div>
                    <div className="p-1">
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.map((genre) => (
                          <span
                            key={genre}
                            className=" text-white px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-white/10"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-white/10" />
                  {/* Director */}
                  <div>
                    <div className="flex items-center gap-2 text-white/60 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm">Director</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                      {directorImage ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-none">
                          <Image
                            src={directorImage}
                            alt={movie.director}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-red-500/30">
                          <span className="text-white font-bold text-sm">
                            {movie.director.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{movie.director}</p>
                        <p className="text-white/50 text-xs">Director</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          
          </div>
              {/* Trailer Section */}
              {/* {(trailerState.trailerSrc || trailerState.isLoading) && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg">
                      <Play className="w-5 h-5 text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-white">Official Trailer</h2>
                    {trailerState.isLoading && (
                      <div className="ml-auto">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                      </div>
                    )}
                  </div>
                  
                  {trailerState.isLoading ? (
                    <div className="aspect-video bg-black/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-3"></div>
                        <p className="text-white/60 text-sm">Loading trailer...</p>
                      </div>
                    </div>
                  ) : trailerState.trailerSrc ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <VideoPlayer
                        src={trailerState.trailerSrc}
                        poster={movie.backdrop}
                        title={`${movie.title} - Official Trailer`}
                        className="w-full h-full"
                        contentType="movie"
                        contentId={`${movie.id}-trailer`}
                      />
                    </div>
                  ) : null}
                </div>
              )} */}

          {/* Similar Movies Section */}
          {relatedMovies.length > 0 && (
            <div className="space-y-6 mt-12">
              <div className="flex items-center justify-between">
                <h2 className="heading-subsection font-bold text-white">Similar Movies for you</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const container = document.getElementById('similar-carousel');
                      if (container) {
                        container.scrollBy({ left: -400, behavior: 'smooth' });
                      }
                    }}
                    className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10 opacity-70 hover:opacity-100"
                  >
                    <ChevronLeft className="h-4 w-4 text-white" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const container = document.getElementById('similar-carousel');
                      if (container) {
                        container.scrollBy({ left: 400, behavior: 'smooth' });
                      }
                    }}
                    className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10 opacity-70 hover:opacity-100"
                  >
                    <ChevronRight className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>

              <div
                id="similar-carousel"
                className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {relatedMovies.map((relatedMovie) => (
                  <Link key={relatedMovie.id} href={createDetailUrl('movie', relatedMovie.id, relatedMovie.title)}>
                    <div className="group flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:scale-105">
                      <div className="relative rounded-lg overflow-hidden bg-black mb-3">
                        <div className="relative aspect-video">
                          <Image
                            src={relatedMovie.backdrop || relatedMovie.thumbnail}
                            alt={relatedMovie.title}
                            fill
                            className="object-cover transition-all duration-300 group-hover:brightness-110"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-white font-bold heading-card leading-tight">
                          {relatedMovie.title}
                        </h3>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-semibold caption-text">{relatedMovie.rating}</span>
                          </div>
                          <span className="text-white/70">|</span>
                          <span className="text-white/70 caption-text">
                            {relatedMovie.genres.slice(0, 2).join(' • ')} • Movie
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

   
    </div >
  );
}