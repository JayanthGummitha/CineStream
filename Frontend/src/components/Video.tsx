'use client';

import { useState, useEffect } from 'react';
import { VideoPlayerClient } from '@/components/VideoPlayerClient';
import { type VideoPlayerEpisodeData } from '@/utils/episode-transformation';
import { generateContentId, generateSeriesId } from '@/utils/content-id-generator';
import '../app/globals.css';

interface VideoProps {
  autoFullscreen?: boolean;
  autoPlay?: boolean;
  isTrailer?: boolean;
  title?: string;
  src?: string;
  poster?: string;
  contentType?: string;
  contentId?: string;
  episodeData?: VideoPlayerEpisodeData | null;
}

function Video({ autoFullscreen = false, autoPlay = false, title = "Untitled", src = '', poster = '', contentType = 'movie', contentId, episodeData = null }: VideoProps) {
  const [videoSrc] = useState(src);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisodeData, setCurrentEpisodeData] = useState(episodeData);

  // Update internal episode data when props change
  useEffect(() => {
    setCurrentEpisodeData(episodeData);
  }, [episodeData]);

  // Generate consistent IDs using centralized utility
  const contentIdResult = generateContentId({
    contentType: contentType === 'tv' ? 'tv' : 'movie',
    episodeData: currentEpisodeData,
    enableLogging: true
  });

  const seriesId = contentType === 'tv' 
    ? generateSeriesId(currentEpisodeData, 'series-1', true)
    : undefined;

  // const presetVideos = [
  //   {
  //     id: 'sprite-fight-1080p',
  //     title: 'Sprite Fight (1080p)',
  //     url: 'https://files.vidstack.io/sprite-fight/1080p.mp4',
  //     description: 'Action-packed animated short film in 1080p'
  //   },
  //   {
  //     id: 'sprite-fight-720p',
  //     title: 'Sprite Fight (720p)',
  //     url: 'https://files.vidstack.io/sprite-fight/720p.mp4',
  //     description: 'Action-packed animated short film in 720p'
  //   },
  //   {
  //     id: 'sprite-fight-480p',
  //     title: 'Sprite Fight (480p)',
  //     url: 'https://files.vidstack.io/sprite-fight/480p.mp4',
  //     description: 'Action-packed animated short film in 480p'
  //   }
  // ];

  // const handleLoadVideo = (url: string) => {
  //   setVideoSrc(url);
  //   setIsPlaying(false);
  // };

  // const handleLoadCustom = () => {
  //   if (customSrc.trim()) {
  //     setVideoSrc(customSrc.trim());
  //     setIsPlaying(false);
  //   }
  // };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-[100vw] h-[99vh]  flex items-center justify-center p-2">



        <VideoPlayerClient
          src={videoSrc}
          poster={poster}
          onPlayingChange={setIsPlaying}
          autoFullscreen={autoFullscreen}
          autoPlay={autoPlay}
          title={title}
          className="w-99% m-0 p-0 h-full max-w-none"
          contentType={contentType === 'tv' ? 'episode' : 'movie'}
          contentId={contentId || contentIdResult.contentId} // Use provided contentId or generate from episode data
          seriesId={seriesId} // ✅ Now extracts series ID from episode data
          // Pass episode data props for TV shows
          episodes={currentEpisodeData?.episodes}
          currentEpisodeIndex={currentEpisodeData?.currentEpisodeIndex}
          seasonNumber={currentEpisodeData?.seasonNumber}
          onEpisodeChange={(episodeMetadata) => {
            console.log('🎬 Episode changed in Video component:', {
              newEpisodeId: episodeMetadata.id,
              newEpisodeTitle: episodeMetadata.title,
              seasonNumber: episodeMetadata.seasonNumber,
              episodeNumber: episodeMetadata.episodeNumber
            });

            // Update the current episode data to reflect the change
            if (currentEpisodeData?.episodes) {
              const newEpisodeIndex = currentEpisodeData.episodes.findIndex(ep => ep.id === episodeMetadata.id);
              if (newEpisodeIndex !== -1) {
                const updatedEpisodeData = {
                  ...currentEpisodeData,
                  currentEpisodeIndex: newEpisodeIndex,
                  seasonNumber: episodeMetadata.seasonNumber
                };
                setCurrentEpisodeData(updatedEpisodeData);
                console.log('🎬 Updated episode data in Video component:', {
                  newIndex: newEpisodeIndex,
                  newEpisodeTitle: episodeMetadata.title,
                  totalEpisodes: currentEpisodeData.episodes.length
                });
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default Video;