"use client";

import React from "react";
import styles from "./NewAdminScheduleActivityCard.module.css";

interface NewAdminScheduleActivityCardProps {
  id: string;
  title: string;
  startTime: string; // e.g., "19:00"
  endTime: string; // e.g., "20:30"
  currentParticipants: number;
  maxParticipants: number;
  onClick?: () => void;
}

const NewAdminScheduleActivityCard: React.FC<
  NewAdminScheduleActivityCardProps
> = ({
  title,
  startTime,
  endTime,
  currentParticipants,
  maxParticipants,
  onClick,
}) => {
  const formatTime = (time: string) => time.slice(0, 5);

  return (
    <div className={styles.cardContainer} onClick={onClick}>
      <div className={styles.contentStack}>
        {/* Line 1: Title */}
        <h3 className={styles.titleText}>{title}</h3>

        {/* Line 2: Start Time - End Time (Replaces Date) */}
        <p className={styles.timeRangeText}>
          {formatTime(endTime)} - {formatTime(startTime)}
        </p>

        {/* Line 3: Participants Ratio */}
        <p className={styles.participantsText}>
          {currentParticipants}/{maxParticipants} נרשמים
        </p>
      </div>
    </div>
  );
};

export default NewAdminScheduleActivityCard;
