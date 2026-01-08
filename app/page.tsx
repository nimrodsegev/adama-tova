"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/contexts/UserContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    // Only redirect to login if:
    // 1. Auth check is complete (loading = false)
    // 2. No user is logged in
    // If user IS logged in, UserProvider will redirect to the correct dashboard
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Show loading state while checking auth or while UserProvider redirects
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F28130",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
        fontSize: "1.25rem",
      }}
    >
      טוען...
    </div>
  );
}
