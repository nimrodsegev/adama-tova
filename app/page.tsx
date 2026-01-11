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
        minHeight: "100dvh",
        paddingTop: "env(safe-area-inset-top, 0)",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
        background: "linear-gradient(180deg, #E74E1C 0%, #DE6930 53%, #E79267 87%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#EFEFEF",
        fontFamily: "Ezer Shemesh TRIAL ONLY, sans-serif",
        fontSize: "1.25rem",
      }}
      dir="rtl"
    >
      טוען...
    </div>
  );
}
