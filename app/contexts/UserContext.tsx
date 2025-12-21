/**
 * USER CONTEXT
 * Manages user authentication state, quiz completion status, and full user profile.
 * Loads complete user data from users table including role, name, phone, quiz data.
 * Redirects users to /complete-profile if they haven't finished the quiz.
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

  // Load full user profile and check quiz completion whenever user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        // Load full profile from users table
        const profile = await userService.getFullProfile(user.id);
        setUserProfile(profile);
        
        // Check if quiz is completed
        const completed = profile?.quiz?.completed_at != null;
        setHasCompletedQuiz(completed);
        
        // If not completed and not already on complete-profile page, redirect
        if (!completed && pathname !== '/complete-profile' && pathname !== '/login') {
          router.push('/complete-profile');
        }
      } else {
        setUserProfile(null);
        setHasCompletedQuiz(false);
      }
    };

    loadProfile();
  }, [user, pathname, router]);

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
    setHasCompletedQuiz(false);
    await authService.signOut();
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