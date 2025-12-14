"use client";
import { useState } from "react";
import WeeklyHeader from "@/lib/components/WeeklyBoard/WeeklyHeader";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import WeekNavigation from "@/lib/components/WeeklyBoard/WeekNavigation";
import MeetingCard from "@/lib/components/Home/MeetingCard";

type Meeting = {
  title: string;
  time: string;
  location: string;
  description: string;
};

// Mock data generator based on date
const generateMeetingsForDate = (date: Date): Meeting[] => {
  const dayOfWeek = date.getDay();
  const seed = date.getDate() + date.getMonth();

  // Different meetings based on day of week
  const meetingTemplates: Record<number, Meeting[]> = {
    0: [
      // Sunday
      {
        title: "פגישת צוות",
        time: "09:00",
        location: "חדר ישיבות A",
        description: "סנכרון שבועי",
      },
      {
        title: "סקירת פרויקט",
        time: "14:00",
        location: "זום",
        description: "עדכון התקדמות",
      },
    ],
    1: [
      // Monday
      {
        title: "הרצאה",
        time: "10:00",
        location: "אולם 101",
        description: "טכנולוגיות חדשות",
      },
    ],
    2: [
      // Tuesday
      {
        title: "סדנת עיצוב",
        time: "11:00",
        location: "סטודיו",
        description: "עבודה על UI/UX",
      },
      {
        title: "שיחת קפה",
        time: "16:00",
        location: "בית קפה",
        description: "נטוורקינג",
      },
    ],
    3: [
      // Wednesday
      {
        title: "פגישת לקוחות",
        time: "13:00",
        location: "משרד",
        description: "הצגת אב טיפוס",
      },
    ],
    4: [
      // Thursday
      {
        title: "סיעור מוחות",
        time: "10:30",
        location: "חדר יצירתיות",
        description: "רעיונות חדשים",
      },
      {
        title: "סקירת קוד",
        time: "15:00",
        location: "זום",
        description: "Code review",
      },
    ],
    5: [
      // Friday
      {
        title: "מפגש חברתי",
        time: "12:00",
        location: "גן",
        description: "פעילות צוות",
      },
    ],
    6: [], // Saturday
  };

  return meetingTemplates[dayOfWeek] || [];
};

export default function WeeklyBoardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  // Calculate the selected date based on week and day
  const getSelectedDate = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const selected = new Date(weekStart);
    selected.setDate(weekStart.getDate() + selectedDayIndex);
    return selected;
  };

  const selectedDate = getSelectedDate();
  const meetings = generateMeetingsForDate(selectedDate);

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
      <WeeklyHeader currentDate={selectedDate} />
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
          מפגשים ליום {dayLetters[selectedDayIndex]}
        </h2>
        {meetings.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {meetings.map((meeting, index) => (
              <MeetingCard
                key={index}
                title={meeting.title}
                time={meeting.time}
                location={meeting.location}
                description={meeting.description}
              />
            ))}
          </div>
        ) : (
          <p style={{ color: "#888", fontSize: "18px" }}>
            אין מפגשים מתוכננים ליום זה
          </p>
        )}
      </section>
    </main>
  );
}
