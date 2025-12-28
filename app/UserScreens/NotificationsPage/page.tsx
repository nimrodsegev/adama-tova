"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiNotifications, supabase } from "@/app/services/db_api";
import Link from "next/link";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import styles from "./NotificationsPage.styles";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
  activityId?: string; // 👈 1. Added optional activityId
};

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  // Helper to convert DB record to UI object
  const mapDbToUi = (dbRecord: any): Notification => {
    let type: "info" | "warning" | "success" | "error" = "info";
    const text = (dbRecord.title + " " + dbRecord.message).toLowerCase();

    if (text.includes("cancel") || text.includes("בוטל") || text.includes("ביטול")) {
      type = "error";
    } else if (text.includes("warning") || text.includes("שינוי")) {
      type = "warning";
    } else if (text.includes("success") || text.includes("אושרה")) {
      type = "success";
    }

    return {
      id: dbRecord.id,
      message: dbRecord.message,
      type: type,
      timestamp: new Date(dbRecord.created_at),
      isRead: dbRecord.is_read,
      title: dbRecord.title || "הודעה מערכת",
      activityId: dbRecord.linked_activity_id, // 👈 2. Map the new DB column
    };
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      const [data, error] = await apiNotifications.getList(user.id, 50);
      if (data) {
        setNotifications(data.map(mapDbToUi));
      }
      setLoading(false);
    };

    loadData();

    const subscription = apiNotifications.subscribe(
      user.id,
      (newRawNotif: any) => {
        const newUiNotif = mapDbToUi(newRawNotif);
        setNotifications((prev) => [newUiNotif, ...prev]);
      }
    );

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    const [_, error] = await apiNotifications.markAsRead(id);

    if (error) {
      console.error("Error marking as read:", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      alert("שגיאה בעדכון ההודעה");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  if (!user)
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>אנא התחבר כדי לצפות בהודעות</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.vectorBackground} />

      <h1 style={styles.headerText}>הודעות ועדכונים</h1>

      <div style={styles.mainContentFrame}>
        <div style={styles.filterContainer}>
          <button
            onClick={() => setFilter("all")}
            style={{
              ...styles.filterButton,
              ...(filter === "all" ? styles.filterButtonActive : {}),
            }}
          >
            הכל
          </button>
          <button
            onClick={() => setFilter("unread")}
            style={{
              ...styles.filterButton,
              ...(filter === "unread" ? styles.filterButtonActive : {}),
            }}
          >
            לא נקראו
          </button>
        </div>

        {loading ? (
          <p style={styles.loadingText}>טוען הודעות...</p>
        ) : (
          <div style={styles.notificationsList} className="notifications-scrollable">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                // 3. 👇 WRAP IN LINK CONDITIONALLY
                notif.activityId ? (
                  <Link 
                    key={notif.id} 
                    href={`/UserScreens/ActivityDetailsPage?id=${notif.activityId}`}
                    style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }}
                  >
                    <NotificationCard
                      notification={notif}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  </Link>
                ) : (
                  <div key={notif.id} style={{ marginBottom: '10px' }}>
                    <NotificationCard
                      notification={notif}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  </div>
                )
              ))
            ) : (
              <p style={styles.emptyText}>אין הודעות להצגה</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}