"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page immediately
    router.replace("/login");
  }, [router]);

  // Show loading state while redirecting
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
