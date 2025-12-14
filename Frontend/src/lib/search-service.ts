/**
 * Search Service
 * 
 * Unified search across movies, TV shows, and documentaries.
 * Provides both quick suggestions and full search results.
 */

import { searchMovies, searchTVShows, convertTMDBMovieToMovie, convertTMDBTVShowToMovie } from './tmdb';
import { Movie } from '@/types';

export interface SearchResult {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'documentary';
  thumbnail: string;
  releaseDate: string;
  rating: number;
  overview: string;
}

export interface SearchResults {
  movies: Movie[];
  tvShows: Movie[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Quick search for suggestions (limited results)
 * Used in the header search overlay
 */
export async function quickSearch(query: string, limit: number = 6): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    // Fetch movies and TV shows in parallel
    const [moviesResponse, tvShowsResponse] = await Promise.allSettled([
      searchMovies(query, 1),
      searchTVShows(query, 1),
    ]);

    const results: SearchResult[] = [];

    // Process movies
    if (moviesResponse.status === 'fulfilled' && moviesResponse.value.results) {
      const movies = moviesResponse.value.results.slice(0, Math.ceil(limit / 2));
      movies.forEach((movie) => {
        results.push({
          id: movie.id.toString(),
          title: movie.title,
          type: 'movie',
          thumbnail: movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : '/placeholder-movie.jpg',
          releaseDate: movie.release_date || '',
          rating: movie.vote_average || 0,
          overview: movie.overview || '',
        });
      });
    }

    // Process TV shows
    if (tvShowsResponse.status === 'fulfilled' && tvShowsResponse.value.results) {
      const tvShows = tvShowsResponse.value.results.slice(0, Math.ceil(limit / 2));
      tvShows.forEach((show) => {
        results.push({
          id: show.id.toString(),
          title: show.name,
          type: 'tv',
          thumbnail: show.poster_path
            ? `https://image.tmdb.org/t/p/w200${show.poster_path}`
            : '/placeholder-movie.jpg',
          releaseDate: show.first_air_date || '',
          rating: show.vote_average || 0,
          overview: show.overview || '',
        });
      });
    }

    // Sort by rating and limit
    return results
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  } catch (error) {
    console.error('Quick search failed:', error);
    return [];
  }
}

/**
 * Full search with pagination
 * Used on the search results page
 */
export async function fullSearch(
  query: string,
  page: number = 1,
  filter: 'all' | 'movies' | 'tv' = 'all'
): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return { movies: [], tvShows: [], total: 0, page: 1, totalPages: 0 };
  }

  try {
    const results: SearchResults = {
      movies: [],
      tvShows: [],
      total: 0,
      page,
      totalPages: 0,
    };

    // Fetch based on filter
    const promises: Promise<any>[] = [];
    
    if (filter === 'all' || filter === 'movies') {
      promises.push(searchMovies(query, page));
    } else {
      promises.push(Promise.resolve({ results: [], total_results: 0, total_pages: 0 }));
    }
    
    if (filter === 'all' || filter === 'tv') {
      promises.push(searchTVShows(query, page));
    } else {
      promises.push(Promise.resolve({ results: [], total_results: 0, total_pages: 0 }));
    }

    const [moviesResponse, tvShowsResponse] = await Promise.allSettled(promises);

    // Process movies
    if (moviesResponse.status === 'fulfilled' && moviesResponse.value.results) {
      results.movies = moviesResponse.value.results.map((movie: any) => 
        convertTMDBMovieToMovie(movie, [])
      );
      results.total += moviesResponse.value.total_results || 0;
      results.totalPages = Math.max(results.totalPages, moviesResponse.value.total_pages || 0);
    }

    // Process TV shows
    if (tvShowsResponse.status === 'fulfilled' && tvShowsResponse.value.results) {
      results.tvShows = tvShowsResponse.value.results.map((show: any) => 
        convertTMDBTVShowToMovie(show, [])
      );
      results.total += tvShowsResponse.value.total_results || 0;
      results.totalPages = Math.max(results.totalPages, tvShowsResponse.value.total_pages || 0);
    }

    return results;
  } catch (error) {
    console.error('Full search failed:', error);
    return { movies: [], tvShows: [], total: 0, page: 1, totalPages: 0 };
  }
}

/**
 * Get content type route prefix
 */
export function getContentTypeRoute(type: 'movie' | 'tv' | 'documentary'): string {
  switch (type) {
    case 'movie':
      return '/movie';
    case 'tv':
      return '/tv-shows';
    case 'documentary':
      return '/documentaries';
    default:
      return '/movie';
  }
}
