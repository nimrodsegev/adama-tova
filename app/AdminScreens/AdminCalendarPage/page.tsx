"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import { apiActivities } from "@/app/services/db_api";
import ScheduleActivityCard from "@/lib/components/WeeklyBoard/ScheduleActivityCard";
import styles from "./AdminCalendarPage.module.css";

export default function AdminCalendarPage() {
  const router = useRouter();
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current week's start date (Sunday)
  const getWeekStartDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = -dayOfWeek; // Days to subtract to get to Sunday
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + diff);
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  };

  const getSelectedDateObject = () => {
    const weekStart = getWeekStartDate();
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDateObj = getSelectedDateObject();

  // Fetch activities for selected date
  const fetchActivities = async () => {
    setLoading(true);
    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDateObj.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    const [data, error] = await apiActivities.getByDate(dateString);
    if (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [selectedDayIndex]);

  return (
    <div className="mobile-container">
      <div className={styles.mainFrame}>
        {/* Header Section */}
        <div className={styles.headerSection}>
          {/* Page Title */}
          <h1 className="header-secondary">{/* Using global */}לוח שבועי</h1>

          {/* Day Slider */}
          <DaySlider
            selectedDayIndex={selectedDayIndex}
            onDaySelect={setSelectedDayIndex}
            currentWeekStart={getWeekStartDate()}
          />
        </div>

        {/* Activities List */}
        <div className={styles.activitiesList}>
          {loading ? (
            <p className="text-empty">טוען...</p>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
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
                onRegistrationChange={fetchActivities}
                isGroup={activity.is_group}
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
