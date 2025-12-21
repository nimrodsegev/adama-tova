/**
 * USER SERVICE
 * Handles user profile operations, specifically:
 * - Saving quiz answers to the database
 * - Checking if user completed the onboarding quiz
 */

import { createClient } from '@/lib/supabase/client';

export const userService = {
  // Save quiz answers and create user profile
  async completeProfile(userId: string, profileData: {
    full_name: string;
    phone: string;
    circle?: string;
    interests?: string[];
    free_text?: string;
  }) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        full_name: profileData.full_name,
        phone: profileData.phone,
        quiz: {
          circle: profileData.circle || null,
          interests: profileData.interests || [],
          free_text: profileData.free_text || null,
          completed_at: new Date().toISOString(),
        }
      });
    
    if (error) throw error;
    return data;
  },

  // Check if user has completed quiz
  async hasCompletedQuiz(userId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('quiz')
      .eq('id', userId)
      .single();
    
    if (error) return false;
    return data?.quiz?.completed_at != null;
  },
};