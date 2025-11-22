'use client';

import { WatchProgressData } from '@/types/watch-progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useEffect } from 'react';

interface DeleteConfirmDialogProps {
  open: boolean;
  item: WatchProgressData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  item,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle Enter if the active element is a button in the dialog
      if (e.key === 'Enter' && document.activeElement?.tagName === 'BUTTON') {
        // Let the button's onClick handle it
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent 
        className="sm:max-w-[425px]"
        aria-describedby="delete-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="delete-dialog-title">
            Remove from Watch History?
          </DialogTitle>
          <DialogDescription id="delete-dialog-description">
            This will permanently remove &quot;{item.title}&quot; from your watch history. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Item Preview */}
        <div className="flex items-center gap-4 py-4" role="group" aria-label="Item to be deleted">
          <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={item.thumbnail || '/placeholder-movie.jpg'}
              alt=""
              role="presentation"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold line-clamp-2" id="item-title">
              {item.title}
            </h4>
            {item.contentType === 'tv-show' && item.episodeTitle && (
              <p className="text-sm text-muted-foreground line-clamp-1" id="item-episode">
                Season {item.seasonNumber}, Episode {item.episodeNumber}: {item.episodeTitle}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            autoFocus
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
            aria-describedby="delete-dialog-description"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
