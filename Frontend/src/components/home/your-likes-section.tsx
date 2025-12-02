'use client';

import { useLikes } from '@/hooks/useLikes';
import { Movie } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, Heart, X } from 'lucide-react';
import { createDetailUrl } from '@/lib/url-utils';

export function YourLikesSection() {
  const { likes, isLoading, toggleLike } = useLikes();

  if (isLoading || likes.length === 0) {
    return null;
  }

  return (
    <section className="py-2">
      <div className="container max-w-screen-2xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Your Likes</h2>
            <span className="text-white/40 text-sm">({likes.length} titles)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const container = document.getElementById('likes-carousel');
                if (container) {
                  container.scrollBy({ left: -400, behavior: 'smooth' });
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
                const container = document.getElementById('likes-carousel');
                if (container) {
                  container.scrollBy({ left: 400, behavior: 'smooth' });
                }
              }}
              className="h-9 w-9 p-0 rounded-full bg-white/10 hover:bg-white/20 border-0"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </Button>
          </div>
        </div>

        <div
          id="likes-carousel"
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {likes.map((movie: Movie) => (
            <Link
              key={movie.id}
              href={createDetailUrl(movie.contentType || 'movie', movie.id, movie.title)}
            >
              <div className="group flex-shrink-0 w-[200px] cursor-pointer transition-all duration-300 hover:scale-105">
                <div className="relative rounded-lg overflow-hidden mb-3">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={movie.thumbnail}
                      alt={movie.title}
                      fill
                      sizes="200px"
                      className="object-cover transition-all duration-300 group-hover:brightness-110"
                    />
                    {/* Like indicator */}
                    <div className="absolute top-3 left-2">
                      <Heart className="h-5 w-5 fill-red-500 text-red-500 drop-shadow-lg" />
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleLike(movie);
                      }}
                      className="absolute top-3 right-2 h-7 w-7 rounded-full bg-black/60 hover:cursor-pointer flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400">{movie.rating}</span>
                    </div>
                    <span className="text-white/50">•</span>
                    <span className="text-white/50">
                      {new Date(movie.releaseDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
