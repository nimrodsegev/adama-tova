"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiNotifications } from "@/app/services/db_api";
import Link from "next/link";
import AdminActivityCard from "@/lib/components/Home/AdminActivityCard";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import styles from "./AdminHomePage.styles";
import NotificationEmptyState from "@/lib/components/Notifications/NotificationEmptyState";
import Image from "next/image";

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
              + הוספת פעילות
            </Link>

            <Link href="/adminScreens/CalendarPage" style={styles.buttonS}>
              <span style={styles.buttonText}>הכל</span>
            </Link>
          </div>
        </section>

        {/* Section 2: Recent Notifications - USING NotificationCard Component */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>הודעות אחרונות</h2>

          {notifications.length > 0 ? (
            <>
              {/* Show notifications list */}
              <div
                style={styles.notificationsList}
                className="notifications-scrollable"
              >
                {notifications.map((notif) => (
                  <NotificationCard key={notif.id} notification={notif} />
                ))}
              </div>

              {/* Notification Buttons CTA */}
              <div style={styles.ctaRow}>
                <Link
                  href="/adminScreens/addNotification"
                  style={styles.buttonM}
                >
                  + הודעה חדשה
                </Link>
                <Link
                  href="/adminScreens/NotificationPage"
                  style={styles.buttonS}
                >
                  <span style={styles.buttonText}>הכל</span>
                </Link>
              </div>
            </>
          ) : (
            /* Show empty state when no notifications */
            <NotificationEmptyState />
          )}
        </section>
      </div>

      {/* Navigation Bar at bottom */}
      <nav style={styles.navBar}>
        <div style={styles.navItem}>
          <Image
            src="/icons/figure_icon.svg" // or .png
            alt="No figure icon"
            width={71} // Match Figma dimensions
            height={72} // Match Figma dimensions
            style={styles.icon}
          />
        </div>
        <div style={styles.navItem}>📅</div>
        <div style={styles.navItem}>🔔</div>
        <div style={styles.navItem}>👤</div>
      </nav>
    </div>
  );
}
