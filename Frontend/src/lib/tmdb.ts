export const TMDB_API_KEY = '7e83be858f9268de6fa04f84b4045b31';
export const TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZTgzYmU4NThmOTI2OGRlNmZhMDRmODRiNDA0NWIzMSIsIm5iZiI6MTc1NDk2OTAyOC44MDMsInN1YiI6IjY4OWFiM2M0OTE0Yzg1NDZhMThkYjBlZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.31grce5Jf4lAiwnVXpLih4Sh6G81Y4KprizPynnPUjw';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// TMDB API Response Types
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  imdb_id: string;
  homepage: string;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
  adult: boolean;
  original_language: string;
  original_name: string;
  popularity: number;
  origin_country: string[];
}

export interface TMDBTVShowDetails extends TMDBTVShow {
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  homepage: string;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: TMDBSeason[];
  created_by: { id: number; name: string; profile_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  last_air_date: string;
  in_production: boolean;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResponse {
  id: number;
  results: TMDBVideo[];
}

// API Functions
const apiOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
  }
};

export async function fetchPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/movie/popular?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch popular movies');
  }
  return response.json();
}

export async function fetchTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch trending movies');
  }
  return response.json();
}

export async function fetchTopRatedMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch top rated movies');
  }
  return response.json();
}

export async function fetchNowPlayingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch now playing movies');
  }
  return response.json();
}

export async function fetchUpcomingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming movies');
  }
  return response.json();
}

export async function fetchMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch movie details');
  }
  return response.json();
}

export async function fetchMovieCredits(movieId: number): Promise<TMDBCredits> {
  const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/credits`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch movie credits');
  }
  return response.json();
}

export async function fetchGenres(): Promise<{ genres: TMDBGenre[] }> {
  const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch genres');
  }
  return response.json();
}

export async function searchMovies(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to search movies');
  }
  return response.json();
}

export async function fetchMovieVideos(movieId: number): Promise<TMDBVideosResponse> {
  try {
    
    // Validate movie ID
    if (!movieId || movieId <= 0) {
      throw new Error(`Invalid movie ID: ${movieId}`);
    }

    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos`, apiOptions);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[TMDB API] Failed to fetch videos for movie ${movieId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Provide specific error messages based on status code
      if (response.status === 404) {
        throw new Error(`Movie with ID ${movieId} not found`);
      } else if (response.status === 401) {
        throw new Error('TMDB API authentication failed - check API key');
      } else if (response.status === 429) {
        throw new Error('TMDB API rate limit exceeded - please try again later');
      } else if (response.status >= 500) {
        throw new Error('TMDB API server error - please try again later');
      } else {
        throw new Error(`Failed to fetch movie videos: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error(`[TMDB API] Error fetching videos for movie ${movieId}:`, error);
    
    // Re-throw with additional context
    if (error instanceof Error) {
      throw new Error(`TMDB API error for movie ${movieId}: ${error.message}`);
    } else {
      throw new Error(`Unknown error fetching videos for movie ${movieId}`);
    }
  }
}

export function getTrailerUrl(videos: TMDBVideo[]): string | null {
  try {
    
    // Validate input
    if (!videos || !Array.isArray(videos)) {
      console.warn('[Trailer Processing] Invalid videos input - not an array');
      return null;
    }

    if (videos.length === 0) {
      return null;
    }

    // Filter to only YouTube trailers with comprehensive validation
    const youtubeTrailers = videos.filter(video => {
      if (!video) {
        console.warn('[Trailer Processing] Skipping null/undefined video');
        return false;
      }

      if (video.type !== 'Trailer') {
        return false;
      }

      if (video.site !== 'YouTube') {
        return false;
      }

      if (!video.key || typeof video.key !== 'string' || video.key.trim() === '') {
        console.warn('[Trailer Processing] Skipping video with invalid key:', video.key);
        return false;
      }

      // Validate YouTube key format (basic check)
      if (!/^[a-zA-Z0-9_-]{11}$/.test(video.key)) {
        console.warn(`[Trailer Processing] Skipping video with invalid YouTube key format: ${video.key}`);
        return false;
      }

      return true;
    });


    if (youtubeTrailers.length === 0) {
      return null;
    }

    // Priority 1: Official YouTube trailers
    const officialTrailer = youtubeTrailers.find(video => video.official === true);
    if (officialTrailer) {
      const url = `https://www.youtube.com/embed/${officialTrailer.key}`;
      return url;
    }

    // Priority 2: Any YouTube trailer (fallback)
    const anyTrailer = youtubeTrailers[0];
    const url = `https://www.youtube.com/embed/${anyTrailer.key}`;
    return url;

  } catch (error) {
    console.error('[Trailer Processing] Error processing trailer URL:', error);
    return null;
  }
}

