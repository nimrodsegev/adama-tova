type NotificationsHeaderProps = {
  unreadCount: number;
};

export default function NotificationsHeader({
  unreadCount,
}: NotificationsHeaderProps) {
  return (
    <header
      style={{
        marginBottom: "32px",
        direction: "rtl",
        backgroundColor: "transparent",
        padding: 0,
        border: "none",
      }}
    >
      <h1 style={{ fontSize: "32px", marginBottom: "8px", textAlign: "right" }}>
        הודעות ועדכונים
      </h1>
      <p style={{ fontSize: "16px", color: "#666", textAlign: "right" }}>
        {unreadCount > 0
          ? `יש לך ${unreadCount} הודעות שלא נקראו`
          : "כל ההודעות נקראו"}
      </p>
    </header>
  );
}
