"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin homepage immediately
    router.replace("/AdminScreens/HomePage");
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
