'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const username = user.email.split('@')[0];
        router.replace(`/profile/${username}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting to profile...</div>;
}
