"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/contexts/UserContext";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import Button from "@/lib/components/UI/Button";
import styles from "./page.module.css";

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = createClient();
  const { userProfile, loading } = useUser();

  // Default params for loading state
  const defaultParams = useMemo(() => calculateShapeParams(null), []);

  // Calculate circle parameters from user profile - memoized to prevent recalculation
  const circleParams = useMemo(() => {
    return userProfile ? calculateShapeParams(userProfile) : defaultParams;
  }, [userProfile, defaultParams]);

  // Poll for approval status changes
  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("users")
          .select("is_approved, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.is_approved) {
          // User has been approved - redirect to home
          if (profile.role === "admin") {
            router.replace("/AdminScreens/HomePage");
          } else {
            router.replace("/UserScreens/HomePage");
          }
        }
      } catch (error) {
        // Silently ignore errors - will retry on next poll
      }
    };

    // Check immediately on mount
    checkApprovalStatus();

    // Then check every 5 seconds
    const interval = setInterval(checkApprovalStatus, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      {/* OrganicCircles with calculated parameters */}
      <OrganicCircles
        key={`pending-approval-${circleParams.layers}-${circleParams.complexity}`}
        mode="breathing"
        radius={0.35}
        layers={circleParams.layers}
        smoothness={circleParams.smoothness}
        complexity={circleParams.complexity}
        elongation={circleParams.elongation}
        opacity={circleParams.opacity}
        strokeWidth={circleParams.strokeWidth}
        position={{ x: 0.5, y: 0.5 }}
        baseColor="#FFFFFF"
      />

      <div className={styles.content}>
        {/* Main message */}
        <div className={styles.messageBox}>
          <p className={styles.mainText}>
            <span>כמעט שם...</span>
            <span>הפרטים שלך בבדיקה,</span>
            <span>נעדכן כשהגישה תיפתח.</span>
          </p>
        </div>

        {/* Contact info */}
        <p className={styles.contactText}>
          [לסיוע ויצירת קשר: [להשלים כתובת מייל
        </p>

        {/* Back to registration button */}
        <div className={styles.backButtonWrapper}>
          <Button variant="primary" onClick={handleBackToLogin}>
            לעמוד ההרשמה
          </Button>
        </div>
      </div>
    </div>
  );
}
