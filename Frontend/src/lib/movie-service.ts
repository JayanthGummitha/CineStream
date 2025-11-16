import { 
  fetchPopularMovies, 
  fetchTrendingMovies, 
  fetchTopRatedMovies, 
  fetchNowPlayingMovies,
  fetchUpcomingMovies,
  fetchMovieDetails,
  fetchMovieCredits,
  fetchGenres,
  fetchMoviesByGenre,
  fetchMovieVideos,
  getTrailerUrl,
  getVidstackTrailerUrl,
  convertTMDBMovieToMovie,
  convertTMDBMovieDetailsToMovie,
  // TV Show imports
  fetchPopularTVShows,
  fetchTrendingTVShows,
  fetchTopRatedTVShows,
  fetchAiringTodayTVShows,
  fetchOnTheAirTVShows,
  fetchTVShowDetails,
  fetchTVShowCredits,
  fetchTVGenres,
  fetchTVShowsByGenre,
  convertTMDBTVShowToMovie,
  convertTMDBTVShowDetailsToMovie,
  TMDBGenre
} from './tmdb';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Validate API keys on initialization
if (!TMDB_API_KEY || !TMDB_ACCESS_TOKEN) {
  console.warn('⚠️ TMDB API keys not found. Please set TMDB_API_KEY and TMDB_ACCESS_TOKEN in .env.local');
}

import { Movie, Collection, TVShow, Season, Episode } from '@/types';

let cachedGenres: TMDBGenre[] = [];

// Trailer cache implementation
interface TrailerCacheEntry {
  url: string | null;
  timestamp: number;
}

class TrailerCache {
  private cache = new Map<string, TrailerCacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  set(movieId: string, url: string | null): void {
    this.cache.set(movieId, {
      url,
      timestamp: Date.now()
    });
  }

  get(movieId: string): string | null | undefined {
    const entry = this.cache.get(movieId);
    
    if (!entry) {
      return undefined;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(movieId);
      return undefined;
    }

    return entry.url;
  }

  invalidate(movieId: string): void {
    const deleted = this.cache.delete(movieId);
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [movieId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(movieId);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
    }
  }
}

// Global trailer cache instance
const trailerCache = new TrailerCache();



// Initialize genres cache
export async function initializeGenres() {
  if (cachedGenres.length === 0) {
    try {
      const { genres } = await fetchGenres();
      cachedGenres = genres;
    } catch (error) {
      console.error('Failed to fetch genres:', error);
      cachedGenres = []; // fallback to empty array
    }
  }
  return cachedGenres;
}



export async function getTVShowWithSeasons(id: string) {
  try {
      // First get the TV show details to know how many seasons it has
      const response = await fetch(
          `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`
      );
      
      if (!response.ok) {
          throw new Error('Failed to fetch TV show');
      }
      
      const tvShow = await response.json();
      
      // Now fetch each season's episodes
      const seasons = [];
      
      for (let seasonNum = 1; seasonNum <= tvShow.number_of_seasons; seasonNum++) {
          try {
              const seasonResponse = await fetch(
                  `${TMDB_BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=en-US`
              );
              
              if (seasonResponse.ok) {
                  const seasonData = await seasonResponse.json();
                  
                  // Transform TMDB episode data to your Episode interface
                  const episodes = seasonData.episodes.map((ep: any) => ({
                      id: `${id}-s${seasonNum}-e${ep.episode_number}`,
                      title: `Episode ${ep.episode_number}: ${ep.name}`,
                      description: ep.overview || `Episode ${ep.episode_number} of ${tvShow.name}`,
                      episodeNumber: ep.episode_number,
                      duration: ep.runtime || tvShow.episode_run_time?.[0] || 45,
                      thumbnail: ep.still_path 
                          ? `https://image.tmdb.org/t/p/w500${ep.still_path}` 
                          : `https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`,
                      releaseDate: ep.air_date || tvShow.first_air_date,
                      rating: Math.round((ep.vote_average || tvShow.vote_average) * 10) // Convert to your rating system
                  }));

                  seasons.push({
                      id: `${id}-season-${seasonNum}`,
                      seasonNumber: seasonNum,
                      title: `Season ${seasonNum}`,
                      episodes: episodes,
                      releaseDate: seasonData.air_date || tvShow.first_air_date,
                      thumbnail: seasonData.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${seasonData.poster_path}`
                          : `https://image.tmdb.org/t/p/w500${tvShow.poster_path}`
                  });
              }
          } catch (error) {
              console.error(`Error fetching season ${seasonNum}:`, error);
          }
      }
      
      return {
          tvShow: transformTMDBTVShow(tvShow),
          seasons: seasons
      };
  } catch (error) {
      console.error('Error fetching TV show with seasons:', error);
      throw error;
  }
}

