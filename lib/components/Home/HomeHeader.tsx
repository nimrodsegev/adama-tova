type HomeHeaderProps = {
  userName: string;
};

export default function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <header style={{ marginBottom: "32px", direction: "ltr" }}>
      <p style={{ fontSize: "28px", marginBottom: "8px" }}>שלום, {userName}</p>
      <p style={{ fontSize: "18px", color: "#555" }}>
        ברוך שובך! הנה מה שמחכה לך הלאה.
      </p>
    </header>
  );
}
