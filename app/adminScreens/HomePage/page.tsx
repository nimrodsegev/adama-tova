"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiNotifications } from "@/app/services/db_api";
import Link from "next/link";
import AdminActivityCard from "@/lib/components/Home/AdminActivityCard";
import styles from "./AdminHomePage.styles";

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
        3,
        false
      );
      if (!notifError && notificationsData) {
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading)
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>טוען...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Background Decorative Vectors */}
      <div style={styles.vectorBackground} />

      {/* Header */}
      <h1 style={styles.headerText}>
        היי {userProfile?.full_name?.split(" ")[0] || "מנהל"},
      </h1>

      <div style={styles.mainContentFrame}>
        {/* Section 1: Activities */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>סטטוס הרשמה לפעילויות</h2>
          <div style={styles.horizontalScroll}>
            {todayActivities.length > 0 ? (
              todayActivities.map((activity) => (
                <div key={activity.id} style={styles.glassCard}>
                  <AdminActivityCard
                    id={activity.id}
                    title={activity.title}
                    date={activity.date}
                    start_time={activity.start_time}
                    current_participants={activity.current_participants || 0}
                    max_participants={activity.max_participants}
                  />
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>אין פעילויות היום</p>
            )}
          </div>

          {/* Activity Buttons CTA */}
          <div style={styles.ctaRow}>
            <Link href="/adminScreens/AddActivityPage" style={styles.buttonM}>
              ➕ הוספת פעילות
            </Link>

            <Link href="/adminScreens/CalendarPage" style={styles.buttonS}>
              <span style={styles.buttonText}>הכל</span>
            </Link>
          </div>
        </section>

        {/* Section 2: Recent Notifications */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>הודעות אחרונות</h2>
          <div style={styles.notificationsList}>
            {notifications.map((notif) => (
              <div key={notif.id} style={styles.notificationGlassCard}>
                <div style={styles.notifHeader}>
                  <span style={styles.notifTime}>
                    {new Date(notif.created_at).toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span style={styles.notifPipe}>|</span>
                  <span style={styles.notifTitle}>
                    {notif.category || "כללי"}
                  </span>
                </div>
                <p style={styles.notifMessage}>{notif.message}</p>
              </div>
            ))}
          </div>

          {/* Notification Buttons CTA */}
          <div style={styles.ctaRow}>
            <Link href="/adminScreens/addNotification" style={styles.buttonM}>
              ➕ הודעה חדשה
            </Link>
            <Link href="/adminScreens/NotificationPage" style={styles.buttonS}>
              <span style={styles.buttonText}>הכל</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Navigation Bar at bottom */}
      <nav style={styles.navBar}>
        <div style={styles.navItem}>🏠</div>
        <div style={styles.navItem}>📅</div>
        <div style={styles.navItem}>🔔</div>
        <div style={styles.navItem}>👤</div>
      </nav>
    </div>
  );
}
