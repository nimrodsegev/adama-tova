"use client";
import Link from "next/link";
import styles from "./NotificationEmptyState.styles";
import Image from "next/image";

export default function NotificationEmptyState() {
  return (
    <div style={styles.container}>
      {/* Icon/Visualization - Plus sign with circles */}
      <div style={styles.iconContainer}>
        <Image
          src="/icons/plus_sign_icon.svg" // or .png
          alt="No notifications icon"
          width={71} // Match Figma dimensions
          height={72} // Match Figma dimensions
          style={styles.icon}
        />
      </div>

      {/* Empty state text */}
      <div style={styles.textContainer}>
        <p style={styles.emptyText}>אין הודעות אחרונות</p>
      </div>

      {/* Add notification button */}
      <div style={styles.buttonContainer}>
        <Link href="/adminScreens/addNotification" style={styles.addButton}>
          <span style={styles.buttonText}>+ הודעה חדשה</span>
        </Link>
      </div>
    </div>
  );
}
