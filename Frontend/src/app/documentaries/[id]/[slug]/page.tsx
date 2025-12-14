'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight, Heart, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMovieDetails, getMoviesByGenre, getMovieTrailer } from '@/lib/movie-service';
import { searchPersonImage } from '@/lib/tmdb';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie } from '@/types';
import Link from 'next/link';
import { useLikes } from '@/hooks/useLikes';
import { useMyList } from '@/hooks/useMyList';
import { TrailerButton } from '@/components/TrailerButton';
import { useParentalControls } from '@/hooks/useParentalControls';
import { ContentRestrictionOverlay } from '@/components/parental/ContentRestrictionOverlay';
import { ContentAccessResult } from '@/lib/parental-controls';

interface DocumentaryDetailPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default function DocumentaryDetailPage({ params }: DocumentaryDetailPageProps) {
  const [documentary, setDocumentary] = useState<Movie | null>(null);
  const [relatedDocs, setRelatedDocs] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [directorImage, setDirectorImage] = useState<string | null>(null);
  const [trailerState, setTrailerState] = useState<{
    trailerSrc: string | null;
    isLoading: boolean;
    hasError: boolean;
  }>({
    trailerSrc: null,
    isLoading: false,
    hasError: false
  });
  
  const { isLiked, toggleLike } = useLikes();
  const { isInList, toggleList } = useMyList();
  const { canAccessContent, setPinVerified } = useParentalControls();
  const [contentAccess, setContentAccess] = useState<ContentAccessResult>({ allowed: true });

