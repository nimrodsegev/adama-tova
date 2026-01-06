import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "@/lib/config";
import { createBrowserClient } from "@supabase/ssr";

// Singleton instance - prevents multiple clients from refreshing tokens independently
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
};