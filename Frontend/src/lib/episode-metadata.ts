/**
 * Episode and Movie Metadata Utility
 * 
 * This module provides comprehensive interfaces and functions for managing
 * episode and movie metadata, including intro timings, next episode logic,
 * and content organization for Netflix-like streaming features.
 * 
 * @module episode-metadata
 * @version 1.0.0
 */

/**
 * Interface representing episode metadata
 * Contains all necessary information for episode playback and navigation
 */
export interface EpisodeMetadata {
  /** Unique identifier for the episode */
  id: string;
  /** Display title of the episode */
  title: string;
  /** Brief description or synopsis of the episode */
  description: string;
  /** URL to the episode thumbnail image */
  thumbnail: string;
  /** URL to the episode video source */
  src: string;
  /** Start time of the intro sequence in seconds */
  introStart: number;
  /** End time of the intro sequence in seconds */
  introEnd: number;
  /** Total duration of the episode in seconds */
  duration: number;
  /** Identifier of the series this episode belongs to */
  seriesId: string;
  /** Season number (1-based) */
  seasonNumber: number;
  /** Episode number within the season (1-based) */
  episodeNumber: number;
}

/**
 * Interface representing movie metadata
 * Contains all necessary information for movie playback
 */
export interface MovieMetadata {
  /** Unique identifier for the movie */
  id: string;
  /** Display title of the movie */
  title: string;
  /** Start time of the intro sequence in seconds */
  introStart: number;
  /** End time of the intro sequence in seconds */
  introEnd: number;
  /** Total duration of the movie in seconds */
  duration: number;
  /** URL to the movie video source */
  src: string;
  /** URL to the movie thumbnail image */
  thumbnail: string;
  /** Brief description or synopsis of the movie */
  description: string;
}

// Mock data store for episodes
const MOCK_EPISODES: Record<string, EpisodeMetadata> = {
  'episode-1': {
    id: 'episode-1',
    title: 'Pilot Episode',
    description: 'The beginning of an epic journey through space and time',
    thumbnail: '/thumbnails/episode-1.jpg',
    src: '/videos/episode-1.mp4',
    introStart: 0,
    introEnd: 45,
    duration: 2700, // 45 minutes
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 1
  },
  'episode-2': {
    id: 'episode-2',
    title: 'The Discovery',
    description: 'New worlds are discovered as the adventure continues',
    thumbnail: '/thumbnails/episode-2.jpg',
    src: '/videos/episode-2.mp4',
    introStart: 0,
    introEnd: 42,
    duration: 2640, // 44 minutes
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 2
  },
  'episode-3': {
    id: 'episode-3',
    title: 'Revelations',
    description: 'Shocking truths are revealed that change everything',
    thumbnail: '/thumbnails/episode-3.jpg',
    src: '/videos/episode-3.mp4',
    introStart: 0,
    introEnd: 38,
    duration: 2580, // 43 minutes
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 3
  },
  'episode-4': {
    id: 'episode-4',
    title: 'The Alliance',
    description: 'Unlikely allies join forces against a common threat',
    thumbnail: '/thumbnails/episode-4.jpg',
    src: '/videos/episode-4.mp4',
    introStart: 0,
    introEnd: 40,
    duration: 2760, // 46 minutes
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 4
  },
  'episode-5': {
    id: 'episode-5',
    title: 'Season Finale',
    description: 'The epic conclusion to an unforgettable season',
    thumbnail: '/thumbnails/episode-5.jpg',
    src: '/videos/episode-5.mp4',
    introStart: 0,
    introEnd: 50,
    duration: 3300, // 55 minutes
    seriesId: 'series-1',
    seasonNumber: 1,
    episodeNumber: 5
  }
};

// Mock data store for movies
const MOCK_MOVIES: Record<string, MovieMetadata> = {
  'movie-1': {
    id: 'movie-1',
    title: 'The Epic Adventure',
    introStart: 0,
    introEnd: 90, // Default 90 seconds for movies
    duration: 7200, // 2 hours
    src: '/videos/movie-1.mp4',
    thumbnail: '/thumbnails/movie-1.jpg',
    description: 'An epic adventure that spans across galaxies'
  },
  'movie-2': {
    id: 'movie-2',
    title: 'Mystery of the Lost City',
    introStart: 0,
    introEnd: 85,
    duration: 6900, // 1 hour 55 minutes
    src: '/videos/movie-2.mp4',
    thumbnail: '/thumbnails/movie-2.jpg',
    description: 'A thrilling mystery set in an ancient lost civilization'
  },
  'movie-3': {
    id: 'movie-3',
    title: 'Future Worlds',
    introStart: 0,
    introEnd: 95,
    duration: 8100, // 2 hours 15 minutes
    src: '/videos/movie-3.mp4',
    thumbnail: '/thumbnails/movie-3.jpg',
    description: 'A sci-fi epic exploring distant future civilizations'
  }
};

// Episode sequence mapping for next episode logic
const EPISODE_SEQUENCES: Record<string, string> = {
  'episode-1': 'episode-2',
  'episode-2': 'episode-3',
  'episode-3': 'episode-4',
  'episode-4': 'episode-5'
  // episode-5 has no next episode (season finale)
};

/**
 * Simulates async delay for realistic API behavior
 * Used to mimic network latency in mock data functions
 * 
 * @param ms - Delay duration in milliseconds (default: 100)
 * @returns Promise that resolves after the specified delay
 */
