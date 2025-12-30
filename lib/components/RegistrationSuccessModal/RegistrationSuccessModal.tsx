"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import styles from "./RegistrationSuccessModal.styles";

type RegistrationSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  activityDate: string;
  activityTime: string;
};

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  activityTitle,
  activityDate,
  activityTime,
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

        {/* Content Frame */}
        <div style={styles.contentFrame}>
          {/* Icon Container */}
          <div style={styles.iconContainer}>
            <img
              src="/icons/successful_registration_icon.svg"
              alt="Success"
              style={styles.successIcon}
            />
          </div>

          {/* Success message text - TWO LINES */}
          <p style={styles.messageText}>
            נרשמת בהצלחה לסדנת {activityTitle}
            <br />
            בתאריך {activityDate} בשעה {activityTime}
          </p>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
