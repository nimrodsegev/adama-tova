"use client";

import { useUser } from "@/app/contexts/UserContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we are DONE loading and there is NO user
    if (!loading && !user) {
      router.push("/login");
    }

    // TODO: Admin check logic would go here
  }, [user, loading, router, requireAdmin]);

  // If we are finished loading and have no user, render nothing (waiting for redirect)
  if (!loading && !user) {
    return null;
  }

  // RENDER CHILDREN IMMEDIATELY (Even while loading)
  // This allows ProfilePage to render its SmoothPageWrapper with isLoading={true}
  return <>{children}</>;
}
