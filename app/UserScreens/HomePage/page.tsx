"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import {
  HomeFilter,
  USER_FILTER_OPTIONS,
} from "@/lib/components/UI/HomeFilter";
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
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const mountedRef = useRef(false);

  // Calculate shape parameters based on user profile
  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

  // Get today's opening hours
  const getTodayHours = () => {
    const today = new Date().getDay();
    if (today in OPENING_HOURS) {
      return OPENING_HOURS[today as keyof typeof OPENING_HOURS];
    }
    return null;
  };

  const todayHours = getTodayHours();

  useEffect(() => {
    if (user && !mountedRef.current) {
      mountedRef.current = true;
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's registrations
      const { data: rawRegs } = await supabase
        .from("registrations")
        .select("activity_id, status")
        .eq("user_id", user!.id);

      const approvedIds = (rawRegs || [])
        .filter((r: any) => r.status === "approved")
        .map((r: any) => r.activity_id);

      const allInteractedIds = (rawRegs || []).map((r: any) => r.activity_id);

      // Fetch all activities and user branches
      const [[activities], [userBranches]] = await Promise.all([
        apiActivities.getAll() as Promise<[Activity[], any]>,
        apiUser.getUserBranches(user!.id),
      ]);

      if (activities && userBranches) {
        // Filter by user's branches
        const branchFiltered = activities.filter(
          (act: Activity) => !act.branch || userBranches.includes(act.branch)
        );

        // Process list to remove duplicate series
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

        // Get registered activities
        const regList = processList(
          branchFiltered.filter((act: Activity) => approvedIds.includes(act.id))
        );

        // Get suggested activities (not interacted with)
        const candidates = branchFiltered.filter(
          (act: Activity) => !allInteractedIds.includes(act.id)
        );
        const suggList = processList(candidates);

        // Filter suggestions by user interests if available
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
      setLoading(false);
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

  if (userLoading || loading) {
    return (
      <div className={styles.loadingContainer} dir="rtl">
        <OrganicCircles
          mode="loading"
          radius={0.07}
          {...shapeParams}
          baseColor="#FFFFFF"
        />
      </div>
    );
  }

  const firstName = userProfile?.full_name?.split(" ")[0] || "משתמש";
  const displayedActivities =
    activeFilter === "yours"
      ? registeredActivities
      : suggestedActivities.slice(0, 4);

  return (
    <>
      {/* Transition Modal - Shows during processing */}
      {isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            background:
              "linear-gradient(180deg, #E74E1C 0%, #DE6930 53%, #E79267 87%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "all",
          }}
        >
          <OrganicCircles
            mode="breathing"
            radius={0.25}
            {...shapeParams}
            baseColor="#FFFFFF"
            position={{ x: 0.5, y: 0.5 }}
          />
        </div>
      )}

      <div className={styles.pageContainer} dir="rtl">
        {/* Decorative Circles - using calculated parameters with radius 0.07 */}
        <OrganicCircles
          mode="breathing"
          radius={0.07}
          layers={shapeParams.layers}
          smoothness={shapeParams.smoothness}
          complexity={shapeParams.complexity}
          elongation={shapeParams.elongation}
          opacity={shapeParams.opacity}
          strokeWidth={shapeParams.strokeWidth}
          position={{ x: 0.5, y: 0.1 }}
          baseColor="#FFFFFF"
        />

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Greeting Section */}
          <div className={styles.greetingSection}>
            <h1 className={styles.greetingTitle}>היי {firstName},</h1>
            <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
          </div>

          {/* Opening Hours Component */}
          {todayHours ? (
            <OpenHours startTime={todayHours.open} endTime={todayHours.close} />
          ) : (
            <div className={styles.closedMessage}>
              <p className={styles.closedText}>המרחב סגור היום</p>
            </div>
          )}

          {/* Filter Tabs */}
          <div className={styles.filterContainer}>
            <HomeFilter
              options={USER_FILTER_OPTIONS}
              activeOption={activeFilter}
              onFilterChange={(id) =>
                setActiveFilter(id as "recommended" | "yours")
              }
            />
          </div>

          {/* Section Title - without counts */}
          <h2 className={styles.sectionTitle}>
            {activeFilter === "recommended"
              ? "חשבנו שיעניין אותך"
              : "המפגשים שלך"}
          </h2>

          {/* Cards Container */}
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
            ) : // Empty State - Different messages based on active filter
            activeFilter === "yours" ? (
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
