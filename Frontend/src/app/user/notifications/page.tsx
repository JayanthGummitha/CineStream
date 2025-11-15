'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bell, Sparkles, Film, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  fetchNotifications,
  formatTimestamp,
  getNotificationIconComponent,
  type Notification
} from '@/lib/notifications';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    const IconComponent = getNotificationIconComponent(type);
    return <IconComponent className="h-5 w-5" />;
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Stay updated with your activity • {unreadCount} unread
            </p>
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="hidden sm:flex bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:bg-red-900"

            >
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-3 mt-6">
            <Badge 
              variant="outline" 
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200
                         ${filter === 'all' 
                           ? 'bg-primary/10 border-primary text-primary' 
                           : 'border-border hover:bg-muted'}
                         hover:scale-105 active:scale-95`}
            >
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              All ({notifications.length})
            </Badge>
            <Badge 
              variant="outline" 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200
                         ${filter === 'unread' 
                           ? 'bg-primary/10 border-primary text-primary' 
                           : 'border-border hover:bg-muted'}
                         hover:scale-105 active:scale-95`}
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
              Unread ({unreadCount})
            </Badge>
          </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-4 p-2">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="relative w-24 h-24 mb-6 opacity-20">
              <Bell className="w-full h-full" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md text-sm">
              {filter === 'unread' 
                ? 'You\'re all caught up! Check back later for updates.' 
                : 'You don\'t have any notifications yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`@container/card bg-gradient-to-b from-neutral-800 to-neutral-900/90 border-neutral-900/50 shadow-lg border-4 p-2 transition-all duration-300 hover:shadow-xl overflow-hidden
                         ${!notification.isRead ? 'border-neutral-600' : 'border-b-neutral-900'}`}
            >
              <CardContent className="p-4 sm:p-2">
                <div className="flex gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg flex items-center justify-center `}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Thumbnail (if available) */}
                  {notification.imageUrl && (
                    <div className="flex-shrink-0 w-16 h-24 sm:w-20 sm:h-30 rounded-lg overflow-hidden hidden sm:block">
                      <Image
                        src={notification.imageUrl}
                        alt={notification.movieTitle || 'Thumbnail'}
                        width={80}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                      <h3 className="font-bold text-base sm:text-lg">
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        <span className="text-muted-foreground text-xs sm:text-sm whitespace-nowrap">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {notification.actionUrl && (
                        <Link href={notification.actionUrl}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-b from-red-500 to-red-600 hover:border-2 hover:border-neutral-900"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Film className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                            {notification.actionText}
                          </Button>
                        </Link>
                      )}
                      
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" />
                          Mark Read
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center"
                      >
                        <Trash2 className="h-5 w-5 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
