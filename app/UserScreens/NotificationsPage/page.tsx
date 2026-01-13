"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiNotifications, supabase } from "@/app/services/db_api";
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import styles from "./UserNotificationPage.module.css";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
  activityId?: string;
};

const NOTIFICATION_FILTERS = [
  { id: "all", label: "הכל" },
  { id: "unread", label: "לא נקרא" },
];

export default function NewUserNotificationPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  if (!user)
    return (
      <div className={styles.pageContainer}>
        <p className="text-loading">אנא התחבר כדי לצפות בהודעות</p>
      </div>
    );

  return (
    <div className={styles.pageContainer}>
      <div className="vector-background" />

      {/* Centered Title */}
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>הודעות ועדכונים</h1>
      </div>

      {/* Centered Filter */}
      <div className={styles.filterContainer}>
        <HomeFilter
          options={NOTIFICATION_FILTERS}
          activeOption={filter}
          onFilterChange={(id) => setFilter(id as "all" | "unread")}
        />
      </div>

      {/* Notifications List */}
      <div className={styles.contentContainer}>
        {loading ? (
          <p className="text-loading">טוען הודעות...</p>
        ) : (
          <div className={styles.notificationsList}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
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
              ))
            ) : (
              <p className="text-empty">אין הודעות להצגה</p>
            )}
          </div>
        )}
      </div>

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