  // Auto-login for development if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authData = localStorage.getItem('cinestream_auth');
      if (!authData) {
        // Auto-login with demo user for development
        const demoUser = {
          id: 'demo-user-123',
          name: 'Demo User',
          email: 'demo@cinestream.com',
          firstName: 'Demo',
          lastName: 'User'
        };
        localStorage.setItem('cinestream_auth', JSON.stringify({ isAuthenticated: true, user: demoUser }));
        localStorage.setItem('cinestream_user', JSON.stringify(demoUser));
        console.log('✅ Auto-logged in as demo user for development');
      }
    }
  }, []);

  const isAuthenticated = true;
  const resolvedParams = use(params);
  
  // Sample video URL - using the same working source as movies
  const videoSrc = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_with_multiple_tiled_thumbnails.mpd';

  useEffect(() => {
    let isMounted = true;

    async function fetchDocumentaryData() {
      try {
        const movieData = await getMovieDetails(resolvedParams.id);

        if (!movieData) {
          notFound();
          return;
        }

        if (!isMounted) return;
        setDocumentary(movieData);

        // Check parental controls access (including genre-based blocking)
        const accessResult = canAccessContent(movieData.id, movieData.contentRating || 'TV-MA', movieData.genres);
        setContentAccess(accessResult);

        // Fetch director image from TMDB (non-blocking)
        if (movieData.director && movieData.director !== 'Unknown') {
          searchPersonImage(movieData.director).then(imageUrl => {
            if (isMounted) setDirectorImage(imageUrl);
          });
        }

        // Fetch trailer asynchronously (non-blocking)
        if (isMounted) setTrailerState(prev => ({ ...prev, isLoading: true, hasError: false }));
        getMovieTrailer(resolvedParams.id)
          .then(trailerUrl => {
            if (isMounted) {
              setTrailerState({
                trailerSrc: trailerUrl,
                isLoading: false,
                hasError: trailerUrl === null
              });
            }
          })
          .catch(err => {
            console.error('[Documentary Page] Failed to load trailer:', err);
            if (isMounted) {
              setTrailerState({
                trailerSrc: null,
                isLoading: false,
                hasError: true
              });
            }
          });

        // Get related documentaries based on the first genre
        if (movieData.genres.length > 0) {
          const related = await getMoviesByGenre(movieData.genres[0]);
          const filtered = related.filter(m => m.id !== movieData.id).slice(0, 10);
          if (isMounted) setRelatedDocs(filtered);
        }
      } catch (error) {
        console.error('Error fetching documentary data:', error);
        notFound();
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDocumentaryData();

    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading documentary details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!documentary) {
    notFound();
  }

  // Handle PIN verification for restricted content
  const handlePinVerified = () => {
    setPinVerified(true);
    setContentAccess({ allowed: true });
  };

  // Show restriction overlay if content is not accessible
  if (!contentAccess.allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <ContentRestrictionOverlay
          accessResult={contentAccess}
          contentTitle={documentary.title}
          onPinVerified={handlePinVerified}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isAuthenticated={isAuthenticated} />

      <main>
        {/* Hero Section */}
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={documentary.backdrop}
              alt={documentary.title}
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
                {/* Documentary Poster */}
                <div className="hidden lg:block">
                  <div className="relative aspect-[2/3] w-48 mx-auto">
                    <Image
                      src={documentary.thumbnail}
                      alt={documentary.title}
                      fill
                      sizes="192px"
                      className="object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </div>

                {/* Documentary Info */}
                <div className="lg:col-span-2 space-y-6 text-white">
                  {/* Title */}
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                    {documentary.title}
                  </h1>

                  {/* Documentary Badges and Metadata - All in one horizontal line */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{documentary.rating}/10</span>
                    </div>
                    <span className="text-white/70">•</span>
                    <span className="text-white/80">{new Date(documentary.releaseDate).getFullYear()}</span>
                    <span className="text-white/70">•</span>
                    <Badge variant="outline" className="border-white/20 text-white bg-white/10 text-xs">
                      {documentary.contentRating}
                    </Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/80">{documentary.duration ? `${Math.floor(documentary.duration / 60)}h ${documentary.duration % 60}m` : 'N/A'}</span>
                    <span className="text-white/70">•</span>
                    <Badge className="bg-emerald-600 text-xs">Documentary</Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/70">{documentary.genres.slice(0, 2).join(' • ')}</span>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                    {documentary.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    { isAuthenticated  && (
                      <Link href={`/watch/${documentary.id}?fullscreen=true&autoplay=true&title=${encodeURIComponent(documentary.title)}&src=${videoSrc}&poster=${encodeURIComponent(documentary.backdrop)}&type=movie`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Play className="mr-2 h-5 w-5" />
                          Play Now
                        </Button>
                      </Link>
                    )}

                    <TrailerButton
                      trailerSrc={trailerState.trailerSrc}
                      isLoading={trailerState.isLoading}
                      hasError={trailerState.hasError}
                      movieId={documentary.id}
                      movieTitle={documentary.title}
                      size="sm"
                    />

                    {isAuthenticated && documentary && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleList({ ...documentary, contentType: 'documentaries' })}
                          className={`border-white/20 text-white hover:bg-white/10 transition-all ${isInList(documentary.id)
                            ? 'text-white'
                            : ''
                            }`}
                        >
                          {isInList(documentary.id) ? (
                            <>
                              <Save className="mr-2 h-5 w-5" />
                              <span className="text-white">Saved</span>
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-5 w-5" />
                              Add to list
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleLike({ ...documentary, contentType: 'documentaries' })}
                          className={`border-white/20 text-white hover:bg-white/10 transition-all ${isLiked(documentary.id)
                            ? 'text-white'
                            : ''
                            }`}
                        >
                          {isLiked(documentary.id) ? (
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
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">About This Documentary</h2>
                </div>
                <p className="text-white/80 leading-relaxed text-sm">
                  {documentary.description}
                </p>
              </div>

              {/* Featured People Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-white">Featured People</h2>
                    <span className="text-white/40 text-sm">({documentary.cast.length} people)</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                  {documentary.cast.map((person, index) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0 group cursor-pointer"
                    >
                      <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 w-[140px]">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                          <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-white/20 transition-all duration-300">
                            <Image
                              src={person.profileImage}
                              alt={person.name}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-semibold text-sm truncate mb-1 transition-colors">
                            {person.name}
                          </p>
                          <p className="text-white/50 text-xs truncate">
                            {person.character}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Information Panel */}
            <div className="space-y-4">
              {/* Documentary Details Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold">Documentary Details</h3>
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
                      {new Date(documentary.releaseDate).getFullYear()}
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
                      {documentary.duration ? `${Math.floor(documentary.duration / 60)}h ${documentary.duration % 60}m` : 'N/A'}
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
                      {documentary.contentRating}
                    </span>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Languages */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">
                        <div className="p-2 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                        </div>
                        <h3 className="text-white font-semibold">Languages</h3>
                        <span className="text-white/40 text-xs ml-auto">{documentary.languages.length} available</span>
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="flex flex-wrap gap-2">
                        {documentary.languages.map((language) => (
                          <span
                            key={language}
                            className="text-white px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-white/10"
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  {/* Genres */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/60">
                        <div className="p-2 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                        </div>
                        <h3 className="text-white font-semibold">Genres</h3>
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="flex flex-wrap gap-2">
                        {documentary.genres.map((genre) => (
                          <span
                            key={genre}
                            className="text-white px-3 py-1.5 rounded-lg text-xs font-medium border-2 border-white/10"
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
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={directorImage}
                            alt={documentary.director}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {documentary.director.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">{documentary.director}</p>
                        <p className="text-white/50 text-xs">Documentary Filmmaker</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Documentaries Section */}
          <div className="space-y-6 mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Similar Documentaries</h2>
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
              {relatedDocs.map((doc) => (
                <Link key={doc.id} href={createDetailUrl('documentaries', doc.id, doc.title)}>
                  <div className="group flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:scale-105">
                    <div className="relative rounded-lg overflow-hidden bg-black mb-3">
                      <div className="relative aspect-video">
                        <Image
                          src={doc.backdrop || doc.thumbnail}
                          alt={doc.title}
                          fill
                          className="object-cover transition-all duration-300 group-hover:brightness-110"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-lg leading-tight">
                        {doc.title}
                      </h3>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 font-semibold text-sm">{doc.rating}</span>
                        </div>
                        <span>|</span>
                        <span className="text-white/70 text-sm">
                          {doc.genres.slice(0, 2).join(' • ')} • Documentary
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}