// Helper function to transform TMDB TV show data to your Movie interface
function transformTMDBTVShow(tmdbShow: any) {
  return {
      id: tmdbShow.id.toString(),
      title: tmdbShow.name,
      description: tmdbShow.overview,
      releaseDate: tmdbShow.first_air_date,
      duration: tmdbShow.episode_run_time?.[0] || 45,
      rating: Math.round(tmdbShow.vote_average * 10) / 10,
      genres: tmdbShow.genres?.map((g: any) => g.name) || [],
      thumbnail: `https://image.tmdb.org/t/p/w500${tmdbShow.poster_path}`,
      backdrop: `https://image.tmdb.org/t/p/original${tmdbShow.backdrop_path}`,
      director: tmdbShow.created_by?.[0]?.name || 'Unknown',
      cast: tmdbShow.credits?.cast?.slice(0, 10).map((actor: any) => ({
          id: actor.id.toString(),
          name: actor.name,
          character: actor.character,
          profileImage: actor.profile_path 
              ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
              : '/placeholder-actor.jpg'
      })) || [],
      languages: tmdbShow.spoken_languages?.map((lang: any) => lang.english_name) || ['English'],
      contentRating: tmdbShow.content_ratings?.results?.find((cr: any) => cr.iso_3166_1 === 'US')?.rating || 'NR'
  };
}
// Get popular movies
export async function getPopularMovies(page: number = 1): Promise<Movie[]> {
  try {
    await initializeGenres();
    const response = await fetchPopularMovies(page);
    return response.results.map(movie => convertTMDBMovieToMovie(movie, cachedGenres));
  } catch (error) {
    console.error('Failed to fetch popular movies:', error);
    return [];
  }
}

// Get trending movies
export async function getTrendingMovies(): Promise<Movie[]> {
  try {
    await initializeGenres();
    const response = await fetchTrendingMovies('week');
    return response.results.map(movie => convertTMDBMovieToMovie(movie, cachedGenres));
  } catch (error) {
    console.error('Failed to fetch trending movies:', error);
    return [];
  }
}

// Get top rated movies
export async function getTopRatedMovies(page: number = 1): Promise<Movie[]> {
  try {
    await initializeGenres();
    const response = await fetchTopRatedMovies(page);
    return response.results.map(movie => convertTMDBMovieToMovie(movie, cachedGenres));
  } catch (error) {
    console.error('Failed to fetch top rated movies:', error);
    return [];
  }
}

// Get now playing movies
export async function getNowPlayingMovies(page: number = 1): Promise<Movie[]> {
  try {
    await initializeGenres();
    const response = await fetchNowPlayingMovies(page);
    return response.results.map(movie => convertTMDBMovieToMovie(movie, cachedGenres));
  } catch (error) {
    console.error('Failed to fetch now playing movies:', error);
    return [];
  }
}

// Get upcoming movies
export async function getUpcomingMovies(page: number = 1): Promise<Movie[]> {
  try {
    await initializeGenres();
    const response = await fetchUpcomingMovies(page);
    return response.results.map(movie => convertTMDBMovieToMovie(movie, cachedGenres));
  } catch (error) {
    console.error('Failed to fetch upcoming movies:', error);
    return [];
  }
}

// Get movie details with credits and trailer
export async function getMovieDetails(movieId: string): Promise<Movie | null> {
  try {
    
    // Validate movie ID
    if (!movieId || movieId.trim() === '') {
      console.error('[Movie Service] Invalid movie ID provided');
      return null;
    }

    const parsedMovieId = parseInt(movieId);
    if (isNaN(parsedMovieId) || parsedMovieId <= 0) {
      console.error(`[Movie Service] Invalid movie ID format: ${movieId}`);
      return null;
    }

    // Fetch movie details and credits with proper error handling
    let movieDetails, credits;
    try {
      [movieDetails, credits] = await Promise.all([
        fetchMovieDetails(parsedMovieId),
        fetchMovieCredits(parsedMovieId)
      ]);
    } catch (error) {
      console.error(`[Movie Service] Failed to fetch movie details or credits for ${movieId}:`, error);
      throw error; // Re-throw as this is critical data
    }

    const movie = convertTMDBMovieDetailsToMovie(movieDetails, credits);
    
    // Check cache first for trailer URL
    const cachedTrailerUrl = trailerCache.get(movieId);
    if (cachedTrailerUrl !== undefined) {
      movie.trailer = cachedTrailerUrl || '';
    } else {
      // Fetch trailer videos only if not cached
      let videos;
      try {
        videos = await fetchMovieVideos(parsedMovieId);
      } catch (error) {
        console.error(`[Movie Service] Failed to fetch trailer videos for movie ${movieId}:`, error);
        // Provide fallback empty videos response
        videos = { id: parsedMovieId, results: [] };
      }

      // Process trailer URL with comprehensive error handling
      try {
        if (videos.results && videos.results.length > 0) {
          const trailerUrl = getTrailerUrl(videos.results);
          
          if (trailerUrl) {
            movie.trailer = trailerUrl;
            // Cache the successful result
            trailerCache.set(movieId, trailerUrl);
          } else {
            movie.trailer = '';
            // Cache the absence of trailer
            trailerCache.set(movieId, null);
          }
        } else {
          movie.trailer = '';
          // Cache the absence of videos
          trailerCache.set(movieId, null);
        }
      } catch (trailerError) {
        console.error(`[Movie Service] Error processing trailer for movie ${movieId}:`, trailerError);
        // Continue without trailer - don't fail the entire request
        movie.trailer = '';
        // Cache the processing failure
        trailerCache.set(movieId, null);
      }
    }
    
    return movie;
  } catch (error) {
    console.error(`[Movie Service] Critical error fetching movie details for ID ${movieId}:`, error);
    
    // Log additional error context
    if (error instanceof Error) {
      console.error(`[Movie Service] Error details: ${error.message}`);
      console.error(`[Movie Service] Error stack:`, error.stack);
    }
    
    return null;
  }
}

