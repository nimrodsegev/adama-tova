"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiUser, supabase } from "@/app/services/db_api";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import OpenHours from "@/lib/components/UI/OpenHours";
import EmptyState from "@/lib/components/UI/EmptyState";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";

import styles from "./UserHomePage.module.css";

interface Activity {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  description: string;
  category: string;
  branch?: string;
  series_id?: string;
  is_group?: boolean;
  instructor?: string;
}

const INTERESTS_MAPPING: Record<string, string> = {
  מיינדפולנס: "mindfulness",
  "גוף ותנועה": "body_motion",
  מוזיקה: "music_sound",
  "יצירה וחומר": "creation_material",
};

const OPENING_HOURS = {
  0: { open: "16:00", close: "22:00" },
  2: { open: "16:00", close: "22:00" },
  3: { open: "16:00", close: "22:00" },
  5: { open: "16:00", close: "22:00" },
};

const isActivityInFuture = (activity: Activity) => {
  if (!activity.date) return false;
  const timeString = activity.start_time || "00:00";
  const activityDateTime = new Date(`${activity.date}T${timeString}`);
  return activityDateTime >= new Date();
};

// Calculate radius based on layers
const calculateRadius = (layers: number) => {
  const baseRadius = 0.07;
  if (layers <= 5) return baseRadius;
  const reduction = (layers - 5) * 0.005;
  return baseRadius - reduction;
};

