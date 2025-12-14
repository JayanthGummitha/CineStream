'use client';

import { useState } from 'react';
import { useParentalControls } from '@/hooks/useParentalControls';
import { PinModal } from './PinModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Lock, AlertTriangle } from 'lucide-react';

interface ContentRestrictionBadgeProps {
  contentId: string;
  contentRating: string;
  className?: string;
  /** Called when content is unlocked */
  onUnlock?: () => void;
  /** Show as inline badge or blocking overlay */
  variant?: 'badge' | 'overlay';
}

export function ContentRestrictionBadge({
  contentId,
  contentRating,
  className,
  onUnlock,
  variant = 'badge',
}: ContentRestrictionBadgeProps) {
  const { canAccessContent, isEnabled, hasPinSet, getRatingDescription } = useParentalControls();
  const [showPinModal, setShowPinModal] = useState(false);

  // Check access
  const accessResult = canAccessContent(contentId, contentRating);

  // If access is allowed or parental controls disabled, don't show anything
  if (accessResult.allowed || !isEnabled) {
    return null;
  }

  const handleUnlock = () => {
    if (hasPinSet) {
      setShowPinModal(true);
    }
  };

  const handlePinVerified = () => {
    setShowPinModal(false);
    onUnlock?.();
  };

  if (variant === 'overlay') {
    return (
      <>
        <div className={cn(
          'absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10',
          className
        )}>
          <Lock className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">Content Restricted</h3>
          <p className="text-gray-400 text-sm text-center max-w-xs mb-4">
            {accessResult.reason === 'maturity_rating' && (
              <>
                This content is rated {accessResult.currentRating} and exceeds your profile&apos;s 
                maximum rating of {accessResult.requiredRating}.
              </>
            )}
            {accessResult.reason === 'blocked' && (
              <>This content has been blocked on your profile.</>
            )}
            {accessResult.reason === 'time_restriction' && (
              <>Viewing is restricted during this time.</>
            )}
          </p>
          {hasPinSet && (
            <Button onClick={handleUnlock} variant="outline" className="border-white/20 text-white">
              <Lock className="w-4 h-4 mr-2" />
              Enter PIN to Watch
            </Button>
          )}
        </div>

        <PinModal
          open={showPinModal}
          onOpenChange={setShowPinModal}
          onVerified={handlePinVerified}
          title="Enter PIN"
          description="Enter your PIN to unlock this content."
        />
      </>
    );
  }

  // Badge variant
  return (
    <>
      <Badge
        variant="outline"
        className={cn(
          'border-yellow-500/50 text-yellow-500 bg-yellow-500/10 cursor-pointer',
          className
        )}
        onClick={handleUnlock}
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        {contentRating}
        {hasPinSet && <Lock className="w-3 h-3 ml-1" />}
      </Badge>

      <PinModal
        open={showPinModal}
        onOpenChange={setShowPinModal}
        onVerified={handlePinVerified}
        title="Enter PIN"
        description="Enter your PIN to unlock this content."
      />
    </>
  );
}