// Get movie trailer URL separately (for cases where you only need the trailer)
export async function getMovieTrailer(movieId: string): Promise<string | null> {
  try {
    
    // Validate movie ID
    if (!movieId || movieId.trim() === '') {
      console.error('[Movie Trailer Service] Invalid movie ID provided');
      return null;
    }

    const parsedMovieId = parseInt(movieId);
    if (isNaN(parsedMovieId) || parsedMovieId <= 0) {
      console.error(`[Movie Trailer Service] Invalid movie ID format: ${movieId}`);
      return null;
    }

    // Check cache first
    const cachedUrl = trailerCache.get(movieId);
    if (cachedUrl !== undefined) {
      return cachedUrl;
    }

    // Fetch videos with comprehensive error handling
    let videos;
    try {
      videos = await fetchMovieVideos(parsedMovieId);
    } catch (error) {
      console.error(`[Movie Trailer Service] Failed to fetch videos for movie ${movieId}:`, error);
      
      // Log specific error types for better debugging
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          console.error(`[Movie Trailer Service] Movie ${movieId} not found in TMDB`);
        } else if (error.message.includes('authentication')) {
          console.error('[Movie Trailer Service] TMDB API authentication failed');
        } else if (error.message.includes('rate limit')) {
          console.error('[Movie Trailer Service] TMDB API rate limit exceeded');
        } else if (error.message.includes('server error')) {
          console.error('[Movie Trailer Service] TMDB API server error');
        } else {
          console.error(`[Movie Trailer Service] Unexpected error: ${error.message}`);
        }
      }
      
      // Cache the failure to avoid repeated API calls for non-existent movies
      trailerCache.set(movieId, null);
      return null;
    }

    // Process trailer URL with error handling
    try {
      if (!videos.results || videos.results.length === 0) {
        // Cache the absence of trailer
        trailerCache.set(movieId, null);
        return null;
      }

      const trailerUrl = getTrailerUrl(videos.results);
      
      if (trailerUrl) {
        // Cache the successful result
        trailerCache.set(movieId, trailerUrl);
        return trailerUrl;
      } else {
        // Cache the absence of suitable trailer
        trailerCache.set(movieId, null);
        return null;
      }
    } catch (processingError) {
      console.error(`[Movie Trailer Service] Error processing trailer URL for movie ${movieId}:`, processingError);
      // Cache the processing failure
      trailerCache.set(movieId, null);
      return null;
    }
    
  } catch (error) {
    console.error(`[Movie Trailer Service] Unexpected error fetching trailer for movie ${movieId}:`, error);
    
    // Log comprehensive error details for debugging
    if (error instanceof Error) {
      console.error(`[Movie Trailer Service] Error name: ${error.name}`);
      console.error(`[Movie Trailer Service] Error message: ${error.message}`);
      console.error(`[Movie Trailer Service] Error stack:`, error.stack);
    } else {
      console.error(`[Movie Trailer Service] Non-Error object thrown:`, error);
    }
    
    // Cache the unexpected error to avoid repeated failures
    trailerCache.set(movieId, null);
    return null;
  }
}

// Separate cache for Vidstack URLs since they have different format
class VidstackTrailerCache {
  private cache = new Map<string, TrailerCacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  set(movieId: string, url: string | null): void {
    this.cache.set(movieId, {
      url,
      timestamp: Date.now()
    });
  }

  get(movieId: string): string | null | undefined {
    const entry = this.cache.get(movieId);
    
    if (!entry) {
      return undefined;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(movieId);
      return undefined;
    }

    return entry.url;
  }

  invalidate(movieId: string): void {
    const deleted = this.cache.delete(movieId);
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [movieId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(movieId);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
    }
  }
}

// Global Vidstack trailer cache instance
const vidstackTrailerCache = new VidstackTrailerCache();

// Cache management functions
export function invalidateTrailerCache(movieId: string): void {
  trailerCache.invalidate(movieId);
  vidstackTrailerCache.invalidate(movieId);
}

export function clearAllTrailerCaches(): void {
  trailerCache.clear();
  vidstackTrailerCache.clear();
}

export function getTrailerCacheStats(): { standardCache: number; vidstackCache: number } {
  return {
    standardCache: trailerCache.size(),
    vidstackCache: vidstackTrailerCache.size()
  };
}

