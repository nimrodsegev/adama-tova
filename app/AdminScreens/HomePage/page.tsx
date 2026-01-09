"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiNotifications } from "@/app/services/db_api";
import AdminActivityCard from "@/lib/components/Home/AdminActivityCard";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import EmptyState from "@/lib/components/UI/EmptyState";
import Button from "@/lib/components/UI/Button";

export default function AdminHomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const dateString = today.toISOString().split("T")[0];

      const [activities, actError] = await apiActivities.getByDate(dateString);
      if (!actError && activities) setTodayActivities(activities);

      const [notificationsData, notifError] = await apiNotifications.getList(
        user!.id,
        5,
        false
      );
      if (!notifError && notificationsData) {
        // Transform to match NotificationCard props
        const transformedNotifications = notificationsData.map(
          (notif: any) => ({
            id: notif.id,
            message: notif.message,
            type: "info" as const,
            timestamp: new Date(notif.created_at),
            isRead: notif.is_read || false,
            title: notif.title || "כללי",
          })
        );
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F28130",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#EFEFEF",
          fontFamily: "Ezer Shemesh TRIAL ONLY, sans-serif",
          fontSize: "1.25rem",
        }}
        dir="rtl"
      >
        טוען...
      </div>
    );

  return (
    <div className="mobile-container">
      {/* Background Decorative Vectors */}
      <div className="vector-background" />

      {/* Header */}
      <h1 className="header-primary absolute-header">
        היי {userProfile?.full_name?.split(" ")[0] || "מנהל"},
      </h1>

      <div className="main-content">
        {/* Section 1: Activities */}
        <section className="section">
          <h2 className="text-section-title">סטטוס הרשמה לפעילויות</h2>

          {todayActivities.length > 0 ? (
            <>
              <div className="horizontal-scroll">
                {todayActivities.map((activity) => (
                  <div key={activity.id} className="glass-card">
                    <AdminActivityCard
                      id={activity.id}
                      title={activity.title}
                      date={activity.date}
                      start_time={activity.start_time}
                      current_participants={activity.current_participants || 0}
                      max_participants={activity.max_participants}
                    />
                  </div>
                ))}
              </div>

              {/* Activity Buttons CTA */}
              <div className="cta-row">
                <Button size="M" href="/AdminScreens/AddActivityPage">
                  + הוספת פעילות
                </Button>

                <Button size="S" href="/AdminScreens/AdminCalendarPage">
                  הכל
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              message="אין פעילויות היום"
              buttonText="+ הוספת פעילות"
              buttonHref="/AdminScreens/AddActivityPage"
            />
          )}
        </section>

        {/* Section 2: Recent Notifications */}
        <section className="section">
          <h2 className="text-section-title">הודעות אחרונות</h2>

          {notifications.length > 0 ? (
            <>
              {/* Show notifications list */}
              <div className="vertical-scroll notifications-list">
                {notifications.map((notif) => (
                  <NotificationCard key={notif.id} notification={notif} />
                ))}
              </div>

              {/* Notification Buttons CTA */}
              <div className="cta-row">
                <Button size="M" href="/AdminScreens/addNotification">
                  + הודעה חדשה
                </Button>

                <Button size="S" href="/AdminScreens/NotificationPage">
                  הכל
                </Button>
              </div>
            </>
          ) : (
            /* Show empty state when no notifications */
            <EmptyState
              message="אין הודעות חדשות"
              buttonText="+ הודעה חדשה"
              buttonHref="/AdminScreens/addNotification"
            />
          )}
        </section>
      </div>

      {/* Navigation Bar at bottom */}
    </div>
  );
}
