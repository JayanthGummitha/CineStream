/**
 * Test for enhanced episode change handler with prop-based navigation
 */

import { renderHook, act } from '@testing-library/react';
import { useCallback } from 'react';
import { type Episode } from '@/types';
import { type EpisodeMetadata } from '@/lib/episode-metadata';
import {
  validateEpisodeNavigationProps,
  mapEpisodeToMetadata,
  getNextEpisodeIndex,
} from '@/utils/episode-validation';

// Mock the episode metadata service
jest.mock('@/lib/episode-metadata', () => ({
  getNextEpisode: jest.fn(),
  getEpisodeMetadata: jest.fn(),
  getMovieMetadata: jest.fn(),
}));

describe('Enhanced Episode Change Handler', () => {
  const mockEpisodes: Episode[] = [
    {
      id: 'ep1',
      title: 'Episode 1',
      description: 'First episode',
      thumbnail: '/thumb1.jpg',
      episodeNumber: 1,
      seasonNumber: 1,
      duration: 2700,
    },
    {
      id: 'ep2',
      title: 'Episode 2',
      description: 'Second episode',
      thumbnail: '/thumb2.jpg',
      episodeNumber: 2,
      seasonNumber: 1,
      duration: 2800,
    },
    {
      id: 'ep3',
      title: 'Episode 3',
      description: 'Third episode',
      thumbnail: '/thumb3.jpg',
      episodeNumber: 3,
      seasonNumber: 1,
      duration: 2900,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Episode Data Validation', () => {
    it('should validate episode navigation props correctly', () => {
      const validation = validateEpisodeNavigationProps(mockEpisodes, 0, 1);
      
      expect(validation.isValid).toBe(true);
      expect(validation.hasEpisodeData).toBe(true);
      expect(validation.canNavigate).toBe(true);
    });

    it('should handle missing episode data gracefully', () => {
      const validation = validateEpisodeNavigationProps(undefined, undefined, undefined);
      
      expect(validation.isValid).toBe(true);
      expect(validation.hasEpisodeData).toBe(false);
      expect(validation.canNavigate).toBe(false);
    });

    it('should detect invalid episode index', () => {
      const validation = validateEpisodeNavigationProps(mockEpisodes, 5, 1);
      
      expect(validation.isValid).toBe(false);
      expect(validation.hasEpisodeData).toBe(true);
      expect(validation.canNavigate).toBe(false);
      expect(validation.error).toContain('Invalid current episode index');
    });
  });

  describe('Episode Index Navigation', () => {
    it('should find next episode index correctly', () => {
      const nextIndex = getNextEpisodeIndex(0, mockEpisodes.length);
      expect(nextIndex).toBe(1);
    });

    it('should return null when at last episode', () => {
      const nextIndex = getNextEpisodeIndex(2, mockEpisodes.length);
      expect(nextIndex).toBe(null);
    });

    it('should handle bounds checking', () => {
      const nextIndex = getNextEpisodeIndex(10, mockEpisodes.length);
      expect(nextIndex).toBe(null);
    });
  });

  describe('Episode to Metadata Mapping', () => {
    it('should map episode data to metadata correctly', () => {
      const episode = mockEpisodes[0];
      const metadata = mapEpisodeToMetadata(episode, 1, 'series-1');

      expect(metadata.id).toBe(episode.id);
      expect(metadata.title).toBe(episode.title);
      expect(metadata.description).toBe(episode.description);
      expect(metadata.thumbnail).toBe(episode.thumbnail);
      expect(metadata.seasonNumber).toBe(1);
      expect(metadata.episodeNumber).toBe(episode.episodeNumber);
      expect(metadata.seriesId).toBe('series-1');
      expect(metadata.src).toBe('https://files.vidstack.io/sprite-fight/1080p.mp4');
    });

    it('should use default values for missing fields', () => {
      const episode: Episode = {
        id: 'ep1',
        title: 'Episode 1',
        description: '',
        thumbnail: '',
        episodeNumber: 1,
        seasonNumber: 1,
        duration: 2700,
      };

      const metadata = mapEpisodeToMetadata(episode, 1, 'series-1');

      expect(metadata.description).toBe('');
      expect(metadata.thumbnail).toBe('');
      expect(metadata.introStart).toBe(0);
      expect(metadata.introEnd).toBe(45);
    });
  });

  describe('Prop-based Navigation Logic', () => {
    it('should simulate prop-based episode navigation', () => {
      // Simulate the logic from the enhanced handlePlayNextEpisode
      const episodeList = mockEpisodes;
      const currentEpisodeIndex = 0;
      
      // Find next episode from episodes array
      const nextEpisodeIndex = getNextEpisodeIndex(currentEpisodeIndex, episodeList.length);
      
      expect(nextEpisodeIndex).toBe(1);
      
      if (nextEpisodeIndex !== null) {
        const nextEpisodeFromProps = episodeList[nextEpisodeIndex];
        
        // Validate next episode data
        expect(nextEpisodeFromProps).toBeDefined();
        expect(nextEpisodeFromProps.id).toBe('ep2');
        expect(nextEpisodeFromProps.title).toBe('Episode 2');
        
        // Map to EpisodeMetadata
        const nextEpisodeMetadata = mapEpisodeToMetadata(
          nextEpisodeFromProps,
          1,
          'series-1'
        );
        
        expect(nextEpisodeMetadata.id).toBe('ep2');
        expect(nextEpisodeMetadata.title).toBe('Episode 2');
        expect(nextEpisodeMetadata.seasonNumber).toBe(1);
        expect(nextEpisodeMetadata.episodeNumber).toBe(2);
      }
    });

    it('should handle end of episode list', () => {
      const episodeList = mockEpisodes;
      const currentEpisodeIndex = 2; // Last episode
      
      const nextEpisodeIndex = getNextEpisodeIndex(currentEpisodeIndex, episodeList.length);
      
      expect(nextEpisodeIndex).toBe(null);
    });

    it('should validate episode data before proceeding', () => {
      const episodeList = mockEpisodes;
      const currentEpisodeIndex = 0;
      
      const nextEpisodeIndex = getNextEpisodeIndex(currentEpisodeIndex, episodeList.length);
      
      if (nextEpisodeIndex !== null) {
        const nextEpisodeFromProps = episodeList[nextEpisodeIndex];
        
        // Simulate validation logic from the enhanced handler
        const isValid = nextEpisodeFromProps && 
                        nextEpisodeFromProps.id && 
                        nextEpisodeFromProps.title;
        
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid episode data gracefully', () => {
      const invalidEpisodes = [
        {
          id: '',
          title: '',
          description: '',
          thumbnail: '',
          episodeNumber: 0,
          seasonNumber: 0,
          duration: 0,
        }
      ];

      const validation = validateEpisodeNavigationProps(invalidEpisodes, 0, 1);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBeDefined();
    });

    it('should handle empty episode list', () => {
      const validation = validateEpisodeNavigationProps([], 0, 1);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Episodes array cannot be empty');
    });
  });
});