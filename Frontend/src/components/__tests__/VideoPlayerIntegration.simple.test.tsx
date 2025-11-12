/**
 * Simple integration test for Netflix-like features with existing VideoPlayer controls
 * Tests basic functionality without complex mocking
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Vidstack components with simple implementations
jest.mock('@vidstack/react', () => ({
  MediaPlayer: React.forwardRef<HTMLDivElement, any>(({ children, ...props }, ref) => (
    React.createElement('div', { ref, 'data-testid': 'media-player', ...props }, children)
  )),
  MediaProvider: ({ children }: any) => React.createElement('div', { 'data-testid': 'media-provider' }, children),
  Captions: () => React.createElement('div', { 'data-testid': 'captions' }),
  useMediaState: () => false, // Return default values
  useMediaStore: () => ({
    qualities: [],
    quality: null,
    autoQuality: true,
    canSetQuality: true
  })
}));

// Mock episode metadata
jest.mock('../../lib/episode-metadata', () => ({
  getEpisodeMetadata: jest.fn().mockResolvedValue(null),
  getNextEpisode: jest.fn().mockResolvedValue(null),
  getMovieMetadata: jest.fn().mockResolvedValue(null)
}));

// Mock CSS imports
jest.mock('../../styles/skip-intro-animations.css', () => ({}));
jest.mock('../../styles/video-player-animations.css', () => ({}));

describe('VideoPlayer Integration - Basic Tests', () => {
  it('should render without crashing', () => {
    // Import here to avoid hoisting issues
    const { VideoPlayerContent } = require('../VideoPlayer');
    
    render(
      React.createElement(VideoPlayerContent, {
        src: '/test-video.mp4',
        contentType: 'movie'
      })
    );

    expect(screen.getByTestId('media-player')).toBeInTheDocument();
  });

  it('should render with episode content type', () => {
    const { VideoPlayerContent } = require('../VideoPlayer');
    
    render(
      React.createElement(VideoPlayerContent, {
        src: '/test-video.mp4',
        contentType: 'episode',
        contentId: 'episode-1'
      })
    );

    expect(screen.getByTestId('media-player')).toBeInTheDocument();
  });

  it('should handle missing content props gracefully', () => {
    const { VideoPlayerContent } = require('../VideoPlayer');
    
    render(
      React.createElement(VideoPlayerContent, {
        src: '/test-video.mp4'
      })
    );

    expect(screen.getByTestId('media-player')).toBeInTheDocument();
  });
});