/**
 * USER CONTEXT
 * Manages user authentication state and quiz completion status.
 * Redirects users to /complete-profile if they haven't finished the quiz.
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import { useRouter, usePathname } from 'next/navigation';

interface UserContextType {
  user: User | null;
  loading: boolean;
  hasCompletedQuiz: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if there's a mismatch between initialUser and actual session
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser?.id !== initialUser?.id) {
          setUser(currentUser);
          router.refresh(); // Force refresh if mismatch
        }
      } catch (error) {
        setUser(null);
      }
    };

    checkSession();

    const subscription = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, [initialUser, router]);

  // Check quiz completion whenever user changes
  useEffect(() => {
    const checkQuiz = async () => {
      if (user) {
        const completed = await userService.hasCompletedQuiz(user.id);
        setHasCompletedQuiz(completed);
        
        // If not completed and not already on complete-profile page, redirect
        if (!completed && pathname !== '/complete-profile' && pathname !== '/login') {
          router.push('/complete-profile');
        }
      }
    };

    checkQuiz();
  }, [user, pathname, router]);

  const signOut = async () => {
    setUser(null);
    setHasCompletedQuiz(false);
    await authService.signOut();
  };

  return (
    <UserContext.Provider value={{ user, loading, hasCompletedQuiz, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}