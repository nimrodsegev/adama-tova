"use client";

import React from "react";
import styles from "./OpenHours.module.css";

interface OpenHoursProps {
  startTime: string; // e.g., "16:00"
  endTime: string; // e.g., "22:00"
}

const OpenHours: React.FC<OpenHoursProps> = ({ startTime, endTime }) => {
  return (
    <div className={styles.container}>
      <p className={styles.text}>
        המרחב פתוח היום {startTime} עד {endTime}
      </p>
    </div>
  );
};

export default OpenHours;
