"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/app/contexts/UserContext";
import { apiRegistrations } from "@/app/services/db_api";
import Button from "@/lib/components/UI/Button";
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

    console.log("🔵 Starting registration toggle...");
    setLoading(true);

    try {
      if (regStatus !== "none") {
        console.log("🔴 Unregistering from activity:", id);
        const [_, error] = await apiRegistrations.cancelRegistration(
          user.id,
          id
        );
        if (!error) {
          console.log("✅ Unregistration successful");
          setRegStatus("none");
          console.log("📞 Calling onRegistrationChange callback...");

          // Add small delay to ensure DB is updated
          await new Promise((resolve) => setTimeout(resolve, 300));
          onRegistrationChange?.();

          console.log("📞 Callback called");
        } else {
          console.error("❌ Error unregistering:", error);
        }
      } else {
        console.log("🟢 Registering for activity:", id);
        const [res, error] = await apiRegistrations.registerUserToActivity(
          user.id,
          id
        );
        console.log("Registration response:", res, "Error:", error);

        // ✅ FIXED: Check if we got data back (registration happened)
        // The error might just be a waitlist message
        if (res && res.id) {
          // If we got a registration ID, it worked
          const isWaitlist =
            res.if_confirmed === false || error?.message?.includes("waitlist");
          setRegStatus(isWaitlist ? "waitlist" : "confirmed");
          console.log(
            "✅ Registration successful, status:",
            isWaitlist ? "waitlist" : "confirmed"
          );
          console.log("📞 Calling onRegistrationChange callback...");

          // Add small delay to ensure DB is updated
          await new Promise((resolve) => setTimeout(resolve, 300));
          onRegistrationChange?.();

          console.log("📞 Callback called");
        } else {
          console.error("❌ Error registering:", error);
        }
      }
    } catch (error) {
      console.error("💥 Registration error:", error);
    } finally {
      setLoading(false);
      console.log("🔵 Registration toggle completed");
    }
  };

  const showRegisterButton = !isAdmin;

  return (
    <Link
      href={`/UserScreens/ActivityDetailsPage?id=${id}`}
      style={styles.cardContainer}
    >
      <div style={styles.frame224}>
        <h3 style={styles.titleText}>{title}</h3>

        <div style={styles.frame266}>
          <p style={styles.bodyM}>
            {dayName} {dayMonth}
            <br />
            בשעה {formattedTime}
            <br />
            {location}
          </p>
        </div>
      </div>

      {/* ✅ UPDATED: Using styles.registerButton from CSS file */}
      {showRegisterButton && (
        <Button
          size="icon"
          onClick={handleRegistrationToggle}
          disabled={loading}
          style={styles.registerButton} // ✅ Reference CSS file
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

      <div style={styles.arrowButton}>
        <span style={styles.arrowIcon}>›</span>
      </div>
    </Link>
  );
}
