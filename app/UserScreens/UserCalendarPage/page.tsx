"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import {
  apiActivities,
  apiRegistrations,
  apiUser,
} from "@/app/services/db_api";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import ScheduleActivityCard from "@/lib/components/WeeklyBoard/ScheduleActivityCard";
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

  // Closed days: Monday(1), Thursday(4), Friday(5), Saturday(6)
  const closedDays = [1, 4, 5, 6];
  const isDayClosed = closedDays.includes(selectedDayIndex);

  // Get current week's start date (Sunday) + offset
  const getWeekStartDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = -dayOfWeek; // Days to subtract to get to Sunday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + diff + weekOffset * 7); // Add week offset
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    if (weekOffset > 0) {
      setWeekOffset(weekOffset - 1);
    }
  };

  const goToNextWeek = () => {
    if (weekOffset < 1) {
      // Only allow up to next week
      setWeekOffset(weekOffset + 1);
    }
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
    // If closed day, clear and return
    if (isDayClosed) {
      setActivities([]);
      return;
    }

    setLoading(true);

    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDateObj.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // 👇 1. Fetch Activities AND User Branches in parallel
    const [[actData, actError], [userBranches, branchError]] =
      await Promise.all([
        apiActivities.getByDate(dateString),
        // Only fetch branches if we have a user, otherwise null
        user ? apiUser.getUserBranches(user.id) : Promise.resolve([null, null]),
      ]);

    if (actError) console.error("Error fetching activities:", actError);
    if (branchError) console.error("Error fetching branches:", branchError);

    const rawActivities = actData || [];
    const validBranches = userBranches || ["nahalal", "satria"]; // Default to both

    // 👇 2. Filter by Branch
    const branchFilteredActivities = rawActivities.filter((activity: any) => {
      // Keep if: No branch defined OR branch is in user's list
      return !activity.branch || validBranches.includes(activity.branch);
    });

    setActivities(branchFilteredActivities);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayIndex, weekOffset, user]); // Added weekOffset to dependencies

  // Filter activities based on selected filter ("All" vs "For You")
  const getFilteredActivities = () => {
    if (filter === "all") return activities;

    // "For You" filter - based on user interests
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

  // Format week display
  const getWeekDisplayText = () => {
    const weekStart = getWeekStartDate();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}.${month}`;
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  return (
    <div className="mobile-container">
      <div className={styles.mainFrame}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          {/* Top Row - Title RIGHT + Filter LEFT */}
          <div className={styles.topRow}>
            {/* Page Title (RIGHT side) */}
            <h1 className="header-secondary">לוח פעילויות</h1>

            {/* Filter Options (LEFT side) */}
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

          {/* Week Navigation */}
          <div className={styles.weekNavigation}>
            <button
              className={styles.weekNavButton}
              style={{
                opacity: isCurrentWeek ? 0.5 : 1,
                cursor: isCurrentWeek ? "not-allowed" : "pointer",
              }}
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
              style={{
                opacity: isNextWeek ? 0.5 : 1,
                cursor: isNextWeek ? "not-allowed" : "pointer",
              }}
              onClick={goToNextWeek}
              disabled={isNextWeek}
            >
              ›
            </button>
          </div>

          {/* Day Slider */}
          <DaySlider
            selectedDayIndex={selectedDayIndex}
            onDaySelect={setSelectedDayIndex}
            currentWeekStart={getWeekStartDate()}
          />
        </div>

        {/* Activities List or Closed Message */}
        <div className={styles.activitiesList}>
          {isDayClosed ? (
            <p className={styles.closedMessage}>המרחב סגור היום</p>
          ) : loading ? (
            <p className="text-empty">טוען...</p>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <ScheduleActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                date={activity.date}
                start_time={activity.start_time}
                end_time={activity.end_time}
                current_participants={activity.current_participants || 0}
                max_participants={activity.max_participants}
                waitlist_count={activity.waitlist_count || 0}
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
