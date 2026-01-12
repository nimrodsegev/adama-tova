"use client";
import { useState, useEffect } from "react";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import ActivityDetailsModal from "@/lib/components/ActivityDetailsModal/ActivityDetailsModal";
import CancelConfirmationModal from "@/lib/components/CancelConfirmationModal/CancelConfirmationModal";
import RegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/RegistrationSuccessModal";
import GroupRegistrationSuccessModal from "@/lib/components/RegistrationSuccessModal/GroupRegistrationSuccessModal";
import styles from "./ScheduleActivityCard.styles";

type ScheduleActivityCardProps = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  waitlist_count?: number;
  onRegistrationChange?: () => void;
  isGroup: boolean;
};

export default function ScheduleActivityCard({
  id,
  title,
  date,
  start_time,
  end_time,
  current_participants,
  max_participants,
  waitlist_count = 0,
  onRegistrationChange,
  isGroup,
}: ScheduleActivityCardProps) {
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

  const formattedStartTime = start_time.slice(0, 5);
  const formattedEndTime = end_time.slice(0, 5);

  // Format date for modals
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString("he-IL", { weekday: "long" });
  const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}.${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  // Check if activity is full
  const isFull = current_participants >= max_participants;

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
        setRegistrationBackendStatus(res.status || null);

        // Show success modal - DO NOT refresh data yet
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = async () => {
    if (!user || loading) return;

    setLoading(true);

    try {
      const [_, error] = await apiRegistrations.cancelRegistration(user.id, id);
      if (!error) {
        setRegStatus("none");
        setWaitlistPosition(null);
        await new Promise((resolve) => setTimeout(resolve, 300));
        onRegistrationChange?.();
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
    // Refresh page data after modal closes
    onRegistrationChange?.();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on register button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalRegistrationChange = () => {
    // Refresh the card's registration status
    checkRegistrationStatus();
    // Call parent's callback
    onRegistrationChange?.();
  };

  const showRegisterButton = !isAdmin;
  const isRegistered = regStatus !== "none";

  return (
    <>
      <div
        onClick={handleCardClick}
        style={{
          ...styles.cardContainer,
          border: isRegistered ? "0.125rem solid #681F02" : "none",
        }}
      >
        {/* Register/Unregister Button - RIGHT MOST SIDE */}
        {showRegisterButton && (
          <Button
            size="S"
            onClick={handleRegistrationToggle}
            disabled={loading}
            style={styles.registerButton}
          >
            {regStatus !== "none" ? (
              // Minus icon - 45x45
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
              // Plus icon - 45x45
              <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
                {/* Horizontal line */}
                <line
                  x1="11.25"
                  y1="22.5"
                  x2="33.75"
                  y2="22.5"
                  stroke="#681F02"
                  strokeWidth="1"
                />
                {/* Vertical line */}
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

        {/* Content - MIDDLE (3 lines) */}
        <div style={styles.content}>
          {/* Line 1: Title (Bold) */}
          <h3 style={styles.title}>{title}</h3>

          {/* Line 2: Time (start on left, end on right in RTL) */}
          <p style={styles.time}>
            {formattedEndTime} - {formattedStartTime}
          </p>

          {/* Line 3: Participants Ratio (red if full) + Waitlist count */}
          <p
            style={{
              ...styles.participants,
              ...(isFull && styles.participantsFull),
            }}
          >
            {current_participants}/{max_participants}
            {waitlist_count > 0 && ` (${waitlist_count} בהמתנה)`}
          </p>
        </div>

        {/* Arrow - LEFT MOST SIDE (pointing left/backwards) */}
        <div style={styles.arrow}>
          <svg width="12" height="21" viewBox="0 0 12 21" fill="none">
            <line
              x1="10"
              y1="2"
              x2="2"
              y2="10.5"
              stroke="#F9F9F9"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="10.5"
              x2="10"
              y2="19"
              stroke="#F9F9F9"
              strokeWidth="2"
            />
          </svg>
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
        activityTime={formattedStartTime}
      />

      {/* Success Modal */}
      {isSuccessModalOpen &&
        // Group with space AND pending approval (not waitlist)
        (registrationBackendStatus === "pending" && regStatus !== "waitlist" ? (
          <GroupRegistrationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            activityTitle={title}
            startDate={dayMonth}
            startTime={formattedStartTime}
          />
        ) : (
          // Waitlist or regular confirmed
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
}
