"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiNotifications } from "@/app/services/db_api";
import Link from "next/link";
import AdminActivityCard from "@/lib/components/Home/AdminActivityCard";

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
        <p style={{ color: "white" }}>טוען...</p>
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Background Decorative Vectors (The Group/Circles from CSS) */}
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

            {/* כפתור "הכל" במקום החץ הכחול */}
            <Link
              href="/adminScreens/CalendarPage"
              style={{ ...styles.buttonS, width: "auto", padding: "0 15px" }}
            >
              <span style={{ ...styles.buttonText, color: "#681F02" }}>
                הכל
              </span>
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
            <Link
              href="/adminScreens/NotificationPage"
              style={{ ...styles.buttonS, width: "auto", padding: "0 15px" }}
            >
              <span style={{ ...styles.buttonText, color: "#681F02" }}>
                הכל
              </span>
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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "100%",
    maxWidth: "393px", // Mobile width from CSS
    minHeight: "852px",
    margin: "0 auto",
    backgroundColor: "#AB4016", // Background from CSS
    position: "relative",
    overflowX: "hidden",
    direction: "rtl",
    paddingBottom: "100px",
  },
  vectorBackground: {
    position: "absolute",
    width: "150%",
    height: "40%",
    top: "2.5%",
    left: "-25%",
    border: "2px solid rgba(189, 161, 201, 0.2)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  headerText: {
    position: "absolute",
    width: "352px",
    left: "20px",
    top: "91px",
    fontFamily: "Arfilit, sans-serif",
    fontSize: "36px",
    fontWeight: "400",
    color: "#FFFFFF",
    textAlign: "right",
  },
  mainContentFrame: {
    marginTop: "200px",
    display: "flex",
    flexDirection: "column",
    gap: "40px",
    padding: "0 20px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "400",
    color: "#FFFFFF",
    textAlign: "right",
  },
  horizontalScroll: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    overflowX: "auto",
    paddingBottom: "10px",
  },
  glassCard: {
    minWidth: "167px",
    height: "154px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(6.4px)",
    WebkitBackdropFilter: "blur(6.4px)",
    borderRadius: "20px",
    padding: "12px",
  },
  notificationGlassCard: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  notifHeader: {
    display: "flex",
    flexDirection: "row-reverse",
    gap: "4px",
    alignItems: "center",
  },
  notifTitle: { fontSize: "16px", fontWeight: "600", color: "#681F02" },
  notifPipe: { color: "#681F02" },
  notifTime: { fontSize: "14px", color: "#681F02" },
  notifMessage: {
    fontSize: "15px",
    color: "#681F02",
    textAlign: "right",
    marginTop: "4px",
  },
  ctaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
  },
  buttonM: {
    width: "140px",
    height: "44px",
    background: "#F9F9F9",
    borderRadius: "25px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    color: "#1A1A2E",
    fontSize: "14px",
    fontWeight: "400",
  },
  buttonS: {
    width: "44px",
    height: "44px",
    background: "#F9F9F9",
    borderRadius: "25px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
  },
  arrowIcon: { color: "#681F02", fontSize: "20px" },
  navBar: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "353px",
    height: "61px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    borderRadius: "20px",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1000,
  },
  navItem: { fontSize: "24px", cursor: "pointer" },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    width: "100%",
  },
};
