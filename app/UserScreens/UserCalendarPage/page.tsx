"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";

// UI Components
import DaySlider from "@/lib/components/UI/DaySlider";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

// Import the calculator
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

import styles from "./UserCalendarPage.module.css";

const INTRESTS_MAPPING: Record<string, string> = {
  מיינדפולנס: "mindfulness",
  "גוף ותנועה": "body_motion",
  מוזיקה: "music_sound",
  "יצירה וחומר": "creation_material",
};

const isActivityInFuture = (activity: any) => {
  if (!activity.date) return false;
  const timeString = activity.start_time || "00:00";
  const activityDateTime = new Date(`${activity.date}T${timeString}`);
  return activityDateTime >= new Date();
};

export default function NewUserCalendarPage() {
  const { user, userProfile } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Data State
  const [activities, setActivities] = useState<any[]>([]);
  const [registeredActivityIds, setRegisteredActivityIds] = useState<string[]>(
    []
  );

  // UI State
  const [filter, setFilter] = useState("all");

  // Loading States
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Motion Mode State
  const [motionMode, setMotionMode] = useState<"spouting" | "breathing">(
    "spouting"
  );

  const [coverNav, setCoverNav] = useState(false);
  const mounted = useRef(false);

  // Calculate Shape Params based on user profile
  const shapeParams =
    userProfile?.role === "participant"
      ? calculateShapeParams(userProfile)
      : calculateShapeParams(null);

  const fetchData = async () => {
    // If switching dates, show Overlay Loader and clear list
    if (mounted.current) {
      setIsListLoading(true);
      setActivities([]);
    }

    const dateString = selectedDate.toISOString().split("T")[0];

    try {
      const registrationsPromise = user
        ? supabase
            .from("registrations")
            .select("activity_id")
            .eq("user_id", user.id)
            .in("status", ["confirmed", "waitlist", "approved"])
        : Promise.resolve({ data: [] });

      const [[actData, actError], [userBranches], { data: rawRegs }, _] =
        await Promise.all([
          apiActivities.getByDate(dateString),
          user
            ? apiUser.getUserBranches(user.id)
            : Promise.resolve([null, null]),
          registrationsPromise,
          new Promise((resolve) => setTimeout(resolve, 500)), // Smooth animation delay
        ]);

      if (!actError) {
        const validBranches = userBranches || ["nahalal", "satria"];

        let filtered = actData.filter(
          (a: any) => !a.branch || validBranches.includes(a.branch)
        );

        filtered = filtered.filter(isActivityInFuture);
        setActivities(filtered);
      }

      if (rawRegs) {
        const ids = rawRegs.map((r: any) => r.activity_id);
        setRegisteredActivityIds(ids);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInitialLoad(false);
      setIsListLoading(false);
      mounted.current = true;
    }
  };

  const handleMotionState = async (
    state: "start" | "end",
    skipFetch?: boolean
  ) => {
    if (state === "start") {
      setCoverNav(true);
      // ⭐ UPDATED: Use "spouting" to match Home Page registration effect
      setMotionMode("spouting");
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 5000);
    } else {
      if (!skipFetch) {
        await fetchData();
      }
      setIsProcessing(false);

      setTimeout(() => {
        setCoverNav(false);
        setMotionMode("spouting");
      }, 1000);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, user]);

  // --- FILTER LOGIC ---
  const forYouActivities = activities.filter((activity) => {
    const isRegistered = registeredActivityIds.includes(activity.id);
    let isInterested = false;
    if (userProfile?.quiz?.interests) {
      const myInterests = userProfile.quiz.interests.map(
        (i: string) => INTRESTS_MAPPING[i] || i
      );
      isInterested = myInterests.includes(activity.category);
    }
    return isRegistered || isInterested;
  });

  const dynamicFilters = [
    { id: "all", label: "הכל", count: activities.length },
    { id: "foryou", label: "בשבילך", count: forYouActivities.length },
  ];

  const displayedActivities = filter === "all" ? activities : forYouActivities;

  return (
    <SmoothPageWrapper
      isLoading={isInitialLoad || isProcessing}
      mode={motionMode}
      coverNavigation={coverNav}
      // ⭐ UPDATED: Added radiusScale and customPosition to match Home Page logic
      radiusScale={coverNav ? 1.5 : 1.0}
      customPosition={coverNav ? { x: 0.5, y: 0.45 } : undefined}
    >
      <div className={styles.pageContainer}>
        {/* LOADING OVERLAY */}
        {isListLoading && (
          <div className={styles.loadingOverlay}>
            <OrganicCircles
              mode="loading"
              radius={0.08}
              baseColor="#FFFFFF"
              // @ts-ignore
              {...shapeParams}
            />
          </div>
        )}

        {/* Title Container */}
        <div className={styles.titleContainer}>
          <h1 className={styles.titleText}>לוח פעילויות</h1>
        </div>

        {/* Slider Section */}
        <div className={styles.sliderSection}>
          <DaySlider
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Filter Section */}
        <div className={styles.filterSection}>
          <HomeFilter
            options={dynamicFilters}
            activeOption={filter}
            onFilterChange={(newId) => setFilter(newId)}
          />
        </div>

        {/* Content Container with Activities List */}
        <div className={styles.contentContainer}>
          <div className={styles.activitiesList}>
            {displayedActivities.length > 0
              ? displayedActivities.map((activity) => (
                  <div key={activity.id} className={styles.activityItem}>
                    <NewUserActivityCard
                      id={activity.id}
                      title={activity.title}
                      instructor={activity.instructor || "לא צוין"}
                      date={activity.date}
                      startTime={activity.start_time}
                      currentParticipants={activity.current_participants || 0}
                      maxParticipants={activity.max_participants || 0}
                      waitlistCount={activity.waitlist_count || 0}
                      isGroup={activity.is_group || !!activity.series_id}
                      onMotionChange={handleMotionState}
                    />
                  </div>
                ))
              : !isListLoading && (
                  <p className={styles.emptyText}>אין פעילויות ליום זה</p>
                )}
          </div>
        </div>
      </div>
    </SmoothPageWrapper>
  );
}
