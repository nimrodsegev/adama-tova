/**
 * ADMIN PROFILE COMPLETION PAGE
 * Simple form for admin users - only collects name and phone.
 * After submission, redirects to /AdminScreens.
 */

"use client";

import { useUser } from "@/app/contexts/UserContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminQuizModal from "@/lib/components/AdminQuizModal";

export default function CompleteProfileAdminPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>טוען...</div>;
  }

  return <AdminQuizModal userId={user.id} userEmail={user.email || ""} />;
}
