"use client";

import React from "react";
import styles from "./NewAdminActivityCard.module.css";

interface NewAdminActivityCardProps {
  id: string;
  title: string;
  instructor: string;
  day: string;
  startTime: string;
  currentParticipants: number;
  maxParticipants: number;
  onClick?: () => void;
}

const NewAdminActivityCard: React.FC<NewAdminActivityCardProps> = ({
  title,
  instructor,
  day,
  startTime,
  currentParticipants,
  maxParticipants,
  onClick,
}) => {
  const formatTime = (time: string) => time.slice(0, 5);
  const isOverCapacity = currentParticipants > maxParticipants;
  const waitlistCount = isOverCapacity ? currentParticipants - maxParticipants : 0;

  return (
    <div className={styles.cardContainer} onClick={onClick}>
      <div className={styles.contentStack}>
        {/* Line 1: Title */}
        <h3 className={styles.titleText}>{title}</h3>

        {/* Line 2: Instructor */}
        <p className={styles.instructorText}>{instructor}</p>

        {/* Line 3: Day and Time */}
        <p className={styles.dateTimeText}>
          {day} בשעה {formatTime(startTime)}
        </p>

        {/* Line 4: Participants Ratio */}
        <p className={`${styles.participantsText} ${isOverCapacity ? styles.participantsOverCapacity : ''}`}>
          {currentParticipants}/{maxParticipants} נרשמים
          {isOverCapacity && ` (מלא - ${waitlistCount} ממתין)`}
        </p>
      </div>
    </div>
  );
};

export default NewAdminActivityCard;
