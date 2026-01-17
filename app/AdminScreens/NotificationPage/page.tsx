"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiNotifications, supabase } from "@/app/services/db_api";
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";
import { HomeFilter, FilterOption } from "@/lib/components/UI/HomeFilter";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import EmptyState from "@/lib/components/UI/EmptyState";
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
  const [mounting, setMounting] = useState(true);

  // Modal state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Swipe hints
  const [showMarkAsReadHint, setShowMarkAsReadHint] = useState(false);
  const [showDeleteHint, setShowDeleteHint] = useState(false);

  // Hints Logic
  useEffect(() => {
    const hasUsedMarkAsRead = localStorage.getItem("admin_used_mark_as_read");
    const hasUsedDelete = localStorage.getItem("admin_used_delete");

    if (!hasUsedMarkAsRead) setShowMarkAsReadHint(true);
    if (!hasUsedDelete) setShowDeleteHint(true);
  }, []);

  // Mounting Animation
  useEffect(() => {
    const timer = setTimeout(() => setMounting(false), 50);
    return () => clearTimeout(timer);
  }, []);

  // Helper: DB to UI mapping
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

  // Data Fetching
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

  // Handlers
  const handleMarkAsRead = async (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id) : id;
    if (showMarkAsReadHint)
      localStorage.setItem("admin_used_mark_as_read", "true");
    if (showDeleteHint) localStorage.setItem("admin_used_delete", "true");
    setShowMarkAsReadHint(false);
    setShowDeleteHint(false);

    setNotifications((prev) =>
      prev.map((n) => (n.id === numericId ? { ...n, isRead: true } : n))
    );
    const [_, error] = await apiNotifications.markAsRead(numericId);
    if (error) {
      console.error(error);
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

  const handleDelete = async (id: number | string) => {
    const numericId = typeof id === "string" ? parseInt(id) : id;
    if (showMarkAsReadHint)
      localStorage.setItem("admin_used_mark_as_read", "true");
    if (showDeleteHint) localStorage.setItem("admin_used_delete", "true");
    setShowMarkAsReadHint(false);
    setShowDeleteHint(false);

    setNotifications((prev) => prev.filter((n) => n.id !== numericId));
    const [_, error] = await apiNotifications.delete(numericId);
    if (error) {
      console.error(error);
      const [data] = await apiNotifications.getList(user ? user.id : "", 50);
      if (data) setNotifications(data.map(mapDbToUi));
      alert("שגיאה במחיקת ההודעה");
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

  // Filtering
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const allCount = notifications.length;

  const filterOptions: FilterOption[] = [
    { id: "all", label: "הכל", count: allCount },
    { id: "unread", label: "לא נקראו", count: unreadCount },
  ];

  if (!user) return null;

  return (
    <SmoothPageWrapper isLoading={loading || mounting}>
      <div className={styles.pageContainer}>
        {/* Title */}
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>הודעות ועדכונים</h1>
        </div>

        {/* Filter */}
        <div className={styles.filterContainer}>
          <HomeFilter
            options={filterOptions}
            activeOption={filter}
            onFilterChange={(id) => setFilter(id as "all" | "unread")}
          />
        </div>

        {/* Actions Container - UPDATED WITH VISIBILITY LOGIC */}
        <div className={styles.actionsContainer}>
          <Button
            variant="tertiary"
            tertiarySize="medium"
            tertiaryWeight="semibold"
            customBgColor="transparent"
            customTextColor="#F9F9F9"
            tertiaryArrowDirection="down"
            onClick={handleMarkAllAsRead}
            disabled={loading || unreadCount === 0}
            // Logic to hide button but keep layout spacing
            style={{ visibility: unreadCount > 0 ? "visible" : "hidden" }}
          >
            סמן הכל כנקרא
          </Button>
        </div>

        {/* Content Container */}
        <div className={styles.contentContainer}>
          {filteredNotifications.length > 0 ? (
            /* LIST (Now part of the main scroll flow) */
            <div className={styles.notificationsList}>
              {filteredNotifications.map((notif, index) => {
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
              })}
            </div>
          ) : (
            !loading && (
              /* EMPTY STATE */

              <div className={styles.emptyStateContainer}>
                <EmptyState
                  message="אין הודעות אחרונות"
                  buttonText="להוספת הודעה"
                  buttonHref="/AdminScreens/addNotification"
                />
              </div>
            )
          )}
        </div>

        {/* Sticky Button */}
        {filteredNotifications.length > 0 && (
          <div className={styles.bottomButton}>
            <Button size="L" href="/AdminScreens/addNotification">
              להוספת הודעה
            </Button>
          </div>
        )}

        {/* Modal */}
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
