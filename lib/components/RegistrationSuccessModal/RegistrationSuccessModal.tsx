"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Image from "next/image";
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
}: RegistrationSuccessModalProps) {
  const [mounted, setMounted] = useState(false);

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
      {/* Overlay backdrop */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal container with gradient background */}
      <div className={styles.groupModalContainer}>
        {/* Close button */}
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

        {/* Content Frame */}
        <div className={styles.groupContentFrame}>
          {/* Checkmark circle with V icon */}
          <div className={styles.checkmarkContainer}>
            <Image
              src="/icons/checkmark_circle.svg"
              alt=""
              width={122}
              height={124}
              className={styles.checkmarkCircle}
            />
            {/* Checkmark V icon */}
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

          {/* Message text */}
          <p className={styles.groupMessageText}>
            {isWaitlist ? (
              <>
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
              </>
            ) : (
              <>
                נרשמת בהצלחה לסדנת
                <br />
                {activityTitle}
                <br />
                בתאריך {activityDate} בשעה {activityTime}
              </>
            )}
          </p>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
