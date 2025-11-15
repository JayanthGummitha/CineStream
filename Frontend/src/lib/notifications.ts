import { Bell, Sparkles, CreditCard, TrendingUp, Clock } from 'lucide-react';
import { 
  fetchNowPlayingMovies,
  getImageUrl,
} from '@/lib/tmdb';

// Notification interface
export interface Notification {
  id: string;
  type: 'new_release' | 'subscription' | 'trending' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  movieId?: string;
  movieTitle?: string;
}

/**
 * Fetch notifications from TMDB API and generate system notifications
 */
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    // Fetch now playing movies from TMDB
    const nowPlayingData = await fetchNowPlayingMovies(1);
    
    // Get movies from the last 7 days
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMovies = nowPlayingData.results
      .filter(movie => {
        const releaseDate = new Date(movie.release_date);
        return releaseDate >= lastWeek && releaseDate <= now;
      })
      .slice(0, 5); // Limit to 5 most recent

    // Convert TMDB movies to notifications
    const movieNotifications: Notification[] = recentMovies.map((movie, index) => ({
      id: `movie-${movie.id}`,
      type: 'new_release' as const,
      title: 'New Movie Alert! 🎬',
      message: `${movie.title} is now available to stream. ${movie.overview.slice(0, 100)}...`,
      timestamp: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
      isRead: index > 1, // First 2 are unread
      actionUrl: `/movie/${movie.id}`,
      actionText: 'Watch Now',
      imageUrl: getImageUrl(movie.poster_path, 'w200'),
      movieId: movie.id.toString(),
      movieTitle: movie.title
    }));

    // Add system notifications
    const systemNotifications: Notification[] = [
      {
        id: 'sub-1',
        type: 'subscription',
        title: 'Subscription Expiring Soon ⚠️',
        message: 'Your premium subscription will expire in 7 days. Renew now to continue enjoying unlimited streaming.',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isRead: false,
        actionUrl: '/user/subscription',
        actionText: 'Renew Now'
      },
      {
        id: 'sys-1',
        type: 'system',
        title: 'Welcome to CineStream! 🎉',
        message: 'Thank you for subscribing to Premium. Enjoy unlimited streaming in 4K quality.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        actionUrl: '/',
        actionText: 'Explore'
      }
    ];

    return [...movieNotifications, ...systemNotifications];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Format timestamp to relative time string
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Get icon component class for notification type
 */
export function getNotificationIconComponent(type: Notification['type']) {
  switch (type) {
    case 'new_release':
      return Sparkles;
    case 'subscription':
      return CreditCard;
    case 'trending':
      return TrendingUp;
    case 'reminder':
      return Clock;
    case 'system':
      return Bell;
    default:
      return Bell;
  }
}

/**
 * Get color gradient class for notification type
 */
export function getNotificationColor(type: Notification['type']): string {
  switch (type) {
    case 'new_release':
      return 'from-green-500 to-emerald-600';
    case 'subscription':
      return 'from-orange-500 to-red-600';
    case 'trending':
      return 'from-pink-500 to-purple-600';
    case 'reminder':
      return 'from-blue-500 to-cyan-600';
    case 'system':
      return 'from-yellow-500 to-amber-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
}

/**
 * Filter notifications by time range (in hours)
 */
export function filterNotificationsByTime(
  notifications: Notification[],
  hoursAgo: number = 3
): Notification[] {
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  
  return notifications
    .filter(n => new Date(n.timestamp) >= cutoffTime)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10); // Limit to 10 items
}
