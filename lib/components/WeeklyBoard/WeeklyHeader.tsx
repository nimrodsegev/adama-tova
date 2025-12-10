type WeeklyHeaderProps = {
  currentDate: Date;
};

export default function WeeklyHeader({ currentDate }: WeeklyHeaderProps) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("he-IL", options);
  };

  return (
    <header
      style={{
        marginBottom: "32px",
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "12px",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "8px", fontWeight: "bold" }}>
        לוח שבועי
      </h1>
      <p style={{ fontSize: "20px", color: "#555" }}>
        {formatDate(currentDate)}
      </p>
    </header>
  );
}
