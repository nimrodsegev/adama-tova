"use client";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
};

type NotificationSectionProps = {
  notifications: Notification[];
};

export default function NotificationSection({
  notifications,
}: NotificationSectionProps) {
  const getBackgroundColor = (type: string) => {
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

  if (notifications.length === 0) {
    return null;
  }

  return (
    <section
      style={{ direction: "rtl", marginTop: "24px", marginBottom: "24px" }}
    >
      <h3
        style={{ textAlign: "right", marginBottom: "12px", fontSize: "20px" }}
      >
        הודעות ועדכונים
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              backgroundColor: getBackgroundColor(notification.type),
              border: `2px solid ${getBorderColor(notification.type)}`,
              borderRadius: "8px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              direction: "rtl",
            }}
          >
            <span style={{ fontSize: "20px" }}>
              {getIcon(notification.type)}
            </span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, textAlign: "right", fontSize: "16px" }}>
                {notification.message}
              </p>
              <p
                style={{
                  margin: 0,
                  marginTop: "4px",
                  fontSize: "12px",
                  color: "#666",
                  textAlign: "right",
                }}
              >
                {notification.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
