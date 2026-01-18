import "@/styles/global.css";
import "./fonts.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Footer from "@/lib/components/Footer";
import { AppProviders } from "@/app/providers/AppProviders";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
// Import the new GlobalSplash component
import GlobalSplash from "@/lib/components/UI/GlobalSplash";

export const metadata: Metadata = {
  title: "Adama Tova",
  description: "Activity registration and management for Adama Tova",
};

// ✅ Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // 🔑 SERVER: get user from Supabase cookie
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="icon" href="/icons/favicon.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/logo-iphone.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/logo-android.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body>
        {/* 👇 Global Splash Screen 
            This sits on top of the app. It checks sessionStorage internally 
            and decides whether to show itself or not. 
        */}
        <GlobalSplash />

        {/* 👇 Hydrate client with server user */}
        <AppProviders initialUser={user}>
          {/* Main application content */}
          {children}

          {/* Footer */}
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
