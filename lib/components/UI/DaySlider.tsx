"use client";

import React, { useMemo, useState } from "react";
import styles from "./DaySlider.module.css";

interface DaySliderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DaySlider: React.FC<DaySliderProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay());
    startOfThisWeek.setDate(startOfThisWeek.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfThisWeek);
      date.setDate(startOfThisWeek.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
  const isForbidden = (dayIndex: number) => ![0, 2, 3].includes(dayIndex);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
    );
  };

  return (
    <div className={styles.weekContainer}>
      <button
        type="button"
        className={`${styles.navButton} ${
          weekOffset === 0 ? styles.navDisabled : ""
        }`}
        onClick={() => setWeekOffset(0)}
      >
        <div
          className={styles.arrowIcon}
          style={{ transform: "rotate(45deg)" }}
        />
      </button>

      <div className={styles.sliderWrapper}>
        {weekDays.map((date, index) => {
          const forbidden = isForbidden(date.getDay());
          const selected =
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth();

          return (
            <div
              key={index}
              className={`${styles.dayColumn} ${
                selected ? styles.selectedDay : ""
              }`}
              onClick={() => !forbidden && onDateChange(date)}
              style={{ cursor: forbidden ? "not-allowed" : "pointer" }}
            >
              <span
                className={`${styles.dayName} ${
                  forbidden ? styles.disabledText : ""
                }`}
              >
                {dayNames[date.getDay()]}
              </span>
              <div className={styles.dateContainer}>
                <span
                  className={`${styles.dateNumber} ${
                    forbidden ? styles.disabledText : ""
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
              {isToday(date) && <div className={styles.todayDot} />}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className={`${styles.navButton} ${
          weekOffset === 1 ? styles.navDisabled : ""
        }`}
        onClick={() => setWeekOffset(1)}
      >
        <div
          className={styles.arrowIcon}
          style={{ transform: "rotate(-135deg)" }}
        />
      </button>
    </div>
  );
};

export default DaySlider;
