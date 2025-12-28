"use client";
import { useState, useEffect } from "react";
import WeeklyHeader from "@/lib/components/WeeklyBoard/WeeklyHeader";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import WeekNavigation from "@/lib/components/WeeklyBoard/WeekNavigation";
import UserActivityCard from "@/lib/components/Home/UserActivityCard";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";

export default function WeeklyBoardPage() {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  const [activities, setActivities] = useState<any[]>([]);
  const [myRegistrationIds, setMyRegistrationIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getSelectedDateObject = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDateObj = getSelectedDateObject();

  // Fetch Data (Activities + User Registrations)
  const fetchData = async () => {
    setLoading(true);

    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDateObj.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Fetch Activities
    const [actData, actError] = await apiActivities.getByDate(dateString);
    if (actError) console.error("Error fetching activities:", actError);
    else setActivities(actData || []);

    // Fetch User Registrations if logged in
    if (user) {
      const [registrationIds, regError] =
        await apiRegistrations.getUserRegistrationIds(user.id);
      if (!regError && registrationIds) {
        setMyRegistrationIds(registrationIds);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDayIndex, currentDate, user]);

  // Navigation Handlers
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
          מפגשים ליום {dayLetters[selectedDayIndex]} (
          {selectedDateObj.toLocaleDateString("he-IL")})
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
            {activities.map((activity) => (
              <UserActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                date={activity.date}
                start_time={activity.start_time}
                location={activity.location}
                description={activity.description}
              />
            ))}
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
