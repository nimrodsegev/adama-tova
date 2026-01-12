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
  // 0 is current week, 1 is next week
  const [weekOffset, setWeekOffset] = useState<0 | 1>(0);

  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    // Adjust to start from Sunday (index 0)
    startOfThisWeek.setDate(today.getDate() - today.getDay());

    // Offset by 7 days if looking at the next week
    startOfThisWeek.setDate(startOfThisWeek.getDate() + weekOffset * 7);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfThisWeek);
      date.setDate(startOfThisWeek.getDate() + i);
      return date;
    });
  }, [weekOffset]);

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  /**
   * Pressable Days: Sunday (0), Tuesday (2), Wednesday (3)
   */
  const isForbidden = (dayIndex: number) => ![0, 2, 3].includes(dayIndex);

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth()
    );
  };

  return (
    <div className={styles.weekContainer}>
      {/* Previous Week Arrow - Always Visible */}
      <button
        type="button"
        className={`${styles.navButton} ${styles.prevButton} ${
          weekOffset === 0 ? styles.navDisabled : ""
        }`}
        onClick={() => weekOffset === 1 && setWeekOffset(0)}
        aria-label="השבוע הקודם"
      >
        <div className={styles.arrowIcon} />
      </button>

      <div className={styles.sliderWrapper}>
        {weekDays.map((date, index) => {
          const dayIndex = date.getDay();
          const forbidden = isForbidden(dayIndex);
          const selected = isSelected(date);
          const today = isToday(date);

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
                {dayNames[dayIndex]}
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
              {today && <div className={styles.todayDot} />}
            </div>
          );
        })}
      </div>

      {/* Next Week Arrow - Always Visible */}
      <button
        type="button"
        className={`${styles.navButton} ${styles.nextButton} ${
          weekOffset === 1 ? styles.navDisabled : ""
        }`}
        onClick={() => weekOffset === 0 && setWeekOffset(1)}
        aria-label="השבוע הבא"
      >
        <div className={styles.arrowIcon} />
      </button>
    </div>
  );
};

export default DaySlider;
