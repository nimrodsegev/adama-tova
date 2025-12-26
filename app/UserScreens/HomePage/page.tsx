"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import {
  apiActivities,
  apiRegistrations,
  apiNotifications,
} from "@/app/services/db_api";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import UserActivityCard from "@/lib/components/Home/UserActivityCard";
import styles from "./HomePage.styles";
import Link from "next/link";

export default function HomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [registeredActivities, setRegisteredActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [registrationIds = [], regError] =
        await apiRegistrations.getUserRegistrationIds(user!.id);

      if (regError) {
        console.error("Error fetching registrations:", regError);
      }

      const [activities, actError] = await apiActivities.getAll();
      if (actError) {
        console.error("Error fetching activities:", actError);
      }

      const [notificationsData, notifError] = await apiNotifications.getList(
        user!.id,
        20,
        true
      );
      if (notifError) {
        console.error("Error fetching notifications:", notifError);
      } else if (notificationsData) {
        const formattedNotifications = notificationsData.map((notif: any) => ({
          id: notif.id,
          message: notif.message,
          type: notif.type || "info",
          timestamp: new Date(notif.created_at),
          isRead: notif.is_read,
          title: notif.title || "כללי",
        }));
        setNotifications(formattedNotifications);
      }

      if (activities && registrationIds) {
        const registered = activities.filter((activity: any) =>
          registrationIds.includes(activity.id)
        );

        const notRegistered = activities.filter(
          (activity: any) => !registrationIds.includes(activity.id)
        );

        setRegisteredActivities(registered);
        setAllActivities(notRegistered);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>טוען...</p>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>עליך להתחבר כדי לראות את הדף</p>
      </div>
    );
  }

  const possibleActivities = allActivities.slice(0, 4);

  return (
    <div style={styles.container}>
      {/* Background Decorative Vectors */}
      <div style={styles.vectorBackground} />

      {/* Header */}
      <h1 style={styles.headerText}>
        היי {userProfile?.full_name?.split(" ")[0] || ""},
      </h1>

      <div style={styles.mainContentFrame}>
        {/* Notifications Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>הודעות ועדכונים</h2>
          {notifications.length > 0 ? (
            <div style={styles.notificationsList}>
              {notifications.slice(0, 3).map((notif) => (
                <NotificationCard key={notif.id} notification={notif} />
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>אין הודעות חדשות</p>
          )}
          {notifications.length > 0 && (
            <div style={styles.ctaRow}>
              <Link
                href="/UserScreens/NotificationsPage"
                style={styles.buttonS}
              >
                <span style={styles.buttonText}>הכל</span>
              </Link>
            </div>
          )}
        </section>

        {/* Registered Activities Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>המפגשים הבאים שלך</h2>
          {registeredActivities.length > 0 ? (
            <div style={styles.horizontalScroll}>
              {registeredActivities.map((activity) => (
                <div key={activity.id} style={styles.glassCard}>
                  <UserActivityCard
                    id={activity.id}
                    title={activity.title}
                    date={activity.date}
                    start_time={activity.start_time}
                    location={activity.location}
                    description={activity.description}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>אין פעילויות רשומות</p>
          )}
        </section>

        {/* Suggested Activities Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>פעילויות אפשריות</h2>
          {possibleActivities.length > 0 ? (
            <>
              <div style={styles.horizontalScroll}>
                {possibleActivities.map((activity) => (
                  <div key={activity.id} style={styles.glassCard}>
                    <UserActivityCard
                      id={activity.id}
                      title={activity.title}
                      date={activity.date}
                      start_time={activity.start_time}
                      location={activity.location}
                      description={activity.description}
                    />
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div style={styles.ctaRow}>
                <Link
                  href="/UserScreens/WeeklyBoardPage"
                  style={styles.buttonS}
                >
                  <span style={styles.buttonText}>הכל</span>
                </Link>
              </div>
            </>
          ) : (
            <p style={styles.emptyText}>אין פעילויות זמינות כרגע</p>
          )}
        </section>
      </div>
    </div>
  );
}
