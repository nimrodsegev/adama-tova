import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div>
        <h2>Welcome to the Product Jam Starter Kit</h2>

        {/* Link to your actual Home Page */}
        <div style={{ margin: "20px 5px" }}>
          <Link
            href="/screens/HomePage"
            style={{
              padding: "10px 16px",
              backgroundColor: "#0070f3",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            עמוד הבית
          </Link>
          <Link
            href="/screens/WeeklyBoardPage"
            style={{
              padding: "10px 16px",
              backgroundColor: "#28a745",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
              marginLeft: "10px",
            }}
          >
            לוח שבועי
          </Link>
          <Link
            href="/screens/NotificationsPage"
            style={{
              padding: "10px 16px",
              backgroundColor: "#ff9800",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
              marginLeft: "10px",
            }}
          >
            הודעות ועדכונים
          </Link>
          <Link
            href="/screens/AddActivityPage"
            style={{
              padding: "10px 16px",
              backgroundColor: "#dc3545",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
              marginLeft: "10px",
            }}
          >
            הוסף פעילות (מנהל)
          </Link>
        </div>

        <Image
          src="/huji.svg"
          alt="HUJI Logo"
          width={80}
          height={80}
          priority
        />
        <Image
          src="/bezalel.svg"
          alt="Bezalel Logo"
          className="item"
          width={80}
          height={80}
          priority
        />
      </div>
    </main>
  );
}
