'use client';

import ProtectedRoute from '@/lib/components/ProtectedRoute';
import { useUser } from '@/app/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <ProtectedRoute>
      <div className="content" style={{ padding: '2rem' }}>
        <h1>הפרופיל שלי</h1>
        
        <div style={{ marginTop: '2rem' }}>
          <p><strong>אימייל:</strong> {user?.email}</p>
          <p><strong>שם:</strong> {user?.user_metadata?.name || 'לא צוין'}</p>
          <p><strong>ID:</strong> {user?.id}</p>
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            marginTop: '2rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          התנתק
        </button>
      </div>
    </ProtectedRoute>
  );
}