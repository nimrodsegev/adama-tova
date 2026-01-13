"use client";

import React from "react";
import styles from "./NewUserScheduleActivityCard.module.css";
import Button from "./Button";

interface NewUserScheduleActivityCardProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  currentParticipants: number;
  maxParticipants: number;
  registrationStatus: "registered" | "not_registered" | "pending";
  onAction?: (status: string) => void;
}

const NewUserScheduleActivityCard: React.FC<
  NewUserScheduleActivityCardProps
> = ({
  title,
  startTime,
  endTime,
  currentParticipants,
  maxParticipants,
  registrationStatus,
  onAction,
}) => {
  const formatTime = (time: string) => time.slice(0, 5);

  const getButtonText = () => {
    switch (registrationStatus) {
      case "registered":
        return "לביטול";
      case "pending":
        return "ממתין";
      default:
        return "הרשמה";
    }
  };

  return (
    <div className={styles.cardContainer}>
      {/* In RTL: 
         1st Child (Info) appears on the Right.
         2nd Child (Action) appears on the Left.
      */}
      <div className={styles.infoSection}>
        <h3 className={styles.titleText}>{title}</h3>
        <p className={styles.timeRange}>
          {formatTime(startTime)} - {formatTime(endTime)}
        </p>
        <p className={styles.participantsText}>
          {currentParticipants}/{maxParticipants} נרשמים
        </p>
      </div>

      <div className={styles.actionSection}>
        <Button
          variant="primary"
          size="S"
          onClick={() => onAction?.(registrationStatus)}
        >
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default NewUserScheduleActivityCard;
