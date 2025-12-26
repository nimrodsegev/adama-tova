"use client";
import styles from "./NotificationCard.styles";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
};

type NotificationCardProps = {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
  onMarkAsUnread?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationCardProps) {
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const notifDate = new Date(date);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const notifDay = new Date(
      notifDate.getFullYear(),
      notifDate.getMonth(),
      notifDate.getDate()
    );

    if (notifDay.getTime() === today.getTime()) {
      return notifDate.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (notifDay.getTime() === yesterday.getTime()) {
      return "אתמול";
    }

    const day = notifDate.getDate().toString().padStart(2, "0");
    const month = (notifDate.getMonth() + 1).toString().padStart(2, "0");
    return `${day}.${month}`;
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div style={styles.cardContainer}>
      {/* Header: Title (category) and Time - BOLD if UNREAD */}
      <div style={styles.header}>
        <span style={notification.isRead ? styles.time : styles.timeBold}>
          {formatTimestamp(notification.timestamp)}
        </span>
        <span style={styles.pipe}>|</span>
        <span style={notification.isRead ? styles.title : styles.titleBold}>
          {notification.title}
        </span>
      </div>

      {/* Message - Always same weight (Light 300) */}
      <p style={styles.message}>{notification.message}</p>

      {/* Mark as Read Button - Only show for UNREAD messages */}
      {!notification.isRead && onMarkAsRead && (
        <button onClick={handleMarkAsRead} style={styles.markAsReadButton}>
          ✓
        </button>
      )}
    </div>
  );
}
