'use client';

import { MyListProvider } from '@/contexts/MyListContext';
import { LikesProvider } from '@/contexts/LikesContext';
import { WatchProgressCleanup } from '@/components/watch-progress-cleanup';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MyListProvider>
      <LikesProvider>
        <WatchProgressCleanup />
        {children}
      </LikesProvider>
    </MyListProvider>
  );
}