const simulateAsyncDelay = (ms: number = 100): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retrieves episode metadata by episode ID
 * @param episodeId - The unique identifier for the episode
 * @returns Promise resolving to EpisodeMetadata or null if not found
 */
export async function getEpisodeMetadata(episodeId: string): Promise<EpisodeMetadata | null> {
  try {
    if (!episodeId || typeof episodeId !== 'string') {
      console.warn('🎬 Invalid episode ID provided:', episodeId);
      return null;
    }

    await simulateAsyncDelay();
    
    const episode = MOCK_EPISODES[episodeId];
    
    if (episode) {
      console.log('🎬 Episode metadata loaded successfully:', episode.title);
    } else {
      console.log('🎬 Episode metadata not found for ID:', episodeId);
    }
    
    return episode || null;
  } catch (error) {
    console.error('🎬 Error loading episode metadata:', error);
    return null;
  }
}

/**
 * Retrieves the next episode in sequence for a given episode
 * @param currentEpisodeId - The current episode ID
 * @returns Promise resolving to next EpisodeMetadata or null if no next episode
 */
export async function getNextEpisode(currentEpisodeId: string): Promise<EpisodeMetadata | null> {
  try {
    if (!currentEpisodeId || typeof currentEpisodeId !== 'string') {
      console.warn('🎬 Invalid current episode ID provided:', currentEpisodeId);
      return null;
    }

    await simulateAsyncDelay();
    
    const nextEpisodeId = EPISODE_SEQUENCES[currentEpisodeId];
    if (!nextEpisodeId) {
      console.log('🎬 No next episode found for:', currentEpisodeId);
      return null;
    }
    
    const nextEpisode = MOCK_EPISODES[nextEpisodeId];
    
    if (nextEpisode) {
      console.log('🎬 Next episode loaded successfully:', nextEpisode.title);
    } else {
      console.warn('🎬 Next episode ID found but metadata missing:', nextEpisodeId);
    }
    
    return nextEpisode || null;
  } catch (error) {
    console.error('🎬 Error loading next episode metadata:', error);
    return null;
  }
}

/**
 * Retrieves movie metadata by movie ID
 * @param movieId - The unique identifier for the movie
 * @returns Promise resolving to MovieMetadata or null if not found
 */
export async function getMovieMetadata(movieId: string): Promise<MovieMetadata | null> {
  try {
    if (!movieId || typeof movieId !== 'string') {
      console.warn('🎬 Invalid movie ID provided:', movieId);
      return null;
    }

    await simulateAsyncDelay();
    
    const movie = MOCK_MOVIES[movieId];
    
    if (movie) {
      console.log('🎬 Movie metadata loaded successfully:', movie.title);
    } else {
      console.log('🎬 Movie metadata not found for ID:', movieId);
    }
    
    return movie || null;
  } catch (error) {
    console.error('🎬 Error loading movie metadata:', error);
    return null;
  }
}

/**
 * Helper function to get all episodes for a series
 * @param seriesId - The series identifier
 * @returns Promise resolving to array of EpisodeMetadata for the series
 */
export async function getSeriesEpisodes(seriesId: string): Promise<EpisodeMetadata[]> {
  try {
    if (!seriesId || typeof seriesId !== 'string') {
      console.warn('🎬 Invalid series ID provided:', seriesId);
      return [];
    }

    await simulateAsyncDelay();
    
    const episodes = Object.values(MOCK_EPISODES)
      .filter(episode => episode.seriesId === seriesId)
      .sort((a, b) => {
        if (a.seasonNumber !== b.seasonNumber) {
          return a.seasonNumber - b.seasonNumber;
        }
        return a.episodeNumber - b.episodeNumber;
      });
    
    console.log(`🎬 Found ${episodes.length} episodes for series:`, seriesId);
    return episodes;
  } catch (error) {
    console.error('🎬 Error loading series episodes:', error);
    return [];
  }
}

/**
 * Helper function to check if content has intro timing
 * @param contentId - Episode or movie ID
 * @param contentType - Type of content ('episode' or 'movie')
 * @returns Promise resolving to intro timing object or null
 */
export async function getIntroTiming(
  contentId: string, 
  contentType: 'episode' | 'movie'
): Promise<{ start: number; end: number } | null> {
  try {
    if (!contentId || typeof contentId !== 'string') {
      console.warn('🎬 Invalid content ID provided:', contentId);
      return null;
    }

    if (!contentType || !['episode', 'movie'].includes(contentType)) {
      console.warn('🎬 Invalid content type provided:', contentType);
      return null;
    }

    await simulateAsyncDelay();
    
    if (contentType === 'episode') {
      const episode = MOCK_EPISODES[contentId];
      if (episode) {
        console.log(`🎬 Intro timing loaded for episode: ${episode.introStart}s - ${episode.introEnd}s`);
        return { start: episode.introStart, end: episode.introEnd };
      } else {
        console.log('🎬 No intro timing found for episode:', contentId);
        return null;
      }
    } else {
      const movie = MOCK_MOVIES[contentId];
      if (movie) {
        console.log(`🎬 Intro timing loaded for movie: ${movie.introStart}s - ${movie.introEnd}s`);
        return { start: movie.introStart, end: movie.introEnd };
      } else {
        console.log('🎬 No intro timing found for movie:', contentId);
        return null;
      }
    }
  } catch (error) {
    console.error('🎬 Error loading intro timing:', error);
    return null;
  }
}