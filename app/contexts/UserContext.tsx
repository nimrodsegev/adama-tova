/**
 * USER CONTEXT
 * Manages user authentication state, quiz completion status, and full user profile.
 * Loads complete user data from users table including role, name, phone, quiz data.
 * For new Google users, redirects to complete profile page.
 * Redirects users based on role and quiz completion status.
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import { useRouter, usePathname } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'participant' | 'admin';
  notifications_enabled: boolean;
  quiz: {
    circle?: string;
    interests?: string[];
    free_text?: string;
    completed_at?: string;
  };
}

interface UserContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  hasCompletedQuiz: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const NO_REDIRECT_ROUTES = ['/complete-profile', '/reset-password'];
const PUBLIC_ROUTES = ['/login', '/complete-profile', '/reset-password'];

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser?.id !== initialUser?.id) {
          setUser(currentUser);
          router.refresh();
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

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      if (user) {
        try {
          const profile = await userService.getFullProfile(user.id);
          
          if (profile) {
            setUserProfile(profile);
            
            const completed = profile?.quiz?.completed_at != null;
            setHasCompletedQuiz(completed);
            
            if (pathname === '/reset-password') {
              setLoading(false);
              return;
            }
            
            const shouldRedirect = pathname === '/login' || pathname === '/complete-profile' || pathname === '/';

            if (shouldRedirect && completed) {
              if (profile.role === 'admin') {
                router.replace('/adminScreens');
              } else {
                router.replace('/UserScreens');
              }
            } else if (!completed && pathname !== '/complete-profile') {
              router.replace('/complete-profile');
            }
          } else {
            setUserProfile(null);
            setHasCompletedQuiz(false);
            
            if (pathname === '/reset-password') {
              setLoading(false);
              return;
            }
            
            if (pathname !== '/complete-profile') {
              router.replace('/complete-profile');
            }
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          setUserProfile(null);
          setHasCompletedQuiz(false);
        }
      } else {
        setUserProfile(null);
        setHasCompletedQuiz(false);
        
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace('/login');
        }
      }
      
      setLoading(false);
    };

    loadProfile();
  }, [user, pathname, router]);

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
    setHasCompletedQuiz(false);
    await authService.signOut();
    router.replace('/login');
  };

  return (
    <UserContext.Provider value={{ user, userProfile, loading, hasCompletedQuiz, signOut }}>
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