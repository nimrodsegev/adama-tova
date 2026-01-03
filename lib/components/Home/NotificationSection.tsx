"use client";
import { useState } from "react";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import Link from "next/link";
import { apiNotifications } from "@/app/services/db_api";
import { useIvrita } from "@/app/contexts/IvritaContext";
import styles from "./NotificationSection.styles";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
};

type NotificationSectionProps = {
  notifications: Notification[];
  maxDisplay?: number;
  onRefresh?: () => void;
};

export default function NotificationSection({
  notifications: initialNotifications,
  maxDisplay = 5,
  onRefresh,
}: NotificationSectionProps) {
  const { t } = useIvrita();
  const [notifications, setNotifications] = useState(initialNotifications);

  // Show only unread notifications
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const displayNotifications = unreadNotifications.slice(0, maxDisplay);

  if (displayNotifications.length === 0) {
    return (
      <section style={styles.section}>
        <h3 style={styles.sectionTitle}>הודעות ועדכונים</h3>
        <p style={styles.emptyText}>אין הודעות חדשות</p>
      </section>
    );
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      const [_, error] = await apiNotifications.markAsRead(id);
      if (error) {
        console.error("Error marking as read:", error);
        alert("שגיאה בעדכון ההודעה");
      } else {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("שגיאה בעדכון ההודעה");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("האם את/ה בטוח/ה שברצונך למחוק את ההודעה?"))) return;

    try {
      const [_, error] = await apiNotifications.delete(id);
      if (error) {
        console.error("Error deleting notification:", error);
        alert("שגיאה במחיקת ההודעה");
      } else {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("שגיאה במחיקת ההודעה");
    }
  };

  return (
    <section style={styles.section}>
      {/* Section Header */}
      <div style={styles.headerContainer}>
        <h3 style={styles.sectionTitle}>הודעות ועדכונים</h3>
        {unreadNotifications.length > maxDisplay && (
          <Link
            href="/UserScreens/NotificationsPage"
            style={styles.viewAllLink}
          >
            הצג הכל
          </Link>
        )}
      </div>

      {/* Notification Cards */}
      <div style={styles.notificationsList}>
        {displayNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* View All Link */}
    </section>
  );
}
