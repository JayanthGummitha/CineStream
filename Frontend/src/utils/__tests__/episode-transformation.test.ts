import { 
  transformSeasonsToEpisodeData, 
  transformAllSeasonsToEpisodeData,
  getCurrentEpisode,
  getNextEpisodeFromData 
} from '../episode-transformation';
import { Season, Episode } from '@/types';

// Mock data for testing
const mockEpisodes: Episode[] = [
  {
    id: 'ep1',
    title: 'Episode 1',
    description: 'First episode',
    episodeNumber: 1,
    duration: 45,
    thumbnail: '/thumb1.jpg',
    releaseDate: '2023-01-01',
    rating: 8.5,
    src: 'https://files.vidstack.io/sprite-fight/1080p.mp4'
  },
  {
    id: 'ep2',
    title: 'Episode 2',
    description: 'Second episode',
    episodeNumber: 2,
    duration: 47,
    thumbnail: '/thumb2.jpg',
    releaseDate: '2023-01-08',
    rating: 8.7,
    src: 'https://files.vidstack.io/sprite-fight/720p.mp4'
  }
];

const mockSeasons: Season[] = [
  {
    id: 'season1',
    seasonNumber: 1,
    title: 'Season 1',
    episodes: mockEpisodes,
    releaseDate: '2023-01-01',
    thumbnail: '/season1.jpg'
  },
  {
    id: 'season2',
    seasonNumber: 2,
    title: 'Season 2',
    episodes: [
      {
        id: 'ep3',
        title: 'Episode 3',
        description: 'Third episode',
        episodeNumber: 1,
        duration: 50,
        thumbnail: '/thumb3.jpg',
        releaseDate: '2023-02-01',
        rating: 9.0
      }
    ],
    releaseDate: '2023-02-01',
    thumbnail: '/season2.jpg'
  }
];

describe('Episode Transformation Utils', () => {
  describe('transformSeasonsToEpisodeData', () => {
    it('should transform season data to episode data correctly', () => {
      const result = transformSeasonsToEpisodeData(mockSeasons, 1);
      
      expect(result).not.toBeNull();
      expect(result?.episodes).toHaveLength(2);
      expect(result?.currentEpisodeIndex).toBe(0);
      expect(result?.seasonNumber).toBe(1);
      expect(result?.episodes[0].title).toBe('Episode 1');
    });

    it('should find correct episode by ID', () => {
      const result = transformSeasonsToEpisodeData(mockSeasons, 1, 'ep2');
      
      expect(result).not.toBeNull();
      expect(result?.currentEpisodeIndex).toBe(1);
      expect(result?.episodes[1].id).toBe('ep2');
    });

    it('should return null for invalid season', () => {
      const result = transformSeasonsToEpisodeData(mockSeasons, 99);
      
      expect(result).toBeNull();
    });
  });

  describe('transformAllSeasonsToEpisodeData', () => {
    it('should combine all episodes from all seasons', () => {
      const result = transformAllSeasonsToEpisodeData(mockSeasons);
      
      expect(result).not.toBeNull();
      expect(result?.episodes).toHaveLength(3); // 2 from season 1 + 1 from season 2
      expect(result?.currentEpisodeIndex).toBe(0);
      expect(result?.seasonNumber).toBe(1); // First season
    });

    it('should find episode across seasons', () => {
      const result = transformAllSeasonsToEpisodeData(mockSeasons, 'ep3');
      
      expect(result).not.toBeNull();
      expect(result?.currentEpisodeIndex).toBe(2); // Third episode overall
      expect(result?.seasonNumber).toBe(2); // Episode is in season 2
    });

    it('should return null for empty seasons', () => {
      const result = transformAllSeasonsToEpisodeData([]);
      
      expect(result).toBeNull();
    });
  });

  describe('getCurrentEpisode', () => {
    it('should return current episode correctly', () => {
      const episodeData = transformSeasonsToEpisodeData(mockSeasons, 1, 'ep2');
      const currentEpisode = getCurrentEpisode(episodeData!);
      
      expect(currentEpisode).not.toBeNull();
      expect(currentEpisode?.id).toBe('ep2');
      expect(currentEpisode?.title).toBe('Episode 2');
    });

    it('should return null for invalid data', () => {
      const currentEpisode = getCurrentEpisode({
        episodes: [],
        currentEpisodeIndex: 0,
        seasonNumber: 1
      });
      
      expect(currentEpisode).toBeNull();
    });
  });

  describe('getNextEpisodeFromData', () => {
    it('should return next episode correctly', () => {
      const episodeData = transformAllSeasonsToEpisodeData(mockSeasons, 'ep1');
      const nextEpisode = getNextEpisodeFromData(episodeData!);
      
      expect(nextEpisode).not.toBeNull();
      expect(nextEpisode?.id).toBe('ep2');
      expect(nextEpisode?.title).toBe('Episode 2');
    });

    it('should return null when no next episode', () => {
      const episodeData = transformAllSeasonsToEpisodeData(mockSeasons, 'ep3');
      const nextEpisode = getNextEpisodeFromData(episodeData!);
      
      expect(nextEpisode).toBeNull();
    });
  });
});