"use client";
import { createPortal } from "react-dom";
import { useState, useEffect, useMemo } from "react";
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
  const [closing, setClosing] = useState(false);
  const { userProfile } = useUser();

  // Handle close with animation
  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 400);
  };

  // Calculate shape parameters based on user profile
  const shapeParams = useMemo(() => {
    return calculateShapeParams(userProfile);
  }, [userProfile]);

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
      <div className={styles.overlay} onClick={handleCloseWithAnimation} />

      {/* Modal container */}
      <div className={styles.modalContainer}>
        {/* Organic Circles in the background with calculated parameters */}
        <OrganicCircles
          mode={closing ? "loading" : "breathing"}
          radius={0.3}
          layers={shapeParams.layers}
          smoothness={shapeParams.smoothness}
          complexity={shapeParams.complexity}
          elongation={shapeParams.elongation}
          opacity={shapeParams.opacity}
          strokeWidth={shapeParams.strokeWidth}
          position={{ x: 0.5, y: 0.5 }}
          baseColor="#FFFFFF"
        />

        {/* Close button */}
        <button className={styles.closeButton} onClick={handleCloseWithAnimation}>
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
        <div className={styles.contentFrame}>
          {/* Success message text - TWO LINES */}
          <p className={styles.messageText}>
            {isWaitlist ? (
              <>
                הפעילות מלאה - נרשמת לרשימת ההמתנה
                <br />
                מקום #{waitlistPosition} {isGroup ? `לקבוצת` : `לפעילות`}{" "}
                {activityTitle}
                <br />
                <span className={styles.subMessage}>
                  {isGroup
                    ? "כשיתפנה מקום, בקשתך תועבר לאישור המנהל"
                    : "נעדכן אותך כשיתפנה מקום"}
                </span>
              </>
            ) : (
              <>
                נרשמת בהצלחה לסדנת {activityTitle}
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
