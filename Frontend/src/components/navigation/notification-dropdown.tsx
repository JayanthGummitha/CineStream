'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './notification-item';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
  className?: string;
}

/**
 * NotificationDropdown component
 * Displays a dropdown menu with recent notifications when the bell icon is clicked
 * - Shows notifications from the last 3 hours
 * - Displays unread badge indicator
 * - Includes loading, empty, and error states
 * - Supports keyboard navigation
 * - Responsive design for mobile, tablet, and desktop
 */
export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, isLoading, error, unreadCount, refetch } = useNotifications();

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-9 w-9 rounded-full",
            "hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/20",
            className
          )}
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Bell className="h-5 w-5 text-white" />
          
          {/* Unread Badge Indicator */}
          {unreadCount > 0 && (
            <div
              className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full"
              aria-label={`${unreadCount} unread notifications`}
            >
              <span className="text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-60}
        className={cn(
          "w-[320px] sm:w-[340px] lg:w-[380px]",
          "max-h-[250px] overflow-y-auto",
          "bg-neutral-900/95 backdrop-blur-xl",
          "border-neutral-800 shadow-2xl rounded-xl",
          "p-0"
        )}
        role="menu"
        aria-label="Notification menu"
        onEscapeKeyDown={handleClose}
      >
        {/* Header */}
        <DropdownMenuLabel className="px-4 py-2.5 text-base font-semibold text-white border-b border-neutral-800">
          Notifications
        </DropdownMenuLabel>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Loader2 className="h-7 w-7 text-white/50 animate-spin mb-2" />
            <p className="text-sm text-white/50">Loading notifications...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-white/70 mb-3 text-center">
              Unable to load notifications
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Bell className="h-8 w-8 text-white/30 mb-2" />
            <p className="text-sm text-white/50">No new notifications</p>
            <p className="text-xs text-white/30 mt-1">Check back later for updates</p>
          </div>
        )}

        {/* Notification List */}
        {!isLoading && !error && notifications.length > 0 && (
          <>
            <div className="py-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClose={handleClose}
                  className="mx-2"
                />
              ))}
            </div>

            <DropdownMenuSeparator className="bg-neutral-800" />

            {/* More Notifications Link */}
            <Link
              href="/user/notifications"
              onClick={handleClose}
              className={cn(
                "flex items-center justify-center gap-2 w-full",
                "px-4 py-2.5 text-sm font-medium text-white",
                "bg-neutral-800/50 hover:bg-neutral-800",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              )}
              role="menuitem"
            >
              More notifications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
