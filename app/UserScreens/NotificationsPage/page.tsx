"use client";
import { useState } from "react";
import NotificationsHeader from "@/lib/components/Notifications/NotificationsHeader";
import NotificationsFilters from "@/lib/components/Notifications/NotificationsFilters";
import NotificationsBody from "@/lib/components/Notifications/NotificationsBody";

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: Date;
  isRead: boolean;
  category: string;
};

// Mock data - Will be replaced with Supabase fetch
// Future: import { fetchNotifications } from "@/lib/api/notifications";
const initialNotifications: Notification[] = [
  {
    id: 1,
    message: "המפגש של מחר ב-10:00 עבר לחדר 205",
    type: "warning",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
    category: "שינויים במפגשים",
  },
  {
    id: 2,
    message: "נוספת סדנה חדשה - פיתוח ממשקי משתמש מודרניים",
    type: "info",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: false,
    category: "מפגשים חדשים",
  },
  {
    id: 3,
    message: "הרשמתך לסדנה אושרה בהצלחה!",
    type: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
    category: "אישורים",
  },
  {
    id: 4,
    message: "נא לעדכן את פרטי הפרופיל שלך",
    type: "info",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false,
    category: "פרופיל",
  },
  {
    id: 5,
    message: "המפגש 'סקירת קוד' בוטל",
    type: "error",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isRead: true,
    category: "ביטולים",
  },
  {
    id: 6,
    message: "תזכורת: מפגש צוות מחר בשעה 09:00",
    type: "info",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isRead: true,
    category: "תזכורות",
  },
];

export default function NotificationsPage() {
  // Future: const { data: notifications, loading } = useSupabase('notifications');
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Future: These will be API calls to Supabase
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    // Future: await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const markAsUnread = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
    // Future: await supabase.from('notifications').update({ is_read: false }).eq('id', id);
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    // Future: await supabase.from('notifications').delete().eq('id', id);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    // Future: await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

      <NotificationsBody
        notifications={filteredNotifications}
        onMarkAsRead={markAsRead}
        onMarkAsUnread={markAsUnread}
        onDelete={deleteNotification}
      />
    </main>
  );
}
