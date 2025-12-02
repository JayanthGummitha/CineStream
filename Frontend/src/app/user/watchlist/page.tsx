'use client';

import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';
import { useMyList } from '@/hooks/useMyList';
import Image from 'next/image';
import Link from 'next/link';
import { createDetailUrl } from '@/lib/url-utils';
import { Star, Trash2, Play, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

export default function MyListPage() {
  const { myList, isLoading, removeFromList } = useMyList();
  const isAuthenticated = true;

  // Reload list when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is now visible, force a re-check of localStorage
        const stored = localStorage.getItem('cinestream_my_list');
        if (stored) {
          // Trigger a custom event to update the context
          window.dispatchEvent(new CustomEvent('myListUpdated', { 
            detail: JSON.parse(stored) 
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Debug: Log myList whenever it changes

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isAuthenticated={isAuthenticated} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your list...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Header isAuthenticated={isAuthenticated} /> */}

      <main className="container max-w-screen-2xl px-4 md:px-8 lg:px-12 ">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Watchlist
              </h1>
              <p className="text-white/70 text-lg">
                {myList.length === 0
                  ? 'Start building your collection'
                  : `${myList.length} ${myList.length === 1 ? 'item' : 'items'} saved`}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {myList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 mb-8 opacity-20">
              <Heart className="w-full h-full text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Your list is empty
            </h2>
            <p className="text-white/60 text-center max-w-md mb-8">
              Browse movies and shows, then click the Save button to add them to your list
            </p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                Browse Content
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {myList.map((movie) => (
                    <Card 
                      key={movie.id}
                      className="m-0 group h-[55vh] relative   @container/card bg-gradient-to-b p-1 from-neutral-800 to-neutral-900/90 border-neutral-900/50  shadow-lg border-4 transition-all duration-300 hover:shadow-xl overflow-hidden">
              
                {/* Movie Poster - Takes 70% of card height */}
                <Link href={createDetailUrl('movie', movie.id, movie.title)} className="flex-[0_0_60%]">
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={movie.thumbnail}
                      alt={movie.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-fill transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-red-600 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-6 w-6 text-white fill-white" />
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-xs font-semibold">
                        {movie.rating}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Movie Info - Takes 40% of card height */}
                <CardContent className="flex-[0_0_40%] w-full  flex gap-2 flex-col justify-between">
                  <div className="space-y-1 h-full grid ">
                    <Link href={createDetailUrl('movie', movie.id, movie.title)}>
                      <h3 className="flex text-white font-bold text-sm line-clamp-2 group-hover:text-red-400 transition-colors">
                        {movie.title}
                      </h3>
                    </Link>

                 
                  {/* Remove Button */}
                  <Button
                    onClick={() => removeFromList(movie.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 w-full sm:flex-none   transition-all 
                                      bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Remove
                  </Button>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
