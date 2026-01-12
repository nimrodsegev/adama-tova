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

  // 1. Blacklist of routes where the footer must be hidden
  const hiddenRoutes = [
    "/AdminScreens/AddActivityPage",
    "/AdminScreens/addNotification",
    "/login",
    "/ApplicationForm", // This covers the SignupWizard folder
    "/AdminScreens/EditActivityPage",
  ];

  // Check if current path matches any item in the blacklist
  const isHidden = hiddenRoutes.some((route) => pathname.includes(route));

  // 2. Logic-based hiding
  if (isHidden || loading || !user || !userProfile) return null;
  if (userProfile.role === "participant" && !userProfile.is_approved)
    return null;

  const isAdmin = userProfile.role === "admin";

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
                  width={32}
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
