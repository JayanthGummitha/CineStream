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
  fetchTVShowVideos,
  convertTMDBTVShowToMovie,
  convertTMDBTVShowDetailsToMovie,
  TMDBGenre,
  // API Configuration
  TMDB_API_KEY,
  TMDB_ACCESS_TOKEN,
  TMDB_BASE_URL,
  TMDB_IMAGE_BASE_URL
} from './tmdb';

import { Movie, Collection, TVShow, Season, Episode } from '@/types';

// ============================================================================
// ERROR CLASSIFICATION AND VALIDATION UTILITIES
// ============================================================================

/**
 * Error types for TV show fetch operations
 */
export enum TVShowFetchErrorType {
  INVALID_ID = 'INVALID_ID',
  NOT_FOUND = 'NOT_FOUND',
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Custom error class for TV show fetch operations with detailed context
 */
export class TVShowFetchError extends Error {
  type: TVShowFetchErrorType;
  statusCode?: number;
  tvShowId?: string;
  context?: Record<string, any>;

  constructor(
    message: string,
    type: TVShowFetchErrorType,
    statusCode?: number,
    tvShowId?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'TVShowFetchError';
    this.type = type;
    this.statusCode = statusCode;
    this.tvShowId = tvShowId;
    this.context = context;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TVShowFetchError);
    }
  }
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedId?: number;
}

/**
 * Validates TV show ID format and returns sanitized ID
 * @param id - TV show ID to validate (string)
 * @returns ValidationResult with isValid flag and sanitized ID if valid
 */
export function validateTVShowId(id: string): ValidationResult {
  // Check for empty/null/undefined
  if (!id || id.trim() === '') {
    return {
      isValid: false,
      error: 'TV show ID is required and cannot be empty'
    };
  }

  // Parse to integer
  const parsedId = parseInt(id.trim(), 10);

  // Check if parsing was successful
  if (isNaN(parsedId)) {
    return {
      isValid: false,
      error: `TV show ID must be numeric, received: ${id}`
    };
  }

  // Validate positive number
  if (parsedId <= 0) {
    return {
      isValid: false,
      error: `TV show ID must be a positive number, received: ${parsedId}`
    };
  }

  // Check for reasonable bounds (TMDB IDs are typically under 10 million)
  if (parsedId > 10000000) {
    return {
      isValid: false,
      error: `TV show ID exceeds maximum allowed value: ${parsedId}`
    };
  }

  return {
    isValid: true,
    sanitizedId: parsedId
  };
}

/**
 * Validates API configuration at startup
 * @returns boolean indicating if API is properly configured
 */
export function validateAPIConfiguration(): boolean {
  const hasApiKey = !!TMDB_API_KEY && TMDB_API_KEY.trim() !== '';
  const hasAccessToken = !!TMDB_ACCESS_TOKEN && TMDB_ACCESS_TOKEN.trim() !== '';

  if (!hasApiKey || !hasAccessToken) {
    console.error('[TV Show Service] API Configuration Error:');
    if (!hasApiKey) {
      console.error('[TV Show Service] - TMDB_API_KEY is missing or empty');
    }
    if (!hasAccessToken) {
      console.error('[TV Show Service] - TMDB_ACCESS_TOKEN is missing or empty');
    }
    console.error('[TV Show Service] Please set these environment variables in .env.local');
    return false;
  }

  console.log('[TV Show Service] API configuration validated successfully');
  return true;
}

/**
 * Classifies HTTP errors into specific error types
 * @param response - Fetch Response object
 * @returns TVShowFetchErrorType
 */
export function classifyHTTPError(response: Response): TVShowFetchErrorType {
  const status = response.status;

  switch (status) {
    case 404:
      return TVShowFetchErrorType.NOT_FOUND;
    case 401:
    case 403:
      return TVShowFetchErrorType.AUTHENTICATION;
    case 429:
      return TVShowFetchErrorType.RATE_LIMIT;
    case 500:
    case 502:
    case 503:
    case 504:
      return TVShowFetchErrorType.SERVER_ERROR;
    default:
      if (status >= 400 && status < 500) {
        return TVShowFetchErrorType.VALIDATION;
      }
      return TVShowFetchErrorType.NETWORK;
  }
}

/**
 * Logs TV show fetch errors with comprehensive context
 * @param error - TVShowFetchError instance
 */
export function logTVShowError(error: TVShowFetchError): void {
  console.error(`[TV Show Service] ========================================`);
  console.error(`[TV Show Service] Error Type: ${error.type}`);
  console.error(`[TV Show Service] Message: ${error.message}`);
  
  if (error.tvShowId) {
    console.error(`[TV Show Service] TV Show ID: ${error.tvShowId}`);
  }
  
  if (error.statusCode) {
    console.error(`[TV Show Service] HTTP Status: ${error.statusCode}`);
  }
  
  if (error.context) {
    console.error(`[TV Show Service] Context:`, JSON.stringify(error.context, null, 2));
  }
  
  if (error.stack) {
    console.error(`[TV Show Service] Stack Trace:`);
    console.error(error.stack);
  }
  
  console.error(`[TV Show Service] ========================================`);
}

