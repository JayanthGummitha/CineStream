'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '@/types';
import { useProfiles } from '@/contexts/ProfileContext';

const MY_LIST_STORAGE_KEY = 'cinestream_my_list';

/** Get profile-scoped storage key */
function getStorageKey(profileId: string | undefined): string {
  return profileId ? `${MY_LIST_STORAGE_KEY}_${profileId}` : MY_LIST_STORAGE_KEY;
}

interface MyListContextType {
  myList: Movie[];
  isLoading: boolean;
  addToList: (movie: Movie) => void;
  removeFromList: (movieId: string) => void;
  isInList: (movieId: string) => boolean;
  toggleList: (movie: Movie) => void;
}

const MyListContext = createContext<MyListContextType | undefined>(undefined);

export function MyListProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useProfiles();
  const [myList, setMyList] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const profileId = activeProfile?.id;
  const storageKey = getStorageKey(profileId);

  // Load list from localStorage when profile changes
  useEffect(() => {
    setIsLoading(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMyList(JSON.parse(stored));
      } else {
        setMyList([]);
      }
    } catch (error) {
      console.error('Error loading my list:', error);
      setMyList([]);
    } finally {
      setIsLoading(false);
    }

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          setMyList(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    // Listen for custom events from same tab
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.profileId === profileId) {
        setMyList(customEvent.detail.list);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('myListUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('myListUpdated', handleCustomEvent);
    };
  }, [storageKey, profileId]);

  // Save list to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(myList));
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('myListUpdated', { detail: { profileId, list: myList } }));
      } catch (error) {
        console.error('Error saving my list:', error);
      }
    }
  }, [myList, isLoading, storageKey, profileId]);

  const addToList = (movie: Movie) => {
    setMyList((prev) => {
      // Check if already in list
      if (prev.some((m) => m.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  const removeFromList = (movieId: string) => {
    setMyList((prev) => prev.filter((m) => m.id !== movieId));
  };

  const isInList = (movieId: string) => {
    return myList.some((m) => m.id === movieId);
  };

  const toggleList = (movie: Movie) => {
    if (isInList(movie.id)) {
      removeFromList(movie.id);
    } else {
      addToList(movie);
    }
  };

  return (
    <MyListContext.Provider
      value={{
        myList,
        isLoading,
        addToList,
        removeFromList,
        isInList,
        toggleList,
      }}
    >
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const context = useContext(MyListContext);
  if (context === undefined) {
    throw new Error('useMyList must be used within a MyListProvider');
  }
  return context;
}
