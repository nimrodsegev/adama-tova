"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import ScheduleActivityCard from "@/lib/components/WeeklyBoard/ScheduleActivityCard";
import OrganicCircles, {
  OrganicCirclesRef,
} from "@/lib/components/OrganicCircles/OrganicCircles";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import styles from "./UserCalendarPage.module.css";

// Interests Mapping (same as HomePage)
const INTRESTS_MAPPING: Record<string, string> = {
  מדיטציה: "Meditation",
  יוגה: "Yoga",
  אומנות: "Art",
  כתיבה: "Writing",
  מיינדפולנס: "Mindfulness",
  יצירה: "Crafts",
};

export default function UserCalendarPage() {
  const { user, userProfile } = useUser();
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "foryou">("all");
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week

  // 🔵 Organic Circles ref for imperative controls if needed
  const circlesRef = useRef<OrganicCirclesRef>(null);

  // 🎨 Calculate shape parameters based on user profile (Native Ranges: 0-1, 0-5)
  const shapeParams = calculateShapeParams(userProfile);

  // Closed days: Monday(1), Thursday(4), Friday(5), Saturday(6)
  const closedDays = [1, 4, 5, 6];
  const isDayClosed = closedDays.includes(selectedDayIndex);

  const getWeekStartDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = -dayOfWeek;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + diff + weekOffset * 7);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  };

  const goToPreviousWeek = () => {
    if (weekOffset > 0) setWeekOffset(weekOffset - 1);
  };
  const goToNextWeek = () => {
    if (weekOffset < 1) setWeekOffset(weekOffset + 1);
  };

  const isCurrentWeek = weekOffset === 0;
  const isNextWeek = weekOffset === 1;

  const getSelectedDateObject = () => {
    const weekStart = getWeekStartDate();
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDateObj = getSelectedDateObject();

  const fetchData = async () => {
    if (isDayClosed) {
      setActivities([]);
      return;
    }

    setLoading(true);

    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDateObj.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Force delay to ensure the organic loading animation is visible
    await new Promise((resolve) => setTimeout(resolve, 750));

    try {
      const [[actData, actError], [userBranches, branchError]] =
        await Promise.all([
          apiActivities.getByDate(dateString),
          user
            ? apiUser.getUserBranches(user.id)
            : Promise.resolve([null, null]),
        ]);

      if (actError) console.error("Error fetching activities:", actError);

      const rawActivities = actData || [];
      const validBranches = userBranches || ["nahalal", "satria"];

      const branchFilteredActivities = rawActivities.filter((activity: any) => {
        return !activity.branch || validBranches.includes(activity.branch);
      });

      setActivities(branchFilteredActivities);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDayIndex, weekOffset, user]);

  const getFilteredActivities = () => {
    if (filter === "all") return activities;
    if (filter === "foryou" && userProfile?.quiz?.interests) {
      const myInterestsEnglish = userProfile.quiz.interests.map(
        (interest: string) => INTRESTS_MAPPING[interest] || interest
      );
      return activities.filter((activity: any) =>
        myInterestsEnglish.includes(activity.category)
      );
    }
    return activities;
  };

  const filteredActivities = getFilteredActivities();

  const getWeekDisplayText = () => {
    const weekStart = getWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const formatDate = (date: Date) =>
      `${date.getDate()}.${date.getMonth() + 1}`;
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  return (
    <div className="mobile-container">
      {/* 🔵 Organic Circles Loading Overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(242, 129, 48, 0.3)", // Subtle orange tint to background while loading
          }}
        >
          <OrganicCircles
            ref={circlesRef}
            mode="loading"
            radius={0.08}
            // Spreading unified shape parameters (complexity, smoothness, elongation, opacity, strokeWidth)
            {...shapeParams}
            baseColor="#FFFFFF"
            position={{ x: 0.5, y: 0.5 }}
          />
        </div>
      )}

      <div className={styles.mainFrame}>
        <div className={styles.headerSection}>
          <div className={styles.topRow}>
            <h1 className="header-secondary">לוח פעילויות</h1>

            <div className={styles.filterRow}>
              <span
                className={
                  filter === "all"
                    ? "filter-button filter-button-active"
                    : "filter-button"
                }
                onClick={() => setFilter("all")}
              >
                הכל
              </span>
              <span
                className={
                  filter === "foryou"
                    ? "filter-button filter-button-active"
                    : "filter-button"
                }
                onClick={() => setFilter("foryou")}
              >
                בשבילך
              </span>
            </div>
          </div>

          <div className={styles.weekNavigation}>
            <button
              className={styles.weekNavButton}
              style={{ opacity: isCurrentWeek ? 0.5 : 1 }}
              onClick={goToPreviousWeek}
              disabled={isCurrentWeek}
            >
              ‹
            </button>

            <span className={styles.weekDisplay}>
              {isCurrentWeek ? "השבוע" : "השבוע הבא"} ({getWeekDisplayText()})
            </span>

            <button
              className={styles.weekNavButton}
              style={{ opacity: isNextWeek ? 0.5 : 1 }}
              onClick={goToNextWeek}
              disabled={isNextWeek}
            >
              ›
            </button>
          </div>

          <DaySlider
            selectedDayIndex={selectedDayIndex}
            onDaySelect={setSelectedDayIndex}
            currentWeekStart={getWeekStartDate()}
          />
        </div>

        <div className={styles.activitiesList}>
          {isDayClosed ? (
            <p className={styles.closedMessage}>המרחב סגור היום</p>
          ) : loading ? (
            <div style={{ minHeight: "200px" }} />
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <ScheduleActivityCard
                key={activity.id}
                {...activity}
                onRegistrationChange={fetchData}
                isGroup={activity.is_group || !!activity.series_id}
              />
            ))
          ) : (
            <p className="text-empty">אין פעילויות ליום זה</p>
          )}
        </div>
      </div>
    </div>
  );
}