// Periodic cache cleanup (run every hour)
setInterval(() => {
  trailerCache.cleanup();
  vidstackTrailerCache.cleanup();
}, 60 * 60 * 1000);

// Get Vidstack-compatible movie trailer URL for optimal video player performance
export async function getVidstackMovieTrailer(movieId: string): Promise<string | null> {
  try {
    
    // Validate movie ID
    if (!movieId || movieId.trim() === '') {
      console.error('[Vidstack Trailer Service] Invalid movie ID provided');
      return null;
    }

    const parsedMovieId = parseInt(movieId);
    if (isNaN(parsedMovieId) || parsedMovieId <= 0) {
      console.error(`[Vidstack Trailer Service] Invalid movie ID format: ${movieId}`);
      return null;
    }

    // Check cache first
    const cachedUrl = vidstackTrailerCache.get(movieId);
    if (cachedUrl !== undefined) {
      return cachedUrl;
    }

    // Fetch videos with comprehensive error handling
    let videos;
    try {
      videos = await fetchMovieVideos(parsedMovieId);
    } catch (error) {
      console.error(`[Vidstack Trailer Service] Failed to fetch videos for movie ${movieId}:`, error);
      
      // Log specific error types for better debugging
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          console.error(`[Vidstack Trailer Service] Movie ${movieId} not found in TMDB`);
        } else if (error.message.includes('authentication')) {
          console.error('[Vidstack Trailer Service] TMDB API authentication failed');
        } else if (error.message.includes('rate limit')) {
          console.error('[Vidstack Trailer Service] TMDB API rate limit exceeded');
        } else if (error.message.includes('server error')) {
          console.error('[Vidstack Trailer Service] TMDB API server error');
        } else {
          console.error(`[Vidstack Trailer Service] Unexpected error: ${error.message}`);
        }
      }
      
      // Cache the failure to avoid repeated API calls
      vidstackTrailerCache.set(movieId, null);
      return null;
    }

    // Process Vidstack trailer URL with error handling
    try {
      if (!videos.results || videos.results.length === 0) {
        // Cache the absence of trailer
        vidstackTrailerCache.set(movieId, null);
        return null;
      }

      const trailerUrl = getVidstackTrailerUrl(videos.results);
      
      if (trailerUrl) {
        // Cache the successful result
        vidstackTrailerCache.set(movieId, trailerUrl);
        return trailerUrl;
      } else {
        // Cache the absence of suitable trailer
        vidstackTrailerCache.set(movieId, null);
        return null;
      }
    } catch (processingError) {
      console.error(`[Vidstack Trailer Service] Error processing Vidstack trailer URL for movie ${movieId}:`, processingError);
      // Cache the processing failure
      vidstackTrailerCache.set(movieId, null);
      return null;
    }
    
  } catch (error) {
    console.error(`[Vidstack Trailer Service] Unexpected error fetching Vidstack trailer for movie ${movieId}:`, error);
    
    // Log comprehensive error details for debugging
    if (error instanceof Error) {
      console.error(`[Vidstack Trailer Service] Error name: ${error.name}`);
      console.error(`[Vidstack Trailer Service] Error message: ${error.message}`);
      console.error(`[Vidstack Trailer Service] Error stack:`, error.stack);
    } else {
      console.error(`[Vidstack Trailer Service] Non-Error object thrown:`, error);
    }
    
    // Cache the unexpected error to avoid repeated failures
    vidstackTrailerCache.set(movieId, null);
    return null;
  }
}

// Detect content type based on movie properties
export function detectContentType(movie: Movie): 'movie' | 'tvshow' | 'documentary' | 'kids' {
  // Kids content detection
  if (movie.contentRating === 'G' || movie.contentRating === 'PG' ||
      movie.genres.some(genre => ['Animation', 'Family'].includes(genre)) ||
      movie.title.toLowerCase().includes('disney') ||
      movie.title.toLowerCase().includes('pixar')) {
    return 'kids';
  }
  
  // Documentary detection
  if (movie.genres.some(genre => ['History', 'War', 'Biography', 'Documentary'].includes(genre)) ||
      movie.description.toLowerCase().includes('true story') ||
      movie.description.toLowerCase().includes('based on') ||
      movie.description.toLowerCase().includes('documentary')) {
    return 'documentary';
  }
  
  // TV Show detection (longer content, series-like genres)
  if (movie.duration > 120 || 
      movie.genres.some(genre => ['Drama', 'Crime', 'Mystery', 'Thriller'].includes(genre))) {
    return 'tvshow';
  }
  
  return 'movie';
}

