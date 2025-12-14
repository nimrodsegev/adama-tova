"use client";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import Link from "next/link";

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
  maxDisplay?: number; // Limit how many to show on home page
};

export default function NotificationSection({
  notifications,
  maxDisplay = 3,
}: NotificationSectionProps) {
  // Show only unread notifications on home page
  const unreadNotifications = notifications.filter((n) => !n.isRead);

  // Limit to maxDisplay
  const displayNotifications = unreadNotifications.slice(0, maxDisplay);

  if (displayNotifications.length === 0) {
    return null;
  }

  // Simple handlers for home page (no actual state changes)
  const handleMarkAsRead = (id: number) => {
    // This is just for display, actual state managed in NotificationsPage
    console.log(`Mark as read: ${id}`);
  };

  const handleMarkAsUnread = (id: number) => {
    console.log(`Mark as unread: ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Delete: ${id}`);
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
            href="/screens/NotificationsPage"
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
          href="/screens/NotificationsPage"
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
