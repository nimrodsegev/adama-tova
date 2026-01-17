"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import OpenHours from "@/lib/components/UI/OpenHours";
import EmptyState from "@/lib/components/UI/EmptyState";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

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
  5: { open: "16:00", close: "22:00" },
};

const isActivityInFuture = (activity: Activity) => {
  if (!activity.date) return false;
  const timeString = activity.start_time || "00:00";
  const activityDateTime = new Date(`${activity.date}T${timeString}`);
  return activityDateTime >= new Date();
};

export default function NewUserHomePage() {
  const { user, userProfile } = useUser();
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
  const [motionMode, setMotionMode] = useState<"spouting" | "breathing">(
    "spouting"
  );

  // ⭐ NEW: Control Z-Index for smooth nav vs. registration coverage
  const [coverNav, setCoverNav] = useState(false);

  // Note: We keep the circle config state even if we simplify positioning
  // to maintain the logic, but the CSS now controls the container position.
  const [bgCircleConfig, setBgCircleConfig] = useState({
    radius: 0.09, // Increased default radius for the new layout
    x: 0.47,
    y: 0.1, // Centered in the new container
  });

  const mountedRef = useRef(false);
  const shapeParams = userProfile ? calculateShapeParams(userProfile) : {};

  const todayHours = (() => {
    const today = new Date().getDay();
    // @ts-ignore
    return OPENING_HOURS[today] || null;
  })();

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
        let validActivities = activities.filter(
          (act: Activity) => !act.branch || userBranches.includes(act.branch)
        );

        validActivities = validActivities.filter(isActivityInFuture);

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
          validActivities.filter((act: Activity) =>
            approvedIds.includes(act.id)
          )
        );

        const candidates = validActivities.filter(
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
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleMotionState = async (
    state: "start" | "end",
    skipFetch?: boolean
  ) => {
    if (state === "start") {
      // ⭐ Action Start: Raise Z-Index to cover NavBar
      setCoverNav(true);

      setMotionMode("breathing");
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 5000);
    } else {
      if (!skipFetch) {
        await fetchData();
      }
      setIsProcessing(false);

      // ⭐ Action End: Reset Z-Index after animation delay
      setTimeout(() => {
        setCoverNav(false);
        setMotionMode("spouting");
      }, 1000);
    }
  };

  const firstName = userProfile?.full_name?.split(" ")[0] || "משתמש";
  const displayedActivities =
    activeFilter === "yours"
      ? registeredActivities
      : suggestedActivities.slice(0, 4);

  return (
    <SmoothPageWrapper
      isLoading={loading || isProcessing}
      mode={motionMode}
      // ⭐ Pass the prop to control Z-Index
      coverNavigation={coverNav}
    >
      {/* Flattened Structure matching Admin Page */}
      <div className={styles.pageContainer} dir="rtl">
        {/* 1. Open Hours */}
        <div className={styles.openHoursWrapper}>
          {todayHours ? (
            <OpenHours
              startTime={todayHours.open}
              endTime={todayHours.close}
              isOpen={true}
            />
          ) : (
            <OpenHours isOpen={false} />
          )}
        </div>

        {/* 2. Circles (Static Position in flow) */}
        <div className={styles.circlesContainer}>
          <OrganicCircles
            mode="breathing"
            radius={bgCircleConfig.radius}
            position={{ x: bgCircleConfig.x, y: bgCircleConfig.y }}
            // @ts-ignore
            {...shapeParams}
            baseColor="#FFFFFF"
          />
        </div>

        {/* 3. Greeting */}
        <div className={styles.greetingSection}>
          <h1 className={styles.greetingTitle}>היי {firstName},</h1>
          <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
        </div>

        {/* 4. Filter */}
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

        {/* 5. Cards List */}
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
    </SmoothPageWrapper>
  );
}
