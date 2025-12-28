"use client";
import styles from "./DaySlider.styles";

type DaySliderProps = {
  selectedDayIndex: number;
  onDaySelect: (index: number) => void;
  currentWeekStart: Date;
};

export default function DaySlider({
  selectedDayIndex,
  onDaySelect,
  currentWeekStart,
}: DaySliderProps) {
  // Hebrew day letters: Sunday to Saturday
  const dayLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  // Closed days: Monday(1), Thursday(4), Friday(5), Saturday(6)
  const closedDays = [1, 4, 5, 6];

  // Get the actual dates for the current week
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeekStart);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.getDate()); // Just the day number
    }

    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <div style={styles.container}>
      {dayLetters.map((letter, index) => {
        const isSelected = index === selectedDayIndex;
        const isClosed = closedDays.includes(index);

        return (
          <button
            key={index}
            onClick={() => onDaySelect(index)}
            style={{
              ...styles.dayButton,
              ...(isSelected && styles.dayButtonSelected), // ✅ CHANGED: Always apply selected style when selected
            }}
          >
            {/* Day Letter (Hebrew) */}
            <span
              style={{
                ...styles.dayLetter,
                ...(isSelected && styles.dayLetterSelected), // ✅ CHANGED: White when selected (even if closed)
                ...(isClosed && !isSelected && styles.dayLetterClosed), // ✅ CHANGED: Black only if closed AND not selected
              }}
            >
              {letter}
            </span>

            {/* Date Number */}
            <div style={styles.dateContainer}>
              <span
                style={{
                  ...styles.dateNumber,
                  ...(isSelected && styles.dateNumberSelected), // ✅ CHANGED: White when selected (even if closed)
                  ...(isClosed && !isSelected && styles.dateNumberClosed), // ✅ CHANGED: Black only if closed AND not selected
                }}
              >
                {weekDates[index]}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
