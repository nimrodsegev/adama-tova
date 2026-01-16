"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { useIvrita } from "@/app/contexts/IvritaContext";
import { apiRegistrations, apiActivities } from "@/app/services/db_api";
import styles from "./NewUserActivityCard.module.css";
import Button from "./Button";
import Image from "next/image";

// Modals
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import ActivityRegistrationsModal from "@/lib/components/ActivityRegistrationsModal/ActivityRegistrationsModal";
import Popup from "@/lib/components/UI/Popup";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";

interface NewUserActivityCardProps {
  id: string;
  title: string;
  instructor: string;
  date: string;
  startTime: string;
  currentParticipants?: number;
  maxParticipants?: number;
  waitlistCount?: number;
  onMotionChange?: (state: "start" | "end", skipFetch?: boolean) => void;
  isGroup?: boolean;
}

const NewUserActivityCard: React.FC<NewUserActivityCardProps> = ({
  id,
  title,
  instructor,
  date,
  startTime,
  currentParticipants,
  maxParticipants,
  waitlistCount,
  onMotionChange,
  isGroup = false,
}) => {
  const { user, userProfile } = useUser();
  const { t } = useIvrita();
  const isAdmin = userProfile?.role === "admin";

  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFull, setIsFull] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [registrationBackendStatus, setRegistrationBackendStatus] = useState<
    string | null
  >(null);

  // Admin: Registrations modal state
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] =
    useState(false);

  const formatTime = (time: string) => time.slice(0, 5);
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    if (user && id && !isAdmin) {
      checkRegistrationStatus();
      checkActivityCapacity();
    }
  }, [user, id, isAdmin]);

  useEffect(() => {
    if (currentParticipants !== undefined && maxParticipants !== undefined) {
      setIsFull(currentParticipants >= maxParticipants);
    }
  }, [currentParticipants, maxParticipants]);

  const checkRegistrationStatus = async () => {
    if (isAdmin) return;
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

  const checkActivityCapacity = async () => {
    if (currentParticipants !== undefined && maxParticipants !== undefined) {
      return;
    }

    try {
      const [activityData, error] = await apiActivities.getById(id);
      if (!error && activityData) {
        const current = activityData.current_participants || 0;
        const max = activityData.max_participants || 0;
        setIsFull(current >= max);
      }
    } catch (error) {
      console.error("Error checking capacity:", error);
    }
  };

  const handleActionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading) return;

    // ⭐ For admin, open registrations modal
    if (isAdmin) {
      setIsRegistrationsModalOpen(true);
      return;
    }

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    onMotionChange?.("start");
    setLoading(true);

    try {
      const [res] = await apiRegistrations.registerUserToActivity(user.id, id);

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
    if (isAdmin) return "לכל הנרשמים";
    if (regStatus === "confirmed") return "לביטול";
    if (regStatus === "waitlist") return "לביטול";
    return "להרשמה";
  };

  const shouldShowClockIcon = () => {
    return (regStatus === "none" && isFull) || regStatus === "waitlist";
  };

  const getParticipantsStatus = () => {
    if (
      !isAdmin ||
      currentParticipants === undefined ||
      maxParticipants === undefined
    ) {
      return null;
    }

    const isFull = currentParticipants >= maxParticipants;
    const hasWaitlist = waitlistCount && waitlistCount > 0;

    if (isFull && hasWaitlist) {
      return `${currentParticipants}/${maxParticipants} (${waitlistCount} ברשימת המתנה)`;
    }

    return `${currentParticipants}/${maxParticipants} נרשמים`;
  };

  const participantsStatus = getParticipantsStatus();
  const showFullStatus =
    isAdmin && isFull && waitlistCount && waitlistCount > 0;

  return (
    <>
      <div
        className={styles.cardContainer}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.contentStack}>
          <div className={styles.textGroup}>
            <h3 className={styles.titleText}>{title}</h3>

            <div className={styles.detailsGroup}>
              <p className={styles.instructorText}>{instructor}</p>
              <p className={styles.dateTimeText}>
                {dayName} {dayMonth} בשעה {formatTime(startTime)}
              </p>

              {isAdmin && participantsStatus && (
                <p
                  className={`${styles.participantsText} ${
                    showFullStatus ? styles.participantsFullText : ""
                  }`}
                >
                  {participantsStatus}
                </p>
              )}
            </div>
          </div>

          <div
            className={
              isAdmin ? styles.actionWrapperAdmin : styles.actionWrapper
            }
          >
            {!isAdmin && shouldShowClockIcon() && (
              <div
                className={`${styles.clockIconWrapper} ${
                  regStatus === "waitlist"
                    ? styles.clockIconCancel
                    : styles.clockIconRegister
                }`}
              >
                <Image
                  src="/icons/clock_icon.svg"
                  alt=""
                  width={16}
                  height={16}
                  className={styles.clockIcon}
                />
              </div>
            )}

            <Button
              variant="tertiary"
              tertiarySize={"medium"}
              tertiaryWeight="semibold"
              colorType="orange"
              onClick={handleActionClick}
              disabled={loading}
            >
              {getButtonLabel()}
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Details Modal - Only for regular users or when clicking card body */}
      <ActivityDetailsModal
        activityId={id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegistrationChange={() => {
          checkRegistrationStatus();
          checkActivityCapacity();
        }}
        onMotionChange={onMotionChange}
      />

      {/* ⭐ Activity Registrations Modal - For admin when clicking button */}
      {isAdmin && (
        <ActivityRegistrationsModal
          activityId={id}
          activityTitle={title}
          isOpen={isRegistrationsModalOpen}
          onClose={() => setIsRegistrationsModalOpen(false)}
        />
      )}

      {/* Cancel Confirmation Popup - Only for regular users */}
      {!isAdmin && isCancelModalOpen && (
        <Popup
          content={`${t(
            "את/ה בטוח/ה שאת/ה רוצה לבטל את ההרשמה"
          )} ל${title} ב${dayName} ${dayMonth} בשעה ${formatTime(startTime)}?`}
          primaryButtonText="כן, לבטל"
          primaryButtonAction={handleCancelConfirm}
          secondaryButtonText="לא"
          secondaryButtonAction={() => setIsCancelModalOpen(false)}
          onClose={() => setIsCancelModalOpen(false)}
          loading={loading}
        />
      )}

      {/* Success Modals - Only for regular users */}
      {!isAdmin &&
        isSuccessModalOpen &&
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
