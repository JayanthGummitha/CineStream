/**
 * VideoPlayer Debug Component
 * 
 * A debugging component to help test and verify Netflix-like video features
 * Shows current state and allows manual triggering of features
 */

'use client';

import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { EpisodeMetadata } from '@/lib/episode-metadata';

export function VideoPlayerDebug() {
  const [contentType, setContentType] = useState<'movie' | 'episode'>('episode');
  const [contentId, setContentId] = useState('episode-1');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleEpisodeChange = (episodeData: EpisodeMetadata) => {
    console.log('🎬 Episode changed in debug component:', episodeData);
    setContentId(episodeData.id);
  };

  return (
    <div className="w-full h-screen bg-black">
      {/* Debug Controls */}
      <div className="absolute top-4 left-4 z-[10000] bg-black/80 text-white p-4 rounded-lg space-y-2 text-sm">
        <h3 className="font-bold">Debug Controls</h3>
        
        <div className="space-y-1">
          <label className="block">Content Type:</label>
          <select 
            value={contentType} 
            onChange={(e) => setContentType(e.target.value as 'movie' | 'episode')}
            className="bg-gray-800 text-white p-1 rounded"
          >
            <option value="episode">Episode</option>
            <option value="movie">Movie</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block">Content ID:</label>
          <select 
            value={contentId} 
            onChange={(e) => setContentId(e.target.value)}
            className="bg-gray-800 text-white p-1 rounded"
          >
            {contentType === 'episode' ? (
              <>
                <option value="episode-1">Episode 1</option>
                <option value="episode-2">Episode 2</option>
                <option value="episode-3">Episode 3</option>
                <option value="episode-4">Episode 4</option>
                <option value="episode-5">Episode 5</option>
              </>
            ) : (
              <>
                <option value="movie-1">Movie 1</option>
                <option value="movie-2">Movie 2</option>
                <option value="movie-3">Movie 3</option>
              </>
            )}
          </select>
        </div>

        <div className="space-y-1">
          <div>Playing: {isPlaying ? '▶️' : '⏸️'}</div>
          <div>Time: {Math.floor(currentTime)}s / {Math.floor(duration)}s</div>
          <div>Progress: {duration > 0 ? Math.round((currentTime / duration) * 100) : 0}%</div>
          {duration > 30 && (
            <div className={`text-xs ${currentTime >= (duration - 30) ? 'text-green-400' : 'text-yellow-400'}`}>
              Next Episode Trigger: {Math.floor(duration - 30)}s {currentTime >= (duration - 30) ? '✅' : '⏳'}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <div>💡 Skip Intro should appear at 0-45s for episodes</div>
          <div>💡 Next Episode overlay appears 30s before video ends</div>
          <div>💡 Check browser console for detailed logs</div>
        </div>
      </div>

      {/* Video Player */}
      <VideoPlayer
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
        title={contentType === 'episode' ? `Episode ${contentId.split('-')[1]}` : `Movie ${contentId.split('-')[1]}`}
        className="w-full h-full"
        contentType={contentType}
        contentId={contentId}
        seriesId={contentType === 'episode' ? 'series-1' : undefined}
        onPlayingChange={setIsPlaying}
        onTimeUpdate={(time, dur) => {
          setCurrentTime(time);
          setDuration(dur);
        }}
        onEpisodeChange={handleEpisodeChange}
        nextEpisodeTriggerTime={30} // Show overlay 30 seconds before end for testing
        autoPlay={false}
        autoFullscreen={false}
      />
    </div>
  );
}