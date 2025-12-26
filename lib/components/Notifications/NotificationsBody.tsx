"use client";
import NotificationCard from "./NotificationCard";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
};

type NotificationsBodyProps = {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function NotificationsBody({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationsBodyProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        direction: "rtl",
      }}
    >
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onMarkAsUnread={onMarkAsUnread}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p style={{ textAlign: "center", color: "#888", padding: "40px" }}>
          אין הודעות להצגה
        </p>
      )}
    </div>
  );
}
