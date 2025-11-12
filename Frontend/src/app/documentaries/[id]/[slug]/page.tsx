'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Share, Download, Star, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMovieDetails, getMoviesByGenre } from '@/lib/movie-service';
import { createDetailUrl } from '@/lib/url-utils';
import { Movie } from '@/types';
import Link from 'next/link';

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

  const isAuthenticated = false;
  const resolvedParams = use(params);

  useEffect(() => {
    async function fetchDocumentaryData() {
      try {
        const movieData = await getMovieDetails(resolvedParams.id);

        if (!movieData) {
          notFound();
          return;
        }

        setDocumentary(movieData);

        // Get related documentaries based on the first genre
        if (movieData.genres.length > 0) {
          const related = await getMoviesByGenre(movieData.genres[0]);
          const filtered = related.filter(m => m.id !== movieData.id).slice(0, 10);
          setRelatedDocs(filtered);
        }
      } catch (error) {
        console.error('Error fetching documentary data:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    }

    fetchDocumentaryData();
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
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
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
                    <span className="text-white/80">{Math.floor(documentary.duration / 60)}h {documentary.duration % 60}m</span>
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
                    {isAuthenticated || true && (
                      <Link href={`/watch/${documentary.id}?title=${encodeURIComponent(documentary.title)}`}>
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
                          <Download className="mr-2 h-5 w-5" />
                          Download
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

            {/* Left Column - Description and Cast */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">About This Documentary</h2>
                <p className="text-white/80 leading-relaxed text-sm">
                  {documentary.description}
                </p>
              </div>

              {/* Featured People Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Featured People</h2>
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
                  {documentary.cast.map((person) => (
                    <div key={person.id} className="flex-shrink-0 cursor-pointer group text-center">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-transparent group-hover:ring-white/30 transition-all duration-300">
                        <Image
                          src={person.profileImage}
                          alt={person.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-center max-w-[100px]">
                        <p className="text-white font-semibold text-sm truncate mb-1">
                          {person.name}
                        </p>
                        <p className="text-white/60 text-xs truncate">
                          {person.character}
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
                  <span className="text-sm">Released Year</span>
                </div>
                <div className="text-white font-semibold">
                  {new Date(documentary.releaseDate).getFullYear()}
                </div>
              </div>

              {/* Available Languages */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/60">
                  <span className="text-sm">🌐 Available Languages</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {documentary.languages.map((language) => (
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
                  {documentary.genres.map((genre) => (
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
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {documentary.director.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{documentary.director}</p>
                    <p className="text-white/60 text-xs">Documentary Filmmaker</p>
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