"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiNotifications, supabase } from "@/app/services/db_api";
import NotificationCard from "@/lib/components/Notifications/NotificationCard";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import styles from "./NotificationsPage.module.css"; // ✅ Import as styles object

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  title: string;
  activityId?: string;
};

export default function NotificationsPage() {
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

  const handleMarkAsRead = async (id: number) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    const [_, error] = await apiNotifications.markAsRead(id);

    if (error) {
      console.error("Error marking as read:", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      alert("שגיאה בעדכון ההודעה");
    }
  };

  // Handle notification click
  const handleNotificationClick = (notif: Notification) => {
    if (notif.activityId) {
      setSelectedActivityId(notif.activityId);
      setIsModalOpen(true);
    }
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
      <div className="mobile-container">
        <p className="text-loading">אנא התחבר כדי לצפות בהודעות</p>
      </div>
    );

  return (
    <div className="mobile-container">
      <div className="vector-background" />

      <h1 className="header-secondary absolute-header-right">
        הודעות ועדכונים
      </h1>

      <div className="main-content-high">
        <div className="filter-container">
          <button
            onClick={() => setFilter("all")}
            className={`filter-button ${
              filter === "all" ? "filter-button-active" : ""
            }`}
          >
            הכל
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`filter-button ${
              filter === "unread" ? "filter-button-active" : ""
            }`}
          >
            לא נקראו
          </button>
        </div>

        {loading ? (
          <p className="text-loading">טוען הודעות...</p>
        ) : (
          <div className="vertical-scroll">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={styles.notificationItem} // ✅ Use styles object for module CSS
                  style={{ cursor: notif.activityId ? "pointer" : "default" }}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <NotificationCard
                    notification={notif}
                    onMarkAsRead={handleMarkAsRead}
                  />
                </div>
              ))
            ) : (
              <p className="text-empty">אין הודעות להצגה</p>
            )}
          </div>
        )}
      </div>

      {/* Render Modal */}
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
