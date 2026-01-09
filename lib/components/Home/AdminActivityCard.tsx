"use client";
import { useState } from "react";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import styles from "./AdminActivityCard.module.css";

type AdminActivityCardProps = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  current_participants: number;
  max_participants: number;
  onRegistrationChange?: () => void;
};

export default function AdminActivityCard({
  id,
  title,
  date,
  start_time,
  current_participants,
  max_participants,
  onRegistrationChange,
}: AdminActivityCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedTime = start_time.slice(0, 5);

  // Format date: "2024-12-23" → "יום שלישי 23.12"
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  const progressPercentage =
    max_participants > 0 ? (current_participants / max_participants) * 100 : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent modal from opening if clicking on specific interactive elements
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalRegistrationChange = () => {
    onRegistrationChange?.();
  };

  return (
    <>
      <div onClick={handleCardClick} className={styles.cardContainer}>
        <div className={styles.frame224}>
          {/* Title */}
          <h3 className={styles.titleText}>{title}</h3>

          {/* Date and Time - TWO LINES */}
          <div className={styles.frame266}>
            <p className={styles.bodyM}>
              {dayName} {dayMonth}
              <br />
              בשעה {formattedTime}
            </p>
          </div>

          {/* Participants */}
          <div className={styles.frame265}>
            <p className={styles.bodyL}>
              {current_participants}/{max_participants}
            </p>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressBarContainer}>
            <div className={styles.progressBarBackground} />
            <div
              className={styles.progressBarFill}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Arrow Button - Bottom Left Corner */}
        <div className={styles.arrowButton}>
          <span className={styles.arrowIcon}>›</span>
        </div>
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activityId={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistrationChange={handleModalRegistrationChange}
      />
    </>
  );
}
