"use client";

import React, { useState, useEffect } from "react";
import { apiActivities } from "@/app/services/db_api";

// UI Components
import DaySlider from "@/lib/components/UI/DaySlider";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewAdminActivityCard from "@/lib/components/UI/NewAdminActivityCard";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import ActivityRegistrationsModal from "@/lib/components/ActivityRegistrationsModal/ActivityRegistrationsModal";

import styles from "./AdminCalendarPage.module.css";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Data State
  const [activities, setActivities] = useState<any[]>([]);

  // UI State
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Force a "mounting" state for smooth page transition (initial load only)
  const [mounting, setMounting] = useState(true);

  // Activity modal state
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Registrations modal state
  const [registrationsActivityId, setRegistrationsActivityId] = useState<string | null>(null);
  const [registrationsActivityTitle, setRegistrationsActivityTitle] = useState<string>("");
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);

  const fetchData = async () => {
    setActivities([]);
    setLoading(true);

    const dateString = selectedDate.toISOString().split("T")[0];

    try {
      const [actData, actError] = await apiActivities.getByDate(dateString);

      if (!actError && actData) {
        setActivities(actData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Turn off mounting after a tiny delay to trigger the animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Filter activities by availability
  const filteredActivities = activities.filter((activity: any) => {
    const currentParticipants = activity.current_participants || 0;
    const maxParticipants = activity.max_participants || 0;
    const isFull = currentParticipants >= maxParticipants;

    if (filter === "all") return true;
    if (filter === "waitlist") return isFull; // רשימת המתנה - full or over capacity
    if (filter === "available") return !isFull; // מקום פנוי - has available spots

    return true;
  });

  // Calculate counts for filter tabs
  const waitlistCount = activities.filter((a: any) => {
    const current = a.current_participants || 0;
    const max = a.max_participants || 0;
    return current >= max;
  }).length;

  const availableCount = activities.filter((a: any) => {
    const current = a.current_participants || 0;
    const max = a.max_participants || 0;
    return current < max;
  }).length;

  // Format day string for card
  const formatDayString = (date: string) => {
    const d = new Date(date);
    const days = ["יום א׳", "יום ב׳", "יום ג׳", "יום ד׳", "יום ה׳", "יום ו׳", "שבת"];
    return days[d.getDay()];
  };

  // Handle activity card click
  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsActivityModalOpen(true);
  };

  // Handle activity modal close
  const handleActivityModalClose = () => {
    setIsActivityModalOpen(false);
    setSelectedActivityId(null);
  };

  // Handle registrations click
  const handleRegistrationsClick = (activityId: string, activityTitle: string) => {
    setRegistrationsActivityId(activityId);
    setRegistrationsActivityTitle(activityTitle);
    setIsRegistrationsModalOpen(true);
  };

  // Handle registrations modal close
  const handleRegistrationsModalClose = () => {
    setIsRegistrationsModalOpen(false);
    setRegistrationsActivityId(null);
    setRegistrationsActivityTitle("");
  };

  return (
    <SmoothPageWrapper isLoading={mounting}>
    <div className={styles.pageContainer}>
      {/* Loading overlay for date changes */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <OrganicCircles
            mode="loading"
            radius={0.08}
            baseColor="#FFFFFF"
          />
        </div>
      )}

      <main className={styles.mainFrame}>
        <div className={styles.contentWrapper}>
          {/* Title */}
          <div className={styles.titleContainer}>
            <h1 className={styles.titleText}>לוח פעילויות</h1>
          </div>

          {/* Week Slider */}
          <div className={styles.sliderSection}>
            <DaySlider
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterSection}>
            <HomeFilter
              options={[
                { id: "all", label: "הכל", count: activities.length },
                { id: "waitlist", label: "רשימת המתנה", count: waitlistCount },
                { id: "available", label: "מקום פנוי", count: availableCount },
              ]}
              activeOption={filter}
              onFilterChange={(newId) => setFilter(newId)}
            />
          </div>

          {/* Activities List */}
          <div className={styles.activitiesList}>
            {filteredActivities.length > 0
              ? filteredActivities.map((activity) => (
                  <NewAdminActivityCard
                    key={activity.id}
                    id={activity.id}
                    title={activity.title}
                    instructor={activity.instructor || "לא צוין"}
                    day={formatDayString(activity.date)}
                    startTime={activity.start_time}
                    currentParticipants={activity.current_participants || 0}
                    maxParticipants={activity.max_participants || 0}
                    onClick={() => handleActivityClick(activity.id)}
                    onRegistrationsClick={() => handleRegistrationsClick(activity.id, activity.title)}
                  />
                ))
              : !loading && (
                  <p className={styles.emptyText}>אין פעילויות ליום זה</p>
                )}
          </div>
        </div>
      </main>

      {/* Activity Details Modal */}
      {selectedActivityId && (
        <ActivityDetailsModal
          activityId={selectedActivityId}
          isOpen={isActivityModalOpen}
          onClose={handleActivityModalClose}
          onRegistrationChange={fetchData}
        />
      )}

      {/* Activity Registrations Modal */}
      {registrationsActivityId && (
        <ActivityRegistrationsModal
          activityId={registrationsActivityId}
          activityTitle={registrationsActivityTitle}
          isOpen={isRegistrationsModalOpen}
          onClose={handleRegistrationsModalClose}
        />
      )}
    </div>
    </SmoothPageWrapper>
  );
}
