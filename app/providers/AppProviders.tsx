/**
 * APP PROVIDERS
 * Combines all context providers for the app.
 * IvritaProvider is wrapped inside UserProvider to access user gender.
 */
"use client";
import { ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { UserProvider, useUser } from "@/app/contexts/UserContext";
import { IvritaProvider, GenderType } from "@/app/contexts/IvritaContext";

/**
 * Inner component that uses UserContext to get gender
 * and passes it to IvritaProvider
 */
function IvritaWithUser({ children }: { children: ReactNode }) {
  const { userProfile } = useUser();
  const gender = (userProfile?.gender as GenderType) || null;

  return <IvritaProvider initialGender={gender}>{children}</IvritaProvider>;
}

/**
 * Main providers wrapper
 * Use this in layout.tsx instead of individual providers
 */
export function AppProviders({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) {
  return (
    <UserProvider initialUser={initialUser}>
      <IvritaWithUser>
        {/* PageTransitionProvider REMOVED to avoid conflict with SmoothPageWrapper */}
        {children}
      </IvritaWithUser>
    </UserProvider>
  );
}
