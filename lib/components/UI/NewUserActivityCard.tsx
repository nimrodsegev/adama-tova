"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import styles from "./NewUserActivityCard.module.css";
import Button from "./Button";

// Modals
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";

interface NewUserActivityCardProps {
  id: string;
  title: string;
  instructor: string;
  date: string;
  startTime: string;
  onMotionChange?: (state: "start" | "end", skipFetch?: boolean) => void;
  isGroup?: boolean;
}

const NewUserActivityCard: React.FC<NewUserActivityCardProps> = ({
  id,
  title,
  instructor,
  date,
  startTime,
  onMotionChange,
  isGroup = false,
}) => {
  const { user, userProfile } = useUser();
  const isAdmin = userProfile?.role === "admin";

  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registrationBackendStatus, setRegistrationBackendStatus] = useState<
    string | null
  >(null);

  const formatTime = (time: string) => time.slice(0, 5);
  const dateObj = new Date(date);
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

      // FIX: Check if 'res' is an object to satisfy TypeScript
      if (
        res &&
        typeof res === "object" &&
        ("success" in res || "status" in res) &&
        (res.success || res.status === "confirmed" || res.status === "waitlist")
      ) {
        const isWaitlist = res.if_confirmed === false;

        setRegStatus(isWaitlist ? "waitlist" : "confirmed");
        setWaitlistPosition(res.wait_list_place || null);
        setRegistrationBackendStatus(res.status || null);

        setTimeout(() => {
          setIsSuccessModalOpen(true);
          onMotionChange?.("end", true);
        }, 500);
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
        setTimeout(() => {
          onMotionChange?.("end");
        }, 1000);
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
    onMotionChange?.("start");
    setTimeout(() => {
      setIsSuccessModalOpen(false);
      onMotionChange?.("end");
    }, 600);
  };

  const getButtonLabel = () => {
    if (regStatus === "confirmed") return "ביטול";
    if (regStatus === "waitlist") return "ממתין לאישור";
    return "להרשמה";
  };

  return (
    <>
      <div
        className={styles.cardContainer}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.contentStack}>
          <div className={styles.textGroup}>
            <h3 className={styles.titleText}>{title}</h3>

            {/* ⭐ NEW WRAPPER for instructor and date */}
            <div className={styles.detailsGroup}>
              <p className={styles.instructorText}>{instructor}</p>
              <p className={styles.dateTimeText}>
                {dayName} {dayMonth} בשעה {formatTime(startTime)}
              </p>
            </div>
          </div>

          {!isAdmin && (
            <div className={styles.actionWrapper}>
              <Button
                variant="tertiary"
                colorType="orange"
                onClick={handleActionClick}
                disabled={loading}
              >
                {getButtonLabel()}
              </Button>
            </div>
          )}
        </div>
      </div>

      <ActivityDetailsModal
        activityId={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistrationChange={() => checkRegistrationStatus()}
        onMotionChange={onMotionChange}
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

export default NewUserActivityCard;
