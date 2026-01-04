"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api"; // 👈 Added supabase to imports
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  const fetchData = async () => {
    setLoading(true);

    try {
      // 1. Fetch Registrations with STATUS directly (Needed for logic)
      const { data: rawRegs, error: regError } = await supabase
        .from("registrations")
        .select("activity_id, status")
        .eq("user_id", user!.id);

      if (regError) console.error("Error fetching registrations:", regError);

      // List A: Truly Approved (Show in "My Schedule")
      const approvedIds = (rawRegs || [])
        .filter((r: any) => r.status === 'approved')
        .map((r: any) => r.activity_id);

      // List B: All Interactions (Approved + Pending) -> Hide from "Suggestions"
      const allInteractedIds = (rawRegs || []).map((r: any) => r.activity_id);

      // 2. Fetch Activities & User Branches
      const [
        [activities, actError],
        [userBranches, branchError]
      ] = await Promise.all([
        apiActivities.getAll(),
        apiUser.getUserBranches(user!.id)
      ]);

      if (actError) console.error("Error fetching activities:", actError);
      if (branchError) console.error("Error fetching user branches:", branchError);

      if (activities && userBranches) {
        
        // 3. Filter by Branch
        const branchFilteredActivities = activities.filter((activity: any) => 
          !activity.branch || userBranches.includes(activity.branch)
        );

        // 4. Build "Registered" List (Only Approved items)
        const registeredList = branchFilteredActivities.filter((activity: any) =>
          approvedIds.includes(activity.id)
        );

        // 5. Build "Suggestions" List
        // Start with everything the user hasn't interacted with yet
        const candidates = branchFilteredActivities.filter(
          (activity: any) => !allInteractedIds.includes(activity.id)
        );

        // 5a. DEDUPLICATE SERIES (Groups)
        // If a group has 5 sessions, only show the first one in suggestions
        const uniqueSuggestions: any[] = [];
        const seenSeries = new Set();

        candidates.forEach((act: any) => {
          if (act.series_id) {
            // It's a group session
            if (!seenSeries.has(act.series_id)) {
              seenSeries.add(act.series_id);
              uniqueSuggestions.push(act); // Add only the first occurrence found
            }
          } else {
            // Single activity
            uniqueSuggestions.push(act);
          }
        });

        // 5b. Filter Unique Suggestions by Interest
        let finalSuggestions = uniqueSuggestions;
        if (
          userProfile?.quiz?.interests &&
          userProfile.quiz.interests.length > 0
        ) {
          const myInterestsEnglish = userProfile.quiz.interests.map(
            (interest: string) => INTRESTS_MAPPING[interest] || interest
          );

          finalSuggestions = uniqueSuggestions.filter((activity: any) =>
            myInterestsEnglish.includes(activity.category)
          );
        }

        setRegisteredActivities(registeredList);
        setAllActivities(finalSuggestions);
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