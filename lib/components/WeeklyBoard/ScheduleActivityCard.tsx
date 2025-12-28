"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
import styles from "./ScheduleActivityCard.styles";

type ScheduleActivityCardProps = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  current_participants: number;
  max_participants: number;
  onRegistrationChange?: () => void;
};

export default function ScheduleActivityCard({
  id,
  title,
  start_time,
  end_time,
  current_participants,
  max_participants,
  onRegistrationChange,
}: ScheduleActivityCardProps) {
  const { user, userProfile } = useUser();
  const isAdmin = userProfile?.role === "admin";

  const [regStatus, setRegStatus] = useState<"none" | "confirmed" | "waitlist">(
    "none"
  );
  const [loading, setLoading] = useState(false);

  const formattedStartTime = start_time.slice(0, 5);
  const formattedEndTime = end_time.slice(0, 5);

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

    setLoading(true);

    try {
      if (regStatus !== "none") {
        const [_, error] = await apiRegistrations.cancelRegistration(
          user.id,
          id
        );
        if (!error) {
          setRegStatus("none");
          await new Promise((resolve) => setTimeout(resolve, 300));
          onRegistrationChange?.();
        }
      } else {
        const [res, error] = await apiRegistrations.registerUserToActivity(
          user.id,
          id
        );
        if (res && res.id) {
          const isWaitlist =
            res.if_confirmed === false || error?.message?.includes("waitlist");
          setRegStatus(isWaitlist ? "waitlist" : "confirmed");
          await new Promise((resolve) => setTimeout(resolve, 300));
          onRegistrationChange?.();
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const showRegisterButton = !isAdmin;
  const isRegistered = regStatus !== "none";

  return (
    <Link
      href={`/UserScreens/ActivityDetailsPage?id=${id}`}
      style={{
        ...styles.cardContainer,
        border: isRegistered ? "0.125rem solid #681F02" : "none",
      }}
    >
      {/* Register/Unregister Button - RIGHT MOST SIDE */}
      {showRegisterButton && (
        <Button
          size="icon"
          onClick={handleRegistrationToggle}
          disabled={loading}
          style={styles.registerButton}
        >
          {regStatus !== "none" ? (
            // ✅ Minus icon - 40x40
            <svg
              width="45"
              height="45"
              viewBox="0 0 45 45" // ✅ FIXED: Match width/height
              fill="none"
            >
              <line
                x1="11.25" // ✅ FIXED: Adjusted for 45x45 viewBox (45 * 0.25)
                y1="22.5" // ✅ FIXED: Center line vertically (45/2 = 22.5)
                x2="33.75" // ✅ FIXED: Adjusted for 45x45 viewBox (45 * 0.75)
                y2="22.5" // ✅ FIXED: Center line vertically
                stroke="#681F02"
                strokeWidth="1"
              />
            </svg>
          ) : (
            // ✅ Plus icon - 45x45
            <svg
              width="45"
              height="45"
              viewBox="0 0 45 45" // ✅ FIXED: Match width/height (was 32 32)
              fill="none"
            >
              {/* Horizontal line */}
              <line
                x1="11.25" // ✅ FIXED: Adjusted for 45x45 viewBox (45 * 0.25)
                y1="22.5" // ✅ FIXED: Center line vertically (45/2 = 22.5)
                x2="33.75" // ✅ FIXED: Adjusted for 45x45 viewBox (45 * 0.75)
                y2="22.5" // ✅ FIXED: Center line vertically
                stroke="#681F02"
                strokeWidth="1" // ✅ FIXED: Made thicker (was 1)
              />
              {/* Vertical line */}
              <line
                x1="22.5" // ✅ FIXED: Center line horizontally (45/2 = 22.5)
                y1="11.25" // ✅ FIXED: Adjusted for 45x45 viewBox (45 * 0.25)
                x2="22.5" // ✅ FIXED: Center line horizontally
                y2="33.75" // ✅ FIXED: Adjusted for 45x45 viewBox (45 * 0.75)
                stroke="#681F02"
                strokeWidth="1" // ✅ FIXED: Made thicker (was 1)
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

        {/* Line 3: Participants Ratio (red if full) */}
        <p
          style={{
            ...styles.participants,
            ...(isFull && styles.participantsFull),
          }}
        >
          {current_participants}/{max_participants}
        </p>
      </div>

      {/* Arrow - LEFT MOST SIDE (pointing left/backwards) */}
      <div style={styles.arrow}>
        {/* ✅ Arrow pointing LEFT (opposite direction) */}
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

      {/* Registration Indicator Dot */}
      {isRegistered && <div style={styles.registrationDot} />}
    </Link>
  );
}
