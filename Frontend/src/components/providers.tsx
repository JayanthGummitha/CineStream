'use client';

import { MyListProvider } from '@/contexts/MyListContext';
import { WatchProgressCleanup } from '@/components/watch-progress-cleanup';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MyListProvider>
      <WatchProgressCleanup />
      {children}
    </MyListProvider>
  );
}
