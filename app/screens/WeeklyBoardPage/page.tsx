"use client";
import { useState } from "react";
import WeeklyHeader from "@/lib/components/WeeklyBoard/WeeklyHeader";
import DaySlider from "@/lib/components/WeeklyBoard/DaySlider";
import MeetingCard from "@/lib/components/Home/MeetingCard";

type Meeting = {
  title: string;
  time: string;
  location: string;
  description: string;
};

// Mock data for each day
const meetingsByDay: Record<string, Meeting[]> = {
  א: [
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
  ב: [
    {
      title: "הרצאה",
      time: "10:00",
      location: "אולם 101",
      description: "טכנולוגיות חדשות",
    },
  ],
  ג: [
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
  ד: [
    {
      title: "פגישת לקוחות",
      time: "13:00",
      location: "משרד",
      description: "הצגת אב טיפוס",
    },
  ],
  ה: [
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
  ו: [
    {
      title: "מפגש חברתי",
      time: "12:00",
      location: "גן",
      description: "פעילות צוות",
    },
  ],
  ש: [],
};

export default function WeeklyBoardPage() {
  const [selectedDay, setSelectedDay] = useState("א");
  const [currentDate, setCurrentDate] = useState(new Date());

  const meetings = meetingsByDay[selectedDay] || [];

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        direction: "ltr",
      }}
    >
      <WeeklyHeader currentDate={currentDate} />
      <DaySlider selectedDay={selectedDay} onDaySelect={setSelectedDay} />

      <section style={{ marginTop: "32px" }}>
        <h2 style={{ marginBottom: "16px", fontSize: "24px" }}>
          מפגשים ליום {selectedDay}
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
