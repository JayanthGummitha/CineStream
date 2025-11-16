'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Trash2, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchProgressList } from '@/hooks/useWatchProgressList';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export default function ContinueWatchingPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { progressList, isLoading, isRefreshing, removeProgress, refreshProgress } = useWatchProgressList();

  const handleRemove = (videoId: string, title: string) => {
    removeProgress(videoId);
    
    toast({
      title: 'Removed from Continue Watching',
      description: `${title} has been removed`,
      duration: 5000,
      action: (
        <ToastAction 
          altText="Undo remove"
          onClick={() => {
            }}
        >
          Undo
        </ToastAction>
      ),
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatLastWatched = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getContentUrl = (progressData: any) => {
    if (progressData.contentType === 'movie') {
      return `/movie/${progressData.videoId}`;
    } else if (progressData.contentType === 'tv-show') {
      return `/tv-shows/${progressData.videoId}`;
    }
    return '#';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your watch progress...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  Continue Watching
                </h1>
                <p className="text-white/70 text-lg">
                  Pick up where you left off • {progressList.length} {progressList.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Refresh Button */}
            {progressList.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={refreshProgress}
                disabled={isRefreshing}
                className="bg-black/40 border-white/20 hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Refresh progress"
              >
                <RefreshCw className={`h-5 w-5 text-white mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Content Grid */}
        {progressList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-32 h-32 mb-8 opacity-20">
              <Play className="w-full h-full text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              No items to continue watching
            </h2>
            <p className="text-white/60 text-center max-w-md mb-8">
              Start watching movies and shows to see your progress here
            </p>
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Browse Content
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {progressList.map((progressData) => {
              const isMovie = progressData.contentType === 'movie';
              const displayTitle = progressData.title;
              const displayImage = progressData.thumbnail || '/placeholder-movie.jpg';

              return (
                <Link key={progressData.videoId} href={getContentUrl(progressData)}>
                  <div className="group relative cursor-pointer transition-all duration-300 hover:scale-105 min-w-[280px]">
                    <div className="relative rounded-lg overflow-hidden bg-black w-[300px] h-[150px] flex flex-col">
                      {/* Main Image */}
                      <div className="relative flex-1">
                        <Image
                          src={displayImage}
                          alt={displayTitle}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center transition-all duration-300 group-hover:brightness-110"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(progressData.videoId, progressData.title);
                          }}
                          className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                          aria-label="Remove from Continue Watching"
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                        </button>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                          <div className="bg-white/90 rounded-full p-3 shadow-lg">
                            <Play className="h-6 w-6 text-black fill-black ml-0.5" />
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="text-white font-bold text-xl mb-2 leading-tight line-clamp-2">
                            {displayTitle}
                          </h3>

                          {/* Show different info for movies vs TV shows */}
                          <div className="text-white/80 text-sm mb-4">
                            {isMovie ? (
                              <span className="text-sm text-white/70">{formatLastWatched(progressData.lastWatchedAt)}</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="line-clamp-1 text-base">
                                  S{progressData.seasonNumber} E{progressData.episodeNumber}
                                  {progressData.episodeTitle && ` - ${progressData.episodeTitle}`}
                                </div>
                                <div className="text-sm text-white/70">{formatLastWatched(progressData.lastWatchedAt)}</div>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar Container */}
                          <div className="space-y-2">
                            {/* Time Display */}
                            <div className="flex justify-between text-sm text-white/80 font-medium">
                              <span>{formatTime(progressData.currentTime)}</span>
                              <span>{formatTime(progressData.duration)}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full relative">
                              <div className="w-full h-1.5 bg-white/30 rounded-full">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                                  style={{ width: `${progressData.percentage}%` }}
                                />
                              </div>
                              {/* Progress Dot */}
                              <div
                                className="absolute top-1/2 w-3.5 h-3.5 bg-blue-500 rounded-full transform -translate-y-1/2 transition-all duration-500 border-2 border-white shadow-lg"
                                style={{ left: `calc(${progressData.percentage}% - 7px)` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
