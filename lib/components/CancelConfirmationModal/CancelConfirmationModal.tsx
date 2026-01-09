"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Button from "@/lib/components/UI/Button";
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
  const { t } = useIvrita();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const modalContent = (
    <>
      {/* Overlay backdrop */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Modal container */}
      <div className={styles.modalContainer}>
        {/* Content Frame */}
        <div className={styles.contentFrame}>
          {/* Question text */}
          <p className={styles.questionText}>
            {t("?את/ה בטוח/ה שאת/ה רוצה לבטל את ההרשמה")}
          </p>

          {/* Activity details text */}
          <p className={styles.detailsText}>
            ל{activityTitle} ב{activityDate} בשעה {activityTime}
          </p>
        </div>

        {/* Buttons Frame */}
        <div className={styles.buttonsFrame}>
          {/* Cancel button (left) */}
          <Button size="S" onClick={onClose}>
            לא
          </Button>

          {/* Confirm button (right) */}
          <Button size="M" onClick={handleConfirm}>
            <span className={styles.confirmButtonText}>כן, לבטל</span>
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
