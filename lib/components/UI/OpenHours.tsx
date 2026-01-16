"use client";
import React from "react";
import styles from "./OpenHours.module.css";

interface OpenHoursProps {
  startTime?: string; // e.g., "16:00"
  endTime?: string; // e.g., "22:00"
  isOpen: boolean; // true = open, false = closed
}

const OpenHours: React.FC<OpenHoursProps> = ({
  startTime,
  endTime,
  isOpen,
}) => {
  return (
    <div className={styles.container}>
      <p className={styles.text}>
        {isOpen ? (
          <>
            המרחב פתוח היום {startTime} עד {endTime}
          </>
        ) : (
          <>המרחב סגור היום</>
        )}
      </p>
    </div>
  );
};

export default OpenHours;
