'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

interface MovieRedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function MovieRedirectPage({ params }: MovieRedirectPageProps) {
  const resolvedParams = use(params);
  
  // Redirect to the slug-based URL
  // In a real app, you'd fetch the movie title and create the proper slug
  redirect(`/movie/${resolvedParams.id}/movie-title`);
}