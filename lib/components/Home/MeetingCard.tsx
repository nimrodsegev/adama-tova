"use client";

import Link from "next/link";

type MeetingCardProps = {
  id: string;
  title: string;
  time: string;
  location: string;
  description: string;
};

export default function MeetingCard({
  id,
  title,
  time,
  location,
  description,
}: MeetingCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "16px",
        width: "250px",
        backgroundColor: "#fff",
        marginRight: "16px",
        direction: "rtl",
      }}
    >
      <h3 style={{ marginBottom: "8px", textAlign: "right" }}>{title}</h3>
      <p style={{ textAlign: "right" }}>
        <strong>זמן:</strong> {time}
      </p>
      <p style={{ textAlign: "right" }}>
        <strong>מיקום:</strong> {location}
      </p>
      <p style={{ marginTop: "8px", textAlign: "right" }}>
        <strong>תיאור:</strong> {description}
      </p>

      {/* כפתור ראה עוד */}
      <Link
        href={`/UserScreens/ActivityDetailsPage?id=${id}`}
        style={{
          display: "block",
          marginTop: "12px",
          padding: "10px",
          backgroundColor: "#3b82f6",
          color: "white",
          textAlign: "center",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "600",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#2563eb";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#3b82f6";
        }}
      >
        ראה עוד →
      </Link>
    </div>
  );
}
