'use client';

import { use, useState, useEffect } from 'react';
import Video from '@/components/Video';
import { getTVShowWithSeasons } from '@/lib/movie-service';
import { transformAllSeasonsToEpisodeData, type VideoPlayerEpisodeData } from '@/utils/episode-transformation';
import { Season } from '@/types';

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    fullscreen?: string;
    autoplay?: string;
    trailer?: string;
    title?: string;
    src?: string;
    poster?: string;
    type?: string;
    episode?: string; // Episode ID for TV shows
    season?: string; // Season number for TV shows
  }>;
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  
  const [episodeData, setEpisodeData] = useState<VideoPlayerEpisodeData | null>(null);
  const [loading, setLoading] = useState(false);

  const autoFullscreen = resolvedSearchParams.fullscreen === 'true';
  const autoPlay = resolvedSearchParams.autoplay !== 'false';
  const isTrailer = resolvedSearchParams.trailer === 'true';
  const movieTitle = resolvedSearchParams.title || 'Untitled Movie';
  const source = resolvedSearchParams.src || '';
  const posterUrl = resolvedSearchParams.poster || '';
  const contentType = resolvedSearchParams.type || 'movie';
  const episodeId = resolvedSearchParams.episode;
  const seasonNumber = resolvedSearchParams.season ? parseInt(resolvedSearchParams.season) : 1;

  // Load TV show episode data when it's a TV show
  useEffect(() => {
    if (contentType === 'tv' && !isTrailer) {
      
      
      setLoading(true);
      
      const loadTVShowData = async () => {
        try {
          const { tvShow, seasons } = await getTVShowWithSeasons(resolvedParams.id);
          
          if (seasons && seasons.length > 0) {
            // Transform seasons to episode data
            const transformedData = transformAllSeasonsToEpisodeData(seasons, episodeId);
            
            if (transformedData) {
              setEpisodeData(transformedData);
             
            } else {
              console.warn('🎬 Failed to transform TV show data to episode data');
            }
          }
        } catch (error) {
          console.error('🎬 Error loading TV show data for watch page:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadTVShowData();
    }
  }, [resolvedParams.id, contentType, episodeId, seasonNumber, isTrailer]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center overflow-scroll">
        <div className="text-white">Loading episode data...</div>
      </div>
    );
  }

  return (
    <Video
      src={source}
      poster={posterUrl}
      autoFullscreen={autoFullscreen}
      autoPlay={autoPlay}
      isTrailer={isTrailer}
      title={movieTitle}
      contentType={contentType}
      contentId={resolvedParams.id}
      episodeData={episodeData} // Pass episode data to Video component
    />
  );
}
