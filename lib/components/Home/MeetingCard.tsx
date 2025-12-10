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
        marginLeft: "16px",
        direction: "ltr",
      }}
    >
      <h3 style={{ marginBottom: "8px" }}>{title}</h3>
      <p>
        <strong>זמן:</strong> {time}
      </p>
      <p>
        <strong>מיקום:</strong> {location}
      </p>
      <p style={{ marginTop: "8px" }}>{description}</p>
    </div>
  );
}
