'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PinModal } from './PinModal';
import { ContentAccessResult } from '@/lib/parental-controls';
import { cn } from '@/lib/utils';

interface ContentRestrictionOverlayProps {
  accessResult: ContentAccessResult;
  contentTitle: string;
  onPinVerified: () => void;
  className?: string;
}

export function ContentRestrictionOverlay({
  accessResult,
  contentTitle,
  onPinVerified,
  className,
}: ContentRestrictionOverlayProps) {
  const router = useRouter();
  const [showPinModal, setShowPinModal] = useState(false);

  const getRestrictionMessage = () => {
    switch (accessResult.reason) {
      case 'maturity_rating':
        return {
          icon: Shield,
          title: 'Content Restricted',
          description: `This content is rated ${accessResult.currentRating} and exceeds your profile's maximum rating of ${accessResult.requiredRating}.`,
          showUnlock: true,
        };
      case 'blocked':
        return {
          icon: Lock,
          title: 'Content Blocked',
          description: 'This content has been blocked on your profile.',
          showUnlock: true,
        };
      case 'blocked_genre':
        return {
          icon: Shield,
          title: 'Genre Restricted',
          description: `This content contains "${accessResult.blockedGenre}" which is blocked on your profile.`,
          showUnlock: true,
        };
      case 'time_restriction':
        return {
          icon: AlertTriangle,
          title: 'Viewing Time Restricted',
          description: 'This content is not available during the current time period.',
          showUnlock: false,
        };
      default:
        return {
          icon: Shield,
          title: 'Content Unavailable',
          description: 'This content is not available for your profile.',
          showUnlock: true,
        };
    }
  };

  const restriction = getRestrictionMessage();
  const IconComponent = restriction.icon;

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm',
          className
        )}
      >
        <div className="max-w-md mx-auto px-6 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
            <IconComponent className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-3">{restriction.title}</h1>

          {/* Content Title */}
          <p className="text-lg text-white/80 mb-2">"{contentTitle}"</p>

          {/* Description */}
          <p className="text-white/60 mb-8">{restriction.description}</p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {restriction.showUnlock && (
              <Button
                onClick={() => setShowPinModal(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                Enter PIN to Unlock
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push('/profiles')}
              className="w-full text-white/60 hover:text-white"
            >
              Switch Profile
            </Button>
          </div>

          {/* Rating Badge */}
          {accessResult.currentRating && (
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-white/60 text-sm">Content Rating:</span>
              <span className="text-white font-semibold px-2 py-0.5 bg-red-600/30 rounded text-sm">
                {accessResult.currentRating}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PIN Modal */}
      <PinModal
        open={showPinModal}
        onOpenChange={setShowPinModal}
        onVerified={() => {
          setShowPinModal(false);
          onPinVerified();
        }}
        title="Enter PIN"
        description="Enter your PIN to unlock this content."
      />
    </>
  );
}
