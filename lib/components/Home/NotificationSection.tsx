"use client";
import { useState } from "react";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import Link from "next/link";
import { apiNotifications } from "@/app/services/db_api";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  category: string;
};

type NotificationSectionProps = {
  notifications: Notification[];
  maxDisplay?: number;
  onRefresh?: () => void; // Callback to refresh data from parent
};

export default function NotificationSection({
  notifications: initialNotifications,
  maxDisplay = 3,
  onRefresh,
}: NotificationSectionProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  // Show only unread notifications on home page
  const unreadNotifications = notifications.filter((n) => !n.isRead);
  // Limit to maxDisplay
  const displayNotifications = unreadNotifications.slice(0, maxDisplay);

  if (displayNotifications.length === 0) {
    return null;
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      const [_, error] = await apiNotifications.markAsRead(id);
      if (error) {
        console.error("Error marking as read:", error);
        alert("שגיאה בעדכון ההודעה");
      } else {
        // ✅ Remove the notification from local state (it will disappear)
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        // Optionally refresh parent data
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("שגיאה בעדכון ההודעה");
    }
  };

  const handleMarkAsUnread = async (id: number) => {
    // Not needed on home page since we only show unread
    console.log("Mark as unread not available on home page");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את ההודעה?")) return;

    try {
      const [_, error] = await apiNotifications.delete(id);
      if (error) {
        console.error("Error deleting notification:", error);
        alert("שגיאה במחיקת ההודעה");
      } else {
        // Remove from local state
        setNotifications((prev) => prev.filter((n) => n.id !== id));

        // Optionally refresh parent data
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
    <section
      style={{ direction: "rtl", marginTop: "24px", marginBottom: "24px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h3 style={{ textAlign: "right", fontSize: "20px", margin: 0 }}>
          הודעות ועדכונים
        </h3>
        {unreadNotifications.length > maxDisplay && (
          <Link
            href="/UserScreens/NotificationsPage"
            style={{
              fontSize: "14px",
              color: "#0070f3",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            הצג הכל ({unreadNotifications.length})
          </Link>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {displayNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={handleMarkAsRead}
            onMarkAsUnread={handleMarkAsUnread}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {displayNotifications.length > 0 && (
        <Link
          href="/UserScreens/NotificationsPage"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "12px",
            color: "#0070f3",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          עבור לכל ההודעות →
        </Link>
      )}
    </section>
  );
}
