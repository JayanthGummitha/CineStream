'use client';

import { useState, useEffect } from 'react';
import { useOfflineContent } from '@/hooks/useOfflineContent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Download, Check, Loader2, Trash2, WifiOff } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DownloadButtonProps {
  contentId: string;
  contentType: 'movie' | 'episode';
  title: string;
  thumbnail: string;
  videoUrl: string;
  quality?: 'SD' | 'HD' | '4K';
  className?: string;
  variant?: 'default' | 'icon';
  /** For episodes */
  seriesName?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export function DownloadButton({
  contentId,
  contentType,
  title,
  thumbnail,
  videoUrl,
  quality = 'HD',
  className,
  variant = 'default',
  seriesName,
  seasonNumber,
  episodeNumber,
}: DownloadButtonProps) {
  const {
    offlineContent,
    downloadQueue,
    currentDownload,
    downloadProgress,
    isSupported,
    addToQueue,
    cancelDownload,
    deleteContent,
  } = useOfflineContent();

  const [isAvailable, setIsAvailable] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [offlineId, setOfflineId] = useState<string | null>(null);

  // Check download status
  useEffect(() => {
    // Check if already downloaded
    const downloaded = offlineContent.find(
      c => c.contentId === contentId && c.status === 'completed'
    );
    if (downloaded) {
      setIsAvailable(true);
      setOfflineId(downloaded.id);
      return;
    }

    // Check if in queue
    const queued = downloadQueue.find(q => q.contentId === contentId);
    if (queued) {
      setIsQueued(true);
      setOfflineId(queued.id);
      return;
    }

    // Check if currently downloading
    if (currentDownload?.contentId === contentId) {
      setIsDownloading(true);
      return;
    }

    setIsAvailable(false);
    setIsQueued(false);
    setIsDownloading(false);
    setOfflineId(null);
  }, [offlineContent, downloadQueue, currentDownload, contentId]);

  const handleClick = async () => {
    if (!isSupported) return;

    if (isAvailable && offlineId) {
      // Delete downloaded content
      await deleteContent(offlineId);
    } else if (isQueued && offlineId) {
      // Cancel queued download
      await cancelDownload(offlineId);
    } else if (!isDownloading) {
      // Add to download queue
      await addToQueue({
        contentId,
        contentType,
        title,
        thumbnail,
        videoUrl,
        quality,
        priority: 1,
      });
    }
  };

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size={variant === 'icon' ? 'icon' : 'default'}
              disabled
              className={cn('opacity-50', className)}
            >
              <WifiOff className="w-4 h-4" />
              {variant === 'default' && <span className="ml-2">Offline not supported</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Offline downloads are not supported in this browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getIcon = () => {
    if (isDownloading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (isAvailable) {
      return <Check className="w-4 h-4" />;
    }
    if (isQueued) {
      return <Loader2 className="w-4 h-4" />;
    }
    return <Download className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (isDownloading) {
      return `${downloadProgress}%`;
    }
    if (isAvailable) {
      return 'Downloaded';
    }
    if (isQueued) {
      return 'Queued';
    }
    return 'Download';
  };

  const getTooltip = () => {
    if (isDownloading) {
      return `Downloading... ${downloadProgress}%`;
    }
    if (isAvailable) {
      return 'Click to remove download';
    }
    if (isQueued) {
      return 'Click to cancel';
    }
    return `Download for offline viewing (${quality})`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isAvailable ? 'default' : 'outline'}
            size={variant === 'icon' ? 'icon' : 'default'}
            onClick={handleClick}
            disabled={isDownloading}
            className={cn(
              isAvailable && 'bg-green-600 hover:bg-green-700',
              isQueued && 'border-yellow-500 text-yellow-500',
              className
            )}
          >
            {getIcon()}
            {variant === 'default' && <span className="ml-2">{getLabel()}</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
