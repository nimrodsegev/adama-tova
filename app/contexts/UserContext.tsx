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

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with true to prevent flash
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // List of routes that should not redirect
  const NO_REDIRECT_ROUTES = ['/complete-profile'];
  const PUBLIC_ROUTES = ['/login', '/complete-profile'];


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

  // Load full user profile and check quiz completion whenever user changes
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      if (user) {
        try {
          // Load full profile from users table
          const profile = await userService.getFullProfile(user.id);
          
          if (profile) {
            // User exists in users table
            setUserProfile(profile);
            
            // Check if quiz is completed
            const completed = profile?.quiz?.completed_at != null;
            setHasCompletedQuiz(completed);
            
            // Only redirect if we're not already on a protected route
            // Only redirect if we're on login or quiz pages
const shouldRedirect = pathname === '/login' || pathname === '/complete-profile' || pathname === '/';

if (shouldRedirect && completed) {
  // Quiz completed - go to appropriate dashboard
  if (profile.role === 'admin') {
    router.replace('/adminScreens');
  } else {
    router.replace('/UserScreens');
  }
} else if (!completed && pathname !== '/complete-profile') {
  // Quiz not completed - redirect to quiz page
  router.replace('/complete-profile');
}
          } else {
            // User doesn't exist in users table (new Google user)
            setUserProfile(null);
            setHasCompletedQuiz(false);
            
            // Only redirect if we're not already on the quiz page
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
        // No user - clear profile
        setUserProfile(null);
        setHasCompletedQuiz(false);
        
        // Only redirect to login if we're not on a public route
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