/**
 * Get Vidstack-compatible YouTube URL for trailer playback
 * Vidstack supports multiple YouTube URL formats for optimal performance
 */
export function getVidstackTrailerUrl(videos: TMDBVideo[]): string | null {
  try {
    
    // Validate input
    if (!videos || !Array.isArray(videos)) {
      console.warn('[Vidstack Trailer Processing] Invalid videos input - not an array');
      return null;
    }

    if (videos.length === 0) {
      return null;
    }

    // Filter to only YouTube trailers with comprehensive validation
    const youtubeTrailers = videos.filter(video => {
      if (!video) {
        console.warn('[Vidstack Trailer Processing] Skipping null/undefined video');
        return false;
      }

      if (video.type !== 'Trailer') {
        return false;
      }

      if (video.site !== 'YouTube') {
        return false;
      }

      if (!video.key || typeof video.key !== 'string' || video.key.trim() === '') {
        console.warn('[Vidstack Trailer Processing] Skipping video with invalid key:', video.key);
        return false;
      }

      // Validate YouTube key format (basic check)
      if (!/^[a-zA-Z0-9_-]{11}$/.test(video.key)) {
        console.warn(`[Vidstack Trailer Processing] Skipping video with invalid YouTube key format: ${video.key}`);
        return false;
      }

      return true;
    });


    if (youtubeTrailers.length === 0) {
      return null;
    }

    // Priority 1: Official YouTube trailers
    const officialTrailer = youtubeTrailers.find(video => video.official === true);
    if (officialTrailer) {
      const url = `youtube/${officialTrailer.key}`;
      return url;
    }

    // Priority 2: Any YouTube trailer (fallback)
    const anyTrailer = youtubeTrailers[0];
    const url = `youtube/${anyTrailer.key}`;
    return url;

  } catch (error) {
    console.error('[Vidstack Trailer Processing] Error processing Vidstack trailer URL:', error);
    return null;
  }
}

// In your tmdb.ts or same import file
export async function fetchSeasonEpisodes(tvId: number, seasonNumber: number) {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${process.env.TMDB_API_KEY}&language=en-US`);
  if (!res.ok) throw new Error("Failed to fetch season episodes");
  return res.json();
}

export async function fetchAllSeasonsWithEpisodes(tvId: number) {
  const tvDetails = await fetchTVShowDetails(tvId);

  const seasons = await Promise.all(
    tvDetails.seasons
      .filter((s: any) => s.season_number !== 0) // skip specials
      .map(async (season: any) => {
        const seasonDetails = await fetchSeasonEpisodes(tvId, season.season_number);

        return {
          id: season.id,
          seasonNumber: season.season_number,
          title: season.name,
          description: season.overview,
          releaseDate: season.air_date,
          thumbnail: season.poster_path,
          episodes: seasonDetails.episodes.map((ep: any) => ({
            id: ep.id,
            title: ep.name,
            description: ep.overview,
            episodeNumber: ep.episode_number,
            duration: ep.runtime || 45, // fallback
            thumbnail: ep.still_path,
            releaseDate: ep.air_date,
            rating: ep.vote_average || 0
          })),
        };
      })
  );

  return seasons;
}

export async function fetchMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
  const response = await fetch(`${TMDB_BASE_URL}/discover/movie?with_genres=${genreId}&page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch movies by genre');
  }
  return response.json();
}

// TV Show API Functions
export async function fetchPopularTVShows(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/tv/popular?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch popular TV shows');
  }
  return response.json();
}

export async function fetchTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/trending/tv/${timeWindow}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch trending TV shows');
  }
  return response.json();
}

export async function fetchTopRatedTVShows(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/tv/top_rated?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch top rated TV shows');
  }
  return response.json();
}

export async function fetchAiringTodayTVShows(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/tv/airing_today?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch airing today TV shows');
  }
  return response.json();
}

export async function fetchOnTheAirTVShows(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/tv/on_the_air?page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch on the air TV shows');
  }
  return response.json();
}

export async function fetchTVShowDetails(tvId: number): Promise<TMDBTVShowDetails> {
  const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch TV show details');
  }
  return response.json();
}

