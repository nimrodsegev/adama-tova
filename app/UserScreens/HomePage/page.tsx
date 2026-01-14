"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import OpenHours from "@/lib/components/UI/OpenHours";
import EmptyState from "@/lib/components/UI/EmptyState";
import styles from "./UserHomePage.module.css";

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
  instructor?: string;
}

const INTERESTS_MAPPING: Record<string, string> = {
  מיינדפולנס: "mindfulness",
  "גוף ותנועה": "body_motion",
  מוזיקה: "music_sound",
  "יצירה וחומר": "creation_material",
};

const OPENING_HOURS = {
  0: { open: "16:00", close: "22:00" },
  2: { open: "16:00", close: "22:00" },
  3: { open: "16:00", close: "22:00" },
};

export default function NewUserHomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [activeFilter, setActiveFilter] = useState<"recommended" | "yours">(
    "yours"
  );
  const [registeredActivities, setRegisteredActivities] = useState<Activity[]>(
    []
  );
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>(
    []
  );

  // Combine all loading states into one
  const [initialLoading, setInitialLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Responsive state for background circles
  const [bgCircleConfig, setBgCircleConfig] = useState({
    radius: 0.07,
    x: 0.47,
    y: 0.125,
  });

  const mountedRef = useRef(false);

  // Calculate shape parameters based on user profile
  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

  const todayHours = (() => {
    const today = new Date().getDay();
    // @ts-ignore
    return OPENING_HOURS[today] || null;
  })();

  // Handle Resize for BACKGROUND circles
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 380) {
        setBgCircleConfig({ radius: 0.07, x: 0.5, y: 0.125 });
      } else if (width > 600) {
        setBgCircleConfig({ radius: 0.12, x: 0.5, y: 0.15 });
      } else {
        setBgCircleConfig({ radius: 0.07, x: 0.47, y: 0.125 });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            (i: string) => INTERESTS_MAPPING[i] || i
          );
          finalSuggestions = suggList.filter((act: Activity) =>
            myInterestsEnglish.includes(act.category)
          );
        }

        setRegisteredActivities(regList);
        setSuggestedActivities(finalSuggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      // Small delay to ensure smooth fade out
      setTimeout(() => setInitialLoading(false), 500);
    }
  };

  const handleMotionState = async (state: "start" | "end") => {
    if (state === "start") {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 3000);
    } else {
      await fetchData();
      setIsProcessing(false);
    }
  };

  // Determine if we need to show the full-screen loader
  const showLoader = userLoading || initialLoading || isProcessing;

  const firstName = userProfile?.full_name?.split(" ")[0] || "משתמש";
  const displayedActivities =
    activeFilter === "yours"
      ? registeredActivities
      : suggestedActivities.slice(0, 4);

  return (
    <>
      {/* SMOOTH LOADER:
         Instead of "if (loading) return <Loader>", we render this ON TOP.
         We use CSS opacity/visibility to fade it out, keeping the DOM stable.
      */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background:
            "linear-gradient(180deg, #E74E1C 0%, #DE6930 53%, #E79267 87%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
          // CSS Transition Magic:
          opacity: showLoader ? 1 : 0,
          pointerEvents: showLoader ? "all" : "none",
          transition: "opacity 0.4s ease-in-out",
        }}
        dir="rtl"
      >
        <OrganicCircles
          mode="spouting"
          radius={0.35}
          {...shapeParams}
          baseColor="#FFFFFF"
          position={{ x: 0.5, y: 0.5 }}
        />
      </div>

      <div className={styles.pageContainer} dir="rtl">
        {/* Background Circles - These stay mounted underneath */}
        <OrganicCircles
          mode="breathing"
          radius={bgCircleConfig.radius}
          position={{ x: bgCircleConfig.x, y: bgCircleConfig.y }}
          layers={shapeParams.layers}
          smoothness={shapeParams.smoothness}
          complexity={shapeParams.complexity}
          elongation={shapeParams.elongation}
          opacity={shapeParams.opacity}
          strokeWidth={shapeParams.strokeWidth}
          baseColor="#FFFFFF"
        />

        {/* Main content fades IN as loader fades OUT.
           This overlap creates the smooth feel.
        */}
        <div
          className={styles.mainContent}
          style={{
            opacity: showLoader ? 0 : 1,
            transform: showLoader ? "translateY(20px)" : "translateY(0)",
            transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
            transitionDelay: "0.2s", // Wait slightly for loader to start fading
          }}
        >
          <div className={styles.greetingSection}>
            <h1 className={styles.greetingTitle}>היי {firstName},</h1>
            <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
          </div>

          {todayHours ? (
            <OpenHours startTime={todayHours.open} endTime={todayHours.close} />
          ) : (
            <div className={styles.closedMessage}>
              <p className={styles.closedText}>המרחב סגור היום</p>
            </div>
          )}

          <div className={styles.filterContainer}>
            <HomeFilter
              options={[
                {
                  id: "recommended",
                  label: "חשבנו שיעניין אותך",
                  count: suggestedActivities.length,
                },
                {
                  id: "yours",
                  label: "המפגשים שלך",
                  count: registeredActivities.length,
                },
              ]}
              activeOption={activeFilter}
              onFilterChange={(id) =>
                setActiveFilter(id as "recommended" | "yours")
              }
            />
          </div>

          <div className={styles.cardsContainer}>
            {displayedActivities.length > 0 ? (
              displayedActivities.map((activity) => (
                <NewUserActivityCard
                  key={activity.id}
                  id={activity.id}
                  title={activity.title}
                  instructor={activity.instructor || "מדריך"}
                  date={activity.date}
                  startTime={activity.start_time}
                  onMotionChange={handleMotionState}
                  isGroup={activity.is_group || !!activity.series_id}
                />
              ))
            ) : activeFilter === "yours" ? (
              <EmptyState
                message="אין לך מפגשים קרובים"
                buttonText="הוספת פעילות"
                buttonHref="/UserScreens/UserCalendarPage"
              />
            ) : (
              <EmptyState
                message="אין פעילויות רלוונטיות עבורך"
                buttonText="להוספת תחומי עניין"
                buttonHref="/ProfilePage"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
