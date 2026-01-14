"use client";
import React from "react";
import { useUser } from "@/app/contexts/UserContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const pathname = usePathname();
  const { user, userProfile, loading } = useUser();

  // 1. Blacklist
  const hiddenRoutes = [
    "/AdminScreens/AddActivityPage",
    "/AdminScreens/addNotification",
    "/login",
    "/ApplicationForm",
    "/AdminScreens/EditActivityPage",
    "/elements",
  ];

  const safePathname = pathname || "";
  const isHidden = hiddenRoutes.some((route) => safePathname.includes(route));

  if (isHidden || loading || !user || !userProfile) return null;
  if (userProfile.role === "participant" && !userProfile.is_approved)
    return null;

  const isAdmin = userProfile.role === "admin";

  // Helper: Logic to check if tab is active
  const isTabActive = (currentPath: string, linkHref: string) => {
    if (currentPath === linkHref) return true;
    if (currentPath.startsWith(`${linkHref}/`)) return true;
    return false;
  };

  const baseNavItems = [
    {
      href: isAdmin ? "/AdminScreens/HomePage" : "/UserScreens/HomePage",
      defaultIcon: "/icons/home.svg",
      activeIcon: "/icons/home_active.svg",
      label: "Home",
    },
    {
      href: isAdmin
        ? "/AdminScreens/NotificationPage"
        : "/UserScreens/NotificationsPage",
      defaultIcon: "/icons/message.svg",
      activeIcon: "/icons/message_active.svg",
      label: "Notifications",
    },
    {
      href: isAdmin
        ? "/AdminScreens/AdminCalendarPage"
        : "/UserScreens/UserCalendarPage",
      defaultIcon: "/icons/calendar.svg",
      activeIcon: "/icons/calendar_active.svg",
      label: "Calendar",
    },
    {
      href: "/ProfilePage",
      defaultIcon: "/icons/figure.svg",
      activeIcon: "/icons/figure_active.svg",
      label: "Profile",
    },
  ];

  const navItems = baseNavItems;

  return (
    <footer className={styles.footerWrapper}>
      <nav className={styles.navBar}>
        <div className={styles.iconsContainer}>
          {navItems.map((item) => {
            const isActive = isTabActive(safePathname, item.href);

            return (
              <Link key={item.href} href={item.href} className={styles.navLink}>
                <div className={styles.iconBox}>
                  <Image
                    // Key forces re-render on state change
                    key={`${item.label}-${isActive}`}
                    src={isActive ? item.activeIcon : item.defaultIcon}
                    alt={item.label}
                    width={32}
                    height={32}
                    className={styles.iconImage}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </footer>
  );
}
