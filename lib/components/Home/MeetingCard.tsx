type MeetingCardProps = {
  title: string;
  time: string;
  location: string;
  description: string;
};

export default function MeetingCard({
  title,
  time,
  location,
  description,
}: MeetingCardProps) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "16px",
        width: "250px",
        backgroundColor: "#fff",
        marginRight: "16px",
        direction: "rtl",
      }}
    >
      <h3 style={{ marginBottom: "8px", textAlign: "right" }}>{title}</h3>
      <p style={{ textAlign: "right" }}>
        <strong>זמן:</strong> {time}
      </p>
      <p style={{ textAlign: "right" }}>
        <strong>מיקום:</strong> {location}
      </p>
      <p style={{ marginTop: "8px", textAlign: "right" }}>
        <strong>תיאור:</strong> {description}
      </p>
    </div>
  );
}
