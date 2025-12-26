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
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Extract title from message (first sentence or up to first period/newline)
  const extractTitle = (message: string): string => {
    // Try to get first sentence (up to first period, exclamation, or question mark)
    const titleMatch = message.match(/^[^.!?\n]+/);
    if (titleMatch) {
      const title = titleMatch[0].trim();
      // Limit to 30 characters for display
      return title.length > 30 ? title.substring(0, 27) + "..." : title;
    }
    // Fallback: use first 30 characters
    return message.length > 30 ? message.substring(0, 27) + "..." : message;
  };

  const title = extractTitle(notification.title);

  return (
    <div style={styles.cardContainer}>
      {/* Header: Title (extracted from message), Time */}
      <div style={styles.header}>
        <span style={styles.time}>
          {formatTimestamp(notification.timestamp)}
        </span>
        <span style={styles.pipe}>|</span>
        <span style={styles.category}>{title}</span>
      </div>

      {/* Full Message - RTL aligned to right */}
      <p style={styles.message}>{notification.message}</p>

      {/* Unread indicator dot - positioned on the left */}
    </div>
  );
}
