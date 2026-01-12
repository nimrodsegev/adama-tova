"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser } from "@/app/services/db_api";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

// UI Components
import DaySlider from "@/lib/components/UI/DaySlider";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserScheduleActivityCard from "@/lib/components/UI/NewUserScheduleActivityCard";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";

import styles from "./NewUserCalendarPage.module.css";

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
  const [activities, setActivities] = useState<any[]>([]);
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
      // Force delay + API call
      const [[actData, actError], [userBranches]] = await Promise.all([
        apiActivities.getByDate(dateString),
        user ? apiUser.getUserBranches(user.id) : Promise.resolve([null, null]),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);

      if (!actError) {
        const validBranches = userBranches || ["nahalal", "satria"];
        const filtered = actData.filter(
          (a: any) => !a.branch || validBranches.includes(a.branch)
        );
        // Populate with new data
        setActivities(filtered);
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

  const filteredActivities = activities.filter((activity: any) => {
    if (filter === "all") return true;
    if (filter === "foryou" && userProfile?.quiz?.interests) {
      const myInterests = userProfile.quiz.interests.map(
        (i: string) => INTRESTS_MAPPING[i] || i
      );
      return myInterests.includes(activity.category);
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
            radius={0.25}
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
              size="small"
              options={CALENDAR_FILTERS}
              activeOption={filter}
              onFilterChange={(newId) => setFilter(newId)}
            />
          </div>

          <div className={styles.activitiesList}>
            {filteredActivities.length > 0
              ? filteredActivities.map((activity) => (
                  <NewUserScheduleActivityCard
                    key={activity.id}
                    id={activity.id}
                    title={activity.title}
                    date={activity.date}
                    startTime={activity.start_time}
                    endTime={activity.end_time}
                    currentParticipants={activity.current_participants || 0}
                    maxParticipants={activity.max_participants || 0}
                    waitlistCount={activity.waitlist_count || 0}
                    onRegistrationChange={fetchData}
                    onMotionChange={handleMotionState}
                    isGroup={activity.is_group || !!activity.series_id}
                  />
                ))
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
