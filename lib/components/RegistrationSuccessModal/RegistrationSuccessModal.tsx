"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useUser } from "@/app/contexts/UserContext";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./RegistrationSuccessModal.module.css";

type RegistrationSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  activityDate: string;
  activityTime: string;
  isGroup?: boolean;
  isWaitlist?: boolean;
  waitlistPosition?: number | null;
  circleRadius?: number;
  circlePosition?: { x: number; y: number };
};

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  activityTitle,
  activityDate,
  activityTime,
  isGroup = false,
  isWaitlist = false,
  waitlistPosition = null,
  circleRadius = 0.14,
  circlePosition = { x: 0.5, y: 0.45 },
}: RegistrationSuccessModalProps) {
  const [mounted, setMounted] = useState(false);
  const { userProfile } = useUser();

  const shapeParams =
    userProfile?.role === "participant"
      ? calculateShapeParams(userProfile)
      : calculateShapeParams(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.circlesContainer}>
        <OrganicCircles
          mode="breathing"
          radius={circleRadius}
          position={circlePosition}
          // @ts-ignore
          {...shapeParams}
          baseColor="#FFFFFF"
        />
      </div>

      <div className={styles.groupModalContainer}>
        <button
          className={styles.groupCloseButton}
          onClick={onClose}
          aria-label="סגור"
        >
          <Image
            src="/icons/close.svg"
            alt="Close icon"
            width={41}
            height={40}
          />
        </button>

        <div className={styles.groupContentFrame}>
          {/* Arrow Container */}
          <div className={styles.checkmarkContainer}>
            <svg
              className={styles.checkmarkIcon}
              viewBox="0 0 60 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 38L6 24"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M54 10L20 38"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Text Container */}
          <div className={styles.textWrapper}>
            {isWaitlist ? (
              <p className={styles.groupMessageText}>
                הפעילות מלאה - נרשמת לרשימת ההמתנה
                <br />
                מקום #{waitlistPosition} {isGroup ? `לקבוצת` : `לפעילות`}{" "}
                {activityTitle}
                <br />
                <br />
                <span className={styles.groupMessageTextLight}>
                  {isGroup
                    ? "כשיתפנה מקום, בקשתך תועבר לאישור המנהל"
                    : "נעדכן אותך כשיתפנה מקום"}
                </span>
              </p>
            ) : (
              <>
                {/* ⭐ 1. Main Title ("Registered Successfully") */}
                <h2 className={styles.successTitle}>נרשמת בהצלחה</h2>

                {/* ⭐ 2. Details (Activity Name & Time) */}
                <p className={styles.successDetails}>
                  לסדנת {activityTitle}
                  <br />
                  בתאריך {activityDate} בשעה {activityTime}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
