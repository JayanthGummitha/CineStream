'use client';

import { useState, useCallback } from 'react';
import { VideoPlayer, type EpisodeMetadata } from './VideoPlayer';

// Example usage component showing how to integrate Netflix-like features
export function VideoPlayerExample() {
  const [currentEpisode, setCurrentEpisode] = useState({
    id: 'bb-s1-e1',
    src: '/assets/sample-video.mp4',
    title: 'Breaking Bad - Pilot',
    poster: '/assets/bb-s1-e1-poster.jpg'
  });

  // Handle episode changes from the video player
  const handleEpisodeChange = useCallback((newEpisodeData: EpisodeMetadata) => {
    console.log('🎬 Episode changed to:', newEpisodeData.title);
    
    // Update current episode state
    setCurrentEpisode({
      id: newEpisodeData.id,
      src: newEpisodeData.src,
      title: newEpisodeData.title,
      poster: newEpisodeData.thumbnail || '/assets/default-poster.jpg'
    });
    
    // Here you could also:
    // - Update URL/routing
    // - Track viewing progress
    // - Update watch history
    // - Send analytics events
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <VideoPlayer
        src={currentEpisode.src}
        poster={currentEpisode.poster}
        title={currentEpisode.title}
        contentType="episode" // or "movie"
        contentId={currentEpisode.id}
        seriesId="breaking-bad" // for episodes
        onEpisodeChange={handleEpisodeChange}
        autoPlay={false}
        autoFullscreen={false}
        className="w-full"
      />
      
      {/* Additional UI could go here */}
      <div className="mt-4 p-4 bg-gray-900 rounded-lg">
        <h2 className="text-white text-xl font-bold mb-2">
          Now Playing: {currentEpisode.title}
        </h2>
        <p className="text-gray-300 text-sm">
          Episode ID: {currentEpisode.id}
        </p>
      </div>
    </div>
  );
}

// Example for movies
export function MoviePlayerExample() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <VideoPlayer
        src="/assets/inception.mp4"
        poster="/assets/inception-poster.jpg"
        title="Inception"
        contentType="movie"
        contentId="inception"
        autoPlay={false}
        autoFullscreen={false}
        className="w-full"
      />
    </div>
  );
}