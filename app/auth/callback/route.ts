import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error("Exchange error:", exchangeError);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
    
    // Check if this is a password recovery
    if (type === 'recovery') {
      // For password reset, just redirect to reset-password page
      // Don't do the normal login flow
      return NextResponse.redirect(new URL('/reset-password', requestUrl.origin));
    }
    
    // For normal auth flow (login, signup, etc)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("User error:", userError);
      return NextResponse.redirect(new URL('/login', requestUrl.origin));
    }
    
    // Check if user exists in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Handle "no rows" error (PGRST116) - this is normal for new users
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile error:", profileError);
    }
    
    // Determine where to redirect
    let targetPath = '/';
    
    if (!profile) {
      // New user - redirect to complete profile
      targetPath = '/complete-profile';
    } else if (!profile.quiz?.completed_at) {
      // User exists but quiz not completed
      targetPath = '/complete-profile';
    } else {
      // 🔥 NEW: Check if user is approved (participants only)
      if (!profile.is_approved && profile.role === 'participant') {
        targetPath = '/pending-approval';
      } else {
        // User has completed quiz and is approved - go to appropriate dashboard
        targetPath = profile.role === 'admin' ? '/adminScreens/HomePage' : '/UserScreens/HomePage';
      }
    }
    
    // Force refresh
    revalidatePath('/', 'layout');
    
    // Redirect to the determined path
    return NextResponse.redirect(new URL(targetPath, requestUrl.origin));
  }

  // No code - just redirect to home
  revalidatePath('/', 'layout');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}