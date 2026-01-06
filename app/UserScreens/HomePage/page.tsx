"use client";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import UserActivityCard from "@/lib/components/Home/UserActivityCard";
import EmptyState from "@/lib/components/UI/EmptyState";
import BreathingCircles, {
  BreathingCirclesRef,
} from "@/lib/components/BreathingCircles/BreathingCircles";
import { calculateBreathingParams } from "@/app/utils/breathingParamsCalculator";
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

  // 🔵 Breathing circles ref
  const breathingRef = useRef<BreathingCirclesRef>(null);
  const mountedRef = useRef(false);

  // ✅ Update circle layers when activity count changes
  useEffect(() => {
    if (breathingRef.current && !loading) {
      const newLayers = calculateBreathingParams(
        userProfile,
        registeredActivities.length
      ).layers;
      breathingRef.current.updateLayers(newLayers);
    }
  }, [registeredActivities.length, userProfile, loading]);

  useEffect(() => {
    // Only fetch on initial mount when user is available
    if (user && !mountedRef.current) {
      mountedRef.current = true;
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchData = async () => {
    setLoading(true);

    // 🔵 Circles already breathing continuously, no need to start

    try {
      // 1. Fetch Registrations
      const { data: rawRegs, error: regError } = await supabase
        .from("registrations")
        .select("activity_id, status")
        .eq("user_id", user!.id);

      if (regError) console.error("Error fetching registrations:", regError);

      // List A: Approved IDs (Show in "My Schedule")
      const approvedIds = (rawRegs || [])
        .filter((r: any) => r.status === "approved")
        .map((r: any) => r.activity_id);

      // List B: All Interacted IDs (Hide from "Suggestions")
      const allInteractedIds = (rawRegs || []).map((r: any) => r.activity_id);

      // 2. Fetch Activities & Branches
      const [[activities, actError], [userBranches, branchError]] =
        await Promise.all([
          apiActivities.getAll(),
          apiUser.getUserBranches(user!.id),
        ]);

      if (actError) console.error("Error fetching activities:", actError);
      if (branchError)
        console.error("Error fetching user branches:", branchError);

      if (activities && userBranches) {
        // 3. Filter by Branch
        const branchFilteredActivities = activities.filter(
          (activity: any) =>
            !activity.branch || userBranches.includes(activity.branch)
        );

        // --- 4. REGISTERED LIST LOGIC (Updated) ---
        const rawRegisteredList = branchFilteredActivities.filter(
          (activity: any) => approvedIds.includes(activity.id)
        );

        // 👇 DEDUPLICATE REGISTERED LIST
        // Only show the *next* meeting for each series.
        const uniqueRegisteredList: any[] = [];
        const seenRegisteredSeries = new Set();

        rawRegisteredList.forEach((act: any) => {
          if (!act.series_id) {
            // Not a group, always show
            uniqueRegisteredList.push(act);
          } else {
            // Is a group
            if (!seenRegisteredSeries.has(act.series_id)) {
              // This is the first (earliest) session we've seen for this group
              seenRegisteredSeries.add(act.series_id);
              uniqueRegisteredList.push(act);
            }
            // If seen, skip (it's a later session)
          }
        });

        // --- 5. SUGGESTIONS LIST LOGIC ---
        const candidates = branchFilteredActivities.filter(
          (activity: any) => !allInteractedIds.includes(activity.id)
        );

        // Deduplicate suggestions (show only 1 card per group)
        const uniqueSuggestions: any[] = [];
        const seenSuggestionSeries = new Set();

        candidates.forEach((act: any) => {
          if (act.series_id) {
            if (!seenSuggestionSeries.has(act.series_id)) {
              seenSuggestionSeries.add(act.series_id);
              uniqueSuggestions.push(act);
            }
          } else {
            uniqueSuggestions.push(act);
          }
        });

        // Filter by Interest
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

        setRegisteredActivities(uniqueRegisteredList); // 👈 Set the filtered unique list
        setAllActivities(finalSuggestions);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);

      // 🔵 Don't stop breathing - let it continue
      // The circles should breathe continuously on the home page
    }
  };

  // 🔵 Handle registration changes with breath animation
  const handleRegistrationChange = (isRegistering: boolean) => {
    if (isRegistering) {
      // ✅ Inhale when registering
      breathingRef.current?.triggerInhale();
    } else {
      // ❌ Exhale when unregistering
      breathingRef.current?.triggerExhale();
    }

    // Refresh data after animation
    setTimeout(() => {
      fetchData();
    }, 300);
  };

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

  // 🔵 Calculate breathing parameters based on user profile
  const breathingParams = calculateBreathingParams(
    userProfile,
    registeredActivities.length
  );

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
      {/* 🔵 Breathing Circles - Behind all content */}
      <BreathingCircles
        ref={breathingRef}
        speed={breathingParams.speed}
        complexity={breathingParams.complexity}
        smoothness={breathingParams.smoothness}
        layers={breathingParams.layers} // ✅ Dynamic based on activity count
        opacity={0.6}
        thickness={0.5}
        position={{ x: 0.3, y: 0.15 }} // Top left, near the name
        size={0.25} // Medium size (25% of screen)
        startBreathing={true} // ✅ Start breathing immediately
        colors={[
          "rgba(189, 161, 201, 0.9)",
          "rgba(173, 78, 52, 0.85)",
          "rgba(212, 137, 106, 0.8)",
          "rgba(255, 245, 245, 0.75)",
        ]}
      />

      <div style={styles.vectorBackground} />

      <h1 style={styles.headerText}>
        היי {userProfile?.full_name?.split(" ")[0] || ""},
      </h1>

      <p style={styles.subtitle}>המרחב כאן בשבילך.</p>

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
                    onRegistrationChange={() => handleRegistrationChange(false)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="נראה שאין לך מפגשים השבוע "
              buttonText="+ הוספת פעילות"
              buttonHref="/UserScreens/UserCalendarPage"
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
                    onRegistrationChange={() => handleRegistrationChange(true)}
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
