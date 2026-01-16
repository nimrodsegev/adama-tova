"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiNotifications, supabase } from "@/app/services/db_api";
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import Button from "@/lib/components/UI/Button";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
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

  // Swipe hints
  const [showMarkAsReadHint, setShowMarkAsReadHint] = useState(false);
  const [showDeleteHint, setShowDeleteHint] = useState(false);

  useEffect(() => {
    const hasUsedMarkAsRead = localStorage.getItem("user_used_mark_as_read");
    const hasUsedDelete = localStorage.getItem("user_used_delete");

    if (!hasUsedMarkAsRead) {
      setShowMarkAsReadHint(true);
    }
    if (!hasUsedDelete) {
      setShowDeleteHint(true);
    }
  }, []);

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

    if (showMarkAsReadHint)
      localStorage.setItem("user_used_mark_as_read", "true");
    if (showDeleteHint) localStorage.setItem("user_used_delete", "true");
    setShowMarkAsReadHint(false);
    setShowDeleteHint(false);

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

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    const [res, error] = await apiNotifications.markAllAsRead(user.id);

    if (error) {
      console.error("Error marking all as read", error);
      const [data] = await apiNotifications.getList(user.id, 50);
      if (data) setNotifications(data.map(mapDbToUi));
    }
  };

  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivityId(null);
  };

  const handleDelete = async (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id) : id;

    if (showMarkAsReadHint)
      localStorage.setItem("user_used_mark_as_read", "true");
    if (showDeleteHint) localStorage.setItem("user_used_delete", "true");
    setShowMarkAsReadHint(false);
    setShowDeleteHint(false);

    setNotifications((prev) => prev.filter((n) => n.id !== numericId));
    const [_, error] = await apiNotifications.delete(numericId);

    if (error) {
      console.error("Error deleting notification:", error);
      if (user) {
        const [data] = await apiNotifications.getList(user.id, 50);
        if (data) setNotifications(data.map(mapDbToUi));
      }
      alert("שגיאה במחיקת ההודעה");
    }
  };

  // ⭐ Calculate counts for each filter
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const allCount = notifications.length;

  // ⭐ Dynamic filters with counts
  const dynamicFilters = [
    { id: "all", label: "הכל", count: allCount },
    { id: "unread", label: "לא נקרא", count: unreadCount },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  return (
    <SmoothPageWrapper isLoading={loading || !user}>
      <div className={styles.pageContainer}>
        <div className="vector-background" />

        <div className={styles.titleContainer}>
          <h1 className={styles.title}>הודעות ועדכונים</h1>
        </div>

        <div className={styles.filterContainer}>
          <HomeFilter
            options={dynamicFilters}
            activeOption={filter}
            onFilterChange={(id) => setFilter(id as "all" | "unread")}
          />
        </div>

        <div className={styles.actionsContainer}>
          <Button
            variant="tertiary"
            tertiarySize="medium"
            tertiaryWeight="semibold"
            customBgColor="transparent"
            customTextColor="var(--color-bg-light-opaque)"
            tertiaryArrowDirection="down"
            onClick={handleMarkAllAsRead}
            disabled={loading || unreadCount === 0}
            // This style hides the button but keeps the physical space (preventing layout jump)
            style={{ visibility: unreadCount > 0 ? "visible" : "hidden" }}
          >
            סמן הכל כנקרא
          </Button>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.notificationsList}>
            {filteredNotifications.length > 0
              ? filteredNotifications.map((notif, index) => {
                  const isFirst = index === 0;
                  const isFirstUnread =
                    !notif.isRead &&
                    filteredNotifications.findIndex((n) => !n.isRead) === index;

                  return (
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
                        onDelete={handleDelete}
                        onActivityClick={handleActivityClick}
                        showMarkAsReadHint={showMarkAsReadHint && isFirstUnread}
                        showDeleteHint={showDeleteHint && isFirst}
                      />
                    </div>
                  );
                })
              : !loading && <p className="text-empty">כל ההודעות שלך נקראו</p>}
          </div>
        </div>

        {selectedActivityId && (
          <ActivityDetailsModal
            isOpen={isModalOpen}
            activityId={selectedActivityId}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </SmoothPageWrapper>
  );
}
