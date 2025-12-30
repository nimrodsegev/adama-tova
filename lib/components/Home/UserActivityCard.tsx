"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import styles from "./UserActivityCard.styles";

type UserActivityCardProps = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  location: string;
  description: string;
  onRegistrationChange?: () => void;
};

export default function UserActivityCard({
  id,
  title,
  date,
  start_time,
  location,
  description,
  onRegistrationChange,
}: UserActivityCardProps) {
  const { user, userProfile } = useUser();

  const isAdmin = userProfile?.role === "admin";

  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
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
      const [status, error] = await apiRegistrations.getRegistrationStatus(
        user.id,
        id
      );
      if (!error && status) {
        if (
          status === "confirmed" ||
          status === "waitlist" ||
          status === "none"
        ) {
          setRegStatus(status);
        } else {
          setRegStatus("none");
        }
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
      const [res, error] = await apiRegistrations.registerUserToActivity(
        user.id,
        id
      );

      if (res) {
        const isWaitlist =
          res.if_confirmed === false ||
          (error && error.message && error.message.includes("waitlist"));

        setRegStatus(isWaitlist ? "waitlist" : "confirmed");

        // Show success modal - DO NOT refresh data yet
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("💥 Registration exception:", error);
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

        await new Promise((resolve) => setTimeout(resolve, 300));
        onRegistrationChange?.();
      }
    } catch (error) {
      console.error("💥 Unregistration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
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
      <div onClick={handleCardClick} style={styles.cardContainer}>
        <div style={styles.frame224}>
          {/* Title */}
          <h3 style={styles.titleText}>{title}</h3>

          {/* Date and Time - NO LOCATION */}
          <div style={styles.frame266}>
            <p style={styles.bodyM}>
              {dayName} {dayMonth}
              <br />
              בשעה {formattedTime}
            </p>
          </div>
        </div>

        {showRegisterButton && (
          <Button
            size="icon"
            onClick={handleRegistrationToggle}
            disabled={loading}
            style={styles.registerButton}
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
        )}

        <div style={styles.arrowButton}>
          <span style={styles.arrowIcon}>›</span>
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
      <RegistrationSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessModalClose}
        activityTitle={title}
        activityDate={dayMonth}
        activityTime={formattedTime}
      />
    </>
  );
}
