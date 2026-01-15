"use client";
import React, { useState } from "react";
import Button from "@/lib/components/UI/Button";
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import NewUserScheduleActivityCard from "@/lib/components/UI/NewUserScheduleActivityCard";
import styles from "./elements.module.css";

export default function ElementsPage() {
  // Example Data for Notifications
  const [demoNotifications, setDemoNotifications] = useState([
    {
      id: 1,
      title: "מחר אנחנו סגורים",
      message:
        "בעקבות תשעה באב מחר נהיה סגורים. הפעילות תחזור לסדרה ביום שאחרי.",
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: 2,
      title: "שיעור יוגה",
      message: "עומד להתחיל בעוד שעה. אל תשכחו להביא מים ומגבת!",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true,
      activityId: "act_123",
    },
  ]);

  // Example Data for Activity Cards
  const demoActivities = [
    {
      id: "activity_1",
      title: "יוגה בוקר",
      instructor: "שרה כהן",
      date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      startTime: "08:00:00",
      endTime: "09:00:00",
      currentParticipants: 8,
      maxParticipants: 12,
      waitlistCount: 2,
    },
    {
      id: "activity_2",
      title: "פילאטיס ערב",
      instructor: "דני לוי",
      date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      startTime: "18:30:00",
      endTime: "19:30:00",
      currentParticipants: 10,
      maxParticipants: 10,
      waitlistCount: 3,
    },
    {
      id: "activity_3",
      title: "מדיטציה מודרכת",
      instructor: "רונית אברהם",
      date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      startTime: "19:00:00",
      endTime: "20:00:00",
      currentParticipants: 5,
      maxParticipants: 15,
      waitlistCount: 0,
    },
  ];

  const handleMarkRead = (id: string | number) => {
    setDemoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    alert(`הודעה ${id} סומנה כנקראה!`);
  };

  const handleMotionChange = (state: "start" | "end", skipFetch?: boolean) => {
    console.log(`Motion state: ${state}, Skip fetch: ${skipFetch}`);
  };

  return (
    <div className={styles.scrollableContainer}>
      <div className="mobile-container" style={{ paddingBottom: "8rem" }}>
        {/* HEADER */}
        <div className="absolute-header">
          <h1 className="header-primary">ספריית רכיבים</h1>
        </div>

        <div className="main-content" style={{ marginTop: "8rem" }}>
          {/* --- ACTIVITY CARDS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">כרטיסי פעילות - רגילים</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserActivityCard - מחר
                </p>
                <NewUserActivityCard
                  id={demoActivities[0].id}
                  title={demoActivities[0].title}
                  instructor={demoActivities[0].instructor}
                  date={demoActivities[0].date}
                  startTime={demoActivities[0].startTime}
                  onMotionChange={handleMotionChange}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserActivityCard - מחרתיים
                </p>
                <NewUserActivityCard
                  id={demoActivities[1].id}
                  title={demoActivities[1].title}
                  instructor={demoActivities[1].instructor}
                  date={demoActivities[1].date}
                  startTime={demoActivities[1].startTime}
                  onMotionChange={handleMotionChange}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserActivityCard - קבוצתי
                </p>
                <NewUserActivityCard
                  id={demoActivities[2].id}
                  title={demoActivities[2].title}
                  instructor={demoActivities[2].instructor}
                  date={demoActivities[2].date}
                  startTime={demoActivities[2].startTime}
                  isGroup={true}
                  onMotionChange={handleMotionChange}
                />
              </div>
            </div>
          </section>

          {/* --- SCHEDULE ACTIVITY CARDS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">כרטיסי פעילות - לוח שנה</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserScheduleActivityCard - יוגה
                </p>
                <NewUserScheduleActivityCard
                  id={demoActivities[0].id}
                  title={demoActivities[0].title}
                  instructor={demoActivities[0].instructor}
                  date={demoActivities[0].date}
                  startTime={demoActivities[0].startTime}
                  endTime={demoActivities[0].endTime}
                  currentParticipants={demoActivities[0].currentParticipants}
                  maxParticipants={demoActivities[0].maxParticipants}
                  waitlistCount={demoActivities[0].waitlistCount}
                  onMotionChange={handleMotionChange}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserScheduleActivityCard - פילאטיס (מלא)
                </p>
                <NewUserScheduleActivityCard
                  id={demoActivities[1].id}
                  title={demoActivities[1].title}
                  instructor={demoActivities[1].instructor}
                  date={demoActivities[1].date}
                  startTime={demoActivities[1].startTime}
                  endTime={demoActivities[1].endTime}
                  currentParticipants={demoActivities[1].currentParticipants}
                  maxParticipants={demoActivities[1].maxParticipants}
                  waitlistCount={demoActivities[1].waitlistCount}
                  onMotionChange={handleMotionChange}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserScheduleActivityCard - מדיטציה (מקומות פנויים)
                </p>
                <NewUserScheduleActivityCard
                  id={demoActivities[2].id}
                  title={demoActivities[2].title}
                  instructor={demoActivities[2].instructor}
                  date={demoActivities[2].date}
                  startTime={demoActivities[2].startTime}
                  endTime={demoActivities[2].endTime}
                  currentParticipants={demoActivities[2].currentParticipants}
                  maxParticipants={demoActivities[2].maxParticipants}
                  waitlistCount={demoActivities[2].waitlistCount}
                  isGroup={true}
                  onMotionChange={handleMotionChange}
                />
              </div>
            </div>
          </section>

          {/* --- BUTTONS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">כפתורים נפוצים</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">Primary - Size L</p>
                <Button variant="primary" size="L">
                  להוספת פעילות
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Primary - Size L-short
                </p>
                <Button variant="primary" size="L-short">
                  שמירה
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Secondary - Size L
                </p>
                <Button variant="secondary" size="L">
                  ביטול
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">Tertiary - Orange</p>
                <Button variant="tertiary" colorType="orange">
                  עריכה
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">Tertiary - Delete</p>
                <Button variant="tertiary" colorType="delete">
                  מחיקה
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Approve & Reject Buttons
                </p>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <Button variant="approve">אשר</Button>
                  <Button variant="reject">סרב</Button>
                </div>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">WhatsApp Button</p>
                <Button variant="whatsapp">שלח ווטסאפ</Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Waiting List Button
                </p>
                <Button variant="waiting-list">רשימת המתנה</Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">Login Button</p>
                <Button variant="login">התחברות</Button>
              </div>
            </div>
          </section>

          {/* --- NOTIFICATIONS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">התראות (החלק שמאלה לקריאה)</h2>
            <div
              className="vertical-scroll gap-md"
              style={{ paddingBottom: "20px" }}
            >
              <p className="text-small mb-xs opacity-75">לא נקרא (עם החלקה)</p>
              <NewNotificationCard
                notification={demoNotifications[0]}
                onMarkAsRead={handleMarkRead}
              />

              <p className="text-small mb-xs opacity-75 mt-md">
                נקרא + כפתור לפעילות
              </p>
              <NewNotificationCard
                notification={demoNotifications[1]}
                onMarkAsRead={handleMarkRead}
                onActivityClick={(id) => alert(`Navigating to activity: ${id}`)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
