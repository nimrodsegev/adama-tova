"use client";

import React, { useState } from "react";
// ... existing imports ...
import NewNotificationCard from "@/lib/components/UI/NewNotificationCard";

export default function ElementsPage() {
  // ... existing state ...

  // Example Data for Preview
  const [demoNotifications, setDemoNotifications] = useState([
    {
      id: 1,
      title: "מחר אנחנו סגורים",
      message:
        "בעקבות תשעה באב מחר נהיה סגורים. הפעילות תחזור לסדרה ביום שאחרי.",
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: 2,
      title: "שיעור יוגה",
      message: "     עומד להתחיל בעוד שעה. אל תשכחו להביא מים ומגבת!",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true, // Read message
      activityId: "act_123", // Has button
    },
  ]);

  const handleMarkRead = (id: string | number) => {
    setDemoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    alert(`הודעה ${id} סומנה כנקראה!`);
  };

  return (
    <div className="mobile-container">
      {/* ... existing content ... */}

      {/* --- NOTIFICATIONS SECTION --- */}
      <section className="section">
        <h2 className="text-section-title">התראות (החלק שמאלה לקריאה)</h2>
        <div
          className="vertical-scroll gap-md"
          style={{ paddingBottom: "20px" }}
        >
          <p className="text-small mb-xs opacity-75">לא נקרא (עם החלקה)</p>
          <NewNotificationCard
            notification={demoNotifications[0]}
            onMarkAsRead={handleMarkRead}
          />

          <p className="text-small mb-xs opacity-75 mt-md">
            נקרא + כפתור לפעילות
          </p>
          <NewNotificationCard
            notification={demoNotifications[1]}
            onMarkAsRead={handleMarkRead}
            onActivityClick={(id) => alert(`Navigating to activity: ${id}`)}
          />
        </div>
      </section>

      {/* ... existing content ... */}
    </div>
  );
}
