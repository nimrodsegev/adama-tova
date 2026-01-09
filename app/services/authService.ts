import { createClient } from '@/lib/supabase/client';

// Track last error to prevent rapid retry loops
let lastAuthError: { time: number; count: number } = { time: 0, count: 0 };
const BACKOFF_WINDOW_MS = 10000; // 10 second window
const MAX_ERRORS_IN_WINDOW = 3;

function checkRateLimit(): boolean {
  const now = Date.now();
  if (now - lastAuthError.time > BACKOFF_WINDOW_MS) {
    // Reset if outside window
    lastAuthError = { time: now, count: 0 };
    return true;
  }
  if (lastAuthError.count >= MAX_ERRORS_IN_WINDOW) {
    console.warn('Auth rate limit: backing off to prevent 429 errors');
    return false;
  }
  return true;
}

function recordAuthError() {
  const now = Date.now();
  if (now - lastAuthError.time > BACKOFF_WINDOW_MS) {
    lastAuthError = { time: now, count: 1 };
  } else {
    lastAuthError.count++;
  }
}

export const authService = {
  // Sign up with email/password
  async signUp(email: string, password: string, name?: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Store name in metadata
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in with email/password
  async signIn(email: string, password: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user (with rate limit protection)
  async getCurrentUser() {
    // Check if we're hitting errors too fast
    if (!checkRateLimit()) {
      return null; // Back off instead of hammering the server
    }

    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      recordAuthError();

      // Handle invalid refresh token - clear bad session to prevent 429 cascade
      const errorCode = (error as any)?.code;
      if (errorCode === 'refresh_token_not_found' || errorCode === 'invalid_grant') {
        console.warn('Invalid refresh token detected, clearing session');
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore signOut errors - we just want to clear local storage
        }
        return null; // Return null instead of throwing - user will be redirected to login
      }

      throw error;
    }
    return user;
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: any) => void) {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session?.user ?? null);
      }
    );
    return subscription;
  },
};