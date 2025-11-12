/**
 * Test component to force show Skip Intro and Next Episode buttons for debugging
 */

'use client';

import { SkipIntroButton } from './SkipIntroButton';
import { NextEpisodeButton } from './NextEpisodeButton';
import { EpisodeMetadata } from '@/lib/episode-metadata';

interface VideoPlayerTestButtonsProps {
  onSkipIntro: () => void;
  onPlayNext: (episode: EpisodeMetadata) => void;
}

export function VideoPlayerTestButtons({ onSkipIntro, onPlayNext }: VideoPlayerTestButtonsProps) {
  // Mock data to force buttons to show
  const mockNextEpisode: EpisodeMetadata = {
    id: 'test-episode-2',
    title: 'Test Episode 2',
    description: 'Test next episode',
    thumbnail: '/test-thumb.jpg',
    src: '/test-video.mp4',
    introStart: 0,
    introEnd: 45,
    duration: 2700,
    seriesId: 'test-series',
    seasonNumber: 1,
    episodeNumber: 2
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Force show Skip Intro button */}
      <div className="pointer-events-auto">
        <SkipIntroButton
          currentTime={30} // Force to be within intro range
          introStart={0}
          introEnd={45}
          onSkipIntro={onSkipIntro}
          className="bottom-32 right-4"
        />
      </div>

      {/* Force show Next Episode button */}
      <div className="pointer-events-auto">
        <NextEpisodeButton
          currentTime={2580} // Force to be near end (2580 out of 2700 = 2 minutes left)
          duration={2700}
          nextEpisode={mockNextEpisode}
          onPlayNext={onPlayNext}
          triggerTime={120}
          className="bottom-48 right-4"
        />
      </div>
    </div>
  );
}