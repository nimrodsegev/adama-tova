/**
 * COMPLETE PROFILE PAGE
 * Shows the quiz modal after user signs up.
 * Redirects to login if user is not authenticated.
 * This is where new users land after signup to complete their profile.
 */

'use client';

import { useUser } from '@/app/contexts/UserContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizModal from '@/lib/components/QuizModal';

export default function CompleteProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>טוען...</div>;
  }

  return <QuizModal userId={user.id} userEmail={user.email || ''} />;
}