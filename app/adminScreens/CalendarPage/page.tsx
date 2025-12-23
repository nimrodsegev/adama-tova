"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 👈 1. Import Router
import WeeklyHeader from "@/lib/components/WeeklyBoard/WeeklyHeader";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import WeekNavigation from "@/lib/components/WeeklyBoard/WeekNavigation";
import { apiActivities } from "@/app/services/db_api";
import AdminActivityCard from "@/lib/components/Home/AdminActivityCard";

export default function AdminWeeklyBoardPage() {
  const router = useRouter(); // 👈 2. Initialize Router
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const getSelectedDateObject = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDateObj = getSelectedDateObject();

  // --- Fetch Data ---
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
  }, [selectedDayIndex, currentDate]);

  // --- Navigation ---
  const handleWeekChange = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + offset * 7);
    setCurrentDate(newDate);
  };

  const dayLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <WeeklyHeader currentDate={selectedDateObj} />
      <WeekNavigation
        currentWeekStart={currentDate}
        onWeekChange={handleWeekChange}
      />
      <DaySlider
        selectedDayIndex={selectedDayIndex}
        onDaySelect={setSelectedDayIndex}
        currentWeekStart={currentDate}
      />

      <section style={{ marginTop: "32px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>
          ניהול מפגשים - {dayLetters[selectedDayIndex]} (&apos;
          {selectedDateObj.toLocaleDateString("he-IL")}&apos;)
        </h2>

        {loading ? (
          <p>טוען נתונים מהשרת...</p>
        ) : activities.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {activities.map((activity) => {
              const isLoadingThis = actionLoading === activity.id;

              return (
                <div
                  key={activity.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <AdminActivityCard
                    key={activity.id}
                    id={activity.id}
                    title={activity.title}
                    date={activity.date}
                    start_time={activity.start_time}
                    current_participants={activity.current_participants || 0}
                    max_participants={activity.max_participants}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: "18px" }}>
            אין סדנאות רשומות ליום זה.
          </p>
        )}
      </section>
    </main>
  );
}