export async function fetchTVShowCredits(tvId: number): Promise<TMDBCredits> {
  const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/credits`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch TV show credits');
  }
  return response.json();
}

export async function fetchTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  const response = await fetch(`${TMDB_BASE_URL}/genre/tv/list`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch TV genres');
  }
  return response.json();
}

export async function fetchTVShowsByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/discover/tv?with_genres=${genreId}&page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch TV shows by genre');
  }
  return response.json();
}

export async function searchTVShows(query: string, page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
  const response = await fetch(`${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}`, apiOptions);
  if (!response.ok) {
    throw new Error('Failed to search TV shows');
  }
  return response.json();
}

// Fetch TV show videos (trailers, teasers, etc.)
export async function fetchTVShowVideos(tvId: number): Promise<TMDBVideosResponse> {
  try {
    // Validate TV show ID
    if (!tvId || tvId <= 0) {
      throw new Error(`Invalid TV show ID: ${tvId}`);
    }

    const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/videos`, apiOptions);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[TMDB API] Failed to fetch videos for TV show ${tvId}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      if (response.status === 404) {
        throw new Error(`TV show with ID ${tvId} not found`);
      } else if (response.status === 401) {
        throw new Error('TMDB API authentication failed - check API key');
      } else if (response.status === 429) {
        throw new Error('TMDB API rate limit exceeded - please try again later');
      } else if (response.status >= 500) {
        throw new Error('TMDB API server error - please try again later');
      } else {
        throw new Error(`Failed to fetch TV show videos: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[TMDB API] Error fetching videos for TV show ${tvId}:`, error);
    
    if (error instanceof Error) {
      throw new Error(`TMDB API error for TV show ${tvId}: ${error.message}`);
    } else {
      throw new Error(`Unknown error fetching videos for TV show ${tvId}`);
    }
  }
}

// Helper functions for image URLs
export function getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w400' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'): string {
  if (!path) return '/movie-poster-1.svg'; // fallback to placeholder
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return '/movie-backdrop-1.svg'; // fallback to placeholder
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string {
  if (!path) return '/profile-placeholder.svg'; // fallback to placeholder
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

// Search for a person by name and get their profile image
export async function searchPersonImage(name: string): Promise<string | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}&page=1`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const person = data.results[0];
      if (person.profile_path) {
        return `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error searching for person image:', error);
    return null;
  }
}

// Convert TMDB data to our internal types
export function convertTMDBMovieToMovie(tmdbMovie: TMDBMovie, genres: TMDBGenre[] = []): import('@/types').Movie {
  const movieGenres = genres.filter(g => tmdbMovie.genre_ids.includes(g.id)).map(g => g.name);
  
  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    thumbnail: getImageUrl(tmdbMovie.poster_path, 'w500'),
    backdrop: getBackdropUrl(tmdbMovie.backdrop_path, 'w1280'),
    trailer: '', // Will be populated separately with video data
    duration: 120, // default duration, will be updated with details
    releaseDate: tmdbMovie.release_date,
    genres: movieGenres.length > 0 ? movieGenres : ['Drama'], // fallback genre
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    contentRating: tmdbMovie.adult ? 'R' : 'PG-13',
    cast: [], // will be populated separately
    director: 'Unknown', // will be populated from credits
    writers: ['Unknown'], // will be populated from credits
    languages: ['English'], // default, can be updated
    subtitles: ['English'], // default
    quality: ['HD', '4K'],
    isNew: new Date(tmdbMovie.release_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // released in last 30 days
    isTrending: tmdbMovie.popularity > 100,
    isPopular: tmdbMovie.vote_count > 1000 && tmdbMovie.vote_average > 7,
  };
}

