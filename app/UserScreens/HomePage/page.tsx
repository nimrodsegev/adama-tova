"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import UserActivityCard from "@/lib/components/Home/UserActivityCard";
import EmptyState from "@/lib/components/UI/EmptyState";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

interface Activity {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  description: string;
  category: string;
  branch?: string;
  series_id?: string;
  is_group?: boolean;
}

const INTRESTS_MAPPING: Record<string, string> = {
  מדיטציה: "Meditation",
  יוגה: "Yoga",
  אומנות: "Art",
  כתיבה: "Writing",
  מיינדפולנס: "Mindfulness",
  יצירה: "Crafts",
};

const OPENING_HOURS = {
  0: { open: "16:00", close: "22:00" },
  2: { open: "16:00", close: "22:00" },
  3: { open: "16:00", close: "22:00" },
};

export default function HomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [registeredActivities, setRegisteredActivities] = useState<Activity[]>(
    []
  );
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const mountedRef = useRef(false);

  const shapeParams = calculateShapeParams(userProfile);

  useEffect(() => {
    if (user && !mountedRef.current) {
      mountedRef.current = true;
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: rawRegs } = await supabase
        .from("registrations")
        .select("activity_id, status")
        .eq("user_id", user!.id);
      const approvedIds = (rawRegs || [])
        .filter((r: any) => r.status === "approved")
        .map((r: any) => r.activity_id);
      const allInteractedIds = (rawRegs || []).map((r: any) => r.activity_id);

      const [[activities], [userBranches]] = await Promise.all([
        apiActivities.getAll() as Promise<[Activity[], any]>,
        apiUser.getUserBranches(user!.id),
      ]);

      if (activities && userBranches) {
        const branchFiltered = activities.filter(
          (act: Activity) => !act.branch || userBranches.includes(act.branch)
        );

        const processList = (list: Activity[]) => {
          const unique: Activity[] = [];
          const seen = new Set<string>();
          list.forEach((act: Activity) => {
            if (!act.series_id || !seen.has(act.series_id)) {
              if (act.series_id) seen.add(act.series_id);
              unique.push(act);
            }
          });
          return unique;
        };

        const regList = processList(
          branchFiltered.filter((act: Activity) => approvedIds.includes(act.id))
        );
        const candidates = branchFiltered.filter(
          (act: Activity) => !allInteractedIds.includes(act.id)
        );
        const suggList = processList(candidates);

        let finalSuggestions = suggList;
        if (userProfile?.quiz?.interests?.length) {
          const myInterestsEnglish = userProfile.quiz.interests.map(
            (i: string) => INTRESTS_MAPPING[i] || i
          );
          finalSuggestions = suggList.filter((act: Activity) =>
            myInterestsEnglish.includes(act.category)
          );
        }

        setRegisteredActivities(regList);
        setAllActivities(finalSuggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMotionState = async (state: "start" | "end") => {
    if (state === "start") {
      setIsProcessing(true);
      // 🎯 FIX 1: Reduced timeout from 12s to 3s
      // This ensures motion shows for max 3 seconds before auto-hiding
      setTimeout(() => setIsProcessing(false), 3000);
    } else {
      // 🎯 FIX 2: Fetch data THEN hide motion
      // This ensures page is ready before revealing
      await fetchData();
      setIsProcessing(false);
    }
  };

  const getStatusMessage = () => {
    const today = new Date().getDay();
    if (today in OPENING_HOURS)
      return `שעות הפעילות היום: ${
        OPENING_HOURS[today as keyof typeof OPENING_HOURS].open
      } עד ${OPENING_HOURS[today as keyof typeof OPENING_HOURS].close}`;
    return "המרחב סגור היום";
  };

  if (userLoading || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F28130",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <OrganicCircles
          mode="loading"
          radius={0.1}
          {...shapeParams}
          baseColor="#FFFFFF"
        />
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* 🔵 THE TRANSITION MODAL - Shows during processing */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            backgroundColor: "#F28130",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
          }}
        >
          <OrganicCircles
            mode="breathing"
            radius={0.25} // 🎨 SIZE: Smaller motion (was 0.3)
            {...shapeParams}
            baseColor="#FFFFFF"
            position={{ x: 0.5, y: 0.5 }}
          />
        </div>
      )}

      <div className="vector-background" />
      <h1 className="header-primary absolute-header">
        היי {userProfile?.full_name?.split(" ")[0] || ""},
      </h1>
      <p className="text-subtitle absolute-subtitle">המרחב כאן בשבילך.</p>
      <p className="text-small absolute-status">{getStatusMessage()}</p>

      <div className="main-content">
        <section className="section">
          <h2 className="text-section-title">המפגשים הבאים שלך:</h2>
          <div className="horizontal-scroll">
            {registeredActivities.length > 0 ? (
              registeredActivities.map((act: Activity) => (
                <div key={act.id} className="glass-card">
                  <UserActivityCard
                    {...act}
                    onMotionChange={handleMotionState}
                    isGroup={act.is_group || !!act.series_id}
                  />
                </div>
              ))
            ) : (
              <EmptyState
                message="נראה שאין לך מפגשים השבוע"
                buttonText="+ הוספת פעילות"
                buttonHref="/UserScreens/UserCalendarPage"
              />
            )}
          </div>
        </section>

        <section className="section">
          <h2 className="text-section-title">חשבנו שיעניין אותך:</h2>
          <div className="horizontal-scroll">
            {allActivities.slice(0, 4).map((act: Activity) => (
              <div key={act.id} className="glass-card">
                <UserActivityCard
                  {...act}
                  onMotionChange={handleMotionState}
                  isGroup={act.is_group || !!act.series_id}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
