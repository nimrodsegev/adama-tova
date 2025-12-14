"use client";

type NotificationsFiltersProps = {
  filter: "all" | "unread" | "read";
  onFilterChange: (filter: "all" | "unread" | "read") => void;
  totalCount: number;
  unreadCount: number;
  readCount: number;
  onMarkAllAsRead: () => void;
};

export default function NotificationsFilters({
  filter,
  onFilterChange,
  totalCount,
  unreadCount,
  readCount,
  onMarkAllAsRead,
}: NotificationsFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        gap: "12px",
        flexWrap: "wrap",
        direction: "rtl",
      }}
    >
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onFilterChange("all")}
          style={{
            padding: "8px 16px",
            backgroundColor: filter === "all" ? "#0070f3" : "#f0f0f0",
            color: filter === "all" ? "#fff" : "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
        >
          הכל ({totalCount})
        </button>
        <button
          onClick={() => onFilterChange("unread")}
          style={{
            padding: "8px 16px",
            backgroundColor: filter === "unread" ? "#0070f3" : "#f0f0f0",
            color: filter === "unread" ? "#fff" : "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
        >
          לא נקראו ({unreadCount})
        </button>
        <button
          onClick={() => onFilterChange("read")}
          style={{
            padding: "8px 16px",
            backgroundColor: filter === "read" ? "#0070f3" : "#f0f0f0",
            color: filter === "read" ? "#fff" : "#333",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
        >
          נקראו ({readCount})
        </button>
      </div>

      {unreadCount > 0 && (
        <button
          onClick={onMarkAllAsRead}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "background-color 0.3s",
          }}
        >
          סמן הכל כנקרא
        </button>
      )}
    </div>
  );
}
