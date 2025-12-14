'use client';

import { useUser } from '@/app/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Not logged in - redirect to login
      router.push('/login');
    }
    
    // TODO: Once database is ready, check if requireAdmin and user is not admin
    // For now, we'll skip admin check since we don't have the users table data yet
  }, [user, loading, router, requireAdmin]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>טוען...</p>
      </div>
    );
  }

  // Don't show anything if not authenticated (we're redirecting)
  if (!user) {
    return null;
  }

  // User is authenticated - show the protected content
  return <>{children}</>;
}