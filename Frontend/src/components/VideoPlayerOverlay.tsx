'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';

interface VideoPlayerOverlayProps {
  type: 'loading' | 'error' | 'buffering';
  title: string;
  message: string;
  onRetry?: () => void;
}

export function VideoPlayerOverlay({ type, title, message, onRetry }: VideoPlayerOverlayProps) {
  const getIcon = () => {
    switch (type) {
      case 'loading':
      case 'buffering':
        return <Loader2 className="w-8 h-8 animate-spin text-white" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className=" h-full absolute inset-0 flex items-center justify-center  z-10">
      <Card className="  text-white  bg-indigo-800 max-w-md mx-4 border-none">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            {getIcon()}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-white/70">{message}</p>
          </div>

          {type === 'error' && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}