
'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';


import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight, X, Save, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMovieDetails, getMoviesByGenre, getMovieTrailer } from '@/lib/movie-service';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie, Season } from '@/types';
import Link from 'next/link';
import { VideoPlayer } from '@/components/VideoPlayer';
import { TrailerButton } from '@/components/TrailerButton';
import { useTrailerPerformance } from '@/hooks/useTrailerPerformance';
import { useMyList } from '@/hooks/useMyList';

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

  const { isInList, toggleList, myList } = useMyList();
  const resolvedParams = use(params);

  // Force re-render when myList changes
  const [, forceUpdate] = useState({});
  useEffect(() => {
    forceUpdate({});
  }, [myList]);

  const handleToggleList = () => {
    if (movie) {
      const wasInList = isInList(movie.id);
      toggleList(movie);
      setToastMessage(wasInList ? 'Removed from your list' : 'Added to your list');
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

  // Sample video URL - replace with actual movie video source
  const videoSrc = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_with_multiple_tiled_thumbnails.mpd';

  const isAuthenticated = true;

  // Optimized asynchronous trailer loading function with performance monitoring
  const loadTrailerAsync = async (movieId: string, movieData: Movie) => {
    const startTime = startPerformanceMonitoring();

    try {
      console.log(`[Movie Detail Page] Starting optimized trailer fetch for movie ${movieId}`);
      let trailerUrl: string | null = null;
      let cacheHit = false;

      // First check if trailer is already available in movie data (cache hit)
      if (movieData.trailer && movieData.trailer.includes('youtube.com/embed/')) {
        trailerUrl = movieData.trailer;
        cacheHit = true;
        console.log(`[Movie Detail Page] Trailer found in movie data (cache hit) for ${movieId}:`, trailerUrl);
      } else {
        // Background fetch with optimized timeout and priority
        console.log(`[Movie Detail Page] Fetching trailer in background for movie ${movieId}`);

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
          console.log(`[Movie Detail Page] Trailer fetched successfully for ${movieId}:`, trailerUrl);
        } else {
          console.log(`[Movie Detail Page] No trailer available for movie ${movieId}`);
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
      console.log(`[Movie Detail Page] Trailer loading completed for ${movieId}:`, {
        hasTrailer: !!trailerUrl,
        isError: trailerUrl === null && !movieData.trailer,
        duration: `${duration.toFixed(2)}ms`,
        cacheHit,
        performanceGrade: performanceReport?.performanceGrade || 'Unknown',
        optimizationStatus: cacheHit ? 'Optimal (Cache Hit)' : 'Standard (Network Fetch)'
      });

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
                  <h1 className="heading-hero font-bold leading-tight">
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
                    <span className="text-white/80">{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
                    <span className="text-white/70">•</span>
                    <Badge className="bg-red-600 micro-text">Movie</Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/70">{movie.genres.slice(0, 2).join(' • ')}</span>
                  </div>

                  {/* Description */}
                  <p className="body-large text-white/90 leading-relaxed max-w-3xl">
                    {movie.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    {isAuthenticated  && (
                      <Link
                        href={`/watch/${movie.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(movie.title)}&src=${videoSrc}&poster=${encodeURIComponent(movie.backdrop)}`}
                      >
                        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
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
                      size="lg"
                    />

                    {isAuthenticated && movie && (
                      <>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          onClick={handleToggleList}
                          className={`border-white/20 text-white hover:bg-white/10 transition-all ${
                            isInList(movie.id) 
                              ? 'bg-red-600/20 border-red-500/50 hover:bg-red-600/30' 
                              : ''
                          }`}
                        >
                          {isInList(movie.id) ? (
                            <>
                              <Check className="mr-2 h-5 w-5 text-red-400" />
                              <span className="text-red-400">Saved </span>
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-5 w-5" />
                              Save
                            </>
                          )}
                        </Button>

                        {/* <Link href="/user/my-list">
                          <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            View My List ({myList.length})
                          </Button>
                        </Link> */}

                        {/* <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Download className="mr-2 h-5 w-5" />
                          Download
                        </Button> */}
                      </>
                    )}

                    <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
              <div className="space-y-4">
                <h2 className="heading-card font-semibold text-white">Description</h2>
                <p className="text-white/80 leading-relaxed body-small">
                  {movie.description}
                </p>
              </div>

              {/* Top Cast Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="heading-card font-semibold text-white">Top Cast</h2>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const container = document.getElementById('cast-carousel');
                        if (container) {
                          container.scrollBy({ left: -400, behavior: 'smooth' });
                        }
                      }}
                      className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const container = document.getElementById('cast-carousel');
                        if (container) {
                          container.scrollBy({ left: 400, behavior: 'smooth' });
                        }
                      }}
                      className="h-8 w-8 p-0 bg-transparent border-white/20 hover:bg-white/10"
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
                  {movie.cast.map((actor) => (
                    <div key={actor.id} className="flex-shrink-0 cursor-pointer group text-center">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-transparent group-hover:ring-white/30 transition-all duration-300">
                        <Image
                          src={actor.profileImage}
                          alt={actor.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center max-w-[100px]">
                        <p className="text-white font-semibold caption-text truncate mb-1">
                          {actor.name}
                        </p>
                        <p className="text-white/60 micro-text truncate">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column - Information Panel */}
            <div className="space-y-6">

              {/* Released Year */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span className="caption-text">Released Year</span>
                </div>
                <div className="text-white font-semibold">
                  {new Date(movie.releaseDate).getFullYear()}
                </div>
              </div>

              {/* Available Languages */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="caption-text">🌐 Available Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.languages.map((language) => (
                    <span
                      key={language}
                      className="bg-white/10 text-white/80 px-2 py-1 rounded micro-text border border-white/20"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="caption-text">🎭 Genres</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-white/10 text-white/80 px-2 py-1 rounded micro-text border border-white/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Director */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="caption-text">Director</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {movie.director.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold caption-text">{movie.director}</p>
                    <p className="text-white/60 micro-text">Director</p>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <Clock className="h-4 w-4" />
                  <span className="caption-text">Duration</span>
                </div>
                <div className="text-white font-semibold">
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </div>
              </div>

              {/* Content Rating */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="caption-text">Content Rating</span>
                </div>
                <div className="text-white font-semibold">
                  <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded micro-text border border-yellow-400/30 font-semibold">
                    {movie.contentRating}
                  </span>
                </div>
              </div>

            </div>
          </div>

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

      {/* Video Player - Hidden until triggered */}
      {isPlayerOpen && movie && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <VideoPlayer
            src={videoSrc}
            poster={movie.thumbnail}
            title={movie.title}
            className="w-full h-full"
            contentType="movie"
            contentId={movie.id.toString()}
            onPlayingChange={(playing) => {
              console.log('Video playing:', playing);
            }}
            onTimeUpdate={(currentTime, duration) => {
              console.log('Time update:', currentTime, duration);
            }}
          />

          {/* Close button */}
          <button
            onClick={() => setIsPlayerOpen(false)}
            className="absolute top-4 right-4 z-[10000] text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div >
  );
}