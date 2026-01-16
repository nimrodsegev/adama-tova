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

  // 2. FIX: Don't return null on 'loading' if we already have a user.
  // This prevents flickering during navigation refreshes.
  // Only hide if we are hidden, or if we are loaded and definitely have no user.
  if (isHidden) return null;

  // If still loading initially (no user yet), you might want to hide it,
  // OR show a skeleton. For now, we only hide if loading AND no user.
  if (loading && !user) return null;

  // If loaded and no user, hide (not logged in)
  if (!loading && (!user || !userProfile)) return null;

  // Safety check for userProfile just in case
  if (
    userProfile &&
    userProfile.role === "participant" &&
    !userProfile.is_approved
  )
    return null;

  const isAdmin = userProfile?.role === "admin";

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
                    width={24}
                    height={24}
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
