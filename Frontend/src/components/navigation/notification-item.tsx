'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  Notification, 
  formatTimestamp, 
  getNotificationIconComponent, 
  getNotificationColor 
} from '@/lib/notifications';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
  className?: string;
}

export function NotificationItem({ 
  notification, 
  onClose,
  className 
}: NotificationItemProps) {
  const IconComponent = getNotificationIconComponent(notification.type);
  const colorGradient = getNotificationColor(notification.type);
  const relativeTime = formatTimestamp(notification.timestamp);

  const handleClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const content = (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:bg-neutral-800/50 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        className
      )}
      role="menuitem"
      tabIndex={0}
      aria-label={`${notification.title}: ${notification.message}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div 
          className="absolute top-3 left-1 w-2 h-2 bg-red-500 rounded-full"
          aria-label="Unread notification"
        />
      )}

      {/* Icon */}
      <div 
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
          "bg-gradient-to-br",
          colorGradient
        )}
        aria-hidden="true"
      >
        <IconComponent className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-white line-clamp-1">
            {notification.title}
          </h4>
          <span 
            className="flex-shrink-0 text-xs text-white/50"
            aria-label={`Received ${relativeTime}`}
          >
            {relativeTime}
          </span>
        </div>
        
        <p className="text-sm text-white/70 line-clamp-2 mb-2">
          {notification.message}
        </p>

        {/* Thumbnail Image - Hidden on mobile */}
        {notification.imageUrl && (
          <div className="hidden sm:block mt-2">
            <div className="relative w-full h-20 rounded-md overflow-hidden">
              <Image
                src={notification.imageUrl}
                alt={notification.movieTitle || notification.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 0px, 200px"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If there's an action URL, wrap in Link
  if (notification.actionUrl) {
    return (
      <Link
        href={notification.actionUrl}
        onClick={handleClick}
        className="block"
      >
        {content}
      </Link>
    );
  }

  // Otherwise, render as a div with onClick
  return (
    <div onClick={handleClick}>
      {content}
    </div>
  );
}
