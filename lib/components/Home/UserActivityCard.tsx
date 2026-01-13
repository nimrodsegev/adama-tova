"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";
import styles from "./UserActivityCard.module.css";

type UserActivityCardProps = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  description: string;
  onMotionChange?: (state: "start" | "end") => void;
  isGroup?: boolean;
};

export default function UserActivityCard({
  id,
  title,
  date,
  start_time,
  location,
  description,
  onMotionChange,
  isGroup = false,
}: UserActivityCardProps) {
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

  const formattedTime = start_time.slice(0, 5);
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

  const handleRegistrationToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || loading || isAdmin) return;

    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    // 🚀 STEP 1: Show Motion Transition immediately
    onMotionChange?.("start");
    setLoading(true);

    try {
      const [res] = await apiRegistrations.registerUserToActivity(user.id, id);

      if (res && typeof res === "object" && "success" in res) {
        // Update local state for the modal
        const isWaitlist = res.if_confirmed === false;
        setRegStatus(isWaitlist ? "waitlist" : "confirmed");
        setWaitlistPosition(res.wait_list_place || null);
        setRegistrationBackendStatus(res.status || null);

        // 🎯 FIX 1: Wait 1.5 seconds before showing success modal
        // This gives time for the spouting animation to play
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 🚀 STEP 2: Open Success Modal
        // The motion overlay is still visible in the background
        setIsSuccessModalOpen(true);
      } else {
        onMotionChange?.("end"); // API Failure
      }
    } catch (error) {
      console.error(error);
      onMotionChange?.("end"); // Exception Failure
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

        // Wait 1.5s for motion before refreshing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        onMotionChange?.("end"); // Triggers fetchData in HomePage
      } else {
        onMotionChange?.("end");
      }
    } catch (error) {
      console.error(error);
      onMotionChange?.("end");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);

    // 🎯 FIX 2: Show motion AGAIN when closing success modal
    // Then trigger data refresh, which will hide motion when complete
    onMotionChange?.("start");

    // Small delay to let motion start, then trigger end (which fetches data)
    setTimeout(() => {
      onMotionChange?.("end"); // This triggers fetchData in HomePage
    }, 750);
  };

  const showRegisterButton = !isAdmin;

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className={styles.cardContainer}
      >
        <div className={styles.frame224}>
          <h3 className={styles.titleText}>{title}</h3>
          <div className={styles.frame266}>
            <p className={styles.bodyM}>
              {dayName} {dayMonth}
              <br />
              בשעה {formattedTime}
            </p>
          </div>
        </div>

        {showRegisterButton && (
          <div className={styles.registerButton}>
            <Button
              size="L-short"
              onClick={handleRegistrationToggle}
              disabled={loading}
            >
              {regStatus !== "none" ? (
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <line
                    x1="11.25"
                    y1="22.5"
                    x2="33.75"
                    y2="22.5"
                    stroke="#681F02"
                    strokeWidth="1"
                  />
                </svg>
              ) : (
                <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                  <line
                    x1="11.25"
                    y1="22.5"
                    x2="33.75"
                    y2="22.5"
                    stroke="#681F02"
                    strokeWidth="1"
                  />
                  <line
                    x1="22.5"
                    y1="11.25"
                    x2="22.5"
                    y2="33.75"
                    stroke="#681F02"
                    strokeWidth="1"
                  />
                </svg>
              )}
            </Button>
          </div>
        )}

        <div className={styles.arrowButton}>
          <span className={styles.arrowIcon}>›</span>
        </div>
      </div>

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
        activityTime={formattedTime}
      />

      {isSuccessModalOpen &&
        (registrationBackendStatus === "pending" && regStatus !== "waitlist" ? (
          <GroupRegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            startDate={dayMonth}
            startTime={formattedTime}
          />
        ) : (
          <RegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            activityDate={dayMonth}
            activityTime={formattedTime}
            isGroup={isGroup}
            isWaitlist={regStatus === "waitlist"}
            waitlistPosition={waitlistPosition}
          />
        ))}
    </>
  );
}
