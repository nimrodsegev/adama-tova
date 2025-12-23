"use client";

import Link from "next/link";

type AdminActivityCardProps = {
  id: string;
  title: string;
  date: string;
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
  const formattedTime = start_time.slice(0, 5);

  return (
    <Link
      href={`/UserScreens/ActivityDetailsPage?id=${id}`}
      style={styles.cardContainer}
    >
      {/* Container לטקסט - מוצמד למעלה וימינה */}
      <div style={styles.textWrapper}>
        <h3 style={styles.titleText}>{title}</h3>
        <p style={styles.bodyM}>שעה: {formattedTime}</p>
        <p style={styles.bodyL}>
          {current_participants}/{max_participants} רשומים
        </p>
      </div>

      {/* כפתור חץ - מוצמד לשמאל למטה */}
      <div style={styles.circleButton}>
        <span style={styles.arrowIcon}>←</span>
      </div>
    </Link>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  cardContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start", // מצמיד תוכן למעלה
    alignItems: "flex-end", // מצמיד תוכן לימין (בגלל ה-direction)
    padding: "16px",
    width: "200px",
    height: "180px",
    background: "none",
    textDecoration: "none",
    color: "#681F02",
    direction: "rtl",
    position: "relative",
    cursor: "pointer",
    flex: "none",
  },
  textWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end", // יישור טקסט לימין
    gap: "4px", // רווח קטן בין השורות
    width: "100%",
  },
  titleText: {
    fontFamily: "'Ezer Shemesh TRIAL ONLY', sans-serif",
    fontSize: "20px",
    fontWeight: "600",
    color: "#681F02",
    margin: "0 0 8px 0", // רווח קטן מתחת לכותרת
    textAlign: "right",
    lineHeight: "1.2",
  },
  bodyM: {
    fontSize: "16px",
    fontWeight: "300",
    color: "#681F02",
    margin: 0,
    textAlign: "right",
  },
  bodyL: {
    fontSize: "16px",
    fontWeight: "400",
    color: "#681F02",
    margin: 0,
    textAlign: "right",
  },
  circleButton: {
    width: "38px",
    height: "38px",
    background: "#F9F9F9",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    left: "12px", // צמוד לשמאל
    bottom: "12px", // צמוד למטה
    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
  },
  arrowIcon: {
    color: "#681F02",
    fontSize: "16px",
    fontWeight: "bold",
  },
};
