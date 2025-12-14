'use client';

import { ProfileSelector } from '@/components/profiles/ProfileSelector';

export default function ProfilesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <ProfileSelector />
    </div>
  );
}
