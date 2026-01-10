import { createClient } from '@/lib/supabase/client';

// Track last error to prevent rapid retry loops
let lastAuthError: { time: number; count: number } = { time: 0, count: 0 };
const BACKOFF_WINDOW_MS = 10000; // 10 second window
const MAX_ERRORS_IN_WINDOW = 3;

// Circuit breaker: when true, all auth calls immediately return null
let isSessionInvalid = false;

function checkRateLimit(): boolean {
  // Circuit breaker takes priority
  if (isSessionInvalid) {
    return false;
  }

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

// Check if error is an invalid refresh token (checks both code and message)
function isInvalidTokenError(error: any): boolean {
  const code = (error?.code || '').toLowerCase();
  const msg = (error?.message || '').toLowerCase();
  return (
    code === 'refresh_token_not_found' ||
    code === 'invalid_grant' ||
    msg.includes('refresh token not found') ||
    msg.includes('invalid refresh token')
  );
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

    // Reset circuit breaker on successful sign in
    isSessionInvalid = false;
    lastAuthError = { time: 0, count: 0 };

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

      // Handle invalid refresh token - activate circuit breaker to stop the loop
      if (isInvalidTokenError(error)) {
        // [DEBUG LOG - safe to delete]
        console.warn('[AuthService] Invalid token detected, activating circuit breaker');

        isSessionInvalid = true;

        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore signOut errors
        }
        return null;
      }

      throw error;
    }
    return user;
  },

  // Listen to auth changes (with debouncing)
  onAuthStateChange(callback: (user: any) => void) {
    const supabase = createClient();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let hasEmittedNull = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // If circuit breaker active, emit null only once
        if (isSessionInvalid) {
          if (!hasEmittedNull) {
            hasEmittedNull = true;
            callback(null);
          }
          return;
        }

        // Debounce to prevent rapid-fire callbacks
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          // Reset circuit breaker on successful sign in
          if (event === 'SIGNED_IN' && session?.user) {
            isSessionInvalid = false;
            hasEmittedNull = false;
            lastAuthError = { time: 0, count: 0 };
          }
          callback(session?.user ?? null);
        }, 100);
      }
    );
    return subscription;
  },
};