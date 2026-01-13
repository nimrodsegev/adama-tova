"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import styles from "./NewUserScheduleActivityCard.module.css";
import Button from "./Button";

// Modals
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";

interface NewUserScheduleActivityCardProps {
  id: string;
  title: string;
  instructor: string; // Added instructor prop
  date: string;
  startTime: string;
  endTime: string; // Kept in props, though not used in display anymore
  currentParticipants: number;
  maxParticipants: number;
  waitlistCount: number;
  isGroup?: boolean;
  isRegistered?: boolean;
  isPending?: boolean;
  onRegistrationChange?: () => void;
  onMotionChange?: (state: "start" | "end") => void;
}

const NewUserScheduleActivityCard: React.FC<
  NewUserScheduleActivityCardProps
> = ({
  id,
  title,
  instructor,
  date,
  startTime,
  endTime,
  currentParticipants,
  maxParticipants,
  waitlistCount,
  isGroup = false,
  onRegistrationChange,
  onMotionChange,
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
  const dateObj = new Date(date);

  // "weekday: long" in he-IL usually returns "יום ראשון", "יום שני" etc.
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });

  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

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

  const handleActionClick = async (e: React.MouseEvent) => {
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

  const getButtonLabel = () => {
    if (regStatus === "confirmed") return "לביטול";
    if (regStatus === "waitlist") return "ממתין לאישור";
    return "להרשמה";
  };

  return (
    <>
      <div
        className={styles.cardContainer}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.infoSection}>
          <h3 className={styles.titleText}>{title}</h3>

          {/* 1. Changed Time Range to Instructor */}
          <p className={styles.instructorText}>{instructor}</p>

          {/* 2. Changed Participants to Day/Time format */}
          <p className={styles.dateTimeText}>
            {`${dayName} בשעה ${formatTime(startTime)}`}
          </p>

          {waitlistCount > 0 && (
            <p className={styles.waitlistText}>{waitlistCount} ברשימת המתנה</p>
          )}
        </div>

        {!isAdmin && (
          <div className={styles.actionSection}>
            <Button
              variant="tertiary"
              size="L-short"
              onClick={handleActionClick}
              disabled={loading}
            >
              {getButtonLabel()}
            </Button>
          </div>
        )}
      </div>

      {/* Modals remain unchanged... */}
      <ActivityDetailsModal
        activityId={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistrationChange={() => checkRegistrationStatus()}
      />
      <CancelConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
        activityTitle={title}
        activityDate={`${dayName} ${dayMonth}`}
        activityTime={formatTime(startTime)}
      />
      {isSuccessModalOpen &&
        (registrationBackendStatus === "pending" && regStatus !== "waitlist" ? (
          <GroupRegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            startDate={dayMonth}
            startTime={formatTime(startTime)}
          />
        ) : (
          <RegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            activityDate={dayMonth}
            activityTime={formatTime(startTime)}
            isGroup={isGroup}
            isWaitlist={regStatus === "waitlist"}
            waitlistPosition={waitlistPosition}
          />
        ))}
    </>
  );
};

export default NewUserScheduleActivityCard;
