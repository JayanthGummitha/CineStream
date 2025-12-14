/**
 * useSearch Hook
 * 
 * Custom hook for search functionality with debouncing and caching.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { quickSearch, SearchResult } from '@/lib/search-service';

interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  clearSearch: () => void;
}

/**
 * Hook for quick search with debouncing
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export function useSearch(debounceMs: number = 300): UseSearchReturn {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Simple cache for recent searches
  const cacheRef = useRef<Map<string, SearchResult[]>>(new Map());
  
  // Debounce the search query
  const debouncedQuery = useDebounce(query, debounceMs);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      const trimmedQuery = debouncedQuery.trim();
      
      // Clear results if query is too short
      if (trimmedQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      // Check cache first
      const cached = cacheRef.current.get(trimmedQuery.toLowerCase());
      if (cached) {
        setResults(cached);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await quickSearch(trimmedQuery, 6);
        
        // Cache the results
        cacheRef.current.set(trimmedQuery.toLowerCase(), searchResults);
        
        // Limit cache size
        if (cacheRef.current.size > 50) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }
        
        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Search failed. Please try again.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Set loading state immediately when query changes
  useEffect(() => {
    if (query.trim().length >= 2) {
      setIsLoading(true);
    }
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clearSearch,
  };
}
