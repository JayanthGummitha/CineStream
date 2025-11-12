'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { getMovieDetails, getMoviesByGenre } from '@/lib/movie-service';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie } from '@/types';
import Link from 'next/link';

interface KidsDetailPageProps {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default function KidsDetailPage({ params }: KidsDetailPageProps) {
  const [kidsMovie, setKidsMovie] = useState<Movie | null>(null);
  const [relatedKids, setRelatedKids] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = false;
  const resolvedParams = use(params);

  useEffect(() => {
    async function fetchKidsMovieData() {
      try {
        const movieData = await getMovieDetails(resolvedParams.id);

        if (!movieData) {
          notFound();
          return;
        }

        setKidsMovie(movieData);

        // Get related kids content based on the first genre
        if (movieData.genres.length > 0) {
          const related = await getMoviesByGenre(movieData.genres[0]);
          const filtered = related.filter(m => m.id !== movieData.id).slice(0, 10);
          setRelatedKids(filtered);
        }
      } catch (error) {
        console.error('Error fetching kids movie data:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchKidsMovieData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading kids content...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!kidsMovie) {
    notFound();
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
              src={kidsMovie.backdrop}
              alt={kidsMovie.title}
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
                {/* Kids Movie Poster */}
                <div className="hidden lg:block">
                  <div className="relative aspect-[2/3] w-48 mx-auto">
                    <Image
                      src={kidsMovie.thumbnail}
                      alt={kidsMovie.title}
                      fill
                      sizes="192px"
                      className="object-cover rounded-lg shadow-2xl"
                    />
                  </div>
                </div>

                {/* Kids Movie Info */}
                <div className="lg:col-span-2 space-y-6 text-white">
                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    {kidsMovie.title}
                  </h1>

                  {/* Kids Movie Badges and Metadata - All in one horizontal line */}
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">{kidsMovie.rating}/10</span>
                    </div>
                    <span className="text-white/70">•</span>
                    <span className="text-white/80">{new Date(kidsMovie.releaseDate).getFullYear()}</span>
                    <span className="text-white/70">•</span>
                    <Badge variant="outline" className="border-white/20 text-white bg-white/10 text-xs">
                      {kidsMovie.contentRating}
                    </Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/80">{Math.floor(kidsMovie.duration / 60)}h {kidsMovie.duration % 60}m</span>
                    <span className="text-white/70">•</span>
                    <Badge className="bg-pink-600 text-xs">Kids & Family</Badge>
                    <span className="text-white/70">•</span>
                    <span className="text-white/70">{kidsMovie.genres.slice(0, 2).join(' • ')}</span>
                  </div>

                  {/* Description */}
                  <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                    {kidsMovie.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4">
                    {isAuthenticated || true && (
                      <Link href={`/watch/${kidsMovie.id}?title=${encodeURIComponent(kidsMovie.title)}`}>
                        <Button size="lg" className="bg-pink-600 hover:bg-pink-700 text-white">
                          <Play className="mr-2 h-5 w-5" />
                          Play Now
                        </Button>
                      </Link>
                    )}

                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Trailer
                    </Button>

                    {isAuthenticated && (
                      <>
                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Plus className="mr-2 h-5 w-5" />
                          Add to List
                        </Button>

                        <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          <Heart className="mr-2 h-5 w-5" />
                          Favorite
                        </Button>
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

            {/* Left Column - Description and Characters */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Story</h2>
                <p className="text-white/80 leading-relaxed text-sm">
                  {kidsMovie.description}
                </p>
              </div>

              {/* Characters Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Characters & Voice Cast</h2>
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
                  {kidsMovie.cast.map((actor) => (
                    <div key={actor.id} className="flex-shrink-0 cursor-pointer group text-center">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-transparent group-hover:ring-pink-300 transition-all duration-300">
                        <Image
                          src={actor.profileImage}
                          alt={actor.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center max-w-[100px]">
                        <p className="text-white font-semibold text-sm truncate mb-1">
                          {actor.name}
                        </p>
                        <p className="text-white/60 text-xs truncate">
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

              {/* Age Rating */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">👶 Age Rating</span>
                </div>
                <div className="bg-green-500/20 border border-green-400/40 rounded-lg p-3">
                  <div className="text-green-400 font-semibold text-lg">
                    {kidsMovie.contentRating}
                  </div>
                  <div className="text-green-300 text-xs mt-1">
                    Safe for kids and family viewing
                  </div>
                </div>
              </div>

              {/* Released Year */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Released Year</span>
                </div>
                <div className="text-white font-semibold">
                  {new Date(kidsMovie.releaseDate).getFullYear()}
                </div>
              </div>

              {/* Available Languages */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">🌐 Available Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {kidsMovie.languages.map((language) => (
                    <span
                      key={language}
                      className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs border border-white/20"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">🎭 Genres</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {kidsMovie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs border border-white/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              {/* Director */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">Director</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {kidsMovie.director.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{kidsMovie.director}</p>
                    <p className="text-white/60 text-xs">Family Entertainment</p>
                  </div>
                </div>
              </div>

              {/* Educational Value */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">📚 Educational Value</span>
                </div>
                <div className="bg-blue-500/20 border border-blue-400/40 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-400/30 text-blue-200 px-2 py-1 rounded text-xs">Friendship</span>
                    <span className="bg-blue-400/30 text-blue-200 px-2 py-1 rounded text-xs">Teamwork</span>
                    <span className="bg-blue-400/30 text-blue-200 px-2 py-1 rounded text-xs">Creativity</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Kids Content Section */}
          <div className="space-y-6 mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">More Kids & Family Content</h2>
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
              {relatedKids.map((kidsContent) => (
                <Link key={kidsContent.id} href={createDetailUrl('kids', kidsContent.id, kidsContent.title)}>
                  <div className="group flex-shrink-0 w-80 cursor-pointer transition-all duration-300 hover:scale-105">
                    <div className="relative rounded-lg overflow-hidden bg-black mb-3">
                      <div className="relative aspect-video">
                        <Image
                          src={kidsContent.backdrop || kidsContent.thumbnail}
                          alt={kidsContent.title}
                          fill
                          className="object-cover transition-all duration-300 group-hover:brightness-110"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white font-bold text-lg leading-tight">
                        {kidsContent.title}
                      </h3>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-yellow-400 font-semibold text-sm">{kidsContent.rating}</span>
                        </div>
                        <span>|</span>
                        <span className="text-white/70 text-sm">
                          {kidsContent.genres.slice(0, 2).join(' • ')} • Kids & Family
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