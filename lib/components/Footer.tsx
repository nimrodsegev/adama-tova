"use client";
import React from "react";
import { useUser } from "@/app/contexts/UserContext";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  const { user, userProfile, loading } = useUser();

  if (loading || !user || !userProfile) return null;
  if (userProfile.role === "participant" && !userProfile.is_approved)
    return null;

  const isAdmin = userProfile.role === "admin";

  /**
   * Navigation Order (Right to Left):
   * 1. Home
   * 2. Notifications (Message)
   * 3. Calendar
   * 4. Profile (Figure)
   * 5. Users (Admin Only)
   */
  const baseNavItems = [
    {
      href: isAdmin ? "/AdminScreens/HomePage" : "/UserScreens/HomePage",
      icon: "/icons/home_icon.svg",
      label: "Home",
    },
    {
      href: isAdmin
        ? "/AdminScreens/NotificationPage"
        : "/UserScreens/NotificationsPage",
      icon: "/icons/message_icon.svg",
      label: "Notifications",
    },
    {
      href: isAdmin
        ? "/AdminScreens/AdminCalendarPage"
        : "/UserScreens/UserCalendarPage",
      icon: "/icons/calendar_icon.svg",
      label: "Calendar",
    },
    { href: "/profile", icon: "/icons/figure_icon.svg", label: "Profile" },
  ];

  const navItems = isAdmin
    ? [
        ...baseNavItems,
        {
          href: "/AdminScreens/UsersManagementPage",
          icon: "/icons/users_management_icon.svg",
          label: "Users",
        },
      ]
    : baseNavItems;

  return (
    <footer className={styles.footerWrapper}>
      <nav className={styles.navBar}>
        <div className={styles.iconsContainer}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              <div className={styles.iconBox}>
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={32} /* Increased from 24 */
                  height={32}
                  className={styles.iconImage}
                />
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </footer>
  );
}
