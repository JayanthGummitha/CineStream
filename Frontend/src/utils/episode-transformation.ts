import { Episode, Season } from '@/types';

/**
 * Episode data for VideoPlayer props
 */
export interface VideoPlayerEpisodeData {
  episodes: Episode[];
  currentEpisodeIndex: number;
  seasonNumber: number;
}

/**
 * Transforms season data into episode data suitable for VideoPlayer props
 * @param seasons - Array of seasons from TV show data
 * @param targetSeasonNumber - Season number to extract episodes from
 * @param targetEpisodeId - Optional episode ID to set as current episode
 * @returns Transformed episode data for VideoPlayer
 */
export function transformSeasonsToEpisodeData(
  seasons: Season[],
  targetSeasonNumber: number,
  targetEpisodeId?: string
): VideoPlayerEpisodeData | null {


  // Find the target season
  const targetSeason = seasons.find(season => season.seasonNumber === targetSeasonNumber);
  
  if (!targetSeason) {
    console.error('🎬 Target season not found:', targetSeasonNumber);
    return null;
  }

  if (!targetSeason.episodes || targetSeason.episodes.length === 0) {
    console.error('🎬 No episodes found in target season:', targetSeasonNumber);
    return null;
  }

  // Get episodes from the target season and ensure they have video sources
  const episodes = targetSeason.episodes.map(episode => ({
    ...episode,
    src: episode.src || 'https://files.vidstack.io/sprite-fight/1080p.mp4' // Fallback to DASH source
  }));

  // Determine current episode index
  let currentEpisodeIndex = 0;
  
  if (targetEpisodeId) {
    const episodeIndex = episodes.findIndex(episode => episode.id === targetEpisodeId);
    if (episodeIndex !== -1) {
      currentEpisodeIndex = episodeIndex;
    } else {
      console.warn('🎬 Target episode not found, using first episode:', targetEpisodeId);
    }
  }

  const result = {
    episodes,
    currentEpisodeIndex,
    seasonNumber: targetSeasonNumber
  };

 

  return result;
}

/**
 * Extracts all episodes from all seasons for cross-season navigation
 * @param seasons - Array of seasons from TV show data
 * @param targetEpisodeId - Optional episode ID to set as current episode
 * @returns Transformed episode data with all episodes from all seasons
 */
export function transformAllSeasonsToEpisodeData(
  seasons: Season[],
  targetEpisodeId?: string
): VideoPlayerEpisodeData | null {


  if (!seasons || seasons.length === 0) {
    console.error('🎬 No seasons provided');
    return null;
  }

  // Flatten all episodes from all seasons
  const allEpisodes: Episode[] = [];
  let currentSeasonNumber = 1;
  
  // Sort seasons by season number to ensure correct order
  const sortedSeasons = [...seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
  
  for (const season of sortedSeasons) {
    if (season.episodes && season.episodes.length > 0) {
      // Sort episodes by episode number within each season
      const sortedEpisodes = [...season.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
      
      // Ensure each episode has a video source
      const episodesWithSource = sortedEpisodes.map(episode => ({
        ...episode,
        src: episode.src || 'https://files.vidstack.io/sprite-fight/1080p.mp4' // Fallback to DASH source
      }));
      
      allEpisodes.push(...episodesWithSource);
      
      // Track the season number for the current episode
      if (targetEpisodeId && season.episodes.some(ep => ep.id === targetEpisodeId)) {
        currentSeasonNumber = season.seasonNumber;
      }
    }
  }

  if (allEpisodes.length === 0) {
    console.error('🎬 No episodes found in any season');
    return null;
  }

  // Determine current episode index
  let currentEpisodeIndex = 0;
  
  if (targetEpisodeId) {
    const episodeIndex = allEpisodes.findIndex(episode => episode.id === targetEpisodeId);
    if (episodeIndex !== -1) {
      currentEpisodeIndex = episodeIndex;
    } else {
      console.warn('🎬 Target episode not found, using first episode:', targetEpisodeId);
    }
  }

  const result = {
    episodes: allEpisodes,
    currentEpisodeIndex,
    seasonNumber: currentSeasonNumber
  };

 

  return result;
}

/**
 * Gets the current episode from episode data
 * @param episodeData - Episode data from transformation
 * @returns Current episode or null if not found
 */
export function getCurrentEpisode(episodeData: VideoPlayerEpisodeData): Episode | null {
  if (!episodeData || !episodeData.episodes || episodeData.currentEpisodeIndex < 0) {
    return null;
  }

  if (episodeData.currentEpisodeIndex >= episodeData.episodes.length) {
    console.warn('🎬 Current episode index out of bounds:', {
      index: episodeData.currentEpisodeIndex,
      totalEpisodes: episodeData.episodes.length
    });
    return null;
  }

  return episodeData.episodes[episodeData.currentEpisodeIndex];
}

/**
 * Gets the next episode from episode data
 * @param episodeData - Episode data from transformation
 * @returns Next episode or null if not available
 */
export function getNextEpisodeFromData(episodeData: VideoPlayerEpisodeData): Episode | null {
  if (!episodeData || !episodeData.episodes) {
    return null;
  }

  const nextIndex = episodeData.currentEpisodeIndex + 1;
  
  if (nextIndex >= episodeData.episodes.length) {
    return null;
  }

  return episodeData.episodes[nextIndex];
}