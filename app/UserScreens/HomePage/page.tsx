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

// Interests Mapping
const INTRESTS_MAPPING: Record<string, string> = {
  מדיטציה: "Meditation",
  יוגה: "Yoga",
  אומנות: "Art",
  כתיבה: "Writing",
  מיינדפולנס: "Mindfulness",
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
        const uniqueRegisteredList: any[] = [];
        const seenRegisteredSeries = new Set();

        rawRegisteredList.forEach((act: any) => {
          if (!act.series_id) {
            uniqueRegisteredList.push(act);
          } else {
            if (!seenRegisteredSeries.has(act.series_id)) {
              seenRegisteredSeries.add(act.series_id);
              uniqueRegisteredList.push(act);
            }
          }
        });

        // --- 5. SUGGESTIONS LIST LOGIC ---
        const candidates = branchFilteredActivities.filter(
          (activity: any) => !allInteractedIds.includes(activity.id)
        );

        // Deduplicate suggestions
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

        setRegisteredActivities(uniqueRegisteredList);
        setAllActivities(finalSuggestions);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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

  // 🔵 Calculate breathing parameters
  const breathingParams = calculateBreathingParams(
    userProfile,
    registeredActivities.length
  );

  if (userLoading || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#F28130",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#EFEFEF",
          fontFamily: "Ezer Shemesh TRIAL ONLY, sans-serif",
          fontSize: "1.25rem",
        }}
        dir="rtl"
      >
        טוען...
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="mobile-container">
        <p className="text-loading">עליך להתחבר כדי לראות את הדף</p>
      </div>
    );
  }

  const possibleActivities = allActivities.slice(0, 4);

  return (
    <div className="mobile-container">
      {/* 🔵 Breathing Circles - Behind all content */}
      <BreathingCircles
        ref={breathingRef}
        speed={breathingParams.speed}
        complexity={breathingParams.complexity}
        smoothness={breathingParams.smoothness}
        layers={breathingParams.layers}
        opacity={0.6}
        thickness={0.5}
        position={{ x: 0.3, y: 0.15 }}
        size={0.25}
        startBreathing={true}
        colors={[
          "rgba(189, 161, 201, 0.9)",
          "rgba(173, 78, 52, 0.85)",
          "rgba(212, 137, 106, 0.8)",
          "rgba(255, 245, 245, 0.75)",
        ]}
      />

      <div className="vector-background" />

      <h1 className="header-primary absolute-header">
        היי {userProfile?.full_name?.split(" ")[0] || ""},
      </h1>

      <p className="text-subtitle absolute-subtitle">המרחב כאן בשבילך.</p>

      <p className="text-small absolute-status">{getStatusMessage()}</p>

      <div className="main-content">
        {/* Registered Activities Section */}
        <section className="section">
          <h2 className="text-section-title">המפגשים הבאים שלך:</h2>
          {registeredActivities.length > 0 ? (
            <div className="horizontal-scroll">
              {registeredActivities.map((activity) => (
                <div key={activity.id} className="glass-card">
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
        <section className="section">
          <h2 className="text-section-title">חשבנו שיעניין אותך:</h2>
          {possibleActivities.length > 0 ? (
            <div className="horizontal-scroll">
              {possibleActivities.map((activity) => (
                <div key={activity.id} className="glass-card">
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
