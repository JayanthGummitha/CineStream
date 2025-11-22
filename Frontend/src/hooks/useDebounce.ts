/**
 * useDebounce Hook
 * 
 * Debounces a value by delaying its update until after a specified delay.
 * Useful for optimizing expensive operations like search filtering.
 * 
 * @module useDebounce
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Debounce a value
 * 
 * Returns a debounced version of the value that only updates after the specified delay
 * has passed without the value changing. This is useful for optimizing expensive operations
 * like search filtering or API calls.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchQuery, setSearchQuery] = useState('');
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * 
 * // debouncedQuery will only update 300ms after the user stops typing
 * useEffect(() => {
 *   // Perform expensive search operation
 *   searchItems(debouncedQuery);
 * }, [debouncedQuery]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if value changes before delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
