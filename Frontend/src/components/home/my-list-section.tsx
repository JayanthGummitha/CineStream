'use client';

import { useMyList } from '@/hooks/useMyList';
import { MovieCarousel } from '@/components/ui/movie-carousel';

interface MyListSectionProps {
  isAuthenticated: boolean;
}

export function MyListSection({ isAuthenticated }: MyListSectionProps) {
  const { myList, isLoading } = useMyList();

  // Don't show section if not authenticated or loading
  if (!isAuthenticated || isLoading) {
    return null;
  }

  // Don't show section if list is empty
  if (myList.length === 0) {
    return null;
  }

  return (
    <MovieCarousel
      title="My List"
      movies={myList}
      isAuthenticated={isAuthenticated}
      variant="default"
      showCount={true}
      contentType="movie"
      viewAllLink="/user/my-list"
    />
  );
}