// Generate mock episodes for TV shows and series content
export function generateEpisodes(movie: Movie, contentType: 'tvshow' | 'documentary' | 'kids'): Season[] {
  const seasons: Season[] = [];
  
  if (contentType === 'tvshow') {
    // Generate 2-3 seasons for TV shows
    const numSeasons = Math.floor(Math.random() * 2) + 2; // 2-3 seasons
    
    for (let s = 1; s <= numSeasons; s++) {
      const episodes: Episode[] = [];
      const numEpisodes = Math.floor(Math.random() * 6) + 8; // 8-13 episodes per season
      
      for (let e = 1; e <= numEpisodes; e++) {
        // Array of different video sources for variety
        const videoSources = [
          'https://files.vidstack.io/sprite-fight/1080p.mp4',
          'https://files.vidstack.io/sprite-fight/720p.mp4',
          'https://files.vidstack.io/sprite-fight/480p.mp4',
          'https://files.vidstack.io/sprite-fight/1080p.mp4' // Default video source
        ];
        
        episodes.push({
          id: `${movie.id}-s${s}-e${e}`,
          title: `Episode ${e}: ${generateEpisodeTitle(movie.genres[0])}`,
          description: `In this episode of ${movie.title}, ${generateEpisodeDescription(movie.genres[0])}`,
          episodeNumber: e,
          duration: Math.floor(Math.random() * 20) + 40, // 40-60 minutes
          thumbnail: movie.backdrop,
          releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          rating: Math.floor(Math.random() * 30) + 70, // 7.0-10.0 rating
          src: videoSources[e % videoSources.length] // Cycle through different video sources
        });
      }
      
      seasons.push({
        id: `${movie.id}-season-${s}`,
        seasonNumber: s,
        title: `Season ${s}`,
        episodes,
        releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: movie.thumbnail
      });
    }
  } else if (contentType === 'documentary') {
    // Generate 1 season with multiple parts/episodes
    const episodes: Episode[] = [];
    const numParts = Math.floor(Math.random() * 4) + 3; // 3-6 parts
    
    for (let e = 1; e <= numParts; e++) {
      episodes.push({
        id: `${movie.id}-part-${e}`,
        title: `Part ${e}: ${generateDocumentaryPartTitle(movie.genres[0])}`,
        description: `Part ${e} of ${movie.title} explores ${generateDocumentaryDescription(movie.genres[0])}`,
        episodeNumber: e,
        duration: Math.floor(Math.random() * 30) + 45, // 45-75 minutes
        thumbnail: movie.backdrop,
        releaseDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        rating: Math.floor(Math.random() * 20) + 80 // 8.0-10.0 rating
      });
    }
    
    seasons.push({
      id: `${movie.id}-documentary`,
      seasonNumber: 1,
      title: 'Documentary Series',
      episodes,
      releaseDate: movie.releaseDate,
      thumbnail: movie.thumbnail
    });
  } else if (contentType === 'kids') {
    // Generate 1-2 seasons for kids shows
    const numSeasons = Math.floor(Math.random() * 2) + 1; // 1-2 seasons
    
    for (let s = 1; s <= numSeasons; s++) {
      const episodes: Episode[] = [];
      const numEpisodes = Math.floor(Math.random() * 8) + 10; // 10-17 episodes per season
      
      for (let e = 1; e <= numEpisodes; e++) {
        episodes.push({
          id: `${movie.id}-s${s}-e${e}`,
          title: `Episode ${e}: ${generateKidsEpisodeTitle()}`,
          description: `Join the adventure in this fun episode of ${movie.title}! ${generateKidsDescription()}`,
          episodeNumber: e,
          duration: Math.floor(Math.random() * 10) + 20, // 20-30 minutes
          thumbnail: movie.backdrop,
          releaseDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
          rating: Math.floor(Math.random() * 20) + 80 // 8.0-10.0 rating
        });
      }
      
      seasons.push({
        id: `${movie.id}-season-${s}`,
        seasonNumber: s,
        title: `Season ${s}`,
        episodes,
        releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        thumbnail: movie.thumbnail
      });
    }
  }
  
  return seasons;
}

// Helper functions for generating episode titles and descriptions
function generateEpisodeTitle(genre: string): string {
  const titles = {
    'Drama': ['The Revelation', 'Breaking Point', 'New Beginnings', 'The Truth Unfolds', 'Crossroads'],
    'Crime': ['The Investigation', 'Evidence Found', 'The Suspect', 'Justice Served', 'The Chase'],
    'Mystery': ['The Clue', 'Hidden Secrets', 'The Discovery', 'Unraveling', 'The Answer'],
    'Thriller': ['The Hunt', 'Danger Ahead', 'Close Call', 'The Escape', 'Final Confrontation'],
    'default': ['The Story Continues', 'New Challenges', 'The Journey', 'Revelations', 'The Adventure']
  };
  
  const genreTitles = titles[genre as keyof typeof titles] || titles.default;
  return genreTitles[Math.floor(Math.random() * genreTitles.length)];
}

function generateEpisodeDescription(genre: string): string {
  const descriptions = {
    'Drama': ['relationships are tested as new challenges emerge', 'characters face difficult decisions', 'emotions run high as secrets are revealed'],
    'Crime': ['the investigation takes an unexpected turn', 'new evidence comes to light', 'the case becomes more complex'],
    'Mystery': ['clues lead to surprising discoveries', 'the mystery deepens', 'answers raise more questions'],
    'Thriller': ['tension builds as danger approaches', 'the stakes get higher', 'time is running out'],
    'default': ['the story takes an exciting turn', 'new adventures await', 'characters face new challenges']
  };
  
  const genreDescriptions = descriptions[genre as keyof typeof descriptions] || descriptions.default;
  return genreDescriptions[Math.floor(Math.random() * genreDescriptions.length)];
}

