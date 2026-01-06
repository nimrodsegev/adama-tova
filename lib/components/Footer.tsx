"use client";
import { useUser } from "@/app/contexts/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const { user, userProfile, loading, signOut } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
    router.refresh();
  };

  // Don't show navbar if not logged in or still loading
  if (loading || !user || !userProfile) {
    return null;
  }
  if (userProfile.role === "participant" && !userProfile.is_approved) {
    return null;
  }

  const isAdmin = userProfile.role === "admin";

  // Admin navigation
  const adminNavItems = [
    {
      href: "/AdminScreens/NotificationPage",
      icon: "/icons/message_icon.svg",
      label: "Notifications",
    },
    {
      href: "/AdminScreens/AdminCalendarPage",
      icon: "/icons/calendar_icon.svg",
      label: "Calendar",
    },

    {
      href: "/AdminScreens/HomePage",
      icon: "/icons/home_icon.svg",
      label: "Home",
    },
    { href: "/profile", icon: "/icons/figure_icon.svg", label: "Profile" },
    {
      href: "/AdminScreens/UsersManagementPage",
      icon: "/icons/users_management_icon.svg",
      label: "Users",
    },
  ];

  // User navigation
  const userNavItems = [
    {
      href: "/UserScreens/NotificationsPage",
      icon: "/icons/message_icon.svg",
      label: "Notifications",
    },
    {
      href: "/UserScreens/UserCalendarPage",
      icon: "/icons/calendar_icon.svg",
      label: "UserCalendar",
    },
    {
      href: "/UserScreens/HomePage",
      icon: "/icons/home_icon.svg",
      label: "Home",
    },
    { href: "/profile", icon: "/icons/figure_icon.svg", label: "Profile" },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav style={styles.navBar}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} style={styles.navItem}>
          <Image
            src={item.icon}
            alt={item.label}
            width={35}
            height={35}
            style={{ objectFit: "contain" }}
          />
        </Link>
      ))}
    </nav>
  );
}

const styles = {
  navBar: {
    position: "fixed" as const,
    bottom: "1.25rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: "22.0625rem",
    height: "3.8125rem",
    background: "rgba(255, 255, 255, 0.55)", // Changed from 0.6 to 0.7 to match cardContainer
    backdropFilter: "blur(0.4rem)", // Changed from 0.625rem to 0.4rem to match cardContainer
    WebkitBackdropFilter: "blur(0.4rem)",
    borderRadius: "1.25rem",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 1000,
    WebkitTapHighlightColor: "transparent",
  },
  navItem: {
    fontSize: "1.5rem",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
