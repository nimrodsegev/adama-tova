"use client";

import React, { useState, useEffect } from "react";
import { apiActivities } from "@/app/services/db_api";
import DaySlider from "@/lib/components/UI/DaySlider";
import { HomeFilter } from "@/lib/components/UI/HomeFilter";
import NewUserActivityCard from "@/lib/components/UI/NewUserActivityCard";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import Button from "@/lib/components/UI/Button";
import SmoothPageWrapper from "@/lib/components/UI/SmoothPageWrapper";
import styles from "./AdminCalendarPage.module.css";

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activities, setActivities] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [mounting, setMounting] = useState(true);

  // Modal State
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounting(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const filteredActivities = activities.filter((activity: any) => {
    const currentParticipants = activity.current_participants || 0;
    const maxParticipants = activity.max_participants || 0;
    const isFull = currentParticipants >= maxParticipants;
    if (filter === "all") return true;
    if (filter === "waitlist") return isFull;
    if (filter === "available") return !isFull;
    return true;
  });

  const waitlistCount = activities.filter(
    (a: any) => (a.current_participants || 0) >= (a.max_participants || 0)
  ).length;
  const availableCount = activities.filter(
    (a: any) => (a.current_participants || 0) < (a.max_participants || 0)
  ).length;

  const handleActivityModalClose = () => {
    setIsActivityModalOpen(false);
    setSelectedActivityId(null);
  };

  // Helper to open modal (assuming you want to click the card to edit)
  const handleCardClick = (id: string) => {
    setSelectedActivityId(id);
    setIsActivityModalOpen(true);
  };

  return (
    <SmoothPageWrapper isLoading={mounting}>
      <div className={styles.pageContainer}>
        {/* LOADING OVERLAY */}
        {loading && (
          <div className={styles.loadingOverlay}>
            <OrganicCircles mode="loading" radius={0.08} baseColor="#FFFFFF" />
          </div>
        )}

        {/* Title Container */}
        <div className={styles.titleContainer}>
          <h1 className={styles.titleText}>לוח פעילויות</h1>
        </div>

        {/* Slider Section */}
        <div className={styles.sliderSection}>
          <DaySlider
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Filter Section */}
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

        {/* Content Container with Activities List */}
        <div className={styles.contentContainer}>
          <div className={styles.activitiesList}>
            {filteredActivities.length > 0
              ? filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={styles.activityItem}
                    onClick={() => handleCardClick(activity.id)}
                  >
                    <NewUserActivityCard
                      id={activity.id}
                      title={activity.title}
                      instructor={activity.instructor || "לא צוין"}
                      date={activity.date}
                      startTime={activity.start_time}
                      currentParticipants={activity.current_participants || 0}
                      maxParticipants={activity.max_participants || 0}
                      waitlistCount={activity.waitlist_count || 0}
                      isGroup={activity.is_group || !!activity.series_id}
                    />
                  </div>
                ))
              : !loading && (
                  <p className={styles.emptyText}>אין פעילויות ליום זה</p>
                )}
          </div>
        </div>

        {/* Admin Specific: Modal */}
        {selectedActivityId && (
          <ActivityDetailsModal
            activityId={selectedActivityId}
            isOpen={isActivityModalOpen}
            onClose={handleActivityModalClose}
            onRegistrationChange={fetchData}
          />
        )}

        {/* Admin Specific: Sticky Button */}
        <div className={styles.bottomButton}>
          <Button size="L" href="/AdminScreens/addNotification">
            להוספת הודעה
          </Button>
        </div>
      </div>
    </SmoothPageWrapper>
  );
}
