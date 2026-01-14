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
};

// Helper: Check if activity is in the future
const isActivityInFuture = (activity: Activity) => {
  if (!activity.date) return false;
  const timeString = activity.start_time || "00:00";
  const activityDateTime = new Date(`${activity.date}T${timeString}`);
  return activityDateTime >= new Date();
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
  const [bgCircleConfig, setBgCircleConfig] = useState({
    radius: 0.07,
    x: 0.47,
    y: 0.125,
  });

  const mountedRef = useRef(false);
  const shapeParams = userProfile ? calculateShapeParams(userProfile) : {};

  const todayHours = (() => {
    const today = new Date().getDay();
    // @ts-ignore
    return OPENING_HOURS[today] || null;
  })();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let newConfig = { radius: 0.07, x: 0.47, y: 0.125 };

      if (width < 380) {
        newConfig.radius = 0.06;
        newConfig.x = 0.5;
        newConfig.y = 0.125;
      } else if (width > 600) {
        newConfig.radius = 0.12;
        newConfig.x = 0.5;
        newConfig.y = 0.15;
      }

      if (height < 800) newConfig.y = 0.11;
      if (height < 700) {
        newConfig.radius = Math.min(newConfig.radius, 0.06);
        newConfig.y = 0.1;
      }
      if (height < 600) {
        newConfig.radius = Math.min(newConfig.radius, 0.05);
        newConfig.y = 0.08;
      }

      setBgCircleConfig(newConfig);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        // 1. Filter by Branch
        let validActivities = activities.filter(
          (act: Activity) => !act.branch || userBranches.includes(act.branch)
        );

        // 2. Filter by Future Date/Time
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
          validActivities.filter((act: Activity) => approvedIds.includes(act.id))
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
      setMotionMode("breathing");
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 5000);
    } else {
      if (!skipFetch) {
        await fetchData();
      }
      setIsProcessing(false);
      setTimeout(() => setMotionMode("spouting"), 1000);
    }
  };

  const firstName = userProfile?.full_name?.split(" ")[0] || "משתמש";
  const displayedActivities =
    activeFilter === "yours"
      ? registeredActivities
      : suggestedActivities.slice(0, 4);

  return (
    <SmoothPageWrapper isLoading={loading || isProcessing} mode={motionMode}>
      <div className={styles.pageContainer} dir="rtl">
        <OrganicCircles
          mode="breathing"
          radius={bgCircleConfig.radius}
          position={{ x: bgCircleConfig.x, y: bgCircleConfig.y }}
          // @ts-ignore
          {...shapeParams}
          baseColor="#FFFFFF"
        />

        <div className={styles.mainContent}>
          <div className={styles.greetingSection}>
            <h1 className={styles.greetingTitle}>היי {firstName},</h1>
            <p className={styles.greetingSubtitle}>המרחב כאן בשבילך</p>
          </div>

          {todayHours ? (
            <OpenHours startTime={todayHours.open} endTime={todayHours.close} />
          ) : (
            <div className={styles.closedMessage}>
              <p className={styles.closedText}>המרחב סגור היום</p>
            </div>
          )}

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
      </div>
    </SmoothPageWrapper>
  );
}