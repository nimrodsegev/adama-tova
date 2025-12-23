"use client";

import Link from "next/link";

type AdminActivityCardProps = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  start_time: string;
  current_participants: number;
  max_participants: number;
};

export default function AdminActivityCard({
  id,
  title,
  date,
  start_time,
  current_participants,
  max_participants,
}: AdminActivityCardProps) {
  // Convert date to day name in Hebrew
  const getDayName = (dateString: string) => {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const dayName = getDayName(date);
  const formattedDate = formatDate(date);
  const formattedTime = start_time.slice(0, 5);

  const isFull = current_participants >= max_participants;

  return (
    <Link
      href={`/UserScreens/ActivityDetailsPage?id=${id}`}
      style={{
        display: "block",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
        width: "280px",
        backgroundColor: "#fff",
        textDecoration: "none",
        color: "inherit",
        direction: "rtl",
        transition: "box-shadow 0.2s, transform 0.2s",
        cursor: "pointer",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          marginBottom: "16px",
          textAlign: "right",
          paddingLeft: "30px", // Space for arrow
        }}
      >
        {title}
      </h3>

      {/* Day, Date, Time */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <span style={{ fontSize: "24px" }}>📅</span>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              יום {dayName}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              {formattedDate}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "24px" }}>🕐</span>
          <div style={{ fontSize: "16px", fontWeight: "600" }}>
            {formattedTime}
          </div>
        </div>
      </div>

      {/* Registration Count */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: isFull ? "#ef4444" : "#10b981",
          }}
        >
          {current_participants}/{max_participants}
        </span>
      </div>

      {/* Arrow Button */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          width: "32px",
          height: "32px",
          backgroundColor: "#3b82f6",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px",
          fontWeight: "bold",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        ←
      </div>
    </Link>
  );
}