export function convertTMDBMovieDetailsToMovie(
  tmdbMovie: TMDBMovieDetails, 
  credits?: TMDBCredits
): import('@/types').Movie {
  const cast = credits?.cast.slice(0, 10).map(member => ({
    id: member.id.toString(),
    name: member.name,
    character: member.character,
    profileImage: getProfileUrl(member.profile_path, 'w185')
  })) || [];

  const director = credits?.crew.find(member => member.job === 'Director')?.name || 'Unknown';
  const writers = credits?.crew
    .filter(member => member.job === 'Writer' || member.job === 'Screenplay')
    .map(member => member.name) || ['Unknown'];

  return {
    id: tmdbMovie.id.toString(),
    title: tmdbMovie.title,
    description: tmdbMovie.overview,
    thumbnail: getImageUrl(tmdbMovie.poster_path, 'w500'),
    backdrop: getBackdropUrl(tmdbMovie.backdrop_path, 'original'),
    trailer: '', // Will be populated separately with video data
    duration: tmdbMovie.runtime || 120,
    releaseDate: tmdbMovie.release_date,
    genres: tmdbMovie.genres.map(g => g.name),
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    contentRating: tmdbMovie.adult ? 'R' : 'PG-13',
    cast,
    director,
    writers: writers.length > 0 ? writers : ['Unknown'],
    languages: tmdbMovie.spoken_languages.map(lang => lang.english_name),
    subtitles: ['English', 'Spanish', 'French'], // default subtitles
    quality: ['HD', '4K'],
    isNew: new Date(tmdbMovie.release_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isTrending: tmdbMovie.popularity > 100,
    isPopular: tmdbMovie.vote_count > 1000 && tmdbMovie.vote_average > 7,
  };
}

// Convert TMDB TV Show data to our internal types
export function convertTMDBTVShowToMovie(tmdbTVShow: TMDBTVShow, genres: TMDBGenre[] = []): import('@/types').Movie {
  const showGenres = genres.filter(g => tmdbTVShow.genre_ids.includes(g.id)).map(g => g.name);
  
  return {
    id: tmdbTVShow.id.toString(),
    title: tmdbTVShow.name,
    description: tmdbTVShow.overview,
    thumbnail: getImageUrl(tmdbTVShow.poster_path, 'w500'),
    backdrop: getBackdropUrl(tmdbTVShow.backdrop_path, 'w1280'),
    trailer: '', // Will be populated separately with video data
    duration: 45, // average TV episode duration
    releaseDate: tmdbTVShow.first_air_date,
    genres: showGenres.length > 0 ? showGenres : ['Drama'], // fallback genre
    rating: Math.round(tmdbTVShow.vote_average * 10) / 10,
    contentRating: tmdbTVShow.adult ? 'TV-MA' : 'TV-14',
    cast: [], // will be populated separately
    director: 'Unknown', // will be populated from credits
    writers: ['Unknown'], // will be populated from credits
    languages: ['English'], // default, can be updated
    subtitles: ['English'], // default
    quality: ['HD', '4K'],
    isNew: new Date(tmdbTVShow.first_air_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // released in last 30 days
    isTrending: tmdbTVShow.popularity > 100,
    isPopular: tmdbTVShow.vote_count > 1000 && tmdbTVShow.vote_average > 7,
    contentType: 'tv-shows', // Mark as TV show for correct routing
  };
}

export function convertTMDBTVShowDetailsToMovie(
  tmdbTVShow: TMDBTVShowDetails, 
  credits?: TMDBCredits
): import('@/types').Movie {
  const cast = credits?.cast.slice(0, 10).map(member => ({
    id: member.id.toString(),
    name: member.name,
    character: member.character,
    profileImage: getProfileUrl(member.profile_path, 'w185')
  })) || [];

  const creator = tmdbTVShow.created_by[0]?.name || 'Unknown';
  const writers = credits?.crew
    .filter(member => member.job === 'Writer' || member.job === 'Executive Producer')
    .map(member => member.name) || ['Unknown'];

  return {
    id: tmdbTVShow.id.toString(),
    title: tmdbTVShow.name,
    description: tmdbTVShow.overview,
    thumbnail: getImageUrl(tmdbTVShow.poster_path, 'w500'),
    backdrop: getBackdropUrl(tmdbTVShow.backdrop_path, 'original'),
    trailer: '', // Will be populated separately with video data
    duration: tmdbTVShow.episode_run_time[0] || 45,
    releaseDate: tmdbTVShow.first_air_date,
    genres: tmdbTVShow.genres.map(g => g.name),
    rating: Math.round(tmdbTVShow.vote_average * 10) / 10,
    contentRating: tmdbTVShow.adult ? 'TV-MA' : 'TV-14',
    cast,
    director: creator,
    writers: writers.length > 0 ? writers : ['Unknown'],
    languages: tmdbTVShow.spoken_languages.map(lang => lang.english_name),
    subtitles: ['English', 'Spanish', 'French'], // default subtitles
    quality: ['HD', '4K'],
    isNew: new Date(tmdbTVShow.first_air_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isTrending: tmdbTVShow.popularity > 100,
    isPopular: tmdbTVShow.vote_count > 1000 && tmdbTVShow.vote_average > 7,
    contentType: 'tv-shows', // Mark as TV show for correct routing
  };
}