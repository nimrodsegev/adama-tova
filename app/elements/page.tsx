"use client";
import React, { useState } from "react";
import Button from "@/lib/components/UI/Button";
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import NewUserScheduleActivityCard from "@/lib/components/UI/NewUserScheduleActivityCard";
import UserApprovalCard from "@/lib/components/UI/UserApprovalCard";
import EmptyState from "@/lib/components/UI/EmptyState";
import DaySlider from "@/lib/components/UI/DaySlider";
import Popup from "@/lib/components/UI/Popup";
import {
  HomeFilter,
  ADMIN_FILTER_OPTIONS,
  USER_FILTER_OPTIONS,
  ADMIN_STATUS_OPTIONS,
  AVAILABILITY_OPTIONS,
} from "@/lib/components/UI/HomeFilter";
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
      date: new Date(Date.now() + 86400000).toISOString(),
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
      date: new Date(Date.now() + 172800000).toISOString(),
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
      date: new Date(Date.now() + 259200000).toISOString(),
      startTime: "19:00:00",
      endTime: "20:00:00",
      currentParticipants: 5,
      maxParticipants: 15,
      waitlistCount: 0,
    },
  ];

  // Filter states
  const [adminFilter, setAdminFilter] = useState("pending");
  const [userFilter, setUserFilter] = useState("recommended");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Add state at the top of your component:
  const [showPopup1, setShowPopup1] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [showPopup3, setShowPopup3] = useState(false);
  const [showPopup4, setShowPopup4] = useState(false);
  const [showPopup5, setShowPopup5] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkRead = (id: string | number) => {
    setDemoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    alert(`הודעה ${id} סומנה כנקראה!`);
  };

  const handleMotionChange = (state: "start" | "end", skipFetch?: boolean) => {
    console.log(`Motion state: ${state}, Skip fetch: ${skipFetch}`);
  };

  const handleApprove = (userName: string) => {
    alert(`אישור עבור ${userName}`);
  };

  const handleReject = (userName: string) => {
    alert(`דחייה עבור ${userName}`);
  };

  return (
    <div className={styles.scrollableContainer}>
      <div className="mobile-container" style={{ paddingBottom: "8rem" }}>
        {/* HEADER */}
        <div className="absolute-header">
          <h1 className="header-primary">ספריית רכיבים</h1>
        </div>

        <div className="main-content" style={{ marginTop: "8rem" }}>
          <section className="section">
            <h2 className="text-section-title">
              Popup Component - Interactive
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  Basic Popup - Title, Content, Two Buttons
                </p>
                <Button
                  variant="primary"
                  size="L"
                  onClick={() => setShowPopup1(true)}
                >
                  פתח פופאפ בסיסי
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">With User Name</p>
                <Button
                  variant="primary"
                  size="L"
                  onClick={() => setShowPopup2(true)}
                >
                  פופאפ עם שם משתמש
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Without Title - With Email
                </p>
                <Button
                  variant="primary"
                  size="L"
                  onClick={() => setShowPopup3(true)}
                >
                  פופאפ עם מייל
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  With Loading State
                </p>
                <Button
                  variant="primary"
                  size="L"
                  onClick={() => setShowPopup4(true)}
                >
                  פופאפ עם טעינה
                </Button>
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Single Button Only
                </p>
                <Button
                  variant="primary"
                  size="L"
                  onClick={() => setShowPopup5(true)}
                >
                  פופאפ עם כפתור אחד
                </Button>
              </div>
            </div>
          </section>

          {/* Popups - Rendered at the end of the component */}
          {showPopup1 && (
            <Popup
              title="שכחת סיסמה?"
              content="לשינוי הסיסמה ישלח מייל לכתובת המייל שלך"
              recommendation="מומלץ לבצע את הפעולה במחשב או דרך דפדפן בסמארטפון"
              primaryButtonText="כן, שלח מייל"
              primaryButtonAction={() => {
                alert("Primary button clicked");
                setShowPopup1(false);
              }}
              secondaryButtonText="ביטול"
              secondaryButtonAction={() => setShowPopup1(false)}
              onClose={() => setShowPopup1(false)}
            />
          )}

          {showPopup2 && (
            <Popup
              title="אישור משתמש"
              userName="שרה לוי"
              content="האם ברצונך לאשר את המשתמש?"
              primaryButtonText="אשר"
              primaryButtonAction={() => {
                alert("Approved!");
                setShowPopup2(false);
              }}
              secondaryButtonText="סרב"
              secondaryButtonAction={() => setShowPopup2(false)}
              onClose={() => setShowPopup2(false)}
            />
          )}

          {showPopup3 && (
            <Popup
              content="מייל אישור נשלח לכתובת:"
              email="user@example.com"
              recommendation="אנא בדוק את תיבת הדואר שלך"
              primaryButtonText="סגור"
              primaryButtonAction={() => setShowPopup3(false)}
              onClose={() => setShowPopup3(false)}
            />
          )}

          {showPopup4 && (
            <Popup
              title="שולח מייל"
              content="אנא המתן בזמן שאנו שולחים את המייל"
              primaryButtonText="שלח"
              primaryButtonAction={() => {
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  setShowPopup4(false);
                  alert("Email sent!");
                }, 2000);
              }}
              secondaryButtonText="ביטול"
              secondaryButtonAction={() => setShowPopup4(false)}
              loading={isLoading}
              onClose={() => setShowPopup4(false)}
            />
          )}

          {showPopup5 && (
            <Popup
              title="הצלחה!"
              content="הפעולה בוצעה בהצלחה"
              primaryButtonText="סגור"
              primaryButtonAction={() => setShowPopup5(false)}
              onClose={() => setShowPopup5(false)}
            />
          )}
          {/* --- ACTIVITY CARDS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">כרטיסי פעילות - רגילים</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserActivityCard - מחר (יש מקומות)
                </p>
                <NewUserActivityCard
                  id={demoActivities[0].id}
                  title={demoActivities[0].title}
                  instructor={demoActivities[0].instructor}
                  date={demoActivities[0].date}
                  startTime={demoActivities[0].startTime}
                  currentParticipants={demoActivities[0].currentParticipants}
                  maxParticipants={demoActivities[0].maxParticipants}
                  waitlistCount={demoActivities[0].waitlistCount}
                  onMotionChange={handleMotionChange}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  NewUserActivityCard - מחרתיים (מלא - עם שעון)
                </p>
                <NewUserActivityCard
                  id={demoActivities[1].id}
                  title={demoActivities[1].title}
                  instructor={demoActivities[1].instructor}
                  date={demoActivities[1].date}
                  startTime={demoActivities[1].startTime}
                  currentParticipants={demoActivities[1].currentParticipants}
                  maxParticipants={demoActivities[1].maxParticipants}
                  waitlistCount={demoActivities[1].waitlistCount}
                  onMotionChange={handleMotionChange}
                />
              </div>
            </div>
          </section>
          <section
            className="section"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <h2 className="text-section-title">Popup Component</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  Basic Popup - Title, Content, Two Buttons
                </p>
                <Popup
                  preview={true}
                  title="שכחת סיסמה?"
                  content="לשינוי הסיסמה ישלח מייל לכתובת "
                  email="user@example.com"
                  recommendation="מומלץ לבצע את הפעולה במחשב או דרך דפדפן בסמארטפון"
                  primaryButtonText="כן, שלח מייל"
                  primaryButtonAction={() => alert("Primary button clicked")}
                  secondaryButtonText="ביטול"
                  secondaryButtonAction={() =>
                    alert("Secondary button clicked")
                  }
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  With Email Display
                </p>
                <Popup
                  preview={true}
                  content="האם אתה בטוח שאתה רוצה לסרב לבקשת ישראל ישראלי לאישור ראשוני?"
                  recommendation="פעולה זו תמנע מהמשתמש לקבל גישה לאפליקציה"
                  primaryButtonText="סגור"
                  primaryButtonAction={() => alert("Close clicked")}
                  secondaryButtonText="ביטול"
                  secondaryButtonAction={() =>
                    alert("Secondary button clicked")
                  }
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Success State - Single Button
                </p>
                <Popup
                  preview={true}
                  title="מייל נשלח!"
                  content="שלחנו מייל עם קישור לשינוי הסיסמה. בדוק את תיבת הדואר שלך"
                  primaryButtonText="סגור"
                  primaryButtonAction={() => alert("Close clicked")}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  With Loading State
                </p>
                <Popup
                  preview={true}
                  title="שולח מייל"
                  content="אנא המתן בזמן שאנו שולחים את המייל"
                  primaryButtonText="שלח"
                  primaryButtonAction={() => alert("Send clicked")}
                  secondaryButtonText="ביטול"
                  secondaryButtonAction={() => alert("Cancel clicked")}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Only Secondary Button
                </p>
                <Popup
                  preview={true}
                  title="אזהרה"
                  content="האם אתה בטוח שברצונך להמשיך?"
                  secondaryButtonText="ביטול"
                  secondaryButtonAction={() => alert("Cancel clicked")}
                />
              </div>
            </div>
          </section>
          <section className="section">
            <h2 className="text-section-title">Day Slider</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  Interactive Week Slider - Click days to select
                </p>
                <DaySlider
                  selectedDate={selectedDate}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    console.log("Selected date:", date);
                  }}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Selected date: {selectedDate.toLocaleDateString("he-IL")}
                </p>
              </div>
            </div>
          </section>
          <section className="section">
            <h2 className="text-section-title">Empty State</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75"></p>
                <EmptyState
                  message="אין פעילויות קרובות"
                  buttonText="להוספת פעילות"
                  onButtonClick={() => alert("Add activity clicked")}
                  gap="var(--spacing-md)"
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Message Only - No Button
                </p>
                <EmptyState message="רשימת ההמתנה ריקה" />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Small Icon (50px) with Tight Gap
                </p>
                <EmptyState
                  message="אין משתמשים ממתינים"
                  buttonText="הזמן משתמש"
                  onButtonClick={() => alert("Invite user clicked")}
                  iconSize={50}
                  gap="var(--spacing-xs)"
                />
              </div>
            </div>
          </section>
          {/* --- NOTIFICATIONS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">התראות (החלק שמאלה לקריאה)</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  לא נקרא - עם אפשרות סימון כנקרא (החלק שמאלה)
                </p>
                <NewNotificationCard
                  notification={demoNotifications[0]}
                  onMarkAsRead={handleMarkRead}
                  showMarkAsReadHint={false}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  נקרא - עם כפתור לפעילות
                </p>
                <NewNotificationCard
                  notification={demoNotifications[1]}
                  onMarkAsRead={handleMarkRead}
                  onActivityClick={(id) =>
                    alert(`Navigating to activity: ${id}`)
                  }
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  לא נקרא - עם אפשרות מחיקה (החלק ימינה)
                </p>
                <NewNotificationCard
                  notification={{
                    id: 3,
                    title: "עדכון חשוב",
                    message: "יש לנו עדכון חשוב עבורך. החלק ימינה כדי למחוק.",
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    isRead: false,
                  }}
                  onMarkAsRead={handleMarkRead}
                  onDelete={(id) => alert(`מחיקת הודעה ${id}`)}
                  showDeleteHint={false}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  הודעה ארוכה - עם טקסט מרובה
                </p>
                <NewNotificationCard
                  notification={{
                    id: 4,
                    title: "הודעה ארוכה",
                    message:
                      "זו הודעה ארוכה יותר שמכילה הרבה טקסט. היא נועדה להראות איך הכרטיס מתמודד עם תוכן ארוך ומעטפת את הטקסט בצורה נכונה.",
                    timestamp: new Date(Date.now() - 10800000).toISOString(),
                    isRead: false,
                  }}
                  onMarkAsRead={handleMarkRead}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  נקרא - ללא כפתור פעילות
                </p>
                <NewNotificationCard
                  notification={{
                    id: 5,
                    title: "הודעת מערכת",
                    message: "המערכת תעבור תחזוקה מתוכננת מחר בשעה 02:00.",
                    timestamp: new Date(Date.now() - 14400000).toISOString(),
                    isRead: true,
                  }}
                  onMarkAsRead={handleMarkRead}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  עם שני כיווני החלקה - סימון ומחיקה
                </p>
                <NewNotificationCard
                  notification={{
                    id: 6,
                    title: "הודעה גמישה",
                    message: "החלק שמאלה לסימון כנקרא, או ימינה למחיקה.",
                    timestamp: new Date(Date.now() - 18000000).toISOString(),
                    isRead: false,
                  }}
                  onMarkAsRead={handleMarkRead}
                  onDelete={(id) => alert(`מחיקת הודעה ${id}`)}
                />
              </div>
            </div>
          </section>

          {/* --- HOME FILTER SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">פילטרים (HomeFilter)</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  Admin Filter - 2 אפשרויות
                </p>
                <HomeFilter
                  options={ADMIN_FILTER_OPTIONS}
                  activeOption={adminFilter}
                  onFilterChange={setAdminFilter}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  User Filter - 2 אפשרויות
                </p>
                <HomeFilter
                  options={USER_FILTER_OPTIONS}
                  activeOption={userFilter}
                  onFilterChange={setUserFilter}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Status Filter - 3 אפשרויות
                </p>
                <HomeFilter
                  options={ADMIN_STATUS_OPTIONS}
                  activeOption={statusFilter}
                  onFilterChange={setStatusFilter}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  Availability Filter - 3 אפשרויות
                </p>
                <HomeFilter
                  options={AVAILABILITY_OPTIONS}
                  activeOption={availabilityFilter}
                  onFilterChange={setAvailabilityFilter}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  עם ספירות (Counts)
                </p>
                <HomeFilter
                  options={[
                    { id: "all", label: "הכל", count: 25 },
                    { id: "pending", label: "ממתינים", count: 8 },
                    { id: "approved", label: "מאושרים", count: 17 },
                  ]}
                  activeOption="all"
                  onFilterChange={(id) => console.log("Selected:", id)}
                />
              </div>
            </div>
          </section>

          {/* --- USER APPROVAL CARDS SECTION --- */}
          <section className="section">
            <h2 className="text-section-title">כרטיסי אישור משתמשים</h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <p className="text-small mb-xs opacity-75">
                  אישור ראשוני - עם מעגל
                </p>
                <UserApprovalCard
                  userName="שרה לוי"
                  requestDate="12.01.2025"
                  circle="מעגל נשים"
                  type="initial"
                  onApprove={() => handleApprove("שרה לוי")}
                  onReject={() => handleReject("שרה לוי")}
                  onClick={() => alert("לחיצה על כרטיס שרה לוי")}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  אישור ראשוני - ללא מעגל
                </p>
                <UserApprovalCard
                  userName="דוד כהן"
                  requestDate="15.01.2025"
                  type="initial"
                  onApprove={() => handleApprove("דוד כהן")}
                  onReject={() => handleReject("דוד כהן")}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  אישור קבוצה - עם שם קבוצה
                </p>
                <UserApprovalCard
                  userName="מיכל אברהם"
                  requestDate="10.01.2025"
                  circle="מעגל הורים"
                  groupName="קבוצת פילאטיס בוקר"
                  type="group"
                  onApprove={() => handleApprove("מיכל אברהם")}
                  onReject={() => handleReject("מיכל אברהם")}
                  onClick={() => alert("לחיצה על כרטיס מיכל אברהם")}
                />
              </div>

              <div>
                <p className="text-small mb-xs opacity-75">
                  אישור קבוצה - שם ארוך
                </p>
                <UserApprovalCard
                  userName="יוסף בן דוד המלמד"
                  requestDate="08.01.2025"
                  circle="מעגל גברים ונערים"
                  type="group"
                  onApprove={() => handleApprove("יוסף בן דוד המלמד")}
                  onReject={() => handleReject("יוסף בן דוד המלמד")}
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
                <p className="text-small mb-xs opacity-75">Tertiary - Orange</p>
                <Button variant="tertiary" colorType="orange">
                  עריכה
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
