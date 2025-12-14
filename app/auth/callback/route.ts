import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Force Next.js to refresh the layout with new auth state
  revalidatePath('/', 'layout');
  
  // Redirect to home page instead of origin
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}