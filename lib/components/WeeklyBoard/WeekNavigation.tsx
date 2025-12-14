"use client";

type WeekNavigationProps = {
  currentWeekStart: Date;
  onWeekChange: (offset: number) => void;
};

export default function WeekNavigation({
  currentWeekStart,
  onWeekChange,
}: WeekNavigationProps) {
  const getWeekRange = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const formatDate = (d: Date) => {
      return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  const goToToday = () => {
    const today = new Date();
    onWeekChange(
      Math.floor(
        (today.getTime() - currentWeekStart.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      )
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <button
        onClick={() => onWeekChange(-1)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0051cc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#0070f3";
        }}
      >
        → שבוע קודם
      </button>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontSize: "18px", fontWeight: "bold" }}>
          {getWeekRange(currentWeekStart)}
        </span>
        <button
          onClick={goToToday}
          style={{
            padding: "6px 16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "background-color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#218838";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#28a745";
          }}
        >
          היום
        </button>
      </div>

      <button
        onClick={() => onWeekChange(1)}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#0051cc";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#0070f3";
        }}
      >
        שבוע הבא ←
      </button>
    </div>
  );
}
