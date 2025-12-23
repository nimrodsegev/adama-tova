"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import {
  apiActivities,
  apiRegistrations,
  apiNotifications,
} from "@/app/services/db_api";
import HomeHeader from "@/lib/components/Home/HomeHeader";
import NotificationSection from "@/lib/components/Home/NotificationSection";
import MeetingSection from "@/lib/components/Home/MeetingSection";
import PossibleMeetingsSection from "@/lib/components/Home/PossibleMeetingsSection";

export default function HomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [registeredActivities, setRegisteredActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // 1. Get user's registration IDs
      const [registrationIds = [], regError] =
        await apiRegistrations.getUserRegistrationIds(user!.id);

      if (regError) {
        console.error("Error fetching registrations:", regError);
      }

      // 2. Get all activities
      const [activities, actError] = await apiActivities.getAll();
      if (actError) {
        console.error("Error fetching activities:", actError);
      }

      // 3. Get user notifications - ONLY UNREAD (onlyUnread = true)
      const [notificationsData, notifError] = await apiNotifications.getList(
        user!.id,
        20,
        true // ✅ רק הודעות שלא נקראו
      );
      if (notifError) {
        console.error("Error fetching notifications:", notifError);
      } else if (notificationsData) {
        // Format notifications to match NotificationCard structure
        const formattedNotifications = notificationsData.map((notif: any) => ({
          id: notif.id,
          message: notif.message,
          type: notif.type || "info",
          timestamp: new Date(notif.created_at),
          isRead: notif.is_read,
          category: notif.category || "כללי",
        }));
        setNotifications(formattedNotifications);
      }

      // 4. Filter activities user is registered to
      if (activities && registrationIds) {
        const registered = activities.filter((activity: any) =>
          registrationIds.includes(activity.id)
        );

        // 5. Get activities user is NOT registered to (for suggestions)
        const notRegistered = activities.filter(
          (activity: any) => !registrationIds.includes(activity.id)
        );

        setRegisteredActivities(registered);
        setAllActivities(notRegistered);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format activities for MeetingSection component
  const formatActivitiesForDisplay = (activities: any[]) => {
    return activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      time: `${activity.start_time.slice(0, 5)} - ${activity.end_time.slice(
        0,
        5
      )}`,
      location: activity.location,
      description: activity.description,
    }));
  };

  if (userLoading || loading) {
    return (
      <main
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p>טוען...</p>
      </main>
    );
  }

  if (!user || !userProfile) {
    return (
      <main
        style={{
          padding: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p>עליך להתחבר כדי לראות את הדף</p>
      </main>
    );
  }

  const upcomingMeetings = formatActivitiesForDisplay(registeredActivities);
  const possibleMeetings = formatActivitiesForDisplay(
    allActivities.slice(0, 4)
  ); // Show first 4 suggestions

  return (
    <main
      style={{
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <HomeHeader userName={userProfile.full_name} />

      {/* Notifications Section */}
      {notifications.length > 0 ? (
        <NotificationSection
          notifications={notifications}
          maxDisplay={3}
          onRefresh={fetchData} // ✅ רענון הנתונים כשהודעה מסומנת כנקראת
        />
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            color: "#666",
          }}
        >
          <p>אין הודעות חדשות</p>
        </div>
      )}

      {/* Registered Activities Section */}
      {upcomingMeetings.length > 0 ? (
        <MeetingSection meetings={upcomingMeetings} />
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            color: "#666",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>אין פעילויות רשומות</h3>
          <p>טרם נרשמת לאף פעילות. בדוק את הפעילויות המוצעות למטה!</p>
        </div>
      )}

      {/* Suggested Activities Section */}
      {possibleMeetings.length > 0 ? (
        <PossibleMeetingsSection meetings={possibleMeetings} />
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            textAlign: "center",
            marginBottom: "20px",
            color: "#666",
          }}
        >
          <p>אין פעילויות זמינות כרגע</p>
        </div>
      )}
    </main>
  );
}
