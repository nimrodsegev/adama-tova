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
  waitlistCount: number;
  isGroup?: boolean;
  isRegistered?: boolean;
  isPending?: boolean;
  onRegistrationChange?: () => void;
  onMotionChange?: (state: "start" | "end") => void;
}

const NewUserScheduleActivityCard: React.FC<
  NewUserScheduleActivityCardProps
> = ({
  id,
  title,
  startTime,
  endTime,
  currentParticipants,
  maxParticipants,
  waitlistCount,
  isGroup,
  isRegistered = false,
  isPending = false,
  onRegistrationChange,
  onMotionChange,
}) => {
  const formatTime = (time: string) => time.slice(0, 5);

  const getButtonText = () => {
    if (isRegistered) return "לביטול";
    if (isPending) return "ממתין";

    const isFull = currentParticipants >= maxParticipants;
    if (isFull) return "רשימת המתנה";

    return "הרשמה";
  };

  const handleAction = () => {
    if (onMotionChange) {
      onMotionChange("start");
    }

    // TODO: Add actual registration/cancellation logic here
    // After completion, call:
    // if (onRegistrationChange) onRegistrationChange();
    // if (onMotionChange) onMotionChange("end");
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
        {waitlistCount > 0 && (
          <p className={styles.waitlistText}>{waitlistCount} ברשימת המתנה</p>
        )}
      </div>

      <div className={styles.actionSection}>
        <Button variant="primary" size="L-short" onClick={handleAction}>
          {getButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default NewUserScheduleActivityCard;
