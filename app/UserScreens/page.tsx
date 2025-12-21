"use client";
import Link from "next/link";

export default function UserPage() {
  const userPages = [
    {
      title: "Home",
      description: "View your dashboard and updates",
      href: "/UserScreens/HomePage",
      icon: "🏠",
      bgColor: "bg-blue-400 hover:bg-blue-500",
    },
    {
      title: "Weekly Board",
      description: "View your weekly schedule",
      href: "/UserScreens/WeeklyBoardPage",
      icon: "📊",
      bgColor: "bg-purple-400 hover:bg-purple-500",
    },
    {
      title: "Notifications",
      description: "View your notifications",
      href: "/UserScreens/NotificationsPage",
      icon: "🔔",
      bgColor: "bg-yellow-400 hover:bg-yellow-500",
    },
    {
      title: "Profile",
      description: "View and edit your profile",
      href: "/UserScreens/ProfilePage",
      icon: "👤",
      bgColor: "bg-pink-400 hover:bg-pink-500",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          User Dashboard
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {userPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "180px",
                height: "180px",
                borderRadius: "16px",
                textDecoration: "none",
                transition: "transform 0.2s",
                padding: "16px",
              }}
              className={page.bgColor}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                {page.icon}
              </div>
              <div
                style={{
                  color: "black",
                  fontWeight: "700",
                  fontSize: "18px",
                  textAlign: "center",
                  marginBottom: "6px",
                }}
              >
                {page.title}
              </div>
              <div
                style={{
                  color: "rgba(0, 0, 0, 0.8)",
                  fontSize: "12px",
                  textAlign: "center",
                  lineHeight: "1.3",
                }}
              >
                {page.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
