"use client";

type DaySliderProps = {
  selectedDay: string;
  onDaySelect: (day: string) => void;
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
  selectedDay,
  onDaySelect,
}: DaySliderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        padding: "20px 0",
        borderBottom: "2px solid #e0e0e0",
      }}
    >
      {days.map((day) => (
        <button
          key={day.letter}
          onClick={() => onDaySelect(day.letter)}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            border:
              selectedDay === day.letter
                ? "3px solid #0070f3"
                : "2px solid #ccc",
            backgroundColor: selectedDay === day.letter ? "#0070f3" : "#fff",
            color: selectedDay === day.letter ? "#fff" : "#333",
            fontSize: "24px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            if (selectedDay !== day.letter) {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedDay !== day.letter) {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          title={day.name}
        >
          {day.letter}
        </button>
      ))}
    </div>
  );
}
