'use client';

import { MyListProvider } from '@/contexts/MyListContext';
import { LikesProvider } from '@/contexts/LikesContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { WatchProgressCleanup } from '@/components/watch-progress-cleanup';
import { ServiceWorkerInit } from '@/components/ServiceWorkerInit';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ProfileProvider>
      <MyListProvider>
        <LikesProvider>
          <WatchProgressCleanup />
          <ServiceWorkerInit />
          {children}
        </LikesProvider>
      </MyListProvider>
    </ProfileProvider>
  );
}
