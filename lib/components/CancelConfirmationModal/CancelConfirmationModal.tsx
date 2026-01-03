"use client";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import Button from "@/lib/components/UI/Button";
import styles from "./CancelConfirmationModal.styles";
import { useIvrita } from '@/app/contexts/IvritaContext';

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
      <div style={styles.overlay} onClick={onClose} />

      {/* Modal container */}
      <div style={styles.modalContainer}>
        {/* Content Frame */}
        <div style={styles.contentFrame}>
          {/* Question text */}
          <p style={styles.questionText}>
            {t('?את/ה בטוח/ה שאת/ה רוצה לבטל את ההרשמה')}
          </p>

          {/* Activity details text */}
          <p style={styles.detailsText}>
            ל{activityTitle} ב{activityDate} בשעה {activityTime}
          </p>
        </div>

        {/* Buttons Frame */}
        <div style={styles.buttonsFrame}>
          {/* Cancel button (left) */}
          <Button size="S" onClick={onClose} style={styles.cancelButton}>
            <span style={styles.cancelButtonText}>לא</span>
          </Button>

          {/* Confirm button (right) */}
          <Button size="M" onClick={handleConfirm} style={styles.confirmButton}>
            <span style={styles.confirmButtonText}>כן, לבטל</span>
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