export default function NewUserHomePage() {
  const { user, userProfile } = useUser();
  const [activeFilter, setActiveFilter] = useState<"recommended" | "yours">(
    "yours"
  );
  const [registeredActivities, setRegisteredActivities] = useState<Activity[]>(
    []
  );
  const [suggestedActivities, setSuggestedActivities] = useState<Activity[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [motionMode, setMotionMode] = useState<"spouting" | "breathing">(
    "spouting"
  );

  // This state stays true during the fade-out, so we use it to keep the circle size stable
  const [coverNav, setCoverNav] = useState(false);

  const mountedRef = useRef(false);
  const shapeParams =
    userProfile?.role === "participant"
      ? calculateShapeParams(userProfile)
      : calculateShapeParams(null);

  const dynamicRadius = calculateRadius(shapeParams.layers);

  const [bgCircleConfig, setBgCircleConfig] = useState({
    radius: dynamicRadius,
    x: 0.45,
    y: 0.1,
  });

  const todayHours = (() => {
    const today = new Date().getDay();
    // @ts-ignore
    return OPENING_HOURS[today] || null;
  })();

  // --- 1. Circle Config Resize Logic ---
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Start with the dynamic radius calculated from user layers
      let newConfig = { radius: dynamicRadius, x: 0.45, y: 0.1 };

      // --- Specific Device Viewports (Specific Overrides) ---

      if (height >= 760 && height <= 780) {
        newConfig.y = 0.12;
        newConfig.x = 0.45;
      }

      // 2. iPhone 12/13/14 PWA (790px - 810px)
      if (height >= 790 && height <= 810) {
        newConfig.y = 0.1;
        newConfig.x = 0.45;
      }

      // 3. iPhone 14/15 Plus/Pro Max PWA (865px - 885px)
      if (height >= 865 && height <= 885) {
        newConfig.y = 0.09;
        newConfig.x = 0.43;
      }

      setBgCircleConfig(newConfig);
    };

    handleResize(); // Initial call
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dynamicRadius]);

  useEffect(() => {
    if (user && !mountedRef.current) {
      mountedRef.current = true;
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: rawRegs } = await supabase
        .from("registrations")
        .select("activity_id, status")
        .eq("user_id", user!.id);

      const approvedIds = (rawRegs || [])
        .filter((r: any) => r.status === "approved")
        .map((r: any) => r.activity_id);

      const allInteractedIds = (rawRegs || []).map((r: any) => r.activity_id);

      const [[activities], [userBranches]] = await Promise.all([
        apiActivities.getAll() as Promise<[Activity[], any]>,
        apiUser.getUserBranches(user!.id),
      ]);

      if (activities && userBranches) {
        let validActivities = activities.filter(
          (act: Activity) => !act.branch || userBranches.includes(act.branch)
        );

        validActivities = validActivities.filter(isActivityInFuture);

        const processList = (list: Activity[]) => {
          const unique: Activity[] = [];
          const seen = new Set<string>();
          list.forEach((act: Activity) => {
            if (!act.series_id || !seen.has(act.series_id)) {
              if (act.series_id) seen.add(act.series_id);
              unique.push(act);
            }
          });
          return unique;
        };

        const regList = processList(
          validActivities.filter((act: Activity) =>
            approvedIds.includes(act.id)
          )
        );

        const candidates = validActivities.filter(
          (act: Activity) => !allInteractedIds.includes(act.id)
        );
        const suggList = processList(candidates);

        let finalSuggestions = suggList;
        if (userProfile?.quiz?.interests?.length) {
          const myInterestsEnglish = userProfile.quiz.interests.map(
            (i: string) => INTERESTS_MAPPING[i] || i
          );
          finalSuggestions = suggList.filter((act: Activity) =>
            myInterestsEnglish.includes(act.category)
          );
        }

        setRegisteredActivities(regList);
        setSuggestedActivities(finalSuggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleMotionState = async (
    state: "start" | "end",
    skipFetch?: boolean
  ) => {
    if (state === "start") {
      setCoverNav(true);
      setMotionMode("spouting");
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 5000);
    } else {
      if (!skipFetch) {
        await fetchData();
      }

      // 1. Start fading out (by stopping processing state)
      setIsProcessing(false);

      // 2. Wait for fade out to finish before resetting position/mode
      setTimeout(() => {
        setCoverNav(false);
        setMotionMode("spouting");
      }, 1000);
    }
  };

  const firstName = userProfile?.full_name?.split(" ")[0] || "משתמש";
  const displayedActivities =
    activeFilter === "yours" ? registeredActivities : suggestedActivities;

  return (
    <SmoothPageWrapper
      isLoading={loading || isProcessing}
      mode={motionMode}
      coverNavigation={coverNav}
      // Use coverNav for radius scale to prevent jump during fade out
      radiusScale={coverNav ? 1.5 : 1.0}
      customPosition={coverNav ? { x: 0.5, y: 0.45 } : undefined}
    >
      <div className={styles.pageContainer} dir="rtl">
        <div className={styles.openHoursWrapper}>
          {todayHours ? (
            <OpenHours
              startTime={todayHours.open}
              endTime={todayHours.close}
              isOpen={true}
            />
          ) : (
            <OpenHours isOpen={false} />
          )}
        </div>

        <div className={styles.circlesContainer}>
          <OrganicCircles
            mode="breathing"
            radius={bgCircleConfig.radius}
            position={{ x: bgCircleConfig.x, y: bgCircleConfig.y }}
            // @ts-ignore
            {...shapeParams}
            baseColor="#FFFFFF"
          />
        </div>

        <div className={styles.greetingSection}>
          <h1 className={styles.greetingTitle}>היי {firstName},</h1>
          <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
        </div>

        <div className={styles.filterContainer}>
          <HomeFilter
            options={[
              {
                id: "recommended",
                label: "חשבנו שיעניין אותך",
                count: suggestedActivities.length,
              },
              {
                id: "yours",
                label: "המפגשים שלך",
                count: registeredActivities.length,
              },
            ]}
            activeOption={activeFilter}
            onFilterChange={(id) =>
              setActiveFilter(id as "recommended" | "yours")
            }
          />
        </div>

        <div className={styles.cardsContainer}>
          {displayedActivities.length > 0 ? (
            displayedActivities.map((activity) => (
              <NewUserActivityCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                instructor={activity.instructor || "מדריך"}
                date={activity.date}
                startTime={activity.start_time}
                onMotionChange={handleMotionState}
                isGroup={activity.is_group || !!activity.series_id}
              />
            ))
          ) : activeFilter === "yours" ? (
            <EmptyState
              message="אין לך מפגשים קרובים"
              buttonText="הוספת פעילות"
              buttonHref="/UserScreens/UserCalendarPage"
            />
          ) : (
            <EmptyState
              message="אין פעילויות רלוונטיות עבורך"
              buttonText="להוספת תחומי עניין"
              buttonHref="/ProfilePage"
            />
          )}
        </div>
      </div>
    </SmoothPageWrapper>
  );
}