function generateDocumentaryPartTitle(genre: string): string {
  const titles = {
    'History': ['The Beginning', 'Rise to Power', 'The Golden Age', 'Decline and Fall', 'Legacy'],
    'War': ['The Outbreak', 'Major Battles', 'Turning Points', 'The End', 'Aftermath'],
    'Biography': ['Early Life', 'Rise to Fame', 'Peak Years', 'Challenges', 'Final Years'],
    'default': ['Origins', 'Development', 'Peak', 'Transformation', 'Impact']
  };
  
  const genreTitles = titles[genre as keyof typeof titles] || titles.default;
  return genreTitles[Math.floor(Math.random() * genreTitles.length)];
}

function generateDocumentaryDescription(genre: string): string {
  const descriptions = {
    'History': ['the historical context and key events', 'the social and political climate', 'the lasting impact on society'],
    'War': ['the strategic decisions and battles', 'the human cost and heroism', 'the global consequences'],
    'Biography': ['the formative experiences and influences', 'the achievements and setbacks', 'the personal struggles and triumphs'],
    'default': ['the fascinating details and insights', 'the broader implications', 'the remarkable story behind the scenes']
  };
  
  const genreDescriptions = descriptions[genre as keyof typeof descriptions] || descriptions.default;
  return genreDescriptions[Math.floor(Math.random() * genreDescriptions.length)];
}

