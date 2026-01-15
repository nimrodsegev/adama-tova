"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Button from "@/lib/components/UI/Button";
import OrganicCircles from "@/lib/components/OrganicCircles/OrganicCircles";
import styles from "./CancelConfirmationModal.module.css";
import { useIvrita } from "@/app/contexts/IvritaContext";

type CancelConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activityTitle: string;
  activityDate: string;
  activityTime: string;
};

export default function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  activityTitle,
  activityDate,
  activityTime,
}: CancelConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const { t } = useIvrita();

  // Handle close with animation
  const handleCloseWithAnimation = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 400);
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      <div className={styles.overlay} onClick={handleCloseWithAnimation} />
      <div className={styles.modalContainer}>
        {closing ? (
          <div className={styles.loadingContainer}>
            <OrganicCircles mode="loading" radius={0.1} baseColor="#681f02" />
          </div>
        ) : (
          <>
            <div className={styles.contentFrame}>
              <p className={styles.questionText}>
                {t("?את/ה בטוח/ה שאת/ה רוצה לבטל את ההרשמה")}
              </p>
              <p className={styles.detailsText}>
                ל{activityTitle} ב{activityDate} בשעה {activityTime}
              </p>
            </div>

            <div className={styles.buttonsFrame}>
              <Button size="L-short" onClick={handleCloseWithAnimation}>
                לא
              </Button>

              <Button size="L-short" onClick={onConfirm}>
                <span className={styles.confirmButtonText}>כן, לבטל</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
