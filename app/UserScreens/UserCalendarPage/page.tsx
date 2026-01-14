"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";

// UI Components
import DaySlider from "@/lib/components/UI/DaySlider";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserScheduleActivityCard from "@/lib/components/UI/NewUserScheduleActivityCard";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";

import styles from "./UserCalendarPage.module.css";

const INTRESTS_MAPPING: Record<string, string> = {
  מיינדפולנס: "mindfulness",
  "גוף ותנועה": "body_motion",
  מוזיקה: "music_sound",
  "יצירה וחומר": "creation_material",
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
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Motion Mode State
  const [motionMode, setMotionMode] = useState<"spouting" | "breathing">(
    "spouting"
  );

  const fetchData = async () => {
    setLoading(true);
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
          new Promise((resolve) => setTimeout(resolve, 500)),
        ]);

      if (!actError) {
        const validBranches = userBranches || ["nahalal", "satria"];
        const filtered = actData.filter(
          (a: any) => !a.branch || validBranches.includes(a.branch)
        );
        setActivities(filtered);
      }

      if (rawRegs) {
        const ids = rawRegs.map((r: any) => r.activity_id);
        setRegisteredActivityIds(ids);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMotionState = async (
    state: "start" | "end",
    skipFetch?: boolean
  ) => {
    if (state === "start") {
      setMotionMode("breathing");
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 5000);
    } else {
      if (!skipFetch) {
        await fetchData();
      }
      setIsProcessing(false);
      setTimeout(() => setMotionMode("spouting"), 1000);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, user]);

  // --- 1. FILTER LOGIC & COUNTS ---

  // A. Calculate "For You" list separately to get the count
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

  // B. Define the dynamic filter options
  const dynamicFilters = [
    {
      id: "all",
      label: "הכל",
      count: activities.length, // Total count
    },
    {
      id: "foryou",
      label: "בשבילך",
      count: forYouActivities.length, // Personalized count
    },
  ];

  // C. Determine which list to display based on active filter
  const displayedActivities = filter === "all" ? activities : forYouActivities;

  return (
    <SmoothPageWrapper isLoading={loading || isProcessing} mode={motionMode}>
      <div className={styles.pageContainer}>
        <main className={styles.mainFrame}>
          <div className={styles.titleContainer}>
            <h1 className={styles.titleText}>לוח פעילויות</h1>
          </div>

          <div className={styles.sliderSection}>
            <DaySlider
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          <div className={styles.filterSection}>
            <HomeFilter
              options={dynamicFilters} // Pass the dynamic options with counts
              activeOption={filter}
              onFilterChange={(newId) => setFilter(newId)}
            />
          </div>

          <div className={styles.activitiesList}>
            {displayedActivities.length > 0
              ? displayedActivities.map((activity) => {
                  const isRegistered = registeredActivityIds.includes(
                    activity.id
                  );
                  return (
                    <NewUserScheduleActivityCard
                      key={activity.id}
                      id={activity.id}
                      title={activity.title}
                      instructor={activity.instructor || "לא צוין"}
                      date={activity.date}
                      startTime={activity.start_time}
                      endTime={activity.end_time}
                      currentParticipants={activity.current_participants || 0}
                      maxParticipants={activity.max_participants || 0}
                      waitlistCount={activity.waitlist_count || 0}
                      isGroup={activity.is_group || !!activity.series_id}
                      isRegistered={isRegistered}
                      onRegistrationChange={fetchData}
                      onMotionChange={handleMotionState}
                    />
                  );
                })
              : !loading && (
                  <p
                    className="text-empty"
                    style={{
                      color: "white",
                      marginTop: "2rem",
                      textAlign: "center",
                    }}
                  >
                    אין פעילויות ליום זה
                  </p>
                )}
          </div>
        </main>
      </div>
    </SmoothPageWrapper>
  );
}
