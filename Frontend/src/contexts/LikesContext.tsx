'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '@/types';

const LIKES_STORAGE_KEY = 'cinestream_likes';

interface LikesContextType {
  likes: Movie[];
  isLoading: boolean;
  addLike: (movie: Movie) => void;
  removeLike: (movieId: string) => void;
  isLiked: (movieId: string) => boolean;
  toggleLike: (movie: Movie) => void;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

export function LikesProvider({ children }: { children: ReactNode }) {
  const [likes, setLikes] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load likes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      if (stored) {
        setLikes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setIsLoading(false);
    }

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LIKES_STORAGE_KEY && e.newValue) {
        try {
          setLikes(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    // Listen for custom events from same tab
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setLikes(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('likesUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('likesUpdated', handleCustomEvent);
    };
  }, []);

  // Save likes to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('likesUpdated', { detail: likes }));
      } catch (error) {
        console.error('Error saving likes:', error);
      }
    }
  }, [likes, isLoading]);

  const addLike = (movie: Movie) => {
    setLikes((prev) => {
      if (prev.some((m) => m.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  const removeLike = (movieId: string) => {
    setLikes((prev) => prev.filter((m) => m.id !== movieId));
  };

  const isLiked = (movieId: string) => {
    return likes.some((m) => m.id === movieId);
  };

  const toggleLike = (movie: Movie) => {
    if (isLiked(movie.id)) {
      removeLike(movie.id);
    } else {
      addLike(movie);
    }
  };

  return (
    <LikesContext.Provider
      value={{
        likes,
        isLoading,
        addLike,
        removeLike,
        isLiked,
        toggleLike,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}
