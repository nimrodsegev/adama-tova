"use client";
import { useState, useEffect } from "react";
import WeeklyHeader from "@/lib/components/WeeklyBoard/WeeklyHeader";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import WeekNavigation from "@/lib/components/WeeklyBoard/WeekNavigation";
import MeetingCard from "@/lib/components/Home/MeetingCard";
import { apiActivities } from "@/app/services/db_api"; // וודא שהנתיב לקובץ ה-API נכון

export default function WeeklyBoardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  // State לאחסון הסדנאות שיגיעו מה-DB
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // חישוב התאריך הנבחר מתוך האינדקס והשבוע הנוכחי
  const getSelectedDateObject = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDateObj = getSelectedDateObject();

  // פונקציה לשליפת הנתונים מה-DB
  const fetchActivities = async () => {
    setLoading(true);

    // המרת התאריך לפורמט YYYY-MM-DD שמתאים לפונקציה getByDate
    const year = selectedDateObj.getFullYear();
    const month = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDateObj.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // שימוש בפונקציה ששלחת
    const [data, error] = await apiActivities.getByDate(dateString);

    if (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  // בכל פעם שמשנים יום או שבוע - נשלף נתונים חדשים
  useEffect(() => {
    fetchActivities();
  }, [selectedDayIndex, currentDate]);

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
          מפגשים ליום {dayLetters[selectedDayIndex]} (&apos;
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
            {activities.map((activity) => (
              <MeetingCard
                key={activity.id}
                title={activity.title}
                time={`${activity.start_time} - ${activity.end_time}`}
                location={activity.category} // כאן אתה יכול להחליף למיקום אם קיים ב-DB
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
