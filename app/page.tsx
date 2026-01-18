"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // Wait for the user check to finish
    if (!loading) {
      if (user) {
        // If logged in, go to home
        router.replace("/UserScreens/HomePage");
      } else {
        // If not logged in, go to login
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  // We return an empty div (or a simple loader) because
  // the GlobalSplash overlay is covering the screen anyway.
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "var(--color-background)", // Matches the splash bg so no white flash occurs
      }}
    />
  );
}
