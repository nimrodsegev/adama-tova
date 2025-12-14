'use client';

import { useUser } from '@/app/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
    router.refresh();
  };

  return (
    <footer id="footer">
      <p>This is some example footer content.</p>
      {user ? (
        <p>
          hey {user.email} :){' '}
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'inherit', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Log Out
          </button>{' '}
          | Product Jam 2025
        </p>
      ) : (
        <p>
          <a href="/login">Log In</a> | Product Jam 2025
        </p>
      )}
    </footer>
  );
}