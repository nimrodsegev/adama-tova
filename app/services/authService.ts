import { createClient } from '@/lib/supabase/client';

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

  // Get current user
  async getCurrentUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
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