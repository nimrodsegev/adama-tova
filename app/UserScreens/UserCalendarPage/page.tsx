"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

// UI Components
import DaySlider from "@/lib/components/UI/DaySlider";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserScheduleActivityCard from "@/lib/components/UI/NewUserScheduleActivityCard";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

import styles from "./UserCalendarPage.module.css";

const CALENDAR_FILTERS = [
  { id: "all", label: "הכל" },
  { id: "foryou", label: "בשבילך" },
];

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
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

  const fetchData = async () => {
    // Clear activities and start loading
    setActivities([]);
    setLoading(true);

    const dateString = selectedDate.toISOString().split("T")[0];

    try {
      // 1. Prepare Supabase query for registrations (Active only)
      const registrationsPromise = user
        ? supabase
            .from("registrations")
            .select("activity_id")
            .eq("user_id", user.id)
            .in("status", ["confirmed", "waitlist", "approved"])
        : Promise.resolve({ data: [] });

      // 2. Execute all fetches + Delay
      const [
        [actData, actError],
        [userBranches],
        { data: rawRegs },
        _, // Delay result
      ] = await Promise.all([
        apiActivities.getByDate(dateString),
        user ? apiUser.getUserBranches(user.id) : Promise.resolve([null, null]),
        registrationsPromise,
        new Promise((resolve) => setTimeout(resolve, 500)), // Force 0.5s delay
      ]);

      // 3. Process Activities
      if (!actError) {
        const validBranches = userBranches || ["nahalal", "satria"];
        const filtered = actData.filter(
          (a: any) => !a.branch || validBranches.includes(a.branch)
        );
        setActivities(filtered);
      }

      // 4. Process Registrations
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

  const handleMotionState = async (state: "start" | "end") => {
    if (state === "start") {
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 3000);
    } else {
      await fetchData();
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, user]);

  // 🔍 Updated Filtering Logic
  const filteredActivities = activities.filter((activity: any) => {
    if (filter === "all") return true;

    if (filter === "foryou") {
      // Condition A: User is registered
      const isRegistered = registeredActivityIds.includes(activity.id);

      // Condition B: Matches Interests
      let isInterested = false;
      if (userProfile?.quiz?.interests) {
        const myInterests = userProfile.quiz.interests.map(
          (i: string) => INTRESTS_MAPPING[i] || i
        );
        isInterested = myInterests.includes(activity.category);
      }

      // Return true if EITHER is true
      return isRegistered || isInterested;
    }

    return true;
  });

  return (
    <>
      {/* Motion overlay - Shows during registration/cancellation */}
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
            radius={0.3}
            {...shapeParams}
            baseColor="#FFFFFF"
            position={{ x: 0.5, y: 0.5 }}
          />
        </div>
      )}

      <div className={styles.pageContainer}>
        {/* Loading overlay - Shows during data fetch */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <OrganicCircles
              mode="loading"
              radius={0.08}
              {...shapeParams}
              baseColor="#FFFFFF"
            />
          </div>
        )}

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
              options={CALENDAR_FILTERS}
              activeOption={filter}
              onFilterChange={(newId) => setFilter(newId)}
            />
          </div>

          <div className={styles.activitiesList}>
            {filteredActivities.length > 0
              ? filteredActivities.map((activity) => {
                  const isRegistered = registeredActivityIds.includes(
                    activity.id
                  );
                  return (
                    <NewUserScheduleActivityCard
                      key={activity.id}
                      id={activity.id}
                      title={activity.title}
                      date={activity.date}
                      instructor={activity.instructor || "לא צוין"}
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
                    style={{ color: "white", marginTop: "2rem" }}
                  >
                    אין פעילויות ליום זה
                  </p>
                )}
          </div>
        </main>
      </div>
    </>
  );
}