function generateKidsEpisodeTitle(): string {
  const titles = [
    'The Magic Adventure', 'Friendship Day', 'The Big Discovery', 'Learning Together',
    'The Fun Challenge', 'Helping Friends', 'The Great Quest', 'New Friends',
    'The Surprise Party', 'Problem Solving', 'The Creative Project', 'Team Work'
  ];
  
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateKidsDescription(): string {
  const descriptions = [
    'Learn valuable lessons about friendship and teamwork.',
    'Discover the importance of being kind and helpful.',
    'Join in the fun and educational activities.',
    'Explore creativity and imagination together.',
    'Find out how problems can be solved with cooperation.',
    'Experience the joy of learning new things.'
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Get movies by genre
export async function getMoviesByGenre(genreName: string, page: number = 1): Promise<Movie[]> {
  try {
    await initializeGenres();
    const genre = cachedGenres.find(g => g.name.toLowerCase() === genreName.toLowerCase());
    if (!genre) return [];

    const response = await fetchMoviesByGenre(genre.id, page);
    return response.results.map(movie => convertTMDBMovieToMovie(movie, cachedGenres));
  } catch (error) {
    console.error('Failed to fetch movies by genre:', error);
    return [];
  }
}

// Get featured content for hero section
export async function getFeaturedContent(): Promise<Movie[]> {
  try {
    const [trending, popular] = await Promise.all([
      getTrendingMovies(),
      getPopularMovies()
    ]);
    
    // Combine and deduplicate
    const combined = [...trending.slice(0, 3), ...popular.slice(0, 2)];
    const unique = combined.filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id)
    );
    
    return unique.slice(0, 5);
  } catch (error) {
    console.error('Failed to fetch featured content:', error);
    return [];
  }
}

// Get collections for home page
export async function getHomeCollections(): Promise<Collection[]> {
  try {
    const [trending, popular, topRated, nowPlaying, upcoming] = await Promise.all([
      getTrendingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getUpcomingMovies()
    ]);

    const collections: Collection[] = [
      {
        id: 'trending',
        name: 'Trending Now',
        description: 'The hottest movies everyone is watching',
        thumbnail: trending[0]?.thumbnail || '/movie-poster-1.svg',
        backdrop: trending[0]?.backdrop || '/movie-backdrop-1.svg',
        items: trending,
        type: 'trending'
      },
      {
        id: 'popular',
        name: 'Popular Movies',
        description: 'Most watched movies right now',
        thumbnail: popular[0]?.thumbnail || '/movie-poster-2.svg',
        backdrop: popular[0]?.backdrop || '/movie-backdrop-1.svg',
        items: popular,
        type: 'popular'
      },
      {
        id: 'top-rated',
        name: 'Top Rated',
        description: 'Highest rated movies of all time',
        thumbnail: topRated[0]?.thumbnail || '/movie-poster-3.svg',
        backdrop: topRated[0]?.backdrop || '/movie-backdrop-1.svg',
        items: topRated,
        type: 'custom'
      },
      {
        id: 'now-playing',
        name: 'Now Playing',
        description: 'Currently in theaters',
        thumbnail: nowPlaying[0]?.thumbnail || '/movie-poster-1.svg',
        backdrop: nowPlaying[0]?.backdrop || '/movie-backdrop-1.svg',
        items: nowPlaying,
        type: 'new'
      },
      {
        id: 'upcoming',
        name: 'Coming Soon',
        description: 'Upcoming releases to watch out for',
        thumbnail: upcoming[0]?.thumbnail || '/movie-poster-2.svg',
        backdrop: upcoming[0]?.backdrop || '/movie-backdrop-1.svg',
        items: upcoming,
        type: 'custom'
      }
    ];

    return collections.filter(collection => collection.items.length > 0);
  } catch (error) {
    console.error('Failed to fetch home collections:', error);
    return [];
  }
}

// Get genre-based collections for movies page
export async function getGenreCollections(): Promise<Collection[]> {
  try {
    await initializeGenres();
    const popularGenres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Horror'];
    
    const collections = await Promise.all(
      popularGenres.map(async (genreName) => {
        const movies = await getMoviesByGenre(genreName);
        return {
          id: genreName.toLowerCase(),
          name: genreName,
          description: `Best ${genreName.toLowerCase()} movies`,
          thumbnail: movies[0]?.thumbnail || '/movie-poster-1.svg',
          backdrop: movies[0]?.backdrop || '/movie-backdrop-1.svg',
          items: movies,
          type: 'genre' as const
        };
      })
    );

    return collections.filter(collection => collection.items.length > 0);
  } catch (error) {
    console.error('Failed to fetch genre collections:', error);
    return [];
  }
}

// TV Show specific functions using TMDB TV endpoints
let cachedTVGenres: TMDBGenre[] = [];

// Initialize TV genres cache
export async function initializeTVGenres() {
  if (cachedTVGenres.length === 0) {
    try {
      const { genres } = await fetchTVGenres();
      cachedTVGenres = genres;
    } catch (error) {
      console.error('Failed to fetch TV genres:', error);
      cachedTVGenres = []; // fallback to empty array
    }
  }
  return cachedTVGenres;
}

// Get popular TV shows
export async function getPopularTVShows(page: number = 1): Promise<Movie[]> {
  try {
    await initializeTVGenres();
    const response = await fetchPopularTVShows(page);
    return response.results.map(tvShow => convertTMDBTVShowToMovie(tvShow, cachedTVGenres));
  } catch (error) {
    console.error('Failed to fetch popular TV shows:', error);
    return [];
  }
}

// Get trending TV shows
export async function getTrendingTVShows(): Promise<Movie[]> {
  try {
    await initializeTVGenres();
    const response = await fetchTrendingTVShows('week');
    return response.results.map(tvShow => convertTMDBTVShowToMovie(tvShow, cachedTVGenres));
  } catch (error) {
    console.error('Failed to fetch trending TV shows:', error);
    return [];
  }
}

// Get top rated TV shows
export async function getTopRatedTVShows(page: number = 1): Promise<Movie[]> {
  try {
    await initializeTVGenres();
    const response = await fetchTopRatedTVShows(page);
    return response.results.map(tvShow => convertTMDBTVShowToMovie(tvShow, cachedTVGenres));
  } catch (error) {
    console.error('Failed to fetch top rated TV shows:', error);
    return [];
  }
}

// Get airing today TV shows
export async function getAiringTodayTVShows(page: number = 1): Promise<Movie[]> {
  try {
    await initializeTVGenres();
    const response = await fetchAiringTodayTVShows(page);
    return response.results.map(tvShow => convertTMDBTVShowToMovie(tvShow, cachedTVGenres));
  } catch (error) {
    console.error('Failed to fetch airing today TV shows:', error);
    return [];
  }
}

// Get on the air TV shows
export async function getOnTheAirTVShows(page: number = 1): Promise<Movie[]> {
  try {
    await initializeTVGenres();
    const response = await fetchOnTheAirTVShows(page);
    return response.results.map(tvShow => convertTMDBTVShowToMovie(tvShow, cachedTVGenres));
  } catch (error) {
    console.error('Failed to fetch on the air TV shows:', error);
    return [];
  }
}

// Get TV shows by genre
export async function getTVShowsByGenre(genreName: string, page: number = 1): Promise<Movie[]> {
  try {
    await initializeTVGenres();
    const genre = cachedTVGenres.find(g => g.name.toLowerCase() === genreName.toLowerCase());
    if (!genre) return [];

    const response = await fetchTVShowsByGenre(genre.id, page);
    return response.results.map(tvShow => convertTMDBTVShowToMovie(tvShow, cachedTVGenres));
  } catch (error) {
    console.error('Failed to fetch TV shows by genre:', error);
    return [];
  }
}

// Get TV show details with credits
export async function getTVShowDetails(tvId: string): Promise<Movie | null> {
  try {
    const [tvDetails, credits] = await Promise.all([
      fetchTVShowDetails(parseInt(tvId)),
      fetchTVShowCredits(parseInt(tvId))
    ]);
    
    return convertTMDBTVShowDetailsToMovie(tvDetails, credits);
  } catch (error) {
    console.error('Failed to fetch TV show details:', error);
    return null;
  }
}

// Get TV Shows content using actual TMDB TV endpoints
export async function getTVShowsContent(): Promise<{
  featured: Movie[];
  trending: Movie[];
  drama: Movie[];
  comedy: Movie[];
  crime: Movie[];
  sciFi: Movie[];
  actionAdventure: Movie[];
  animation: Movie[];
}> {
  try {
    await initializeTVGenres();
    const [popular, topRated, trending, drama, comedy, crime, sciFi, actionAdventure, animation] = await Promise.all([
      getPopularTVShows(1),
      getTopRatedTVShows(1),
      getTrendingTVShows(),
      getTVShowsByGenre('Drama'),
      getTVShowsByGenre('Comedy'), 
      getTVShowsByGenre('Crime'),
      getTVShowsByGenre('Sci-Fi & Fantasy'),
      getTVShowsByGenre('Action & Adventure'),
      getTVShowsByGenre('Animation')
    ]);

    // Combine popular and top rated for featured
    const featured = [...popular.slice(0, 3), ...topRated.slice(0, 2)];
    const uniqueFeatured = featured.filter((show, index, self) =>
      index === self.findIndex(s => s.id === show.id)
    );

    return {
      featured: uniqueFeatured.slice(0, 5),
      trending: trending.slice(0, 20),
      drama: drama.slice(0, 20),
      comedy: comedy.slice(0, 20),
      crime: crime.slice(0, 20),
      sciFi: sciFi.slice(0, 20),
      actionAdventure: actionAdventure.slice(0, 20),
      animation: animation.slice(0, 20)
    };
  } catch (error) {
    console.error('Failed to fetch TV shows content:', error);
    return {
      featured: [],
      trending: [],
      drama: [],
      comedy: [],
      crime: [],
      sciFi: [],
      actionAdventure: [],
      animation: []
    };
  }
}

// Get Documentaries content
export async function getDocumentariesContent(): Promise<{
  featured: Movie[];
  nature: Movie[];
  history: Movie[];
  science: Movie[];
  trueCrime: Movie[];
}> {
  try {
    await initializeGenres();
    const [upcoming, nowPlaying, history, war, crime] = await Promise.all([
      getUpcomingMovies(1),
      getNowPlayingMovies(2), // Different page
      getMoviesByGenre('History'),
      getMoviesByGenre('War'),
      getMoviesByGenre('Crime')
    ]);

    // Filter for documentary-style content
    const documentaryFilter = (movies: Movie[]) => movies.filter(movie => 
      movie.genres.some(genre => ['History', 'War', 'Biography', 'Documentary'].includes(genre)) ||
      movie.description.toLowerCase().includes('true story') ||
      movie.description.toLowerCase().includes('based on') ||
      movie.description.toLowerCase().includes('real') ||
      movie.title.toLowerCase().includes('story of')
    );

    return {
      featured: documentaryFilter([...upcoming, ...nowPlaying]).slice(0, 6),
      nature: nowPlaying.slice(0, 12), // Simulate nature docs
      history: documentaryFilter(history),
      science: upcoming.slice(0, 12), // Simulate science docs
      trueCrime: documentaryFilter(crime)
    };
  } catch (error) {
    console.error('Failed to fetch documentaries content:', error);
    return {
      featured: [],
      nature: [],
      history: [],
      science: [],
      trueCrime: []
    };
  }
}

// Get Kids content
export async function getKidsContent(): Promise<{
  featured: Movie[];
  animated: Movie[];
  family: Movie[];
  adventure: Movie[];
  educational: Movie[];
}> {
  try {
    await initializeGenres();
    const [topRated, popular, adventure, comedy, family] = await Promise.all([
      getTopRatedMovies(2), // Different page for variety
      getPopularMovies(3), // Different page
      getMoviesByGenre('Adventure'),
      getMoviesByGenre('Comedy'),
      getMoviesByGenre('Family')
    ]);

    // Filter for kid-friendly content
    const kidsFilter = (movies: Movie[]) => movies.filter(movie => 
      movie.contentRating === 'G' || 
      movie.contentRating === 'PG' ||
      movie.genres.some(genre => ['Animation', 'Family', 'Adventure'].includes(genre)) ||
      movie.title.toLowerCase().includes('disney') ||
      movie.title.toLowerCase().includes('pixar') ||
      movie.description.toLowerCase().includes('family') ||
      movie.description.toLowerCase().includes('children') ||
      movie.description.toLowerCase().includes('kids')
    );

    return {
      featured: kidsFilter([...topRated, ...popular]).slice(0, 8),
      animated: kidsFilter([...topRated, ...adventure]).filter(movie => 
        movie.genres.includes('Animation') || 
        movie.title.toLowerCase().includes('animated')
      ),
      family: kidsFilter(family),
      adventure: kidsFilter(adventure),
      educational: kidsFilter(comedy.slice(0, 12)) // Educational content simulation
    };
  } catch (error) {
    console.error('Failed to fetch kids content:', error);
    return {
      featured: [],
      animated: [],
      family: [],
      adventure: [],
      educational: []
    };
  }
}