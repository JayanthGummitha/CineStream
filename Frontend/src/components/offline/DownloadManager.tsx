'use client';

import { useOfflineContent } from '@/hooks/useOfflineContent';
import { OfflineContent } from '@/types/profile';
import { formatBytes } from '@/lib/offline-storage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Download,
  Trash2,
  Play,
  Clock,
  HardDrive,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface DownloadManagerProps {
  className?: string;
}

export function DownloadManager({ className }: DownloadManagerProps) {
  const {
    offlineContent,
    downloadQueue,
    currentDownload,
    downloadProgress,
    storageUsed,
    isLoading,
    isSupported,
    cancelDownload,
    deleteContent,
  } = useOfflineContent();

  if (!isSupported) {
    return (
      <div className={cn('p-6 text-center', className)}>
        <WifiOff className="w-12 h-12 mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Offline Downloads Not Supported
        </h3>
        <p className="text-gray-400 text-sm">
          Your browser doesn&apos;t support offline downloads. Try using Chrome, Firefox, or Edge.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('p-6 flex items-center justify-center', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const completedDownloads = offlineContent.filter(c => c.status === 'completed');
  const failedDownloads = offlineContent.filter(c => c.status === 'failed');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Storage Info */}
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-gray-400">
            <HardDrive className="w-4 h-4" />
            <span className="text-sm">Storage Used</span>
          </div>
          <span className="text-white font-medium">{storageUsed}</span>
        </div>
        <Progress value={30} className="h-2" />
      </div>

      {/* Current Download */}
      {currentDownload && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Downloading
          </h3>
          <DownloadItem
            item={{
              id: currentDownload.id,
              contentId: currentDownload.contentId,
              contentType: currentDownload.contentType,
              title: currentDownload.title,
              thumbnail: currentDownload.thumbnail,
              progress: downloadProgress,
              status: 'downloading',
            }}
            onCancel={() => cancelDownload(currentDownload.id)}
          />
        </div>
      )}

      {/* Download Queue */}
      {downloadQueue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Queue ({downloadQueue.length})
          </h3>
          {downloadQueue.map((item) => (
            <DownloadItem
              key={item.id}
              item={{
                id: item.id,
                contentId: item.contentId,
                contentType: item.contentType,
                title: item.title,
                thumbnail: item.thumbnail,
                progress: 0,
                status: 'pending',
              }}
              onCancel={() => cancelDownload(item.id)}
            />
          ))}
        </div>
      )}

      {/* Completed Downloads */}
      {completedDownloads.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Downloaded ({completedDownloads.length})
          </h3>
          {completedDownloads.map((item) => (
            <DownloadItem
              key={item.id}
              item={{
                id: item.id,
                contentId: item.contentId,
                contentType: item.contentType,
                title: item.title,
                thumbnail: item.thumbnail,
                progress: 100,
                status: 'completed',
                sizeBytes: item.sizeBytes,
                expiresAt: item.expiresAt,
              }}
              onDelete={() => deleteContent(item.id)}
            />
          ))}
        </div>
      )}

      {/* Failed Downloads */}
      {failedDownloads.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wide">
            Failed ({failedDownloads.length})
          </h3>
          {failedDownloads.map((item) => (
            <DownloadItem
              key={item.id}
              item={{
                id: item.id,
                contentId: item.contentId,
                contentType: item.contentType,
                title: item.title,
                thumbnail: item.thumbnail,
                progress: item.progress,
                status: 'failed',
              }}
              onDelete={() => deleteContent(item.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {completedDownloads.length === 0 && downloadQueue.length === 0 && !currentDownload && (
        <div className="text-center py-12">
          <Download className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Downloads</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Download movies and shows to watch offline. Look for the download button on content pages.
          </p>
        </div>
      )}
    </div>
  );
}

interface DownloadItemProps {
  item: {
    id: string;
    contentId: string;
    contentType: 'movie' | 'episode';
    title: string;
    thumbnail: string;
    progress: number;
    status: OfflineContent['status'] | 'pending';
    sizeBytes?: number;
    expiresAt?: string;
  };
  onCancel?: () => void;
  onDelete?: () => void;
}

function DownloadItem({ item, onCancel, onDelete }: DownloadItemProps) {
  const getStatusIcon = () => {
    switch (item.status) {
      case 'downloading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getExpiryText = () => {
    if (!item.expiresAt) return null;
    const expires = new Date(item.expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `Expires in ${daysLeft} days`;
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-800/50 rounded-lg p-3">
      {/* Thumbnail */}
      <div className="relative w-20 h-12 rounded overflow-hidden flex-shrink-0">
        <Image
          src={item.thumbnail || '/placeholder-movie.jpg'}
          alt={item.title}
          fill
          className="object-cover"
        />
        {item.status === 'completed' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium text-sm truncate">{item.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          {getStatusIcon()}
          <span className="text-xs text-gray-400">
            {item.status === 'downloading' && `${item.progress}%`}
            {item.status === 'completed' && item.sizeBytes && formatBytes(item.sizeBytes)}
            {item.status === 'pending' && 'Waiting...'}
            {item.status === 'failed' && 'Download failed'}
          </span>
          {item.status === 'completed' && (
            <span className="text-xs text-gray-500">• {getExpiryText()}</span>
          )}
        </div>

        {/* Progress Bar */}
        {item.status === 'downloading' && (
          <Progress value={item.progress} className="h-1 mt-2" />
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        {(item.status === 'pending' || item.status === 'downloading') && onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        {(item.status === 'completed' || item.status === 'failed') && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
