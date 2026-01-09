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
  onRegistrationChange?: () => void;
  isGroup?: boolean;
};

export default function UserActivityCard({
  id,
  title,
  date,
  start_time,
  location,
  description,
  onRegistrationChange,
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

  const formattedTime = start_time.slice(0, 5);

  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    if (user && id) {
      checkRegistrationStatus();
    }
  }, [user, id]);

  const checkRegistrationStatus = async () => {
    if (!user || !id) return;
    try {
      const [statusData, error] = await apiRegistrations.getRegistrationStatus(
        user.id,
        id
      );
      if (!error && statusData) {
        const { status, wait_list_place } = statusData;
        if (status === "confirmed" || status === "waitlist") {
          setRegStatus(status);
          setWaitlistPosition(wait_list_place);
        } else {
          setRegStatus("none");
          setWaitlistPosition(null);
        }
      } else {
        setRegStatus("none");
        setWaitlistPosition(null);
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    }
  };

  const handleRegistrationToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || loading || isAdmin) return;

    // If already registered, show cancel confirmation modal
    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    // If not registered, proceed with registration
    setLoading(true);

    try {
      const [res] = await apiRegistrations.registerUserToActivity(user.id, id);

      if (res && typeof res === "object" && "success" in res) {
        const isWaitlist = res.if_confirmed === false;
        setRegStatus(isWaitlist ? "waitlist" : "confirmed");
        setWaitlistPosition(res.wait_list_place || null);

        // Show success modal - refresh will happen when modal closes
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Registration exception:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(user.id, id);
      if (!error) {
        setRegStatus("none");
        setWaitlistPosition(null);

        // Close cancel modal
        setIsCancelModalOpen(false);

        // Refresh home page immediately
        await new Promise((resolve) => setTimeout(resolve, 300));
        onRegistrationChange?.();
      }
    } catch (error) {
      console.error("Unregistration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    // Refresh home page when success modal closes
    onRegistrationChange?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalRegistrationChange = () => {
    checkRegistrationStatus();
    onRegistrationChange?.();
  };

  const showRegisterButton = !isAdmin;

  return (
    <>
      <div onClick={handleCardClick} className={styles.cardContainer}>
        <div className={styles.frame224}>
          {/* Title */}
          <h3 className={styles.titleText}>{title}</h3>

          {/* Date and Time - NO LOCATION */}
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
              size="icon"
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
        activityTime={formattedTime}
      />

      {/* Success Modal */}
      {isSuccessModalOpen && (
        isGroup ? (
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
            isWaitlist={regStatus === "waitlist"}
            waitlistPosition={waitlistPosition}
          />
        )
      )}
    </>
  );
}
