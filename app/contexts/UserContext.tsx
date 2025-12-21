/**
 * USER CONTEXT
 * Manages user authentication state, quiz completion status, and full user profile.
 * Loads complete user data from users table including role, name, phone, quiz data.
 * For new Google users, shows role selection modal.
 * Redirects users based on role and quiz completion status.
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { authService } from '@/app/services/authService';
import { userService } from '@/app/services/userService';
import { useRouter, usePathname } from 'next/navigation';
import RoleSelectionModal from '@/lib/components/RoleSelectionModal';

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
  const [showRoleSelection, setShowRoleSelection] = useState(false);
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
        
        if (profile) {
          // User exists in users table
          setUserProfile(profile);
          setShowRoleSelection(false);
          
          // Check if quiz is completed
          const completed = profile?.quiz?.completed_at != null;
          setHasCompletedQuiz(completed);
          
          // If completed, redirect based on role
          if (completed) {
            if (pathname === '/login' || pathname === '/complete-profile' || pathname === '/complete-profile-admin') {
              if (profile.role === 'admin') {
                router.replace('/adminScreens');
              } else {
                router.replace('/UserScreens');
              }
            }
          } else {
            // Quiz not completed - redirect to appropriate quiz page
            if (pathname !== '/complete-profile' && 
                pathname !== '/complete-profile-admin' && 
                pathname !== '/login') {
              router.push('/complete-profile');
            }
          }
        } else {
          // User doesn't exist in users table (new Google user)
          setUserProfile(null);
          setHasCompletedQuiz(false);
          
          // Show role selection modal if not on login or quiz pages
          if (pathname !== '/login' && 
              pathname !== '/complete-profile' && 
              pathname !== '/complete-profile-admin') {
            setShowRoleSelection(true);
          }
        }
      } else {
        setUserProfile(null);
        setHasCompletedQuiz(false);
        setShowRoleSelection(false);
      }
    };

    loadProfile();
  }, [user, pathname, router]);

  const signOut = async () => {
    setUser(null);
    setUserProfile(null);
    setHasCompletedQuiz(false);
    setShowRoleSelection(false);
    await authService.signOut();
  };

  return (
    <UserContext.Provider value={{ user, userProfile, loading, hasCompletedQuiz, signOut }}>
      {children}
      {showRoleSelection && <RoleSelectionModal />}
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