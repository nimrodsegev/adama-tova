"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
// We can reuse the same styles if they work for you, or create a new CSS module
import styles from "./RegistrationSuccessModal.module.css"; 

type GroupRegistrationSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  startDate: string;
  startTime: string;
};

export default function GroupRegistrationSuccessModal({
  isOpen,
  onClose,
  activityTitle,
  startDate,
  startTime,
}: GroupRegistrationSuccessModalProps) {
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

      {/* Modal container */}
      <div className={styles.modalContainer}>
        {/* Close button */}
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <line x1="2" y1="2" x2="18" y2="18" stroke="#F9F9F9" strokeWidth="2" />
            <line x1="18" y1="2" x2="2" y2="18" stroke="#F9F9F9" strokeWidth="2" />
          </svg>
        </button>

        {/* Content Frame */}
        <div className={styles.contentFrame}>
          {/* Icon Container - You might want a different icon for "Pending" */}
          <div className={styles.iconContainer}>
            {/* Using a clock or hourglass icon fits the "Pending" theme better */}
            <span style={{ fontSize: '3rem', display: 'block' }}>⏳</span>
          </div>

          {/* Pending Approval Message */}
          <p className={styles.messageText} style={{ direction: 'rtl' }}>
            <strong>בקשתך להצטרף לקבוצה נשלחה!</strong>
            <br />
            <br />
            ביקשת להצטרף לקבוצת <strong>{activityTitle}</strong>
            <br />
            שתתחיל בתאריך {startDate} בשעה {startTime}
            <br />
            <br />
            <span style={{ fontSize: '0.9em', opacity: 0.85, display: 'block' }}>
              הבקשה הועברה לאישור המנהל.<br/>
              תקבל/י הודעה ברגע שהסטטוס יתעדכן.
            </span>
          </p>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}