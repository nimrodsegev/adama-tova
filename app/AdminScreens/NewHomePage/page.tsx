"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiUser, apiActivities } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { HomeFilter, ADMIN_FILTER_OPTIONS } from "@/lib/components/UI/HomeFilter";
import styles from "./NewHomePage.module.css";

export default function NewAdminHomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [activeFilter, setActiveFilter] = useState<"pending" | "approved">("pending");
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [upcomingActivitiesCount, setUpcomingActivitiesCount] = useState(0);

  // Fetch counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      // Fetch pending users count
      const [users, userError] = await apiUser.getAllUsers();
      if (!userError && users) {
        const pendingCount = users.filter(
          (u: any) => !u.is_approved && u.role !== "admin"
        ).length;
        setPendingUsersCount(pendingCount);
      }

      // Fetch upcoming activities count (dedupe by series_id)
      const [activities, actError] = await apiActivities.getAll();
      if (!actError && activities) {
        const seenSeriesIds = new Set<string>();
        let count = 0;

        for (const activity of activities) {
          if (activity.series_id) {
            // Group activity - only count first one per series
            if (!seenSeriesIds.has(activity.series_id)) {
              seenSeriesIds.add(activity.series_id);
              count++;
            }
          } else {
            // Regular activity - always count
            count++;
          }
        }
        setUpcomingActivitiesCount(count);
      }
    };

    fetchCounts();
  }, []);

  if (userLoading) {
    return (
      <div className={styles.loadingContainer} dir="rtl">
        טוען...
      </div>
    );
  }

  const firstName = userProfile?.full_name?.split(" ")[0] || "מנהל";

  return (
    <div className={styles.pageContainer} dir="rtl">
      {/* Decorative Circles - positioned at top */}
      <OrganicCircles
        mode="breathing"
        radius={0.08}
        layers={3}
        smoothness={0.5}
        complexity={0.5}
        elongation={0.3}
        opacity={0.7}
        strokeWidth={2.3}
        position={{ x: 0.5, y: 0.1 }}
        baseColor="#FFFFFF"
      />

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Greeting Section */}
        <div className={styles.greetingSection}>
          <h1 className={styles.greetingTitle}>היי {firstName},</h1>
          <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
        </div>

        {/* Opening Hours Bar */}
        <button className={styles.openingHoursBar}>
          <div className={styles.openingHoursContent}>
            <span className={styles.openingHoursText}>
              המרחב פתוח היום 16:00 עד 22:00
            </span>
            <div className={styles.editButton}>
              <span className={styles.editText}>עריכה</span>
              <span className={styles.editArrow}></span>
            </div>
          </div>
        </button>

        {/* Filter Tabs */}
        <div className={styles.filterContainer}>
          <HomeFilter
            options={ADMIN_FILTER_OPTIONS}
            activeOption={activeFilter}
            onFilterChange={(id) => setActiveFilter(id as "pending" | "approved")}
            size="medium"
          />
        </div>

        {/* Section Title */}
        <h2 className={styles.sectionTitle}>
          {activeFilter === "pending"
            ? `ממתינים לאישור (${pendingUsersCount})`
            : `המפגשים הבאים (${upcomingActivitiesCount})`}
        </h2>

        {/* Cards Placeholder */}
        <div className={styles.cardsContainer}>
          {/* Placeholder cards - your friend will replace these */}
          <div className={styles.placeholderCard}>
            <div className={styles.cardHeader}>
              <span className={styles.userName}>ישראל ישראלי</span>
              <span className={styles.userIcon}>👤</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardButtons}>
                <button className={styles.approveButton}>אשר</button>
                <button className={styles.rejectButton}>סרב</button>
              </div>
              <p className={styles.cardInfo}>
                ממתין לאישור ראשוני מתאריך 01.01 מעגל
              </p>
            </div>
          </div>

          <div className={styles.placeholderCard}>
            <div className={styles.cardHeader}>
              <span className={styles.userName}>ישראל ישראלי</span>
              <span className={styles.userIcon}>👥 3</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardButtons}>
                <button className={styles.approveButton}>אשר</button>
                <button className={styles.rejectButton}>סרב</button>
              </div>
              <p className={styles.cardInfo}>
                ממתין לאישור קבוצה מתאריך 01.01 מעגל
              </p>
            </div>
          </div>

          <div className={styles.placeholderCard}>
            <div className={styles.cardHeader}>
              <span className={styles.userName}>ישראל ישראלי</span>
              <span className={styles.userIcon}>👤</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardButtons}>
                <button className={styles.approveButton}>אשר</button>
                <button className={styles.rejectButton}>סרב</button>
              </div>
              <p className={styles.cardInfo}>
                ממתין לאישור ראשוני מתאריך 01.01 מעגל
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className={styles.bottomButtons}>
          <button className={styles.purpleButton}>לאתר</button>
          <button className={styles.purpleButton}>לאתר</button>
        </div>
      </div>
    </div>
  );
}
