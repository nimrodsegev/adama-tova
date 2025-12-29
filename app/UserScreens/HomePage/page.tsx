"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";
import UserActivityCard from "@/lib/components/Home/UserActivityCard";
import EmptyState from "@/lib/components/UI/EmptyState";
import styles from "./HomePage.styles";

// Interests Mapping
const INTRESTS_MAPPING: Record<string, string> = {
  מדיטציה: "Meditation",
  יוגה: "Yoga",
  אומנות: "Art",
  כתיבה: "Writing",
  מינדפולנס: "Mindfulness",
  יצירה: "Crafts",
};

// Opening hours configuration (24-hour format)
const OPENING_HOURS = {
  0: { open: "16:00", close: "22:00" }, // Sunday
  2: { open: "16:00", close: "22:00" }, // Tuesday
  3: { open: "16:00", close: "22:00" }, // Wednesday
};

export default function HomePage() {
  const { user, userProfile, loading: userLoading } = useUser();
  const [registeredActivities, setRegisteredActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, userProfile]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [registrationIds = [], regError] =
        await apiRegistrations.getUserRegistrationIds(user!.id);

      if (regError) {
        console.error("Error fetching registrations:", regError);
      }

      const [activities, actError] = await apiActivities.getAll();

      if (actError) {
        console.error("Error fetching activities:", actError);
      }

      if (activities && registrationIds) {
        const registered = activities.filter((activity: any) =>
          registrationIds.includes(activity.id)
        );

        const notRegistered = activities.filter(
          (activity: any) => !registrationIds.includes(activity.id)
        );

        let filteredSuggestions = notRegistered;
        if (
          userProfile?.quiz?.interests &&
          userProfile.quiz.interests.length > 0
        ) {
          const myInterestsEnglish = userProfile.quiz.interests.map(
            (interest: string) => INTRESTS_MAPPING[interest] || interest
          );

          filteredSuggestions = notRegistered.filter((activity: any) =>
            myInterestsEnglish.includes(activity.category)
          );
        }

        setRegisteredActivities(registered);
        setAllActivities(filteredSuggestions);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get status message based on current day
  const getStatusMessage = () => {
    const today = new Date().getDay();

    if (today in OPENING_HOURS) {
      const hours = OPENING_HOURS[today as keyof typeof OPENING_HOURS];
      return `שעות הפעילות היום: ${hours.open} עד ${hours.close}`;
    }

    const openDays = [0, 2, 3];
    const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

    let daysUntilOpen = 1;
    let nextDay = (today + 1) % 7;

    while (!openDays.includes(nextDay) && daysUntilOpen < 7) {
      daysUntilOpen++;
      nextDay = (today + daysUntilOpen) % 7;
    }

    if (daysUntilOpen === 1) {
      return "היום המרחב סגור אבל נתראה מחר";
    } else if (daysUntilOpen === 2) {
      return "היום המרחב סגור אבל נתראה מחרתיים";
    } else {
      return `היום המרחב סגור אבל נתראה ביום ${dayNames[nextDay]}`;
    }
  };

  if (userLoading || loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>טוען...</p>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>עליך להתחבר כדי לראות את הדף</p>
      </div>
    );
  }

  const possibleActivities = allActivities.slice(0, 4);

  return (
    <div style={styles.container}>
      {/* Background Decorative Vectors */}
      <div style={styles.vectorBackground} />

      {/* Header */}
      <h1 style={styles.headerText}>
        היי {userProfile?.full_name?.split(" ")[0] || ""},
      </h1>

      {/* Subtitle 1 */}
      <p style={styles.subtitle}>המרחב כאן בשבילך.</p>

      {/* Subtitle 2 - Status Message */}
      <p style={styles.statusMessage}>{getStatusMessage()}</p>

      <div style={styles.mainContentFrame}>
        {/* Registered Activities Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>המפגשים הבאים שלך:</h2>
          {registeredActivities.length > 0 ? (
            <div style={styles.horizontalScroll}>
              {registeredActivities.map((activity) => (
                <div key={activity.id} style={styles.glassCard}>
                  <UserActivityCard
                    id={activity.id}
                    title={activity.title}
                    date={activity.date}
                    start_time={activity.start_time}
                    location={activity.location}
                    description={activity.description}
                    onRegistrationChange={fetchData}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="נראה שאין לך מפגשים השבוע "
              buttonText="+ הוספת פעילות"
              buttonHref="/UserScreens/WeeklyBoardPage"
            />
          )}
        </section>

        {/* Suggested Activities Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>חשבנו שיעניין אותך:</h2>
          {possibleActivities.length > 0 ? (
            <div style={styles.horizontalScroll}>
              {possibleActivities.map((activity) => (
                <div key={activity.id} style={styles.glassCard}>
                  <UserActivityCard
                    id={activity.id}
                    title={activity.title}
                    date={activity.date}
                    start_time={activity.start_time}
                    location={activity.location}
                    description={activity.description}
                    onRegistrationChange={fetchData}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="לא נמצאו פעילויות מתאימות"
              buttonText="להוספת תחומי עניין"
              buttonHref="/profile"
            />
          )}
        </section>
      </div>
    </div>
  );
}
