type HomeHeaderProps = {
  userName: string;
};

export default function HomeHeader({ userName }: HomeHeaderProps) {
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
      <p style={{ fontSize: "28px", marginBottom: "0px", textAlign: "right" }}>
        <strong>שלום {userName},</strong>
        <br />
        הנה מה שמחכה לך
      </p>
    </header>
  );
}
