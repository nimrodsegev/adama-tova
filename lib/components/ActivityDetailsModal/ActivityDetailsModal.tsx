"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@/app/contexts/UserContext";
import { apiActivities, apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import styles from "./ActivityDetailsModal.styles";

type ActivityDetailsModalProps = {
  activityId: string;
  isOpen: boolean;
  onClose: () => void;
  onRegistrationChange?: () => void;
};

export default function ActivityDetailsModal({
  activityId,
  isOpen,
  onClose,
  onRegistrationChange,
}: ActivityDetailsModalProps) {
  const { user, userProfile } = useUser();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [registrationCount, setRegistrationCount] = useState({
    confirmed: 0,
    total: 10,
  });
  const [mounted, setMounted] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // ✅ ADDED
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // ✅ ADDED

  const isAdmin = userProfile?.role === "admin";

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && activityId) {
      fetchActivityDetails();
      checkRegistrationStatus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, activityId]);

  const fetchActivityDetails = async () => {
    setLoading(true);
    try {
      const [activityData, error] = await apiActivities.getById(activityId);
      if (!error && activityData) {
        setActivity(activityData);

        setRegistrationCount({
          confirmed: activityData.current_participants || 0,
          total: activityData.max_participants || 10,
        });
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    if (!user || !activityId) return;
    try {
      const [status, error] = await apiRegistrations.getRegistrationStatus(
        user.id,
        activityId
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

  // ✅ UPDATED: Handle registration toggle with modals
  const handleRegistrationToggle = async () => {
    if (!user || loading || isAdmin) return;

    // ✅ If already registered, show cancel confirmation modal
    if (regStatus !== "none") {
      setIsCancelModalOpen(true);
      return;
    }

    // If not registered, proceed with registration
    setLoading(true);
    try {
      const [res, error] = await apiRegistrations.registerUserToActivity(
        user.id,
        activityId
      );

      if (res) {
        const isWaitlist =
          res.if_confirmed === false ||
          (error && error.message && error.message.includes("waitlist"));

        setRegStatus(isWaitlist ? "waitlist" : "confirmed");

        // ✅ Show success modal - DO NOT refresh or close main modal yet
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Handle cancel confirmation
  const handleCancelConfirm = async () => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(
        user.id,
        activityId
      );
      if (!error) {
        setRegStatus("none");
        await new Promise((resolve) => setTimeout(resolve, 300));
        onRegistrationChange?.();
        fetchActivityDetails();
      }
    } catch (error) {
      console.error("Unregistration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADDED: Handle success modal close - refresh data AFTER modal closes
  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    // Refresh data after modal closes
    onRegistrationChange?.();
    fetchActivityDetails();
  };

  if (!isOpen || !mounted) return null;

  const formattedTime = activity?.start_time?.slice(0, 5) || "";
  const dateObj = activity?.date ? new Date(activity.date) : null;
  const dayName = dateObj
    ? dateObj.toLocaleDateString("he-IL", { weekday: "long" })
    : "";
  const dayMonth = dateObj
    ? `${dateObj.getDate().toString().padStart(2, "0")}.${(
        dateObj.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`
    : "";

  const progressPercentage =
    registrationCount.total > 0
      ? (registrationCount.confirmed / registrationCount.total) * 100
      : 0;

  const modalContent = (
    <>
      {/* Overlay backdrop */}
      <div style={styles.overlay} onClick={onClose} />

      {/* Modal container */}
      <div style={styles.modalContainer}>
        {/* Close button */}
        <button style={styles.closeButton} onClick={onClose}>
          <svg width="19.43" height="19.43" viewBox="0 0 20 20" fill="none">
            <line
              x1="2"
              y1="2"
              x2="18"
              y2="18"
              stroke="#F9F9F9"
              strokeWidth="1"
            />
            <line
              x1="18"
              y1="2"
              x2="2"
              y2="18"
              stroke="#F9F9F9"
              strokeWidth="1"
            />
          </svg>
        </button>

        <div style={styles.contentFrame}>
          {/* Image */}
          {activity?.image_url && (
            <div style={styles.imageContainer}>
              <img
                src={activity.image_url}
                alt={activity.title}
                style={styles.activityImage}
              />
            </div>
          )}

          {/* Title */}
          <h2 style={styles.titleText}>{activity?.title || ""}</h2>

          {/* Date/Time/Location */}
          <div style={styles.dateInfoFrame}>
            <p style={styles.dateText}>
              יום {dayName} {dayMonth} בשעה {formattedTime}
              <br />
              {activity?.location || ""}
              <br />
              {activity?.instructor || ""}
            </p>
          </div>

          {/* Description */}
          <div style={styles.descriptionFrame}>
            <p style={styles.descriptionText}>{activity?.description || ""}</p>
          </div>

          {/* Bottom bar */}
          <div style={styles.bottomBar}>
            {/* Register button - RIGHT SIDE */}
            {!isAdmin && (
              <div style={styles.registerButtonContainer}>
                <Button
                  size="S"
                  onClick={handleRegistrationToggle}
                  disabled={loading}
                  style={styles.registerButton}
                >
                  <span style={styles.registerButtonText}>
                    {regStatus !== "none" ? "ביטול" : "הרשמה"}
                  </span>
                </Button>
              </div>
            )}

            {/* Capacity info - LEFT SIDE */}
            <div style={styles.capacityFrame}>
              <p style={styles.capacityText}>
                {registrationCount.confirmed}/{registrationCount.total}
              </p>

              <div style={styles.progressBarContainer}>
                <div style={styles.progressBarBackground} />
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${progressPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ADDED: Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <CancelConfirmationModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleCancelConfirm}
          activityTitle={activity?.title || ""}
          activityDate={`${dayName} ${dayMonth}`}
          activityTime={formattedTime}
        />
      )}

      {/* ✅ ADDED: Success Modal */}
      {isSuccessModalOpen && (
        <RegistrationSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={handleSuccessModalClose}
          activityTitle={activity?.title || ""}
          activityDate={dayMonth}
          activityTime={formattedTime}
        />
      )}
    </>
  );

  return createPortal(modalContent, document.body);
}
