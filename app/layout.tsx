import "@/styles/global.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/lib/components/Navbar";
import Footer from "@/lib/components/Footer";

export const metadata: Metadata = {
  title: "Adama Tova",
  description: "Activity registration and management for Adama Tova",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <head>
        {/* Browser Favicon */}
        <link rel="icon" href="/icons/favicon.png" />
        {/* Apple Icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-180.png"
        />
        {/* Android Icon */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192.png"
        />
        <link rel="manifest" href="/manifest.json" />
        {/* Google Sign-In Script */}
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body>
        <Navbar />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  );
}