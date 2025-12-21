"use client";
import Link from "next/link";

export default function AdminPage() {
  const adminPages = [
    {
      title: "Home",
      description: "View dashboard and overview",
      href: "/adminScreens/HomePage",
      icon: "🏠",
      bgColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "Calendar",
      description: "Manage schedules and appointments",
      href: "/adminScreens/CalendarPage",
      icon: "📅",
      bgColor: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Add Activity",
      description: "Create new activities",
      href: "/adminScreens/AddActivityPage",
      icon: "➕",
      bgColor: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Users",
      description: "Manage user accounts",
      href: "/adminScreens/UsersManagementPage",
      icon: "👥",
      bgColor: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Notifications",
      description: "Send and manage notifications",
      href: "/adminScreens/NotificationPage",
      icon: "🔔",
      bgColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      title: "Profile",
      description: "View and edit profile settings",
      href: "/adminScreens/ProfilePage",
      icon: "👤",
      bgColor: "bg-pink-500 hover:bg-pink-600",
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
          Admin Dashboard
        </h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {adminPages.map((page) => (
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
                  color: "rgba(3, 2, 2, 0.9)",
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
