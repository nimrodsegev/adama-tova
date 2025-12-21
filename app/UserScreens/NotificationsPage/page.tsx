"use client";
import { useState, useEffect } from "react";
import NotificationsHeader from "@/lib/components/Notifications/NotificationsHeader";
import NotificationsFilters from "@/lib/components/Notifications/NotificationsFilters";
import NotificationsBody from "@/lib/components/Notifications/NotificationsBody";
import { useUser } from "@/app/contexts/UserContext"; // 👈 Import User Context
import { apiNotifications, supabase } from "@/app/services/db_api"; // 👈 Import API

// Matches your UI component's expected type
type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  category: string;
};

export default function NotificationsPage() {
  const { user } = useUser(); // Get current user
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);

  // --- HELPER: Map DB Data to UI Type ---
  // This converts the raw DB row into the format your components expect
  const mapDbToUi = (dbRecord: any): Notification => {
    let type: "info" | "warning" | "success" | "error" = "info";
    
    // 🔍 Auto-detect type based on keywords
    const text = (dbRecord.title + " " + dbRecord.message).toLowerCase();

    if (text.includes("cancel") || text.includes("בוטל") || text.includes("ביטול")) {
      type = "error"; // 🔴 Makes it red
    } else if (text.includes("warning") || text.includes("שינוי")) {
      type = "warning"; // 🟡 Makes it yellow
    } else if (text.includes("success") || text.includes("אושרה")) {
      type = "success"; // 🟢 Makes it green
    }

    return {
      id: dbRecord.id,
      message: dbRecord.message,
      type: type,
      timestamp: new Date(dbRecord.created_at),
      isRead: dbRecord.is_read,
      category: dbRecord.title || "הודעה מערכת", // Use Title as Category
    };
  };

  // --- 1. Fetch Data ---
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setLoading(true);
      const [data, error] = await apiNotifications.getList(user.id, 50); // Fetch last 50
      if (data) {
        setNotifications(data.map(mapDbToUi));
      }
      setLoading(false);
    };

    loadData();

    // --- 2. Real-time Subscription ---
    // This makes the "Activity Cancelled" pop up instantly!
    const subscription = apiNotifications.subscribe(user.id, (newRawNotif: any) => {
       const newUiNotif = mapDbToUi(newRawNotif);
       setNotifications((prev) => [newUiNotif, ...prev]);
    });

    // Cleanup
    return () => { supabase.removeChannel(subscription); };

  }, [user]);

  // --- Actions ---

  const markAsRead = async (id: number) => {
    // Optimistic Update (Update UI immediately)
    setNotifications(prev => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    // API Call
    await apiNotifications.markAsRead(id);
  };

  const markAsUnread = async (id: number) => {
    setNotifications(prev => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
    await apiNotifications.markAsUnread(id);
  };

  const deleteNotification = async (id: number) => {
    setNotifications(prev => prev.filter((n) => n.id !== id));
    await apiNotifications.delete(id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map((n) => ({ ...n, isRead: true })));
    await apiNotifications.markAllAsRead(user.id);
  };

  // --- Filtering ---
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!user) return <div style={{ padding: 40, textAlign: 'center' }}>אנא התחבר כדי לצפות בהודעות</div>;

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <NotificationsHeader unreadCount={unreadCount} />

      <NotificationsFilters
        filter={filter}
        onFilterChange={setFilter}
        totalCount={notifications.length}
        unreadCount={unreadCount}
        readCount={notifications.length - unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      {loading ? (
        <p style={{textAlign: 'center', marginTop: 20}}>טוען הודעות...</p>
      ) : (
        <NotificationsBody
          notifications={filteredNotifications}
          onMarkAsRead={markAsRead}
          onMarkAsUnread={markAsUnread}
          onDelete={deleteNotification}
        />
      )}
    </main>
  );
}