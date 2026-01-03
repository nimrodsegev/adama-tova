import "@/styles/global.css";
import "./fonts.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
// import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";
import { AppProviders } from "@/app/providers/AppProviders";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Adama Tova",
  description: "Activity registration and management for Adama Tova",
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
    <html>
      <head>
        <link rel="icon" href="/icons/favicon.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <script src="https://accounts.google.com/gsi/client" async defer />
      </head>
      <body>
        {/* 👇 hydrate client with server user */}
        <AppProviders initialUser={user}>
          <div>{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