/**
 * Creates a user-friendly error message based on error type
 * @param errorType - TVShowFetchErrorType
 * @returns User-friendly error message
 */
export function getUserFriendlyErrorMessage(errorType: TVShowFetchErrorType): string {
  switch (errorType) {
    case TVShowFetchErrorType.INVALID_ID:
      return 'Invalid TV show identifier. Please try again.';
    case TVShowFetchErrorType.NOT_FOUND:
      return 'TV show not found. It may have been removed.';
    case TVShowFetchErrorType.AUTHENTICATION:
      return 'Unable to access TV show data. Please try again later.';
    case TVShowFetchErrorType.RATE_LIMIT:
      return 'Too many requests. Please try again in a moment.';
    case TVShowFetchErrorType.SERVER_ERROR:
      return 'Service temporarily unavailable. Please try again later.';
    case TVShowFetchErrorType.NETWORK:
      return 'Unable to load TV show. Please check your connection.';
    case TVShowFetchErrorType.VALIDATION:
      return 'Invalid TV show data. Please try again.';
    default:
      return 'Failed to load TV show. Please try again.';
  }
}

/**
 * Lazy validation flag to ensure API configuration is checked only once
 */
let apiConfigValidated = false;

/**
 * Lazy API configuration validator - only runs on first API call
 * @returns boolean indicating if API is properly configured
 */
function ensureAPIConfigured(): boolean {
  if (!apiConfigValidated) {
    apiConfigValidated = true;
    return validateAPIConfiguration();
  }
  return true;
}

