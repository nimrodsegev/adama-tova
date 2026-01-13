"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import Button from "./Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";
import styles from "./NewUserScheduleActivityCard.module.css";

interface NewUserScheduleActivityCardProps {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  currentParticipants: number;
  maxParticipants: number;
  waitlistCount?: number;
  onRegistrationChange?: () => void;
  onMotionChange?: (state: "start" | "end") => void;
  isGroup?: boolean;
}

const NewUserScheduleActivityCard: React.FC<
  NewUserScheduleActivityCardProps
> = ({
  id,
  title,
  date,
  startTime,
  endTime,
  currentParticipants,
  maxParticipants,
  waitlistCount = 0,
  onRegistrationChange,
  onMotionChange,
  isGroup = false,
}) => {
  const { user, userProfile } = useUser();
  const isAdmin = userProfile?.role === "admin";

  // Registration States
  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registrationBackendStatus, setRegistrationBackendStatus] = useState<
    string | null
  >(null);

  // Formatting
  const formatTime = (time: string) => time.slice(0, 5);
  const formattedStartTime = formatTime(startTime);
  const formattedEndTime = formatTime(endTime);

  // Format date for modals
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  // Check if activity is full
  const isFull = currentParticipants >= maxParticipants;

  useEffect(() => {
    if (user && id) checkRegistrationStatus();
  }, [user, id]);

  const checkRegistrationStatus = async () => {
    const [statusData, error] = await apiRegistrations.getRegistrationStatus(
      user!.id,
      id
    );
    if (!error && statusData) {
      setRegStatus(
        statusData.status === "confirmed" || statusData.status === "waitlist"
          ? statusData.status
          : "none"
      );
      setWaitlistPosition(statusData.wait_list_place);
    }
  };

  const handleRegistrationToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading || isAdmin) return;

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    onMotionChange?.("start");
    setLoading(true);

    try {
      const [res] = await apiRegistrations.registerUserToActivity(user.id, id);
      if (res && typeof res === "object" && "success" in res) {
        const isWaitlist = res.if_confirmed === false;
        setRegStatus(isWaitlist ? "waitlist" : "confirmed");
        setWaitlistPosition(res.wait_list_place || null);
        setRegistrationBackendStatus(res.status || null);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSuccessModalOpen(true);
      } else {
        onMotionChange?.("end");
      }
    } catch (error) {
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setIsCancelModalOpen(false);
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(
        user!.id,
        id
      );
      if (!error) {
        setRegStatus("none");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onMotionChange?.("end");
      } else {
        onMotionChange?.("end");
      }
    } catch (error) {
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    onMotionChange?.("start");
    setTimeout(() => {
      onMotionChange?.("end");
    }, 750);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalRegistrationChange = () => {
    checkRegistrationStatus();
    onRegistrationChange?.();
  };

  const getButtonText = () => {
    if (regStatus === "confirmed") return "לביטול";
    if (regStatus === "waitlist") return "ממתין";
    return "הרשמה";
  };

  const showRegisterButton = !isAdmin;

  return (
    <>
      <div className={styles.cardContainer} onClick={handleCardClick}>
        {/* Info Section - Right side in RTL */}
        <div className={styles.infoSection}>
          <h3 className={styles.titleText}>{title}</h3>
          <p className={styles.timeRange}>
            {formattedStartTime} - {formattedEndTime}
          </p>
          <p
            className={styles.participantsText}
            style={{ color: isFull ? "#E74E1C" : undefined }}
          >
            {currentParticipants}/{maxParticipants} נרשמים
            {waitlistCount > 0 && ` (${waitlistCount} בהמתנה)`}
          </p>
        </div>

        {/* Action Section - Left side in RTL */}
        {showRegisterButton && (
          <div className={styles.actionSection}>
            <Button
              variant="primary"
              size="L-short"
              onClick={handleRegistrationToggle}
              disabled={loading}
            >
              {getButtonText()}
            </Button>
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activityId={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistrationChange={handleModalRegistrationChange}
      />

      {/* Cancel Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        activityTitle={title}
        activityDate={`${dayName} ${dayMonth}`}
        activityTime={formattedStartTime}
      />

      {/* Success Modal */}
      {isSuccessModalOpen &&
        (registrationBackendStatus === "pending" && regStatus !== "waitlist" ? (
          <GroupRegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            startDate={dayMonth}
            startTime={formattedStartTime}
          />
        ) : (
          <RegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            activityDate={dayMonth}
            activityTime={formattedStartTime}
            isGroup={isGroup}
            isWaitlist={regStatus === "waitlist"}
            waitlistPosition={waitlistPosition}
          />
        ))}
    </>
  );
};

export default NewUserScheduleActivityCard;
