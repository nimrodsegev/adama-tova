import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div>
        <h2>Welcome to the Product Jam Starter Kit</h2>
        {/* Link to User and Admin Dashboards */}
        <div style={{ margin: "20px 5px" }}>
          <Link
            href="/UserScreens"
            style={{
              padding: "10px 16px",
              backgroundColor: "#0070f3",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            User Dashboard
          </Link>
          <Link
            href="/adminScreens"
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
            Admin Dashboard
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
