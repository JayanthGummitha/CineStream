/**
 * Test for VideoPlayer Props Type Enhancement
 * This test validates that the new episode navigation props are properly typed
 */

import { type VideoPlayerProps } from '../VideoPlayer';
import { type Episode } from '@/types';
import { 
  validateEpisodeNavigationProps,
  mapEpisodeToMetadata 
} from '@/utils/episode-validation';

// Mock episode data
const mockEpisodes: Episode[] = [
  {
    id: 'episode-1',
    title: 'Pilot',
    description: 'The first episode',
    episodeNumber: 1,
    duration: 2700,
    thumbnail: '/thumbnails/episode-1.jpg',
    releaseDate: '2024-01-01',
    rating: 8.5
  },
  {
    id: 'episode-2',
    title: 'The Discovery',
    description: 'Second episode',
    episodeNumber: 2,
    duration: 2640,
    thumbnail: '/thumbnails/episode-2.jpg',
    releaseDate: '2024-01-08',
    rating: 8.7
  }
];

describe('VideoPlayer Props Type Enhancement', () => {
  it('should accept new episode navigation props in VideoPlayerProps interface', () => {
    // This test validates that the TypeScript interface accepts the new props
    const propsWithEpisodes: VideoPlayerProps = {
      src: 'https://example.com/video.mp4',
      title: 'Test Video',
      contentType: 'episode',
      contentId: 'episode-1',
      // New episode navigation props
      episodes: mockEpisodes,
      currentEpisodeIndex: 0,
      seasonNumber: 1
    };

    // If this compiles without TypeScript errors, the interface is working
    expect(propsWithEpisodes.episodes).toBeDefined();
    expect(propsWithEpisodes.currentEpisodeIndex).toBe(0);
    expect(propsWithEpisodes.seasonNumber).toBe(1);
  });

  it('should work without episode navigation props (optional)', () => {
    const propsWithoutEpisodes: VideoPlayerProps = {
      src: 'https://example.com/video.mp4',
      title: 'Test Video',
      contentType: 'movie',
      contentId: 'movie-1'
    };

    // Optional props should be undefined
    expect(propsWithoutEpisodes.episodes).toBeUndefined();
    expect(propsWithoutEpisodes.currentEpisodeIndex).toBeUndefined();
    expect(propsWithoutEpisodes.seasonNumber).toBeUndefined();
  });

  it('should validate episode navigation props correctly', () => {
    const validation = validateEpisodeNavigationProps(mockEpisodes, 0, 1);
    
    expect(validation.isValid).toBe(true);
    expect(validation.hasEpisodeData).toBe(true);
    expect(validation.canNavigate).toBe(true);
  });

  it('should map episode to metadata correctly', () => {
    const episode = mockEpisodes[0];
    const metadata = mapEpisodeToMetadata(episode, 1, 'series-1');

    expect(metadata.id).toBe(episode.id);
    expect(metadata.title).toBe(episode.title);
    expect(metadata.seasonNumber).toBe(1);
    expect(metadata.seriesId).toBe('series-1');
    expect(metadata.src).toBe('https://files.vidstack.io/sprite-fight/1080p.mp4');
  });

  it('should handle episode change callback prop', () => {
    const mockCallback = jest.fn();
    
    const propsWithCallback: VideoPlayerProps = {
      src: 'https://example.com/video.mp4',
      title: 'Test Video',
      contentType: 'episode',
      contentId: 'episode-1',
      episodes: mockEpisodes,
      currentEpisodeIndex: 0,
      seasonNumber: 1,
      onEpisodeChange: mockCallback
    };

    expect(propsWithCallback.onEpisodeChange).toBe(mockCallback);
  });

  it('should accept all existing props along with new episode props', () => {
    const fullProps: VideoPlayerProps = {
      // Existing props
      src: 'https://example.com/video.mp4',
      poster: '/poster.jpg',
      title: 'Test Video',
      className: 'custom-class',
      onPlayingChange: jest.fn(),
      onTimeUpdate: jest.fn(),
      autoFullscreen: true,
      autoPlay: false,
      contentType: 'episode',
      contentId: 'episode-1',
      seriesId: 'series-1',
      onEpisodeChange: jest.fn(),
      nextEpisodeTriggerTime: 120,
      
      // New episode navigation props
      episodes: mockEpisodes,
      currentEpisodeIndex: 0,
      seasonNumber: 1
    };

    // Validate all props are accessible
    expect(fullProps.src).toBeDefined();
    expect(fullProps.episodes).toBeDefined();
    expect(fullProps.currentEpisodeIndex).toBe(0);
    expect(fullProps.seasonNumber).toBe(1);
    expect(fullProps.contentType).toBe('episode');
  });
});