// ============================================================================
// END ERROR CLASSIFICATION AND VALIDATION UTILITIES
// ============================================================================

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
  const startTime = Date.now();
  
  // Ensure API configuration is validated (lazy validation on first call)
  ensureAPIConfigured();
  
  // ============================================================================
  // SUBTASK 2.1: INPUT VALIDATION AT FUNCTION ENTRY
  // ============================================================================
  console.log(`[TV Show Service] getTVShowWithSeasons called with ID: ${id}`);
  
  // Validate TV show ID format before API calls
  const validation = validateTVShowId(id);
  if (!validation.isValid) {
    const error = new TVShowFetchError(
      validation.error || 'Invalid TV show ID',
      TVShowFetchErrorType.INVALID_ID,
      undefined,
      id,
      { validationError: validation.error }
    );
    logTVShowError(error);
    throw error;
  }
  
  const sanitizedId = validation.sanitizedId!;
  console.log(`[TV Show Service] TV show ID validated successfully: ${sanitizedId}`);
  
  // ============================================================================
  // SUBTASK 5.1: FALLBACK STRATEGY - TRY PRIMARY FETCH WITH FALLBACK
  // ============================================================================
  try {
    // ============================================================================
    // SUBTASK 2.3: STRUCTURED LOGGING - API CALL ATTEMPT
    // ============================================================================
    console.log(`[TV Show Service] Fetching TV show details for ID: ${sanitizedId}`);
    console.log(`[TV Show Service] API URL: ${TMDB_BASE_URL}/tv/${sanitizedId}`);
    
    // First get the TV show details to know how many seasons it has
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${sanitizedId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits`
    );
    
    // ============================================================================
    // SUBTASK 2.2: HTTP ERROR CLASSIFICATION AND HANDLING
    // ============================================================================
    if (!response.ok) {
      const errorType = classifyHTTPError(response);
      const errorMessage = `Failed to fetch TV show: ${response.status} ${response.statusText}`;
      
      // Create typed error object with classification
      const error = new TVShowFetchError(
        errorMessage,
        errorType,
        response.status,
        id,
        {
          url: response.url,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      );
      
      // Implement error-specific logging with context
      logTVShowError(error);
      
      // Add specific guidance based on error type
      if (errorType === TVShowFetchErrorType.AUTHENTICATION) {
        console.error('[TV Show Service] Check TMDB_API_KEY in .env.local');
      } else if (errorType === TVShowFetchErrorType.RATE_LIMIT) {
        console.error('[TV Show Service] TMDB API rate limit exceeded. Please wait before retrying.');
      } else if (errorType === TVShowFetchErrorType.NOT_FOUND) {
        console.error(`[TV Show Service] TV show with ID ${id} not found in TMDB database`);
      }
      
      throw error;
    }
    
    // ============================================================================
    // SUBTASK 2.3: STRUCTURED LOGGING - SUCCESSFUL API RESPONSE
    // ============================================================================
    console.log(`[TV Show Service] Successfully fetched TV show details for ID: ${sanitizedId}`);
    
    const tvShow = await response.json();
    console.log(`[TV Show Service] TV Show: ${tvShow.name}, Seasons: ${tvShow.number_of_seasons}`);
    
    // ============================================================================
    // SUBTASK 3.1: PARALLEL SEASON FETCHING WITH PROMISE.ALLSETTLED
    // ============================================================================
    console.log(`[TV Show Service] Starting to fetch ${tvShow.number_of_seasons} seasons in parallel...`);
    
    // Create an array of season fetch promises
    const seasonPromises = Array.from(
      { length: tvShow.number_of_seasons },
      (_, index) => {
        const seasonNum = index + 1;
        return fetchSeasonData(sanitizedId, seasonNum, tvShow);
      }
    );
    
    // Fetch all seasons concurrently with error tolerance
    const seasonResults = await Promise.allSettled(seasonPromises);
    
    // ============================================================================
    // SUBTASK 3.2: PER-SEASON ERROR HANDLING
    // ============================================================================
    const seasons: Season[] = [];
    const failedSeasons: number[] = [];
    
    seasonResults.forEach((result, index) => {
      const seasonNum = index + 1;
      
      if (result.status === 'fulfilled' && result.value) {
        seasons.push(result.value);
        console.log(`[TV Show Service] ✓ Season ${seasonNum} fetched successfully with ${result.value.episodes.length} episodes`);
      } else if (result.status === 'rejected') {
        // Log warnings for individual season failures
        failedSeasons.push(seasonNum);
        console.warn(`[TV Show Service] ✗ Season ${seasonNum} failed to fetch`);
        console.warn(`[TV Show Service] Error reason:`, result.reason);
        
        // Track which seasons failed for debugging
        if (result.reason instanceof Error) {
          console.warn(`[TV Show Service] Error type: ${result.reason.name}`);
          console.warn(`[TV Show Service] Error message: ${result.reason.message}`);
          if (result.reason.stack) {
            console.warn(`[TV Show Service] Stack trace:`, result.reason.stack);
          }
        }
      }
    });
    
    // Log summary of season fetching results
    if (failedSeasons.length > 0) {
      console.warn(`[TV Show Service] Failed to fetch ${failedSeasons.length} season(s): ${failedSeasons.join(', ')}`);
      console.warn(`[TV Show Service] Successfully fetched ${seasons.length}/${tvShow.number_of_seasons} seasons`);
      console.warn(`[TV Show Service] Continuing with available seasons...`);
    } else {
      console.log(`[TV Show Service] All ${seasons.length} seasons fetched successfully`);
    }
    
    // ============================================================================
    // SUBTASK 2.3: STRUCTURED LOGGING - SUCCESSFUL DATA RETRIEVAL WITH METRICS
    // ============================================================================
    const duration = Date.now() - startTime;
    console.log(`[TV Show Service] ========================================`);
    console.log(`[TV Show Service] Successfully completed getTVShowWithSeasons`);
    console.log(`[TV Show Service] TV Show ID: ${sanitizedId}`);
    console.log(`[TV Show Service] TV Show Name: ${tvShow.name}`);
    console.log(`[TV Show Service] Total Seasons Requested: ${tvShow.number_of_seasons}`);
    console.log(`[TV Show Service] Seasons Successfully Fetched: ${seasons.length}`);
    console.log(`[TV Show Service] Total Episodes: ${seasons.reduce((sum, s) => sum + s.episodes.length, 0)}`);
    console.log(`[TV Show Service] Duration: ${duration}ms`);
    console.log(`[TV Show Service] ========================================`);
    
    // ============================================================================
    // SUBTASK 4.3: DATA TRANSFORMATION ERROR HANDLING
    // ============================================================================
    
    // Wrap TV show transformation in try-catch block
    let transformedTVShow: Movie;
    try {
      console.log(`[TV Show Service] Transforming TV show data for ID: ${sanitizedId}`);
      transformedTVShow = transformTMDBTVShow(tvShow);
      console.log(`[TV Show Service] Successfully transformed TV show data`);
    } catch (transformError) {
      console.error(`[TV Show Service] Error transforming TV show data for ID ${sanitizedId}:`, transformError);
      
      // Log transformation error with context
      if (transformError instanceof Error) {
        console.error(`[TV Show Service] Transformation error name: ${transformError.name}`);
        console.error(`[TV Show Service] Transformation error message: ${transformError.message}`);
        console.error(`[TV Show Service] Transformation error stack:`, transformError.stack);
      }
      
      console.error(`[TV Show Service] TV show data that failed transformation:`, {
        id: tvShow?.id,
        name: tvShow?.name,
        hasOverview: !!tvShow?.overview,
        hasPosterPath: !!tvShow?.poster_path,
        hasBackdropPath: !!tvShow?.backdrop_path
      });
      
      // Apply safe defaults for malformed data - create minimal valid Movie object
      transformedTVShow = {
        id: tvShow?.id?.toString() || sanitizedId.toString(),
        title: tvShow?.name || 'Unknown TV Show',
        description: tvShow?.overview || 'No description available.',
        releaseDate: tvShow?.first_air_date || new Date().toISOString().split('T')[0],
        duration: 45,
        rating: 7.0,
        genres: ['Drama'],
        thumbnail: '/placeholder-movie.jpg',
        backdrop: '/placeholder-movie.jpg',
        director: 'Unknown',
        cast: [],
        languages: ['English'],
        contentRating: 'NR'
      };
      
      console.warn(`[TV Show Service] Applied safe defaults for TV show ${sanitizedId}`);
    }
    
    return {
      tvShow: transformedTVShow,
      seasons: seasons
    };
  } catch (error) {
    // ============================================================================
    // SUBTASK 2.3: STRUCTURED LOGGING - ERROR DETAILS WITH FULL CONTEXT
    // ============================================================================
    
    // Log the primary fetch error
    console.error(`[TV Show Service] Primary fetch failed for TV show ${id}, attempting fallback...`);
    
    if (error instanceof TVShowFetchError) {
      logTVShowError(error);
    } else {
      console.error(`[TV Show Service] Error:`, error);
    }
    
    // ============================================================================
    // SUBTASK 5.1: FALLBACK TO getTVShowDetails WITH MOCK SEASON DATA
    // ============================================================================
    try {
      console.log(`[TV Show Service] Attempting fallback to getTVShowDetails for TV show ${id}`);
      
      // Attempt fallback to basic TV show details
      const tvShowDetails = await getTVShowDetails(id);
      
      if (!tvShowDetails) {
        console.error(`[TV Show Service] Fallback failed: getTVShowDetails returned null for TV show ${id}`);
        
        // If fallback also fails, throw the original error
        if (error instanceof TVShowFetchError) {
          throw error;
        }
        
        const duration = Date.now() - startTime;
        const wrappedError = new TVShowFetchError(
          error instanceof Error ? error.message : 'Unknown error fetching TV show with seasons',
          TVShowFetchErrorType.UNKNOWN,
          undefined,
          id,
          {
            originalError: error instanceof Error ? error.name : typeof error,
            originalMessage: error instanceof Error ? error.message : String(error),
            duration: `${duration}ms`,
            stack: error instanceof Error ? error.stack : undefined,
            fallbackAttempted: true,
            fallbackFailed: true
          }
        );
        
        logTVShowError(wrappedError);
        throw wrappedError;
      }
      
      console.log(`[TV Show Service] Successfully fetched basic TV show details for ${id}, generating mock seasons...`);
      
      // Generate mock season data using existing generateTVShowSeasons function
      const mockSeasons = generateTVShowSeasons(tvShowDetails);
      
      console.log(`[TV Show Service] Generated ${mockSeasons.length} mock seasons with ${mockSeasons.reduce((sum, s) => sum + s.episodes.length, 0)} total episodes`);
      
      const duration = Date.now() - startTime;
      console.log(`[TV Show Service] ========================================`);
      console.log(`[TV Show Service] Fallback completed successfully`);
      console.log(`[TV Show Service] TV Show ID: ${id}`);
      console.log(`[TV Show Service] TV Show Name: ${tvShowDetails.title}`);
      console.log(`[TV Show Service] Mock Seasons Generated: ${mockSeasons.length}`);
      console.log(`[TV Show Service] Total Mock Episodes: ${mockSeasons.reduce((sum, s) => sum + s.episodes.length, 0)}`);
      console.log(`[TV Show Service] Duration: ${duration}ms`);
      console.log(`[TV Show Service] Note: Using mock season data due to primary fetch failure`);
      console.log(`[TV Show Service] ========================================`);
      
      return {
        tvShow: tvShowDetails,
        seasons: mockSeasons
      };
      
    } catch (fallbackError) {
      console.error(`[TV Show Service] Fallback also failed for TV show ${id}:`, fallbackError);
      
      // If fallback fails, throw the original error with fallback context
      const duration = Date.now() - startTime;
      const wrappedError = new TVShowFetchError(
        error instanceof Error ? error.message : 'Unknown error fetching TV show with seasons',
        error instanceof TVShowFetchError ? error.type : TVShowFetchErrorType.UNKNOWN,
        error instanceof TVShowFetchError ? error.statusCode : undefined,
        id,
        {
          originalError: error instanceof Error ? error.name : typeof error,
          originalMessage: error instanceof Error ? error.message : String(error),
          duration: `${duration}ms`,
          stack: error instanceof Error ? error.stack : undefined,
          fallbackAttempted: true,
          fallbackFailed: true,
          fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        }
      );
      
      logTVShowError(wrappedError);
      throw wrappedError;
    }
  }
}

/**
 * Generates mock TV show seasons for fallback when real season data is unavailable
 * @param tvShow - Movie object representing the TV show
 * @returns Array of Season objects with mock episode data
 */
function generateTVShowSeasons(tvShow: Movie): Season[] {
  console.log(`[TV Show Service] Generating mock seasons for TV show: ${tvShow.title}`);
  
  const numSeasons = Math.floor(Math.random() * 4) + 1; // 1-4 seasons
  const seasons: Season[] = [];
  const usedTitles = new Set<string>(); // Prevent duplicate episode titles

  for (let s = 1; s <= numSeasons; s++) {
    const episodes: Episode[] = [];
    const numEpisodes = Math.floor(Math.random() * 6) + 8; // 8-13 episodes per season

    for (let e = 1; e <= numEpisodes; e++) {
      let episodeTitle;
      do {
        episodeTitle = generateMockEpisodeTitle();
      } while (usedTitles.has(`s${s}-${episodeTitle}`));

      usedTitles.add(`s${s}-${episodeTitle}`);

      episodes.push({
        id: `${tvShow.id}-s${s}-e${e}`,
        title: `Episode ${e}: ${episodeTitle}`,
        description: `In this episode of ${tvShow.title}, ${generateMockEpisodeDescription()}`,
        episodeNumber: e,
        duration: Math.floor(Math.random() * 20) + 40, // 40-60 minutes
        thumbnail: tvShow.backdrop,
        releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        rating: Math.floor(Math.random() * 30) + 70 // 70-100 rating
      });
    }

    seasons.push({
      id: `${tvShow.id}-season-${s}`,
      seasonNumber: s,
      title: `Season ${s}`,
      episodes,
      releaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      thumbnail: tvShow.thumbnail
    });
  }

  console.log(`[TV Show Service] Generated ${numSeasons} mock seasons with ${seasons.reduce((sum, s) => sum + s.episodes.length, 0)} total episodes`);
  
  return seasons;
}

/**
 * Generates a random episode title for mock data
 * @returns Random episode title string
 */
function generateMockEpisodeTitle(): string {
  const titles = [
    'The Beginning', 'New Allies', 'The Hunt', 'Revelations', 'The Plan',
    'Betrayal', 'The Truth', 'Final Stand', 'Consequences', 'The End',
    'Pilot', 'The Discovery', 'Breaking Point', 'Crossroads', 'Aftermath',
    'Rising Action', 'The Confrontation', 'Secrets Revealed', 'The Chase', 'Resolution'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

/**
 * Generates a random episode description for mock data
 * @returns Random episode description string
 */
function generateMockEpisodeDescription(): string {
  const descriptions = [
    'relationships are tested as new challenges emerge.',
    'characters face difficult decisions that will change everything.',
    'the investigation takes an unexpected turn.',
    'secrets from the past come to light.',
    'alliances are formed and broken.',
    'the stakes get higher as danger approaches.',
    'new mysteries unfold in this thrilling episode.',
    'characters must confront their deepest fears.',
    'unexpected revelations change the game.',
    'the story takes a dramatic turn.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * Validates episode runtime with fallback chain
 * @param episode - TMDB episode data
 * @param tvShow - TV show data for fallback
 * @returns Valid runtime in minutes
 */
function validateEpisodeRuntime(episode: any, tvShow: any): number {
  // Try episode runtime first
  if (episode.runtime && typeof episode.runtime === 'number' && episode.runtime > 0) {
    return episode.runtime;
  }
  
  // Fallback to show's average episode runtime
  if (tvShow.episode_run_time && Array.isArray(tvShow.episode_run_time) && tvShow.episode_run_time.length > 0) {
    const showRuntime = tvShow.episode_run_time[0];
    if (typeof showRuntime === 'number' && showRuntime > 0) {
      return showRuntime;
    }
  }
  
  // Final fallback to 45 minutes default
  return 45;
}

/**
 * Validates episode thumbnail with fallback to show backdrop
 * @param episode - TMDB episode data
 * @param tvShow - TV show data for fallback
 * @returns Valid thumbnail URL
 */
function validateEpisodeThumbnail(episode: any, tvShow: any): string {
  // Try episode still_path first
  if (episode.still_path && typeof episode.still_path === 'string') {
    return `${TMDB_IMAGE_BASE_URL}/w500${episode.still_path}`;
  }
  
  // Fallback to show backdrop
  if (tvShow.backdrop_path && typeof tvShow.backdrop_path === 'string') {
    return `${TMDB_IMAGE_BASE_URL}/w500${tvShow.backdrop_path}`;
  }
  
  // Final fallback to placeholder
  return '/placeholder-movie.jpg';
}

/**
 * Validates episode rating with fallback to show rating
 * @param episode - TMDB episode data
 * @param tvShow - TV show data for fallback
 * @returns Valid rating (0-100 scale)
 */
function validateEpisodeRating(episode: any, tvShow: any): number {
  // Try episode vote_average first
  if (typeof episode.vote_average === 'number' && episode.vote_average > 0) {
    return Math.round(episode.vote_average * 10); // Convert 0-10 to 0-100 scale
  }
  
  // Fallback to show's overall rating
  if (typeof tvShow.vote_average === 'number' && tvShow.vote_average > 0) {
    return Math.round(tvShow.vote_average * 10);
  }
  
  // Final fallback to 70 (7.0 rating)
  return 70;
}

/**
 * Ensures consistent episode ID format
 * @param tvShowId - TV show ID
 * @param seasonNum - Season number
 * @param episodeNum - Episode number
 * @returns Formatted episode ID
 */
function formatEpisodeId(tvShowId: number, seasonNum: number, episodeNum: number): string {
  return `${tvShowId}-s${seasonNum}-e${episodeNum}`;
}

/**
 * Validates and transforms a single episode with comprehensive fallbacks
 * @param episode - Raw TMDB episode data
 * @param tvShowId - TV show ID
 * @param seasonNum - Season number
 * @param tvShow - TV show data for fallback values
 * @returns Validated and transformed Episode object
 */
function validateAndTransformEpisode(
  episode: any,
  tvShowId: number,
  seasonNum: number,
  tvShow: any
): Episode {
  try {
    // Ensure episode has required fields
    if (!episode || typeof episode !== 'object') {
      throw new Error('Invalid episode data structure');
    }
    
    // Validate and get episode number
    const episodeNumber = typeof episode.episode_number === 'number' && episode.episode_number > 0
      ? episode.episode_number
      : 1; // Fallback to 1 if missing
    
    // Validate episode name
    const episodeName = episode.name && typeof episode.name === 'string' && episode.name.trim() !== ''
      ? episode.name
      : `Episode ${episodeNumber}`;
    
    // Validate episode overview/description
    const description = episode.overview && typeof episode.overview === 'string' && episode.overview.trim() !== ''
      ? episode.overview
      : `Episode ${episodeNumber} of ${tvShow.name || 'this TV show'}`;
    
    // Validate release date
    const releaseDate = episode.air_date && typeof episode.air_date === 'string'
      ? episode.air_date
      : tvShow.first_air_date || new Date().toISOString().split('T')[0];
    
    return {
      id: formatEpisodeId(tvShowId, seasonNum, episodeNumber),
      title: `Episode ${episodeNumber}: ${episodeName}`,
      description: description,
      episodeNumber: episodeNumber,
      duration: validateEpisodeRuntime(episode, tvShow),
      thumbnail: validateEpisodeThumbnail(episode, tvShow),
      releaseDate: releaseDate,
      rating: validateEpisodeRating(episode, tvShow)
    };
  } catch (error) {
    console.error(`[TV Show Service] Error validating episode data:`, error);
    console.error(`[TV Show Service] Episode context:`, {
      tvShowId,
      seasonNum,
      episodeData: episode
    });
    
    // Return a minimal valid episode as last resort
    return {
      id: formatEpisodeId(tvShowId, seasonNum, 1),
      title: 'Episode 1',
      description: 'No description available.',
      episodeNumber: 1,
      duration: 45,
      thumbnail: '/placeholder-movie.jpg',
      releaseDate: new Date().toISOString().split('T')[0],
      rating: 70
    };
  }
}

/**
 * Helper function to fetch a single season's data
 * Used for parallel season fetching with Promise.allSettled
 * @param tvShowId - Sanitized TV show ID
 * @param seasonNum - Season number to fetch
 * @param tvShow - TV show data for fallback values
 * @returns Promise<Season> - Transformed season data
 */
async function fetchSeasonData(
  tvShowId: number,
  seasonNum: number,
  tvShow: any
): Promise<Season> {
  console.log(`[TV Show Service] Fetching season ${seasonNum}/${tvShow.number_of_seasons}`);
  
  const seasonResponse = await fetch(
    `${TMDB_BASE_URL}/tv/${tvShowId}/season/${seasonNum}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  
  // HTTP error classification for season fetch
  if (!seasonResponse.ok) {
    const errorType = classifyHTTPError(seasonResponse);
    const error = new TVShowFetchError(
      `Failed to fetch season ${seasonNum}: ${seasonResponse.status} ${seasonResponse.statusText}`,
      errorType,
      seasonResponse.status,
      tvShowId.toString(),
      {
        seasonNumber: seasonNum,
        url: seasonResponse.url,
        statusText: seasonResponse.statusText
      }
    );
    
    console.warn(`[TV Show Service] Failed to fetch season ${seasonNum}: ${seasonResponse.status} ${seasonResponse.statusText}`);
    console.warn(`[TV Show Service] Error type: ${errorType}`);
    
    throw error;
  }
  
  const seasonData = await seasonResponse.json();
  
  console.log(`[TV Show Service] Successfully fetched season ${seasonNum} with ${seasonData.episodes?.length || 0} episodes`);
  
  // Validate and transform episodes with comprehensive fallbacks
  const episodes: Episode[] = [];
  
  if (seasonData.episodes && Array.isArray(seasonData.episodes)) {
    for (const ep of seasonData.episodes) {
      try {
        const validatedEpisode = validateAndTransformEpisode(ep, tvShowId, seasonNum, tvShow);
        episodes.push(validatedEpisode);
      } catch (error) {
        console.warn(`[TV Show Service] Failed to transform episode in season ${seasonNum}:`, error);
        // Continue with other episodes - don't let one bad episode break the whole season
      }
    }
  } else {
    console.warn(`[TV Show Service] No episodes array found for season ${seasonNum}`);
  }
  
  // Validate season poster with fallback
  const seasonThumbnail = seasonData.poster_path && typeof seasonData.poster_path === 'string'
    ? `${TMDB_IMAGE_BASE_URL}/w500${seasonData.poster_path}`
    : (tvShow.poster_path 
        ? `${TMDB_IMAGE_BASE_URL}/w500${tvShow.poster_path}`
        : '/placeholder-movie.jpg');
  
  // Validate season air date with fallback
  const seasonReleaseDate = seasonData.air_date && typeof seasonData.air_date === 'string'
    ? seasonData.air_date
    : tvShow.first_air_date || new Date().toISOString().split('T')[0];

  return {
    id: `${tvShowId}-season-${seasonNum}`,
    seasonNumber: seasonNum,
    title: `Season ${seasonNum}`,
    episodes: episodes,
    releaseDate: seasonReleaseDate,
    thumbnail: seasonThumbnail
  };
}

// ============================================================================
// DATA VALIDATION AND TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Validates required TV show fields from TMDB response
 * @param tmdbShow - Raw TMDB TV show data
 * @returns Object with validation status and missing fields
 */
function validateTVShowFields(tmdbShow: any): { isValid: boolean; missingFields: string[] } {
  const requiredFields = ['id', 'name', 'overview', 'poster_path', 'backdrop_path'];
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!tmdbShow[field]) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Applies fallback values for missing optional TV show fields
 * @param tmdbShow - Raw TMDB TV show data
 * @returns TV show data with fallback values applied
 */
function applyTVShowFallbacks(tmdbShow: any): any {
  const fallbackShow = { ...tmdbShow };
  
  // Apply fallback for missing poster_path
  if (!fallbackShow.poster_path) {
    console.warn(`[TV Show Service] Missing poster_path for TV show ${tmdbShow.id}, using placeholder`);
    fallbackShow.poster_path = '/placeholder-movie.jpg';
  }
  
  // Apply fallback for missing backdrop_path
  if (!fallbackShow.backdrop_path) {
    console.warn(`[TV Show Service] Missing backdrop_path for TV show ${tmdbShow.id}, using poster as fallback`);
    fallbackShow.backdrop_path = fallbackShow.poster_path;
  }
  
  // Apply fallback for missing overview
  if (!fallbackShow.overview || fallbackShow.overview.trim() === '') {
    console.warn(`[TV Show Service] Missing overview for TV show ${tmdbShow.id}, using default description`);
    fallbackShow.overview = `Watch ${fallbackShow.name || 'this TV show'} and enjoy the story.`;
  }
  
  // Apply fallback for missing first_air_date
  if (!fallbackShow.first_air_date) {
    console.warn(`[TV Show Service] Missing first_air_date for TV show ${tmdbShow.id}, using current date`);
    fallbackShow.first_air_date = new Date().toISOString().split('T')[0];
  }
  
  // Apply fallback for missing episode_run_time
  if (!fallbackShow.episode_run_time || fallbackShow.episode_run_time.length === 0) {
    console.warn(`[TV Show Service] Missing episode_run_time for TV show ${tmdbShow.id}, using default 45 minutes`);
    fallbackShow.episode_run_time = [45];
  }
  
  // Apply fallback for missing vote_average
  if (typeof fallbackShow.vote_average !== 'number' || fallbackShow.vote_average === 0) {
    console.warn(`[TV Show Service] Missing or invalid vote_average for TV show ${tmdbShow.id}, using default 7.0`);
    fallbackShow.vote_average = 7.0;
  }
  
  // Apply fallback for missing genres
  if (!fallbackShow.genres || fallbackShow.genres.length === 0) {
    console.warn(`[TV Show Service] Missing genres for TV show ${tmdbShow.id}, using default genre`);
    fallbackShow.genres = [{ id: 0, name: 'Drama' }];
  }
  
  // Apply fallback for missing spoken_languages
  if (!fallbackShow.spoken_languages || fallbackShow.spoken_languages.length === 0) {
    console.warn(`[TV Show Service] Missing spoken_languages for TV show ${tmdbShow.id}, using English as default`);
    fallbackShow.spoken_languages = [{ english_name: 'English', iso_639_1: 'en' }];
  }
  
  return fallbackShow;
}

/**
 * Helper function to transform TMDB TV show data to Movie interface with validation
 * @param tmdbShow - Raw TMDB TV show data
 * @returns Transformed Movie object with fallbacks applied
 */
function transformTMDBTVShow(tmdbShow: any): Movie {
  try {
    // Validate required fields
    const validation = validateTVShowFields(tmdbShow);
    
    if (!validation.isValid) {
      console.warn(`[TV Show Service] TV show ${tmdbShow.id} missing required fields: ${validation.missingFields.join(', ')}`);
      console.warn(`[TV Show Service] Applying fallback values for missing fields`);
    }
    
    // Apply fallback values for missing optional fields
    const showWithFallbacks = applyTVShowFallbacks(tmdbShow);
    
    // Transform to Movie interface
    return {
      id: showWithFallbacks.id.toString(),
      title: showWithFallbacks.name,
      description: showWithFallbacks.overview,
      releaseDate: showWithFallbacks.first_air_date,
      duration: showWithFallbacks.episode_run_time[0],
      rating: Math.round(showWithFallbacks.vote_average * 10) / 10,
      genres: showWithFallbacks.genres.map((g: any) => g.name),
      thumbnail: showWithFallbacks.poster_path.startsWith('http') 
        ? showWithFallbacks.poster_path 
        : `${TMDB_IMAGE_BASE_URL}/w500${showWithFallbacks.poster_path}`,
      backdrop: showWithFallbacks.backdrop_path.startsWith('http')
        ? showWithFallbacks.backdrop_path
        : `${TMDB_IMAGE_BASE_URL}/original${showWithFallbacks.backdrop_path}`,
      director: showWithFallbacks.created_by?.[0]?.name || 'Unknown',
      cast: showWithFallbacks.credits?.cast?.slice(0, 10).map((actor: any) => ({
        id: actor.id.toString(),
        name: actor.name,
        character: actor.character,
        profileImage: actor.profile_path 
          ? `${TMDB_IMAGE_BASE_URL}/w185${actor.profile_path}`
          : '/placeholder-actor.jpg'
      })) || [],
      languages: showWithFallbacks.spoken_languages.map((lang: any) => lang.english_name),
      contentRating: showWithFallbacks.content_ratings?.results?.find((cr: any) => cr.iso_3166_1 === 'US')?.rating || 'NR'
    };
  } catch (error) {
    console.error(`[TV Show Service] Error transforming TV show data for ID ${tmdbShow?.id}:`, error);
    
    // Return a minimal valid Movie object as last resort
    return {
      id: tmdbShow?.id?.toString() || '0',
      title: tmdbShow?.name || 'Unknown TV Show',
      description: tmdbShow?.overview || 'No description available.',
      releaseDate: tmdbShow?.first_air_date || new Date().toISOString().split('T')[0],
      duration: 45,
      rating: 7.0,
      genres: ['Drama'],
      thumbnail: '/placeholder-movie.jpg',
      backdrop: '/placeholder-movie.jpg',
      director: 'Unknown',
      cast: [],
      languages: ['English'],
      contentRating: 'NR'
    };
  }
}

// ============================================================================
// END DATA VALIDATION AND TRANSFORMATION UTILITIES
// ============================================================================
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

// TV Show trailer cache
const tvShowTrailerCache = new TrailerCache();

// Get TV show trailer URL
export async function getTVShowTrailer(tvShowId: string): Promise<string | null> {
  try {
    // Validate TV show ID
    if (!tvShowId || tvShowId.trim() === '') {
      console.error('[TV Show Trailer Service] Invalid TV show ID provided');
      return null;
    }

    const parsedTVShowId = parseInt(tvShowId);
    if (isNaN(parsedTVShowId) || parsedTVShowId <= 0) {
      console.error(`[TV Show Trailer Service] Invalid TV show ID format: ${tvShowId}`);
      return null;
    }

    // Check cache first
    const cachedUrl = tvShowTrailerCache.get(tvShowId);
    if (cachedUrl !== undefined) {
      return cachedUrl;
    }

    // Fetch videos
    let videos;
    try {
      videos = await fetchTVShowVideos(parsedTVShowId);
    } catch (error) {
      console.error(`[TV Show Trailer Service] Failed to fetch videos for TV show ${tvShowId}:`, error);
      tvShowTrailerCache.set(tvShowId, null);
      return null;
    }

    // Process trailer URL
    try {
      if (!videos.results || videos.results.length === 0) {
        tvShowTrailerCache.set(tvShowId, null);
        return null;
      }

      const trailerUrl = getTrailerUrl(videos.results);
      
      if (trailerUrl) {
        tvShowTrailerCache.set(tvShowId, trailerUrl);
        return trailerUrl;
      } else {
        tvShowTrailerCache.set(tvShowId, null);
        return null;
      }
    } catch (processingError) {
      console.error(`[TV Show Trailer Service] Error processing trailer URL for TV show ${tvShowId}:`, processingError);
      tvShowTrailerCache.set(tvShowId, null);
      return null;
    }
    
  } catch (error) {
    console.error(`[TV Show Trailer Service] Unexpected error fetching trailer for TV show ${tvShowId}:`, error);
    tvShowTrailerCache.set(tvShowId, null);
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