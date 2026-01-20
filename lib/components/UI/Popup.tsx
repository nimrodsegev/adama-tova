"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // Import createPortal
import Button from "./Button";
import styles from "./Popup.module.css";

interface PopupProps {
  title?: string;
  content: string | React.ReactNode;
  userName?: string;
  email?: string;
  recommendation?: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonAction?: () => void;
  secondaryButtonHref?: string;
  loading?: boolean;
  loadingOnSecondary?: boolean;
  onClose?: () => void;
  preview?: boolean;
}

export default function Popup({
  title,
  content,
  userName,
  email,
  recommendation,
  primaryButtonText,
  primaryButtonAction,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonAction,
  secondaryButtonHref,
  loading = false,
  loadingOnSecondary = false,
  onClose,
  preview = false,
}: PopupProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Optional: Prevent background scrolling when popup is open
    if (!preview) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [preview]);

  const handlePrimaryClick = () => {
    if (primaryButtonAction) {
      primaryButtonAction();
    }
    if (primaryButtonHref) {
      window.location.href = primaryButtonHref;
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButtonAction) {
      secondaryButtonAction();
    }
    if (secondaryButtonHref) {
      window.location.href = secondaryButtonHref;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  // 1. Content Logic (Same as before)
  const modalContent = (
    <div className={styles.modalContent}>
      {title && <h2 className={styles.title}>{title}</h2>}

      <div className={styles.messageContainer}>
        {userName && <p className={styles.userName}>{userName}</p>}

        {typeof content === "string" ? (
          <p className={styles.message}>{content}</p>
        ) : (
          content
        )}

        {email && <p className={styles.email}>{email}</p>}

        {recommendation && (
          <p className={styles.recommendation}>{recommendation}</p>
        )}
      </div>

      {(primaryButtonText || secondaryButtonText) && (
        <div className={styles.buttons}>
          {secondaryButtonText && (
            <Button
              variant="reject"
              onClick={handleSecondaryClick}
              disabled={loading && loadingOnSecondary}
            >
              {loading && loadingOnSecondary ? "טוען..." : secondaryButtonText}
            </Button>
          )}

          {primaryButtonText && (
            <Button
              variant="approve"
              onClick={handlePrimaryClick}
              disabled={loading && !loadingOnSecondary}
              customBorderColor={"var(--color-white-pure)"}
            >
              {loading && !loadingOnSecondary ? "טוען..." : primaryButtonText}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // 2. Preview Mode (Returns normal JSX, no portal needed)
  if (preview) {
    return <div className={styles.modal}>{modalContent}</div>;
  }

  // 3. Client-side Check
  if (!mounted) return null;

  // 4. Portal Logic - Render directly into document.body
  // This breaks the popup out of SmoothPageWrapper and puts it above the Footer
  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>{modalContent}</div>
    </div>,
    document.body
  );
}
