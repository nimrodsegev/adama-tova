"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiNotifications, supabase } from "@/app/services/db_api";
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";
import { HomeFilter, FilterOption } from "@/lib/components/UI/HomeFilter";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import styles from "./AdminNotificationsPage.module.css";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
  activityId?: string;
};

export default function AdminNotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to convert DB record to UI object
  const mapDbToUi = (dbRecord: any): Notification => {
    let type: "info" | "warning" | "success" | "error" = "info";
    const text = (dbRecord.title + " " + dbRecord.message).toLowerCase();

    if (
      text.includes("cancel") ||
      text.includes("בוטל") ||
      text.includes("ביטול")
    ) {
      type = "error";
    } else if (text.includes("warning") || text.includes("שינוי")) {
      type = "warning";
    } else if (text.includes("success") || text.includes("אושרה")) {
      type = "success";
    }

    return {
      id: dbRecord.id,
      message: dbRecord.message,
      type: type,
      timestamp: new Date(dbRecord.created_at),
      isRead: dbRecord.is_read,
      title: dbRecord.title || "הודעה מערכת",
      activityId: dbRecord.linked_activity_id,
    };
  };

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      const [data, error] = await apiNotifications.getList(user.id, 50);
      if (data) {
        setNotifications(data.map(mapDbToUi));
      }
      setLoading(false);
    };

    loadData();

    const subscription = apiNotifications.subscribe(
      user.id,
      (newRawNotif: any) => {
        const newUiNotif = mapDbToUi(newRawNotif);
        setNotifications((prev) => [newUiNotif, ...prev]);
      }
    );

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Mark as Read Handler
  const handleMarkAsRead = async (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id) : id;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === numericId ? { ...n, isRead: true } : n))
    );

    const [_, error] = await apiNotifications.markAsRead(numericId);

    if (error) {
      console.error("Error marking as read:", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === numericId ? { ...n, isRead: false } : n))
      );
      alert("שגיאה בעדכון ההודעה");
    }
  };

  // Handle activity click from notification card
  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  // Delete Handler
  const handleDelete = async (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id) : id;

    // Optimistic update - remove from list
    setNotifications((prev) => prev.filter((n) => n.id !== numericId));

    const [_, error] = await apiNotifications.delete(numericId);

    if (error) {
      console.error("Error deleting notification:", error);
      // Reload on error
      if (user) {
        const [data] = await apiNotifications.getList(user.id, 50);
        if (data) setNotifications(data.map(mapDbToUi));
      }
      alert("שגיאה במחיקת ההודעה");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const allCount = notifications.length;

  // Filter options with counts
  const filterOptions: FilterOption[] = [
    { id: "all", label: "הכל", count: allCount },
    { id: "unread", label: "לא נקראו", count: unreadCount },
  ];

  if (!user)
    return (
      <div className={styles.pageContainer}>
        <p className={styles.loadingText}>אנא התחבר כדי לצפות בהודעות</p>
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      {/* Title */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>הודעות ועדכונים</h1>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterContainer}>
        <HomeFilter
          options={filterOptions}
          activeOption={filter}
          onFilterChange={(id) => setFilter(id as "all" | "unread")}
        />
      </div>

      {/* Notifications List */}
      <div className={styles.contentContainer}>
        {loading ? (
          <p className={styles.loadingText}>טוען הודעות...</p>
        ) : filteredNotifications.length > 0 ? (
          <div className={styles.notificationsList}>
            {filteredNotifications.map((notif) => (
              <div key={notif.id} className={styles.notificationItem}>
                <NewNotificationCard
                  notification={{
                    id: notif.id,
                    title: notif.title,
                    message: notif.message,
                    timestamp: notif.timestamp,
                    isRead: notif.isRead,
                    activityId: notif.activityId,
                  }}
                  onMarkAsRead={handleMarkAsRead}
                  onActivityClick={handleActivityClick}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyStateContent}>
              <div className={styles.emptyStateIcon}>
                <svg width="48" height="49" viewBox="0 0 48 49" fill="none">
                  {/* Outer dashed circle */}
                  <circle
                    cx="24"
                    cy="24.5"
                    r="22.9"
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="2.2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  {/* Inner dashed circle */}
                  <circle
                    cx="24"
                    cy="24.5"
                    r="11"
                    stroke="rgba(255, 255, 255, 0.5)"
                    strokeWidth="2.2"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  {/* Horizontal line */}
                  <line
                    x1="19.7"
                    y1="24.5"
                    x2="28.3"
                    y2="24.5"
                    stroke="rgba(255, 245, 245, 0.7)"
                    strokeWidth="1"
                  />
                  {/* Vertical line */}
                  <line
                    x1="24"
                    y1="19.2"
                    x2="24"
                    y2="29.8"
                    stroke="rgba(255, 245, 245, 0.7)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <p className={styles.emptyStateText}>אין הודעות אחרונות</p>
            </div>

            {/* Add notification button inside empty state */}
            <Button size="L" href="/AdminScreens/addNotification">
              להוספת הודעה
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Button - only show when there are notifications */}
      {filteredNotifications.length > 0 && (
        <div className={styles.bottomButton}>
          <Button size="L" href="/AdminScreens/addNotification">
            להוספת הודעה
          </Button>
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivityId && (
        <ActivityDetailsModal
          isOpen={isModalOpen}
          activityId={selectedActivityId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
