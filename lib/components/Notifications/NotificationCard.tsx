"use client";
import { useState } from "react";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  category: string;
};

type NotificationCardProps = {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function NotificationCard({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: NotificationCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getBackgroundColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return "#f9f9f9";
    }
    switch (type) {
      case "info":
        return "#e3f2fd";
      case "warning":
        return "#fff3e0";
      case "success":
        return "#e8f5e9";
      case "error":
        return "#ffebee";
      default:
        return "#f5f5f5";
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case "info":
        return "#2196f3";
      case "warning":
        return "#ff9800";
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      default:
        return "#ccc";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📢";
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    if (days === 1) return "אתמול";
    if (days < 7) return `לפני ${days} ימים`;
    return date.toLocaleDateString("he-IL");
  };

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(
          notification.type,
          notification.isRead
        ),
        border: `2px solid ${
          notification.isRead ? "#ddd" : getBorderColor(notification.type)
        }`,
        borderRadius: "12px",
        padding: "16px",
        position: "relative",
        transition: "all 0.3s",
        opacity: notification.isRead ? 0.7 : 1,
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div style={{ display: "flex", alignItems: "start", gap: "12px" }}>
        <span style={{ fontSize: "24px" }}>{getIcon(notification.type)}</span>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#666",
                backgroundColor: "#e0e0e0",
                padding: "2px 8px",
                borderRadius: "12px",
              }}
            >
              {notification.category}
            </span>
            {!notification.isRead && (
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "#0070f3",
                  borderRadius: "50%",
                }}
              />
            )}
          </div>

          <p
            style={{
              margin: "8px 0",
              textAlign: "right",
              fontSize: "16px",
              fontWeight: notification.isRead ? "normal" : "bold",
            }}
          >
            {notification.message}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#666",
              textAlign: "right",
            }}
          >
            {formatTimestamp(notification.timestamp)}
          </p>
        </div>
      </div>

      {showActions && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "12px",
            justifyContent: "flex-end",
          }}
        >
          {!notification.isRead ? (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              סמן כנקרא
            </button>
          ) : (
            <button
              onClick={() => onMarkAsUnread(notification.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#6c757d",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              סמן כלא נקרא
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            style={{
              padding: "6px 12px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            מחק
          </button>
        </div>
      )}
    </div>
  );
}
