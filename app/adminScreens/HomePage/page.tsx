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
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const [activities, actError] = await apiActivities.getByDate(dateString);
      if (!actError && activities) setTodayActivities(activities);

      const [notificationsData, notifError] = await apiNotifications.getList(
        user!.id,
        5,
        false
      );
      if (!notifError && notificationsData) {
        const formattedNotifications = notificationsData.map((notif: any) => ({
          id: notif.id,
          message: notif.message,
          type: notif.type || "info",
          timestamp: new Date(notif.created_at),
          isRead: notif.is_read,
          category: notif.category || "כללי",
        }));
        setNotifications(formattedNotifications);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading)
    return (
      <main style={{ textAlign: "center", padding: "20px" }}>
        <p>טוען...</p>
      </main>
    );
  if (!user || !userProfile)
    return (
      <main style={{ textAlign: "center", padding: "20px" }}>
        <p>עליך להתחבר כדי לראות את הדף</p>
      </main>
    );

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      {/* Header */}
      <h1
        style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "32px" }}
      >
        היי {userProfile.full_name}!
      </h1>

      {/* Section 1: Activities Status */}
      <section style={{ marginBottom: "40px" }}>
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
        >
          סטטוס הרשמה לפעילויות
        </h2>

        {todayActivities.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {todayActivities.map((activity) => (
              <AdminActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                date={activity.date}
                start_time={activity.start_time}
                current_participants={activity.current_participants || 0}
                max_participants={activity.max_participants}
              />
            ))}
          </div>
        ) : (
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            אין פעילויות היום
          </p>
        )}

        {/* Activity Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/adminScreens/AddActivityPage"
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ➕ הוספת פעילות
          </Link>

          <Link
            href="/adminScreens/CalendarPage"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45px",
              height: "45px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "50%",
              textDecoration: "none",
              fontSize: "20px",
            }}
            title="לוח שנה"
          >
            ←
          </Link>
        </div>
      </section>

      {/* Section 2: Recent Notifications */}
      <section>
        <h2
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}
        >
          הודעות אחרונות
        </h2>

        {notifications.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: "16px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  borderRight: "4px solid #3b82f6",
                }}
              >
                <p style={{ fontSize: "14px", color: "#6b7280" }}>
                  {notif.category}
                </p>
                <p style={{ fontSize: "16px" }}>{notif.message}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            אין הודעות
          </p>
        )}

        {/* Notification Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link
            href="/adminScreens/addNotification"
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ➕ הודעה חדשה
          </Link>
          <Link
            href="/adminScreens/NotificationPage"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45px",
              height: "45px",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "50%",
              textDecoration: "none",
              fontSize: "20px",
            }}
            title="עמוד ההתראות"
          >
            ←
          </Link>
        </div>
      </section>
    </main>
  );
}
