"use client";

type DaySliderProps = {
  selectedDayIndex: number;
  onDaySelect: (dayIndex: number) => void;
  currentWeekStart: Date;
};

const days = [
  { letter: "א", name: "ראשון" },
  { letter: "ב", name: "שני" },
  { letter: "ג", name: "שלישי" },
  { letter: "ד", name: "רביעי" },
  { letter: "ה", name: "חמישי" },
  { letter: "ו", name: "שישי" },
  { letter: "ש", name: "שבת" },
];

export default function DaySlider({
  selectedDayIndex,
  onDaySelect,
  currentWeekStart,
}: DaySliderProps) {
  // Calculate dates for each day in the week
  const getDateForDay = (dayIndex: number) => {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    return date;
  };

  const formatDayDate = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        padding: "20px 0",
        borderBottom: "2px solid #e0e0e0",
        direction: "rtl",
      }}
    >
      {days.map((day, index) => {
        const dayDate = getDateForDay(index);
        const isSelected = selectedDayIndex === index;

        return (
          <button
            key={day.letter}
            onClick={() => onDaySelect(index)}
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "12px",
              border: isSelected ? "3px solid #0070f3" : "2px solid #ccc",
              backgroundColor: isSelected ? "#0070f3" : "#fff",
              color: isSelected ? "#fff" : "#333",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            title={day.name}
          >
            <span style={{ fontSize: "24px" }}>{day.letter}</span>
            <span style={{ fontSize: "12px", opacity: 0.8 }}>
              {formatDayDate(dayDate)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
