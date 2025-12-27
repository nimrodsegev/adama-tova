"use client";
import Link from "next/link";
import styles from "./AdminActivityCard.styles";

type UserActivityCardProps = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  description: string;
};

export default function UserActivityCard({
  id,
  title,
  date,
  start_time,
  location,
  description,
}: UserActivityCardProps) {
  const formattedTime = start_time.slice(0, 5);

  // Format date: "2024-12-23" → "יום שלישי 23.12"
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  return (
    <Link
      href={`/UserScreens/ActivityDetailsPage?id=${id}`}
      style={styles.cardContainer}
    >
      <div style={styles.frame224}>
        {/* Title */}
        <h3 style={styles.titleText}>{title}</h3>

        {/* Date and Time - TWO LINES */}
        <div style={styles.frame266}>
          <p style={styles.bodyM}>
            {dayName} {dayMonth}
            <br />
            בשעה {formattedTime}
            <br />
            {location}
          </p>
        </div>
      </div>

      {/* Arrow Button - Bottom Left Corner */}
      <div style={styles.arrowButton}>
        <span style={styles.arrowIcon}>›</span>
        {/* ↑ Right-Pointing Angle Quotation Mark (U+203A) - Opposite direction */}
      </div>
    </Link>
  );
}
