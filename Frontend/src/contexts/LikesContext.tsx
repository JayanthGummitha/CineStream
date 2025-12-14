'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '@/types';
import { useProfiles } from '@/contexts/ProfileContext';

const LIKES_STORAGE_KEY = 'cinestream_likes';

/** Get profile-scoped storage key */
function getStorageKey(profileId: string | undefined): string {
  return profileId ? `${LIKES_STORAGE_KEY}_${profileId}` : LIKES_STORAGE_KEY;
}

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
  const { activeProfile } = useProfiles();
  const [likes, setLikes] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const profileId = activeProfile?.id;
  const storageKey = getStorageKey(profileId);

  // Load likes from localStorage when profile changes
  useEffect(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setLikes(JSON.parse(stored));
      } else {
        setLikes([]);
      }
    } catch (error) {
      console.error('Error loading likes:', error);
      setLikes([]);
    } finally {
      setIsLoading(false);
    }

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
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
      if (customEvent.detail?.profileId === profileId) {
        setLikes(customEvent.detail.likes);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('likesUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('likesUpdated', handleCustomEvent);
    };
  }, [storageKey, profileId]);

  // Save likes to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(likes));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('likesUpdated', { detail: { profileId, likes } }));
      } catch (error) {
        console.error('Error saving likes:', error);
      }
    }
  }, [likes, isLoading, storageKey, profileId]);

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
