"use client";
import { createPortal } from "react-dom";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useUser } from "@/app/contexts/UserContext";
import { calculateShapeParams } from "@/app/utils/motionParamsCalculator";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
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
  const { userProfile } = useUser();

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
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal container */}
      <div className={styles.modalContainer}>
        {/* Organic Circles in the background with calculated parameters */}
        <OrganicCircles
          mode="breathing"
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
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="סגור"
        >
          <Image
            src="/icons/close.svg"
            alt="Close icon"
            width={40}
            height={40}
          />
        </button>

        {/* Content Frame */}
        <div className={styles.contentFrame}>
          {/* Pending Approval Message */}
          <p className={styles.messageText} style={{ direction: "rtl" }}>
            קיבלנו את בקשתך להצטרף
            <br />
            ל״{activityTitle}״
            <br />
            בתאריך {startDate} בשעה {startTime}
            <br />
            <br />
            נעדכן אותך בקרוב
          </p>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
