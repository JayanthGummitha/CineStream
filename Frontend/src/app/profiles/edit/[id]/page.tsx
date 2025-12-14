'use client';

import { use } from 'react';
import { ProfileEditor } from '@/components/profiles/ProfileEditor';

interface EditProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  const resolvedParams = use(params);
  
  return <ProfileEditor profileId={resolvedParams.id} />;
}
