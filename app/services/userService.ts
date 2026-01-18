/**
 * USER SERVICE
 * Handles user profile operations, specifically:
 * - Saving quiz answers to the database
 * - Checking if user completed the onboarding quiz
 */

import { createClient } from '@/lib/supabase/client';

/**
 * Maps Hebrew circle names to English database enum values
 */
const CIRCLE_MAPPING: Record<string, string> = {
  'שורדי מסיבות': 'Nova Survivor',
  'נפגעי טראומה 7.10 ומלחמת חרבות ברזל': 'October 7 victim',
  'הורים שכולים': 'Shkulim parents',
  'אחים.ות שכולים': 'Shkulim Siblings',
  'קרובים של נפגעי טראומה בגופם ובנפשם בגופם ובנפשם': 'Family of october 7 victim',
  'כוחות הצלה וחילוץ': 'Rescue forces',
  'תושבי העוטף ומפונים': 'Residence of Otef Aza',
  'מעגל שני ושלישי של משפחות השכול': 'Second or third',
};

const INTRESTS_MAPPING: Record<string, string> = {
  'מיינדפולנס': 'mindfulness',
  'גוף ותנועה': 'body_motion',
  'מוזיקה': 'music_sound',
  'יצירה וחומר': 'creation_material',
};
const BRANCHES_MAPPING: Record<string, string> = {
  'נהלל': 'nahalal',
  'סתריה': 'satria',
};

export const userService = {
  // Save quiz answers and create user profile
  async completeProfile(
    userId: string,
    userEmail: string,
    profileData: {
      full_name: string;
      phone: string;
      gender?: 'male' | 'female' | 'neutral' | 'prefer_not_to_say' | null;
      circle?: string;
      proximity?: string;
      interests?: string[];
      branches?: string[];
      free_text?: string;
    }
  ) {
    const supabase = createClient();

    // Map Hebrew circle to English enum value
    const circleEnglish = profileData.circle
      ? CIRCLE_MAPPING[profileData.circle] || null
      : null;

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userEmail,
        role: 'participant',
        full_name: profileData.full_name,
        phone: profileData.phone,
        gender: profileData.gender || null,
        circle: circleEnglish,
        is_approved: false,
        notifications_enabled: true,
        branches: profileData.branches,
        created_at: new Date().toISOString(),
        quiz: {
          circle: profileData.circle || null,
          proximity: profileData.proximity || null,
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
    
    const { data } = await supabase
      .from('users')
      .select('quiz')
      .eq('id', userId)
      .maybeSingle(); // ✅ FIXED
    
    return data?.quiz?.completed_at != null;
  },

  // Get full user profile from users table
  async getFullProfile(userId: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // ✅ FIXED: Returns null instead of throwing 406
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  },
};